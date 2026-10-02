'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, CheckCircle2, Clock, XCircle, ChevronRight, AlertCircle, Mail } from 'lucide-react';
import { useApp } from '@/lib/store';

export const TodayMedicationsList: React.FC = () => {
  const { doseEvents, markDose } = useApp();

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">Today's Medication Doses</h3>
          <p className="text-[10px] sm:text-xs text-slate-500">Scheduled times and status</p>
        </div>
        <Link
          href="/medications"
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 hover:underline"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {doseEvents.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No medication doses scheduled for today.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
        {doseEvents.map((dose) => {
          const isTaken = dose.status === 'taken';
          const isMissed = dose.status === 'missed';
          const isPending = dose.status === 'pending';

          return (
            <div
              key={dose.id}
              className="py-3 sm:py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition"
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isTaken
                      ? 'bg-emerald-50 text-emerald-600'
                      : isMissed
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800">{dose.medicineName}</h4>
                    <span className="text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      {dose.dosage}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {dose.scheduledTime}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{dose.mealRelation}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                      <Mail className="w-2.5 h-2.5 text-sky-600" /> Email reminder active
                    </span>
                    {dose.takenAt && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-emerald-600 font-medium hidden sm:inline">Logged at {dose.takenAt}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Action / Badge (Mobile Touch Target Optimized) */}
              <div className="flex items-center gap-2 self-end sm:self-auto pt-1 sm:pt-0">
                {isTaken && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Taken
                  </span>
                )}

                {isMissed && (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Missed
                    </span>
                    <button
                      onClick={() => markDose(dose.id, 'taken')}
                      className="text-[11px] text-sky-600 hover:text-sky-800 underline font-semibold"
                    >
                      Undo
                    </button>
                  </div>
                )}

                {isPending && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => markDose(dose.id, 'taken')}
                      className="px-3.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer min-h-[38px] sm:min-h-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Taken
                    </button>
                    <button
                      onClick={() => markDose(dose.id, 'missed')}
                      className="p-2 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-md transition min-h-[38px] sm:min-h-0 flex items-center justify-center"
                      title="Log Missed"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
