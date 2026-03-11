"use client";
import { useState, useEffect } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const images = [
  {
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    caption: 'Students in Kakamega',
  },
  {
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    caption: 'TVET Training',
  },
  {
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
    caption: 'Modern Education',
  },
];

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left side – Image carousel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-indigo-900">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute bottom-10 left-10 text-white">
              <p className="text-xl font-semibold">{image.caption}</p>
            </div>
          </div>
        ))}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-10 left-10 text-white">
          <h1 className="text-4xl font-bold">KETRAMS</h1>
          <p className="text-lg mt-2">Kakamega Education & Training Management System</p>
        </div>
      </div>

      {/* Right side – Form (slides in from right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 animate-slideInRight">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}