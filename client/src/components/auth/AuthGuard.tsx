'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ShieldCheck, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authInitialized } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/auth';
  const isOnboardingPage = pathname === '/onboarding';

  useEffect(() => {
    if (authInitialized) {
      if (!user && !isAuthPage) {
        router.push('/auth');
      } else if (
        user &&
        user.role === 'patient' &&
        !user.onboardingCompleted &&
        !isOnboardingPage &&
        !isAuthPage
      ) {
        // Abandonment Rule: If mandatory onboarding not completed, force redirect to /onboarding
        router.push('/onboarding');
      }
    }
  }, [user, authInitialized, isAuthPage, isOnboardingPage, router]);

  // While checking local storage session on initial mount
  if (!authInitialized) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Verifying session...</p>
      </div>
    );
  }

  // If signed out and attempting to view any protected page
  if (!user && !isAuthPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-4 border border-sky-100 shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          You are currently signed out. Please sign in with your patient or caregiver credentials to access your medication courses, adherence tracking, and AI assistant.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold text-sm shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-cyan-500 transition"
        >
          <LogIn className="w-4 h-4" />
          <span>Go to Sign In Portal</span>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
