'use client';

import React from 'react';
import { History, FileText, CheckCircle2, Bell, AlertTriangle, UserCheck } from 'lucide-react';
import { useApp } from '@/lib/store';

export const RecentActivityFeed: React.FC = () => {
  const { activities } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'prescription_uploaded':
        return <FileText className="w-3.5 h-3.5 text-sky-600" />;
      case 'medication_confirmed':
      case 'dose_taken':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'caregiver_alert':
        return <UserCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'dose_missed':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          Recent Activity
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">Live Log</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No recent activity yet.</p>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                  <span className="text-[10px] text-slate-600 shrink-0 font-medium">{act.timestamp}</span>
                </div>
                <p className="text-slate-600 text-[11px] truncate mt-0.5">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
