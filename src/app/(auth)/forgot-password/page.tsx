"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api/axios';
import AuthLayout from '@/components/auth/AuthLayout';

const kenyanPhoneRegex = /^(07|01)[0-9]{8}$/;

const requestResetSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(kenyanPhoneRegex, 'Enter a valid Kenyan phone number (e.g., 0712345678)'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  deliveryMethod: z.enum(['PHONE', 'EMAIL']),
});

type RequestResetFormData = z.infer<typeof requestResetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { phoneNumber: '', email: '', deliveryMethod: 'PHONE' },
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    form.setValue('phoneNumber', value, { shouldValidate: true });
  };

  const onSubmit = async (data: RequestResetFormData) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', {
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
        deliveryMethod: data.deliveryMethod,
      });
      router.push(`/reset-password/verify?phone=${encodeURIComponent(data.phoneNumber)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send a verification code to you">
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            {...form.register('phoneNumber', { onChange: handlePhoneChange })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="0712345678"
          />
          {form.formState.errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register('email')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="you@example.com"
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        {form.watch('email') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Where to send the code?</label>
            <div className="mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="PHONE"
                  {...form.register('deliveryMethod')}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-700">Phone ({form.watch('phoneNumber')})</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="EMAIL"
                  {...form.register('deliveryMethod')}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-700">Email ({form.watch('email')})</span>
              </label>
            </div>
            {form.formState.errors.deliveryMethod && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.deliveryMethod.message}</p>
            )}
          </div>
        )}

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send reset code'}
        </button>

        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}