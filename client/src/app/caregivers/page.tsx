'use client';

import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Bell, Plus, Phone, Mail, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function CaregiversPage() {
  const { caregivers, toggleCaregiverConsent, updateCaregiverRules, setProfileModalOpen } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleToggleConsent = (id: string, current: boolean) => {
    toggleCaregiverConsent(id, !current);
  };

  return (
    <div className="space-y-6">
      {/* Consolidated Profile Notice Banner */}
      <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Unified with Health Profile</h2>
            <p className="text-xs text-slate-600">
              You can now access your doctor details, medical history, and caregivers directly from your user avatar.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setProfileModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          Open Health Profile Modal
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consent-Based Caregiver Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You maintain complete sovereign consent. Alerts are only dispatched when explicitly authorized.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Link Caregiver
        </button>
      </div>

      {/* Sovereign Consent Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 p-5 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Patient Sovereignty & Privacy Safeguard
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            In accordance with healthcare ethics and the application architecture, your health telemetry and missed-dose logs are never shared with family members, caregivers, or doctors without your verified opt-in consent. You can revoke permission at any moment.
          </p>
        </div>
      </div>

      {/* Caregiver Cards */}
      {caregivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">No Caregivers Linked Yet</p>
          <p>You maintain full sovereign consent over your healthcare data. You can link a family member, caregiver, or doctor at any time.</p>
        </div>
      ) : (
        <div className="space-y-4">
        {caregivers.map((cg) => (
          <div
            key={cg.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {cg.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {cg.name}
                    <span
                      className={`pill-badge ${
                        cg.consentGranted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {cg.consentGranted ? 'Consent Granted' : 'Consent Revoked'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">{cg.relation}</p>
                </div>
              </div>

              {/* Master Consent Toggle Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleConsent(cg.id, cg.consentGranted)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    cg.consentGranted
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  {cg.consentGranted ? 'Revoke Consent' : 'Grant Consent'}
                </button>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{cg.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{cg.email}</span>
              </div>
              {cg.grantedAt && (
                <div className="sm:col-span-2 text-[11px] text-slate-600">
                  Consent verified timestamp: <span className="font-semibold text-slate-700">{cg.grantedAt}</span>
                </div>
              )}
            </div>

            {/* Granular Rules (Only if consent granted) */}
            {cg.consentGranted ? (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Automated Notification Triggers
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Missed Dose Escalation</p>
                      <p className="text-[11px] text-slate-600 font-medium">Alert if dose not taken within 45 mins</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={cg.notifyOnMissedDose}
                      onChange={(e) =>
                        updateCaregiverRules(cg.id, { notifyOnMissedDose: e.target.checked })
                      }
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Refill & Low Stock Alert</p>
                      <p className="text-[11px] text-slate-600 font-medium">Alert when course has ≤ 5 days left</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={cg.notifyOnLowStock}
                      onChange={(e) =>
                        updateCaregiverRules(cg.id, { notifyOnLowStock: e.target.checked })
                      }
                      className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {cg.lastNotified && (
                  <p className="text-[11px] text-slate-600">
                    Last dispatch: <span className="font-semibold text-slate-700">{cg.lastNotified}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Consent currently inactive. No alerts or health logs are being transmitted.</span>
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {/* Modal to add caregiver */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Link Caregiver with Consent</h3>
            <p className="text-xs text-slate-500">
              Add a trusted family member or caregiver. They will only receive automated alerts if you approve.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Sibling / Care Nurse"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  alert(`Caregiver ${newName || 'contact'} added and consent pending verification.`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white"
              >
                Confirm & Request Consent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
