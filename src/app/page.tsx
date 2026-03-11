"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 via-purple-900/70 to-black/80"></div>
      </div>

      {/* Glassmorphism navigation */}
      <nav className="relative z-10 glass-nav px-6 py-4 mx-auto max-w-7xl mt-4 rounded-full">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white tracking-tight">KETRAMS</div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-white/90 hover:text-white transition">
              Login
            </Link>
            {/* Dropdown for Get Started */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-amber-500 text-white px-4 py-2 rounded-full hover:bg-amber-600 transition shadow-lg flex items-center focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer active:scale-95 animate-glow"
                type="button"
              >
                Get Started
                <svg
                  className={`ml-2 h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl py-2 z-50 border border-gray-700 overflow-hidden">
                  <Link
                    href="/register"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-white bg-indigo-600 hover:bg-indigo-800 hover:scale-105 transition-all duration-200 border-b border-gray-700 last:border-b-0"
                  >
                    <span className="text-sm font-medium">Student Registration</span>
                    <svg className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/apply-institution"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-white bg-green-600 hover:bg-green-800 hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-sm font-medium">Institution Registration</span>
                    <svg className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Your future starts here
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-12">
            Apply to TVET/VTC institutions in Kakamega County. Navigate your entire application journey with KETRAMS.
          </p>

          {/* Bento grid for registration options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student card */}
            <div className="bento-card group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative z-10 p-8">
                <div className="w-16 h-16 bg-indigo-500/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Student</h3>
                <p className="text-indigo-100 mb-6">
                  Apply to institutions, track applications, and get facilitation.
                </p>
                <Link
                  href="/register"
                  className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition border border-white/30 active:scale-95"
                >
                  Start Applying
                </Link>
              </div>
            </div>

            {/* Institution card */}
            <div className="bento-card group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative z-10 p-8">
                <div className="w-16 h-16 bg-green-500/30 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Institution</h3>
                <p className="text-indigo-100 mb-6">
                  Register your institution for admin access. Approval required.
                </p>
                <Link
                  href="/apply-institution"
                  className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition border border-white/30 active:scale-95"
                >
                  Register Institution
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-12 text-sm text-indigo-200">
            Already have an account?{' '}
            <Link href="/login" className="text-white underline hover:text-indigo-200">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-0"></div>
    </div>
  );
}