'use client';

import React, { useState } from 'react';
import { LineChart, CheckCircle } from 'lucide-react';
import { useApp } from '@/lib/store';

export const AdherenceChart: React.FC = () => {
  const { metrics } = useApp();
  const [selectedRange, setSelectedRange] = useState('Last 7 days');

  return (
    <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-card space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <LineChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Adherence Trend</h3>
            <p className="text-[10px] sm:text-xs text-slate-500">Daily completion tracking</p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="relative">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="text-[11px] sm:text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
          >
            <option>Last 7 days</option>
            <option>Last 14 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Visual Chart Representation with Clean Bars & Data Points */}
      <div className="pt-1 sm:pt-2">
        <div className="h-36 sm:h-44 flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-2 border-b border-slate-200 pb-2">
          {metrics.weeklyTrend.map((item, idx) => {
            const isToday = idx === metrics.weeklyTrend.length - 1;
            const heightPercent = Math.max(20, Math.min(100, item.rate));

            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1 group">
                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-12 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none z-10 font-bold whitespace-nowrap">
                  {item.day}: {item.rate}%
                </div>

                {/* Bar */}
                <div className="w-full max-w-[28px] sm:max-w-[36px] bg-slate-100 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-28 sm:h-36">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-sky-600 to-sky-400'
                        : item.rate >= 90
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        : 'bg-gradient-to-t from-amber-500 to-amber-300'
                    }`}
                  ></div>
                </div>

                {/* Day Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold ${
                    isToday ? 'text-sky-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.day}
                </span>
                <span className="text-[9px] text-slate-600 -mt-1 font-semibold">{item.rate}%</span>
              </div>
            );
          })}
        </div>

        {/* Legend & Target Line Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 sm:pt-3 text-[10px] sm:text-[11px] text-slate-500">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-emerald-500"></span> ≥90% Target
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-sky-500"></span> Today ({metrics.adherencePercentage}%)
            </span>
          </div>

          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Therapeutic Target Met
          </div>
        </div>
      </div>
    </div>
  );
};
