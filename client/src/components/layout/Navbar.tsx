'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Pill, CalendarCheck, ShieldCheck, Sparkles, UploadCloud, Bell, Search, UserCheck, LogOut, LogIn, ChevronDown, User } from 'lucide-react';
import { useApp } from '@/lib/store';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setAssistantOpen, metrics, nextPendingDose, user, logoutUser, setProfileModalOpen } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Activity },
    { label: 'Upload', href: '/upload', icon: UploadCloud },
    { label: 'Medications', href: '/medications', icon: Pill },
    { label: 'Schedule', href: '/schedule', icon: CalendarCheck },
    { label: 'Adherence', href: '/adherence', icon: Activity },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo only in Navbar as requested */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group py-1">
              <Image
                src="/logo.png"
                alt="ArogyaLink"
                width={180}
                height={52}
                className="h-9 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation Links (Only shown when logged in) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-600'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {user && (
              <>
                {/* Search Icon */}
                <button
                  onClick={() => setAssistantOpen(true)}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
                  title="Search medicines or ask AI"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </button>

                {/* AI Assistant Quick Trigger */}
                <button
                  onClick={() => setAssistantOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-sky-700 hover:border-sky-300 hover:shadow-xs transition text-xs font-semibold cursor-pointer"
                  title="Open AI Medication Assistant"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                  <span className="hidden sm:inline">AI Assistant</span>
                </button>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {nextPendingDose && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Patient Profile Dropdown / Auth State */}
            {user ? (
              <div className="relative pl-1 sm:pl-2 sm:border-l sm:border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-sky-100 overflow-hidden">
                    <span className="text-[10px] sm:text-xs font-bold">{initials}</span>
                  </div>
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      {user.name}
                      <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition" />
                    </p>
                    <p className="text-emerald-700 font-medium">{metrics.adherencePercentage}% Adherence</p>
                  </div>
                </button>

                {/* Profile Popup Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in">
                    <div className="p-2.5 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 px-2 py-0.5 rounded">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileModalOpen(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-800 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer text-left font-semibold"
                      >
                        <User className="w-4 h-4 text-sky-600" />
                        <span>My Health Profile</span>
                      </button>

                      <Link
                        href="/auth"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                      >
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        Switch / Register User
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          logoutUser();
                          setShowProfileMenu(false);
                          router.push('/auth');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
