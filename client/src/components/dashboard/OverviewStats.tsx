'use client';

import React from 'react';
import { TrendingUp, Pill, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useApp } from '@/lib/store';

export const OverviewStats: React.FC = () => {
  const { metrics, patientGreeting } = useApp();

  const percentageTaken = metrics.dosesTotalToday > 0
    ? Math.round((metrics.dosesTakenToday / metrics.dosesTotalToday) * 100)
    : 0;

  // SVG circular progress calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentageTaken / 100) * circumference;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header Greeting Banner matching Design 2 Mobile & Desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {patientGreeting}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hear your health summary today
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {metrics.streakDays > 0 ? (
              <>On Schedule ({metrics.streakDays} Day Streak 🔥)</>
            ) : (
              <>Account Active • Ready to track</>
            )}
          </span>
        </div>
      </div>

      {/* Grid of Key Metrics: 2 columns on Mobile (matching Design 2 Mobile screenshot) and 4 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* 1. Adherence Card */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-card hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Adherence
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.adherencePercentage}%
            </span>
            {metrics.lastWeekDelta > 0 && (
              <span className="inline-flex items-center text-[10px] sm:text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />+{metrics.lastWeekDelta}%
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate font-medium">Last 7 days</p>
        </div>

        {/* 2. Active Medications Card */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-card hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Meds
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.activeMedicationsCount}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">courses</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate font-medium">Metformin, this week</p>
        </div>

        {/* 3. Today's Dose Progress Ring */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-card hover:border-slate-300 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Progress
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
              {percentageTaken}%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke="#0284c7"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-[11px] sm:text-xs font-extrabold text-slate-800">
                {metrics.dosesTakenToday}/{metrics.dosesTotalToday}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {metrics.dosesTakenToday} of {metrics.dosesTotalToday} taken
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                {metrics.dosesTotalToday - metrics.dosesTakenToday} remaining
              </p>
            </div>
          </div>
        </div>

        {/* 4. Adherence Streak Card */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-card hover:border-slate-300 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Streak
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.streakDays}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-600">Days</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium">Deterministic adherence log</p>
        </div>

      </div>
    </div>
  );
};
