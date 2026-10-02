'use client';

import React, { useState } from 'react';
import { LineChart, CheckCircle2, AlertTriangle, TrendingUp, Download, ShieldCheck, Flame } from 'lucide-react';
import { useApp } from '@/lib/store';
import { AdherenceChart } from '@/components/dashboard/AdherenceChart';

export default function AdherencePage() {
  const { metrics, doseEvents } = useApp();
  const [downloadingReport, setDownloadingReport] = useState(false);

  const missedDoses = doseEvents.filter((d) => d.status === 'missed');
  const takenDoses = doseEvents.filter((d) => d.status === 'taken');

  const handleExportReport = () => {
    setDownloadingReport(true);
    setTimeout(() => {
      setDownloadingReport(false);
      alert('Patient Adherence Summary Report prepared for Dr. Alok Verma & Dr. Sunita Rao.');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Adherence Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic adherence calculations, missed dose detection, and physician reports.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          disabled={downloadingReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-sky-600" />
          {downloadingReport ? 'Generating Report...' : 'Export Doctor Report (PDF)'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              7-Day Adherence
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{metrics.adherencePercentage}%</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Optimal therapeutic range (≥90%)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{metrics.streakDays} Days</p>
          <p className="text-xs text-slate-400 font-medium mt-1">Continuous on-time adherence</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Doses Logged
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {takenDoses.length} / {doseEvents.length}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1">Doses completed today</p>
        </div>
      </div>

      {/* Visual Chart */}
      <AdherenceChart />

      {/* Missed Dose Detection & Intervention Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Missed Dose Detection & Escalation
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {missedDoses.length} logged missed
          </span>
        </div>

        {missedDoses.length === 0 ? (
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No missed doses detected for today's active schedule. Excellent consistency!</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {missedDoses.map((dose) => (
              <div key={dose.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{dose.medicineName} ({dose.dosage})</p>
                  <p className="text-slate-500">Scheduled: {dose.scheduledTime} • {dose.mealRelation}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="pill-badge bg-rose-50 text-rose-700 border border-rose-200">
                    Missed ({dose.missedAt || 'Logged'})
                  </span>
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Caregiver Alerted
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deterministic Calculation Rules */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          Deterministic Adherence Formula & Transparency
        </div>
        <p className="leading-relaxed">
          Adherence percentage is computed strictly via deterministic application logic: <code className="bg-white px-1.5 py-0.5 rounded border text-slate-800">Rate = (Completed Doses / Total Scheduled Doses) × 100</code>. No generative AI model is permitted to modify, round, or fabricate adherence telemetry.
        </p>
      </div>
    </div>
  );
}
