'use client';

import React, { useState } from 'react';
import { Clock, Check, AlertCircle, Sparkles, Utensils, ShieldCheck, Mail } from 'lucide-react';
import { useApp } from '@/lib/store';

export const NextDoseCard: React.FC = () => {
  const { nextPendingDose, markDose, courses } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (courses.length === 0) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 p-6 rounded-2xl shadow-card text-center">
        <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Medications Scheduled Yet</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
          Add your active prescription or scan a prescription packaging to create your personalized dosing schedule.
        </p>
      </div>
    );
  }

  if (!nextPendingDose) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-2xl shadow-card text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <h3 className="text-base font-bold text-slate-800">All Scheduled Doses Completed!</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
          You've taken all your scheduled medications for today. Your adherence score has been updated.
        </p>
      </div>
    );
  }

  const handleAction = async (status: 'taken' | 'missed') => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 300));
    markDose(nextPendingDose.id, status);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-sky-100 p-5 shadow-elevated relative overflow-hidden">
      {/* Decorative top ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-cyan-400"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Medicine Info */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-600" />
              Next Dose Due
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Utensils className="w-3 h-3 text-slate-400" />
              {nextPendingDose.mealRelation}
            </span>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
              <Mail className="w-3 h-3 text-sky-600" />
              Email reminder active
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {nextPendingDose.medicineName}
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {nextPendingDose.dosage}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Scheduled for <span className="font-bold text-slate-800">{nextPendingDose.scheduledTime}</span> today. Follow standard doctor meal instructions.
            </p>
          </div>
        </div>

        {/* Action Buttons with High-Contrast Touch Targets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-0">
          <button
            onClick={() => handleAction('taken')}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Mark as Taken
          </button>

          <button
            onClick={() => handleAction('missed')}
            disabled={isSubmitting}
            className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Log as missed to update adherence and trigger consent notifications if configured"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Log Missed
          </button>
        </div>
      </div>

      {/* Safety Micro-Banner */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Deterministic schedule verification active
        </span>
        <span className="text-slate-600 font-medium">
          Dose ID: {nextPendingDose.id}
        </span>
      </div>
    </div>
  );
};
