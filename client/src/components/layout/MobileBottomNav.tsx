'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Pill, Camera, CalendarCheck, User } from 'lucide-react';
import { useApp } from '@/lib/store';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user, setProfileModalOpen } = useApp();

  if (!user || pathname === '/auth') {
    return null;
  }

  const navTabs = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Meds', href: '/medications', icon: Pill },
    { label: 'Upload Rx', href: '/upload', icon: Camera, highlight: true },
    { label: 'Schedule', href: '/schedule', icon: CalendarCheck },
    { label: 'Profile', onClick: () => setProfileModalOpen(true), icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href ? pathname === tab.href : false;

          if (tab.highlight) {
            return (
              <Link
                key={tab.label}
                href={tab.href || '#'}
                className="flex flex-col items-center -mt-5 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-active:scale-95 transition-transform border-2 border-white">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-sky-700 mt-1">
                  Upload
                </span>
              </Link>
            );
          }

          if (tab.onClick) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={tab.onClick}
                className="flex flex-col items-center py-1 px-2 rounded-lg text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Icon className="w-5 h-5 mb-0.5 text-slate-600" />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.label}
              href={tab.href || '#'}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive ? 'text-sky-600 font-semibold' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-sky-600 stroke-[2.2]' : 'text-slate-600'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
