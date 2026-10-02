'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Bell,
  Plus,
  Phone,
  Mail,
  AlertTriangle,
  Check,
  ShieldAlert,
  Trash2,
  Edit2,
  X,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { CaregiverConsent } from '@/lib/types';

export default function CaregiversPage() {
  const {
    caregivers,
    addCaregiver,
    updateCaregiver,
    removeCaregiver,
    toggleCaregiverConsent,
    updateCaregiverRules,
    setProfileModalOpen
  } = useApp();

  // Add Caregiver Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Family Member');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newEmail, setNewEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Caregiver Modal State
  const [editingCaregiver, setEditingCaregiver] = useState<CaregiverConsent | null>(null);
  const [editName, setEditName] = useState('');
  const [editRelation, setEditRelation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setNewName('');
    setNewRelation('Family Member');
    setNewPhone('+91 ');
    setNewEmail('');
    setAddError(null);
    setShowAddModal(true);
  };

  const handleSaveNewCaregiver = async () => {
    if (!newName.trim()) {
      setAddError('Caregiver Full Name is required.');
      return;
    }
    if (!newPhone.trim() || newPhone.trim() === '+91' || newPhone.trim().length < 8) {
      setAddError('Valid Phone Number with country code is required (e.g. +91 98765 43210).');
      return;
    }
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setAddError('Valid Email Address is required for alert dispatches.');
      return;
    }

    await addCaregiver({
      name: newName.trim(),
      relation: newRelation.trim() || 'Family Member',
      phone: newPhone.trim(),
      email: newEmail.trim(),
      consentGranted: true,
      grantedAt: new Date().toLocaleString(),
      notifyOnMissedDose: true,
      notifyAfterMinutes: 45,
      notifyOnLowStock: true,
    });

    setShowAddModal(false);
  };

  const handleOpenEdit = (cg: CaregiverConsent) => {
    setEditingCaregiver(cg);
    setEditName(cg.name);
    setEditRelation(cg.relation);
    setEditPhone(cg.phone);
    setEditEmail(cg.email);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCaregiver) return;
    if (!editName.trim()) {
      setEditError('Caregiver Full Name is required.');
      return;
    }
    if (!editPhone.trim() || editPhone.trim().length < 8) {
      setEditError('Valid Phone Number with country code is required.');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      setEditError('Valid Email Address is required.');
      return;
    }

    await updateCaregiver(editingCaregiver.id, {
      name: editName.trim(),
      relation: editRelation.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
    });

    setEditingCaregiver(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await removeCaregiver(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Notice Banner */}
      <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Unified Sovereign Health Profile</h2>
            <p className="text-xs text-slate-600">
              Manage multi-caregiver escalation, primary family doctor details, and ABHA credentials in real time.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setProfileModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          View Full Profile
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Multi-Caregiver Registration & Escalation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You maintain complete sovereign consent. Alerts and missed dose logs are only dispatched when explicitly authorized.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register Caregiver
        </button>
      </div>

      {/* Sovereign Consent Safeguard Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 p-5 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Patient Sovereignty & Privacy Safeguard (Phase-1)
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            In accordance with Indian healthcare regulations and ArogyaLink protocol, your health telemetry and adherence logs are never transmitted to any caregiver or doctor without your explicit opt-in consent. You can revoke permission at any moment with immediate effect.
          </p>
        </div>
      </div>

      {/* Caregiver Cards */}
      {caregivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">No Caregivers Registered Yet</p>
          <p className="max-w-sm mx-auto text-slate-500">
            Add a spouse, family member, or visiting nurse. Once approved, they can be configured for missed dose escalations in Phase 2.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add First Caregiver
          </button>
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
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {cg.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {cg.name}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          cg.consentGranted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {cg.consentGranted ? 'Consent Active' : 'Consent Revoked'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">{cg.relation}</p>
                  </div>
                </div>

                {/* Action Buttons: Edit, Delete, and Master Consent Toggle */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cg)}
                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition cursor-pointer"
                    title="Edit Caregiver"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingId(cg.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Remove Caregiver"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCaregiverConsent(cg.id, !cg.consentGranted)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      cg.consentGranted
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {cg.consentGranted ? 'Revoke Consent' : 'Grant Consent'}
                  </button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span>{cg.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  <span>{cg.email}</span>
                </div>
                {cg.grantedAt && (
                  <div className="sm:col-span-2 text-[11px] text-slate-500">
                    Consent verified timestamp: <span className="font-semibold text-slate-700">{cg.grantedAt}</span>
                  </div>
                )}
              </div>

              {/* Notification Triggers Configuration */}
              {cg.consentGranted ? (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Automated Notification Triggers (Phase-1 Foundation)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Missed Dose Escalation</p>
                        <p className="text-[11px] text-slate-500">Alert if dose not taken within 45 mins</p>
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
                        <p className="text-[11px] text-slate-500">Alert when medication supply has &le; 5 days left</p>
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
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sovereign Consent currently inactive. No notifications or logs are being dispatched to this contact.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD CAREGIVER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" />
                Register New Caregiver
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Daughter / Visiting Nurse"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Phone Number (with Country Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43211"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="priya.sharma@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewCaregiver}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition cursor-pointer"
              >
                Save & Authorize Consent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CAREGIVER */}
      {editingCaregiver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-600" />
                Edit Caregiver Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingCaregiver(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Relationship</label>
                <input
                  type="text"
                  value={editRelation}
                  onChange={(e) => setEditRelation(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number (+91)</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCaregiver(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Update Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Remove Linked Caregiver?</h3>
            <p className="text-xs text-slate-500">
              This action will revoke all consent and permanently stop automated missed-dose dispatches to this person.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Keep Caregiver
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
