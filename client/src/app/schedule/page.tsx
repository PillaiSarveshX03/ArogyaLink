'use client';

import React, { useState } from 'react';
import { CalendarCheck, Clock, CheckCircle2, XCircle, Bell, ShieldCheck, Filter } from 'lucide-react';
import { useApp } from '@/lib/store';

const SchedulePage: React.FC = () => {
  const { doseEvents, markDose, courses } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken' | 'missed'>('all');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const filteredDoses = doseEvents.filter((d) => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personalized Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic daily dose timeline, smart reminders, and active verification.
          </p>
        </div>

        {/* Smart Reminder Toggle */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
          <Bell className={`w-4 h-4 ${remindersEnabled ? 'text-sky-600' : 'text-slate-400'}`} />
          <span className="text-xs font-semibold text-slate-700">Smart Reminders</span>
          <button
            type="button"
            onClick={() => setRemindersEnabled(!remindersEnabled)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
              remindersEnabled ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                remindersEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {(['all', 'pending', 'taken', 'missed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
              filter === tab
                ? 'bg-sky-100 text-sky-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredDoses.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No doses found matching "{filter}".
          </div>
        ) : (
          filteredDoses.map((dose) => {
            const isTaken = dose.status === 'taken';
            const isMissed = dose.status === 'missed';
            const isPending = dose.status === 'pending';

            return (
              <div
                key={dose.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center bg-sky-50 text-sky-700 w-16 h-16 rounded-xl shrink-0 border border-sky-100">
                    <Clock className="w-4 h-4 mb-0.5 text-sky-600" />
                    <span className="text-[11px] font-bold text-center leading-tight">
                      {dose.scheduledTime}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{dose.medicineName}</h3>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {dose.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Meal Rule: <span className="font-semibold text-slate-700">{dose.mealRelation}</span>
                    </p>
                    {dose.takenAt && (
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        ✓ Logged as taken at {dose.takenAt}
                      </p>
                    )}
                    {dose.missedAt && (
                      <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                        ⚠️ Logged as missed at {dose.missedAt} (Caregiver notified)
                      </p>
                    )}
                  </div>
                </div>

                {/* Dose Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isPending && (
                    <>
                      <button
                        onClick={() => markDose(dose.id, 'taken')}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark as Taken
                      </button>
                      <button
                        onClick={() => markDose(dose.id, 'missed')}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-semibold text-xs border border-slate-200 transition cursor-pointer"
                      >
                        Log Missed
                      </button>
                    </>
                  )}

                  {isTaken && (
                    <div className="flex items-center gap-2">
                      <span className="pill-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Taken
                      </span>
                      <button
                        onClick={() => markDose(dose.id, 'pending')}
                        className="text-xs text-slate-400 hover:text-slate-600 underline"
                      >
                        Reset
                      </button>
                    </div>
                  )}

                  {isMissed && (
                    <div className="flex items-center gap-2">
                      <span className="pill-badge bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Missed
                      </span>
                      <button
                        onClick={() => markDose(dose.id, 'taken')}
                        className="text-xs text-sky-600 hover:text-sky-800 underline font-semibold"
                      >
                        Mark Taken Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deterministic Architecture Notice */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>Deterministic Scheduling Guarantee:</strong> Timings and reminders follow strict, verified clinical inputs rather than generative AI hallucinations. Doses must be taken within prescribed windows.
        </p>
      </div>
    </div>
  );
};

export default SchedulePage;
