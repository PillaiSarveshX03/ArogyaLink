'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Stethoscope,
  Heart,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  Building,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Edit2,
  Save,
  ShieldAlert,
  Bell
} from 'lucide-react';
import { useApp } from '@/lib/store';

export const UserProfileModal: React.FC = () => {
  const {
    user,
    isProfileModalOpen,
    setProfileModalOpen,
    updateProfile,
    caregivers,
    toggleCaregiverConsent,
    updateCaregiverRules,
    metrics
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'caregiver'>('info');
  const [isEditing, setIsEditing] = useState(false);

  // Editable local state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [dob, setDob] = useState(user?.dateOfBirth || '1984-06-15');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'B+');
  const [doctorName, setDoctorName] = useState(user?.doctorName || 'Dr. Alok Verma');
  const [doctorSpecialty, setDoctorSpecialty] = useState(user?.doctorSpecialty || 'Cardiologist & Internal Medicine');
  const [doctorHospital, setDoctorHospital] = useState(user?.doctorHospital || 'Apollo Health City, New Delhi');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || 'Priya Sharma (+91 98765 43211)');

  const [newCondition, setNewCondition] = useState('');
  const [conditions, setConditions] = useState<string[]>(user?.conditions || ['Type 2 Diabetes', 'Essential Hypertension']);
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || ['Penicillin (mild rash)']);
  const [newAllergy, setNewAllergy] = useState('');

  if (!isProfileModalOpen || !user) return null;

  const handleSaveInfo = () => {
    updateProfile({
      name,
      phone,
      dateOfBirth: dob,
      bloodGroup,
      doctorName,
      doctorSpecialty,
      doctorHospital,
      emergencyContact,
      conditions,
      allergies
    });
    setIsEditing(false);
  };

  const handleAddCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      const updated = [...conditions, newCondition.trim()];
      setConditions(updated);
      updateProfile({ conditions: updated });
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (c: string) => {
    const updated = conditions.filter(item => item !== c);
    setConditions(updated);
    updateProfile({ conditions: updated });
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      const updated = [...allergies, newAllergy.trim()];
      setAllergies(updated);
      updateProfile({ allergies: updated });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (a: string) => {
    const updated = allergies.filter(item => item !== a);
    setAllergies(updated);
    updateProfile({ allergies: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 p-5 sm:p-6 text-white relative">
          <button
            onClick={() => setProfileModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white text-xl font-black shadow-inner">
              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-sky-100/90 font-medium">
                <span>Blood: <strong className="text-white">{user.bloodGroup || 'B+'}</strong></span>
                <span>•</span>
                <span>Adherence: <strong className="text-white">{metrics.adherencePercentage}%</strong></span>
                <span>•</span>
                <span>Streak: <strong className="text-white">{metrics.streakDays} Days 🔥</strong></span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-5 bg-black/20 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-sky-100 hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Doctor & Details</span>
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'medical'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-sky-100 hover:bg-white/10'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Medical History</span>
            </button>
            <button
              onClick={() => setActiveTab('caregiver')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'caregiver'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-sky-100 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Caregiver & Consent</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* TAB 1: Doctor & Personal Info */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  Primary Physician / Doctor
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) handleSaveInfo();
                    else setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </>
                  )}
                </button>
              </div>

              {/* Doctor Details Card */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Doctor Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                        {user.doctorName || 'Dr. Alok Verma'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Specialty
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorSpecialty}
                        onChange={(e) => setDoctorSpecialty(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {user.doctorSpecialty || 'Cardiologist & Internal Medicine'}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Hospital / Clinic Affiliation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorHospital}
                        onChange={(e) => setDoctorHospital(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {user.doctorHospital || 'Apollo Health City, New Delhi'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Identity & Emergency Card */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Personal & Emergency Contacts
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                      />
                    ) : (
                      <p className="text-xs font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                        {user.phone || '+91 98765 43210'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                      />
                    ) : (
                      <p className="text-xs font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        {user.dateOfBirth || '15 June 1984 (Age 40)'}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-500">Emergency Family Contact</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                      />
                    ) : (
                      <p className="text-xs font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        {user.emergencyContact || 'Priya Sharma (Daughter) — +91 98765 43211'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Medical History & Conditions */}
          {activeTab === 'medical' && (
            <div className="space-y-5">
              {/* Diagnosed Conditions */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Diagnosed Chronic Conditions
                  </h4>
                  <span className="text-[10px] text-slate-400">Used for drug interaction safety</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {conditions.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(c)}
                        className="hover:text-rose-900 cursor-pointer"
                        title="Remove condition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                    placeholder="Add diagnosed condition (e.g. Asthma)..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Known Drug Allergies */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Known Drug Allergies & Sensitivities
                  </h4>
                  <span className="text-[10px] text-amber-600 font-semibold">Strict OCR Warning</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allergies.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(a)}
                        className="hover:text-amber-900 cursor-pointer"
                        title="Remove allergy"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
                    placeholder="Add known allergy (e.g. Sulfa drugs)..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Clinical History Timeline */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verified Clinical History
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0"></div>
                    <p><strong>2019:</strong> Diagnosed with Essential Hypertension by Dr. Alok Verma. Started on Amlodipine.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0"></div>
                    <p><strong>2021:</strong> Diagnosed with Type 2 Diabetes Mellitus (HbA1c: 7.8%). Started on Metformin Hydrochloride 500mg.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0"></div>
                    <p><strong>2024:</strong> Quarterly adherence rate maintained at &gt;90% under ArogyaLink protocol.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Consolidated Caregiver & Sovereign Consent */}
          {activeTab === 'caregiver' && (
            <div className="space-y-5">
              {/* Sovereign Consent Banner */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Sovereign Consent & Privacy Safeguard
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Telemetry, missed doses, and medication logs are never shared with family or doctors without explicit patient consent. You can revoke consent at any second.
                  </p>
                </div>
              </div>

              {/* Caregiver Cards */}
              <div className="space-y-3">
                {caregivers.map((cg) => (
                  <div
                    key={cg.id}
                    className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{cg.name}</h4>
                          <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                            {cg.relation}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{cg.phone}</span>
                          <span>•</span>
                          <span>{cg.email}</span>
                        </p>
                      </div>

                      {/* Sovereign Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => toggleCaregiverConsent(cg.id, !cg.consentGranted)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          cg.consentGranted ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            cg.consentGranted ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className={`font-semibold flex items-center gap-1 ${
                        cg.consentGranted ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
                        {cg.consentGranted ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Consent Active (Authorized)
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                            Consent Revoked (Alerts Paused)
                          </>
                        )}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Notify after {cg.notifyAfterMinutes || 45}m missed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            ArogyaLink Sovereign Health Record • ID: {user.id.substring(0, 8)}...
          </p>
          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
