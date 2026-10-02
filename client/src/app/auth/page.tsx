'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pill, ShieldCheck, Lock, Mail, User, Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function AuthPage() {
  const router = useRouter();
  const { loginUser, registerUser } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up fields
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Type 2 Diabetes']);
  const [consentAgreed, setConsentAgreed] = useState(true);

  const availableConditions = [
    'Type 2 Diabetes',
    'Essential Hypertension',
    'Cardiovascular Health',
    'Cholesterol / Lipids',
    'Asthma / Respiratory',
    'General Health Adherence'
  ];

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter(c => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const success = await loginUser(loginEmail, loginPassword);
    setIsLoading(false);

    if (success) {
      router.push('/');
    } else {
      setErrorMessage('Invalid credentials. Please verify your email and password.');
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoginEmail('rahul.sharma@example.com');
    setLoginPassword('password123');

    await loginUser('rahul.sharma@example.com', 'password123');
    setIsLoading(false);
    router.push('/');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAgreed) {
      setErrorMessage('You must review and agree to the adherence data consent terms to register.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const success = await registerUser({
      name,
      email: signupEmail,
      password: signupPassword,
      role,
      conditions: selectedConditions
    });

    setIsLoading(false);

    if (success) {
      router.push('/');
    } else {
      setErrorMessage('Failed to create account. Please check your details and try again.');
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-6 px-3 sm:px-6">
      <div className="max-w-md w-full space-y-5">
        
        {/* Header Branding with Logo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <Image
              src="/logo.png"
              alt="ArogyaLink Logo"
              width={260}
              height={120}
              className="h-16 sm:h-20 w-auto mx-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
              priority
            />
          </Link>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            AI-Powered Medication Management, Deterministic Adherence & Sovereign Consent
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center text-xs font-bold text-slate-600 shadow-inner">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer text-center ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In Existing User
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer text-center ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
          
          {/* TAB 1: SIGN IN */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.sharma@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-base sm:text-xs font-medium pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset instructions would be routed to your verified email.')}
                    className="text-[11px] font-semibold text-sky-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-base sm:text-xs font-medium pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Patient Fast Login */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  Quick Sign In as Demo Patient (Rahul Sharma)
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT (SIGN UP) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alok Verma or Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-base sm:text-xs font-medium pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full text-base sm:text-xs font-medium pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a secure password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full text-base sm:text-xs font-medium pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                      role === 'patient'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    I am a Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('caregiver')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                      role === 'caregiver'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Family Caregiver
                  </button>
                </div>
              </div>

              {/* Health Conditions Tag Selector (for Patients) */}
              {role === 'patient' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Primary Health Focus (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableConditions.map((cond) => {
                      const isSelected = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sovereign Consent Checkbox */}
              <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 flex items-start gap-2 text-[11px] text-sky-950">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded mt-0.5 cursor-pointer"
                />
                <label htmlFor="consent" className="cursor-pointer leading-snug">
                  I agree to personalized medication schedule tracking and understand that AI insights are educational recommendations, not clinical prescriptions.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Security & Sovereign Consent Guarantee Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected with Supabase Authentication & Row-Level Security</span>
        </div>

      </div>
    </div>
  );
}
