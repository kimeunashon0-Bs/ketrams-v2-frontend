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

const requestOtpSchema = z.object({
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

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

type RequestOtpFormData = z.infer<typeof requestOtpSchema>;
type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const requestForm = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
    mode: 'onChange',
    defaultValues: { phoneNumber: '', email: '', deliveryMethod: 'PHONE' },
  });

  const verifyForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    requestForm.setValue('phoneNumber', value, { shouldValidate: true });
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    verifyForm.setValue('otp', value, { shouldValidate: true });
  };

  const handleSendOtp = async (data: RequestOtpFormData) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/request-otp', {
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
        deliveryMethod: data.deliveryMethod,
      });
      setPhoneNumber(data.phoneNumber);
      setOtpSent(true);
      verifyForm.reset({ otp: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: VerifyOtpFormData) => {
    setLoading(true);
    setError('');
    const payload = {
      phoneNumber,
      otpCode: data.otp,
    };
    console.log('🔍 Verification payload:', payload);
    try {
      await api.post('/auth/verify-otp', payload);
      router.push(`/set-password?phone=${encodeURIComponent(phoneNumber)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    verifyForm.reset({ otp: '' });
    // Ensure the phone number is still in the form (it already is, but just in case)
    if (phoneNumber) {
      requestForm.setValue('phoneNumber', phoneNumber);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="We'll send a verification code to you">
      <div className="mt-8 space-y-6">
        {!otpSent ? (
          <form onSubmit={requestForm.handleSubmit(handleSendOtp)} className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                key={otpSent ? 'phone-otp' : 'phone'} // forces new DOM element when switching views
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                {...requestForm.register('phoneNumber', { onChange: handlePhoneChange })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0712345678"
              />
              {requestForm.formState.errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{requestForm.formState.errors.phoneNumber.message}</p>
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
                {...requestForm.register('email')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
              {requestForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{requestForm.formState.errors.email.message}</p>
              )}
            </div>
            {requestForm.watch('email') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Where to send the code?</label>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="PHONE"
                      {...requestForm.register('deliveryMethod')}
                      className="form-radio h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Phone ({requestForm.watch('phoneNumber')})</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="EMAIL"
                      {...requestForm.register('deliveryMethod')}
                      className="form-radio h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email ({requestForm.watch('email')})</span>
                  </label>
                </div>
                {requestForm.formState.errors.deliveryMethod && (
                  <p className="mt-1 text-sm text-red-600">{requestForm.formState.errors.deliveryMethod.message}</p>
                )}
              </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
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
                {...verifyForm.register('otp', { onChange: handleOtpChange })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest"
                placeholder="6-digit code"
              />
              {verifyForm.formState.errors.otp && (
                <p className="mt-1 text-sm text-red-600">{verifyForm.formState.errors.otp.message}</p>
              )}
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading || !verifyForm.formState.isValid}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <div className="text-sm text-center">
              <button
                type="button"
                onClick={handleBack}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Change phone/email
              </button>
            </div>
          </form>
        )}
        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}