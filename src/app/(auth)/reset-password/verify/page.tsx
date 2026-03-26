"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';                       // ✅ Add this import
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api/axios';
import AuthLayout from '@/components/auth/AuthLayout';

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export default function VerifyResetOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: '' },
  });

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    form.setValue('otp', value, { shouldValidate: true });
  };

  const onSubmit = async (data: VerifyOtpFormData) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-reset-otp', {
        phoneNumber,
        otpCode: data.otp,
      });
      router.push(`/reset-password/new?phone=${encodeURIComponent(phoneNumber)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!phoneNumber) {
    return (
      <AuthLayout title="Invalid Request" subtitle="Missing phone number">
        <div className="mt-8 text-center">
          <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
            Go back
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verify your code" subtitle="Enter the 6-digit code sent to you">
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            {...form.register('otp', { onChange: handleOtpChange })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest"
            placeholder="6-digit code"
          />
          {form.formState.errors.otp && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.otp.message}</p>
          )}
        </div>

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading || !form.formState.isValid}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>

        <div className="text-sm text-center">
          <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
            Try another phone number
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}