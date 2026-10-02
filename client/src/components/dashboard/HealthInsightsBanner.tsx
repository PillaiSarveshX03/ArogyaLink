'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Sparkles, ShieldAlert, X } from 'lucide-react';
import { useApp } from '@/lib/store';

export const HealthInsightsBanner: React.FC = () => {
  const { insights, dismissInsight } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(insights[0]?.id || null);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          Medication Health Insights
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
            {insights.length} Advisory
          </span>
        </h3>
      </div>

      <div className="space-y-2.5">
        {insights.map((insight) => {
          const isExpanded = expandedId === insight.id;

          return (
            <div
              key={insight.id}
              className="bg-white rounded-2xl border border-amber-200/80 shadow-card p-4 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-900">{insight.title}</span>
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                        {insight.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{insight.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-0.5 px-2 py-1 rounded hover:bg-slate-100 transition"
                  >
                    {isExpanded ? 'Less' : 'Details'}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => dismissInsight(insight.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Collapsible Details & Mandatory Guardrail Notice */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2 animate-in fade-in duration-200">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-800 mb-0.5">Clinical Note / Recommendation:</p>
                    <p>{insight.recommendation}</p>
                  </div>

                  {/* Mandatory Clinical Guardrail Disclaimer */}
                  <div className="flex items-start gap-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Important Product Guardrail: </span>
                      {insight.disclaimer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
