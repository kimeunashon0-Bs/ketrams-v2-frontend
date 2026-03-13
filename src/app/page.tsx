"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, GraduationCap, Building2, TrendingUp, Clock, Shield, Users } from 'lucide-react';

// Animated number component
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 1500; // 1.5 seconds
    const increment = end / (duration / 16); // 60fps

    let timer: NodeJS.Timeout;
    const step = () => {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        timer = setTimeout(step, 16);
      } else {
        setCount(end);
      }
    };
    step();
    return () => clearTimeout(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

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

  const stats = [
    { value: 25, suffix: '+', label: 'Institutions' },
    { value: 1200, suffix: '+', label: 'Students Placed' },
    { value: 95, suffix: '%', label: 'Satisfaction Rate' },
    { value: 24, suffix: '/7', label: 'Support' },
  ];

  const institutionFeatures = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Streamlined Admissions',
      description: 'Manage all applications in one dashboard with real‑time updates.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Faster Processing',
      description: 'Reduce paperwork and accelerate your enrollment cycles.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Compliant',
      description: 'Data protection and county regulations built‑in.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Dedicated Support',
      description: 'Priority assistance for institution administrators.',
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Full‑page background image with blue overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1486&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-indigo-900/70 mix-blend-multiply" />
      </div>

      {/* Content with glassmorphism */}
      <div className="relative z-10">
        {/* Navbar with glass effect */}
        <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-white" />
                <span className="text-2xl font-bold text-white tracking-tight">KETRAMS</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-white/90 hover:text-white transition text-sm font-medium">
                  Sign In
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-full hover:bg-white/30 transition-all border border-white/30 flex items-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    Get Started
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl py-2 border border-white/20 overflow-hidden z-50"
                    >
                      <Link
                        href="/register"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-white hover:bg-blue-600/30 transition-colors"
                      >
                        <GraduationCap className="h-5 w-5 mr-3 text-blue-300" />
                        <div>
                          <p className="font-medium">Student Registration</p>
                          <p className="text-xs text-white/70">Apply to institutions</p>
                        </div>
                      </Link>
                      <Link
                        href="/apply-institution"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-white hover:bg-green-600/30 transition-colors"
                      >
                        <Building2 className="h-5 w-5 mr-3 text-green-300" />
                        <div>
                          <p className="font-medium">Institution Registration</p>
                          <p className="text-xs text-white/70">Register your institution</p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section ref={heroRef} className="relative py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg"
            >
              Your future starts{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                here
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/90 max-w-3xl mx-auto mb-12 drop-shadow"
            >
              Apply to TVET/VTC institutions in Kakamega County. Navigate your entire application journey with KETRAMS.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/register"
                className="group bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all transform hover:scale-105 shadow-xl border border-white/30 flex items-center justify-center"
              >
                Apply as Student
                <GraduationCap className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/apply-institution"
                className="group bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all transform hover:scale-105 backdrop-blur-sm flex items-center justify-center"
              >
                Register Institution
                <Building2 className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Animated stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20"
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* For Institutions Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow">
                Built for <span className="text-indigo-300">Institutions</span>
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Everything you need to manage admissions, track applicants, and grow your student body – all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {institutionFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all group"
                >
                  <div className="h-12 w-12 bg-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-300 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <Link
                href="/apply-institution"
                className="inline-flex items-center bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:from-indigo-600/80 hover:to-purple-600/80 transition-all transform hover:scale-105 shadow-xl border border-white/30"
              >
                Register Your Institution
                <Building2 className="ml-2 h-5 w-5" />
              </Link>
              <p className="mt-4 text-sm text-white/70">
                Already registered? <Link href="/login" className="text-indigo-300 hover:underline">Sign in</Link>
              </p>
            </motion.div>
          </div>
        </section>

        {/* How It Works for Institutions */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow">
                Get started in <span className="text-purple-300">three simple steps</span>
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                From registration to managing applicants – we've made it effortless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Register', desc: 'Fill out a simple form to register your institution.' },
                { step: '02', title: 'Get Approved', desc: 'Our team verifies and approves your account.' },
                { step: '03', title: 'Start Managing', desc: 'Access your dashboard and review applications.' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-6xl font-bold text-white/20 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/70">{item.desc}</p>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-white/30" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial / Trust */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-2 bg-indigo-500/30 rounded-full mb-6 backdrop-blur-sm">
              <Shield className="h-6 w-6 text-indigo-300" />
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-white mb-8 drop-shadow">
              "KETRAMS transformed how we handle admissions. We now process applications 3x faster."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                JK
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">James Kiprop</p>
                <p className="text-sm text-white/70">Registrar, Butere TVC</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - centered on all devices */}
        <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col items-center md:flex-row md:justify-between gap-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-indigo-300" />
              <span className="text-lg font-bold text-white">KETRAMS</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/about" className="text-white/70 hover:text-white transition">About</Link>
              <Link href="/contact" className="text-white/70 hover:text-white transition">Contact</Link>
              <Link href="/privacy" className="text-white/70 hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="text-white/70 hover:text-white transition">Terms</Link>
            </div>
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} KETRAMS. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}