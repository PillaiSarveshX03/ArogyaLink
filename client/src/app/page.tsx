'use client';

import React from 'react';
import Link from 'next/link';
import { OverviewStats } from '@/components/dashboard/OverviewStats';
import { NextDoseCard } from '@/components/dashboard/NextDoseCard';
import { AdherenceChart } from '@/components/dashboard/AdherenceChart';
import { TodayMedicationsList } from '@/components/dashboard/TodayMedicationsList';
import { HealthInsightsBanner } from '@/components/dashboard/HealthInsightsBanner';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { Camera, ShieldCheck, PlusCircle } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function DashboardPage() {
  const { caregivers } = useApp();
  const primaryCaregiver = caregivers[0];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Stat Cards & Progress Ring */}
      <OverviewStats />

      {/* Main Responsive Grid: 2 columns on desktop, 1 on tablet/mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left / Main Column (2 spans on desktop) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Next Scheduled Dose Highlight Card */}
          <NextDoseCard />

          {/* Adherence Trend Chart */}
          <AdherenceChart />

          {/* Today's Medications List */}
          <TodayMedicationsList />
        </div>

        {/* Right Sidebar Column (1 span on desktop) */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Quick Action: Prescription Upload CTA Card */}
          <div className="bg-gradient-to-br from-sky-600 to-cyan-600 text-white p-4 sm:p-5 rounded-2xl shadow-elevated relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold">New Prescription?</h3>
                <p className="text-[11px] sm:text-xs text-sky-100">Upload photo for AI OCR extraction</p>
              </div>
            </div>
            <p className="text-xs text-sky-100/90 leading-relaxed mb-3 sm:mb-4">
              Scan medicine packaging or doctor slips. Review extracted data before creating your schedule.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 sm:py-2.5 px-4 rounded-xl bg-white text-sky-700 font-bold text-xs hover:bg-sky-50 shadow-sm transition min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              Start Upload & OCR Review
            </Link>
          </div>

          {/* Health Insights with AI Guardrails */}
          <HealthInsightsBanner />

          {/* Caregiver Status Quick Widget */}
          {primaryCaregiver && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Caregiver Linked
                </h3>
                <Link
                  href="/caregivers"
                  className="text-xs font-semibold text-sky-600 hover:underline"
                >
                  Manage
                </Link>
              </div>
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{primaryCaregiver.name}</p>
                  <p className="text-[11px] text-slate-500">{primaryCaregiver.relation}</p>
                </div>
                <span className="pill-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Consent Active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2">
                Missed dose alerts routed after 45 mins.
              </p>
            </div>
          )}

          {/* Recent Audit & Activity Feed */}
          <RecentActivityFeed />

        </div>

      </div>
    </div>
  );
}
