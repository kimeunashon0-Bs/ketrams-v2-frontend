"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/axios';
import AuthLayout from '@/components/auth/AuthLayout';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  useEffect(() => {
    if (!phone) {
      router.push('/register');
    }
  }, [phone, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-otp', { phoneNumber: phone, otpCode: otp });
      router.push(`/set-password?phone=${encodeURIComponent(phone)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/request-otp', { phoneNumber: phone });
      setError('A new verification code has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify your phone number" subtitle={`We sent a code to ${phone}`}>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            required
            maxLength={6}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        {error && (
          <div className={`text-sm text-center ${error.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify code'}
          </button>
        </div>

        <div className="text-sm text-center">
          <button
            type="button"
            onClick={resendOtp}
            disabled={loading}
            className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
          >
            Resend code
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}