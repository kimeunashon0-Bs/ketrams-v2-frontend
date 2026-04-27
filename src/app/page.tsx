"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
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
    const duration = 1500;
    const increment = end / (duration / 16);

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
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const { scrollY } = useScroll();
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)']
  );
  const navBlur = useTransform(scrollY, [0, 100], [8, 12]);

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
    { value: 68, suffix: '+', label: 'Institutions' },
    { value: 5000, suffix: '+', label: 'Students Enrolled' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate' },
    { value: 24, suffix: '/7', label: 'Support' },
  ];

  const institutionFeatures = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Centralised Admissions',
      description: 'Manage all applications from one dashboard with real‑time tracking.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Faster Processing',
      description: 'Reduce paperwork and accelerate enrollment cycles across all polytechnics.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Compliant',
      description: 'Data protection and county education regulations built‑in.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Multi‑Role Access',
      description: 'Tailored dashboards for institutions, treasury, and ministry officials.',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1486&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-indigo-900/70 to-purple-900/60 mix-blend-multiply" />
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20`} />
      </div>

      {/* Navbar */}
      <motion.nav
        style={{
          backgroundColor: navBackground,
          backdropFilter: `blur(${navBlur}px)`,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-lg shadow-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                KACOPO-IMS
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-white/90 hover:text-white transition text-sm font-medium px-4 py-2 rounded-full hover:bg-white/10"
              >
                Sign In
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-gradient-to-r from-blue-500/80 to-indigo-600/80 backdrop-blur-md text-white px-6 py-2 rounded-full hover:from-blue-600/90 hover:to-indigo-700/90 transition-all border border-white/20 shadow-lg flex items-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
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
                    className="absolute right-0 mt-2 w-64 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl py-2 border border-white/30 overflow-hidden z-50"
                  >
                    <Link
                      href="/register"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-white hover:bg-blue-600/40 transition-colors"
                    >
                      <GraduationCap className="h-5 w-5 mr-3 text-blue-300" />
                      <div>
                        <p className="font-medium">Student Registration</p>
                        <p className="text-xs text-white/80">Apply to polytechnics</p>
                      </div>
                    </Link>
                    <Link
                      href="/apply-institution"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-3 text-white hover:bg-green-600/40 transition-colors"
                    >
                      <Building2 className="h-5 w-5 mr-3 text-green-300" />
                      <div>
                        <p className="font-medium">Institution Registration</p>
                        <p className="text-xs text-white/80">Register your polytechnic</p>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="h-20" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-200 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              Kakamega County Polytechnics Information Management System
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl"
          >
            Centralised Management for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 animate-pulse">
              County Polytechnics
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl text-white/90 max-w-3xl mx-auto mb-12 drop-shadow-lg"
          >
            KACOPO-IMS – The unified platform for managing student admissions, staff, assets, and reporting across all TVET institutions in Kakamega County.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register"
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              Apply as Student
              <GraduationCap className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/apply-institution"
              className="group relative bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              Register Institution
              <Building2 className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
              >
                <div className="text-4xl md:text-5xl font-bold text-white">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/80 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Institutions Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Built for <span className="text-indigo-300">Polytechnics &amp; County Officials</span>
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              A complete ecosystem for admissions, staff management, asset tracking, and data‑driven decision making.
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
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-indigo-400/50 transition-all shadow-xl"
              >
                <div className="h-12 w-12 bg-indigo-500/40 rounded-xl flex items-center justify-center text-indigo-300 mb-4 group-hover:scale-110 transition-transform">
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
              className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl border border-white/20"
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

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
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
                className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl"
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

      {/* Testimonial */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-500/30 rounded-full mb-6 backdrop-blur-sm">
            <Shield className="h-6 w-6 text-indigo-300" />
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium text-white mb-8 drop-shadow-lg">
            "KACOPO-IMS has transformed how we manage admissions and institutional data. It's a game changer for county polytechnics."
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              CO
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Chief Officer</p>
              <p className="text-sm text-white/70">Ministry of Education, Kakamega</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white border-t border-white/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr] items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
              <span className="text-lg font-semibold uppercase tracking-[0.18em] text-white">
                KACOPO-IMS
              </span>
            </div>
            <p className="max-w-lg text-sm text-slate-300">
              Kakamega County's unified platform for admissions, institution management, staff coordination, and reporting across TVET campuses.
            </p>
            <p className="text-sm text-slate-400">
              Built to simplify operations, secure data, and support seamless collaboration between schools, ministry officers, and treasury staff.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Quick links
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Contact
            </h3>
            <p className="text-sm text-slate-400">
              Kakamega County Government
            </p>
            <p className="text-sm text-slate-400">
              support@kacopo-ims.app
            </p>
            <p className="text-sm text-slate-400">
              +254 700 000 000
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} Kakamega County Government. All rights reserved.
        </div>
      </footer>
    </div>
  );
}