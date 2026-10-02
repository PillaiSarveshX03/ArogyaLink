'use client';

import React, { useState, useEffect } from 'react';
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
  Bell,
  Sparkles,
  BadgeCheck,
  Loader2,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { apiClient } from '@/lib/api';

const PRESET_AVATARS = [
  { label: 'Patient A', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: 'Patient B', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Senior Patient', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { label: 'Care Seeker', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { label: 'Gentle Health', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' }
];

export const UserProfileModal: React.FC = () => {
  const {
    user,
    isProfileModalOpen,
    setProfileModalOpen,
    updateProfile,
    caregivers,
    addCaregiver,
    removeCaregiver,
    toggleCaregiverConsent,
    updateCaregiverRules,
    metrics
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'medical' | 'caregiver'>('info');
  const [isEditing, setIsEditing] = useState(false);

  // Editable local state without hardcoded mock fallbacks
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [doctorName, setDoctorName] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [doctorHospital, setDoctorHospital] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [abhaAddress, setAbhaAddress] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [newHistoryItem, setNewHistoryItem] = useState('');

  const [newCondition, setNewCondition] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');

  // Caregiver add form inside modal
  const [showAddCgForm, setShowAddCgForm] = useState(false);
  const [cgName, setCgName] = useState('');
  const [cgRelation, setCgRelation] = useState('Family Member');
  const [cgPhone, setCgPhone] = useState('+91 ');
  const [cgEmail, setCgEmail] = useState('');
  const [isAbhaFetching, setIsAbhaFetching] = useState(false);

  // Populate state on user change
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDob(user.dateOfBirth || '');
      setBloodGroup(user.bloodGroup || 'O+');
      setAvatarUrl(user.avatarUrl || '');
      setDoctorName(user.doctorName || user.doctor?.name || '');
      setDoctorId(user.doctorId || user.doctor?.registrationId || '');
      setDoctorSpecialty(user.doctorSpecialty || '');
      setDoctorHospital(user.doctorHospital || user.doctor?.hospitalAddress || '');
      setDoctorEmail(user.doctorEmail || user.doctor?.email || '');
      setDoctorPhone(user.doctorPhone || user.doctor?.phone || '');
      setEmergencyContact(user.emergencyContact || '');
      setAbhaId(user.abhaId || '');
      setAbhaAddress(user.abhaAddress || '');
      setMedicalHistory(user.medicalHistory || []);
      setConditions(user.conditions || []);
      setAllergies(user.allergies || []);
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Profile picture size should be under 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64); // Instant preview

      try {
        const res = await apiClient.uploadAvatar(user.id, base64, file.name);
        if (res?.success && res.avatarUrl) {
          setAvatarUrl(res.avatarUrl);
          updateProfile({ avatarUrl: res.avatarUrl });
        }
      } catch (err) {
        console.warn('Avatar upload exception:', err);
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    setShowAvatarPresets(false);
    updateProfile({ avatarUrl: url });
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    setShowAvatarPresets(false);
    updateProfile({ avatarUrl: '' });
  };

  const handleAbhaIdFormat = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 14);
    let formatted = '';
    for (let i = 0; i < digitsOnly.length; i++) {
      if (i === 2 || i === 6 || i === 10) formatted += '-';
      formatted += digitsOnly[i];
    }
    setAbhaId(formatted);
  };

  const handleFetchAbhaDemo = async () => {
    setIsAbhaFetching(true);
    try {
      const res = await apiClient.simulateAbhaFetch({
        abhaId: abhaId || '91-4452-9812-4301',
        abhaAddress: abhaAddress || `${(name || 'user').toLowerCase().replace(/\s+/g, '.')}@abdm`
      });
      if (res?.success) {
        setAbhaId(res.abhaId);
        setAbhaAddress(res.abhaAddress);
        if (res.medicalHistory) {
          const combined = Array.from(new Set([...medicalHistory, ...res.medicalHistory]));
          setMedicalHistory(combined);
        }
        if (res.primaryDoctor) {
          setDoctorName(res.primaryDoctor.name);
          setDoctorId(res.primaryDoctor.registrationId);
          setDoctorHospital(res.primaryDoctor.hospitalAddress);
          setDoctorEmail(res.primaryDoctor.email);
          setDoctorPhone(res.primaryDoctor.phone);
        }
      }
    } catch {
      console.warn('ABHA simulation demo failed');
    } finally {
      setIsAbhaFetching(false);
    }
  };

  const handleSaveInfo = () => {
    updateProfile({
      name: name.trim() || user.name,
      phone,
      dateOfBirth: dob,
      bloodGroup,
      avatarUrl,
      doctorName,
      doctorId,
      doctorSpecialty,
      doctorHospital,
      doctorEmail,
      doctorPhone,
      emergencyContact,
      abhaId,
      abhaAddress,
      medicalHistory,
      conditions,
      allergies,
      doctor: {
        name: doctorName,
        registrationId: doctorId,
        hospitalAddress: doctorHospital,
        email: doctorEmail,
        phone: doctorPhone
      }
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

  const handleAddMedicalHistory = () => {
    if (newHistoryItem.trim() && !medicalHistory.includes(newHistoryItem.trim())) {
      const updated = [...medicalHistory, newHistoryItem.trim()];
      setMedicalHistory(updated);
      updateProfile({ medicalHistory: updated });
      setNewHistoryItem('');
    }
  };

  const handleRemoveMedicalHistory = (h: string) => {
    const updated = medicalHistory.filter(item => item !== h);
    setMedicalHistory(updated);
    updateProfile({ medicalHistory: updated });
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

  const handleCreateCaregiver = async () => {
    if (!cgName.trim() || !cgPhone.trim()) return;
    await addCaregiver({
      name: cgName.trim(),
      relation: cgRelation.trim(),
      phone: cgPhone.trim(),
      email: cgEmail.trim() || 'alerts@caregiver.example',
      consentGranted: true,
      notifyOnMissedDose: true,
      notifyAfterMinutes: 45,
      notifyOnLowStock: true,
    });
    setCgName('');
    setCgPhone('+91 ');
    setCgEmail('');
    setShowAddCgForm(false);
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
            {/* Avatar & Photo Upload */}
            <div className="relative group/avatar shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-inner overflow-hidden relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name || user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{(name || user.name || 'P').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Upload Action Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white text-sky-800 shadow-md hover:bg-sky-50 transition border border-sky-200 flex items-center justify-center cursor-pointer group-hover/avatar:scale-110"
                title="Upload Profile Picture"
              >
                <Camera className="w-3.5 h-3.5 text-sky-700" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileSelect}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex-1 max-w-xs">
                    <label className="text-[10px] text-sky-200 font-semibold uppercase tracking-wider block mb-0.5">Edit Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="bg-white/20 border border-white/40 rounded-lg px-2.5 py-1 text-sm sm:text-base font-bold text-white placeholder-white/60 focus:outline-hidden focus:bg-white/30 focus:border-white w-full"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{name || user.name}</h2>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 shrink-0">
                  {user.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100 mt-0.5 truncate">{user.email}</p>

              {/* Photo controls */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                  className="text-[10px] font-semibold text-sky-100 bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>{showAvatarPresets ? 'Close Avatars' : 'Choose Avatar'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-[10px] font-semibold text-rose-200 hover:text-white hover:underline transition cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-[11px] text-sky-100/90 font-medium flex-wrap">
                <span>Blood: <strong className="text-white">{bloodGroup || user.bloodGroup || 'B+'}</strong></span>
                <span>•</span>
                <span>Adherence: <strong className="text-white">{metrics.adherencePercentage}%</strong></span>
                <span>•</span>
                <span>Streak: <strong className="text-white">{metrics.streakDays} Days </strong></span>
              </div>
            </div>
          </div>

          {/* Quick Avatar Presets Picker */}
          {showAvatarPresets && (
            <div className="mt-3 p-3 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-sky-100">Select an Avatar Preset or upload your own</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] bg-white text-sky-900 font-bold px-2 py-0.5 rounded hover:bg-sky-50 transition flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-2.5 h-2.5" /> Upload File
                </button>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="relative shrink-0 rounded-xl overflow-hidden border-2 border-white/30 hover:border-white hover:scale-105 transition cursor-pointer group"
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-11 h-11 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-5 bg-black/20 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${activeTab === 'info'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-sky-100 hover:bg-white/10'
                }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Doctor & Details</span>
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${activeTab === 'medical'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-sky-100 hover:bg-white/10'
                }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Medical History</span>
            </button>
            <button
              onClick={() => setActiveTab('caregiver')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${activeTab === 'caregiver'
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
          {/* TAB 1: Doctor, ABHA & Personal Info */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600" />
                  Patient Profile & Physician
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

              {/* ABHA National Health Authority Card */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                      ABHA Digital Health Credentials
                    </h4>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleFetchAbhaDemo}
                      disabled={isAbhaFetching}
                      className="px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-700 border border-sky-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {isAbhaFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-sky-600" />}
                      Fetch from ABHA Demo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      ABHA Record ID (14 Digits)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        maxLength={17}
                        placeholder="XX-XXXX-XXXX-XXXX"
                        value={abhaId}
                        onChange={(e) => handleAbhaIdFormat(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold tracking-wider text-slate-800 uppercase focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                        {user.abhaId || <span className="text-slate-400 font-normal">Not configured</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      ABHA Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="username@abdm"
                        value={abhaAddress}
                        onChange={(e) => setAbhaAddress(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">
                        {user.abhaAddress || <span className="text-slate-400 font-normal">Not configured</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Doctor Details Card */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                  Primary / Family Doctor Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Doctor Name <span className="text-rose-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {user.doctorName || user.doctor?.name || <span className="text-slate-400 font-normal">Not specified</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Registration ID (Optional)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorId}
                        onChange={(e) => setDoctorId(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {user.doctorId || user.doctor?.registrationId || <span className="text-slate-400 font-normal">Not specified</span>}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Hospital / Clinic Address <span className="text-rose-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorHospital}
                        onChange={(e) => setDoctorHospital(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs text-slate-700 mt-0.5 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {user.doctorHospital || user.doctor?.hospitalAddress || <span className="text-slate-400 font-normal">Not specified</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Doctor Email (for Alerts) <span className="text-rose-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={doctorEmail}
                        onChange={(e) => setDoctorEmail(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs text-slate-700 mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {user.doctorEmail || user.doctor?.email || <span className="text-slate-400 font-normal">Not specified</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Doctor Phone Number <span className="text-rose-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={doctorPhone}
                        onChange={(e) => setDoctorPhone(e.target.value)}
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs text-slate-700 mt-0.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {user.doctorPhone || user.doctor?.phone || <span className="text-slate-400 font-normal">Not specified</span>}
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
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Legal Name"
                        className="mt-1 w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500"
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        {name || user.name}
                      </p>
                    )}
                  </div>

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
                        {user.phone || <span className="text-slate-400 font-normal">Not specified</span>}
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
                        {user.dateOfBirth || <span className="text-slate-400 font-normal">Not specified</span>}
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
                        {user.emergencyContact || <span className="text-slate-400 font-normal">Not configured</span>}
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
                  {conditions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No chronic conditions listed.</p>
                  ) : (
                    conditions.map((c) => (
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
                    ))
                  )}
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

              {/* Verified Medical History Tags */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    Verified Medical History & Past Surgeries
                  </h4>
                  <span className="text-[10px] text-sky-600 font-semibold">ABHA / Patient Record</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {medicalHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No medical history recorded yet.</p>
                  ) : (
                    medicalHistory.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200"
                      >
                        {h}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicalHistory(h)}
                          className="hover:text-sky-950 cursor-pointer"
                          title="Remove item"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newHistoryItem}
                    onChange={(e) => setNewHistoryItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMedicalHistory()}
                    placeholder="Add medical history item..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicalHistory}
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
                  {allergies.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No drug allergies recorded.</p>
                  ) : (
                    allergies.map((a) => (
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
                    ))
                  )}
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
            </div>
          )}

          {/* TAB 3: Multi-Caregiver & Sovereign Consent */}
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

              {/* Add Caregiver Button & Form */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Linked Caregivers ({caregivers.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddCgForm(!showAddCgForm)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddCgForm ? 'Close Form' : 'Add Caregiver'}
                </button>
              </div>

              {showAddCgForm && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800">Register New Caregiver</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={cgName}
                        onChange={(e) => setCgName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Relationship</label>
                      <input
                        type="text"
                        placeholder="e.g. Daughter / Spouse"
                        value={cgRelation}
                        onChange={(e) => setCgRelation(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone (+91)</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={cgPhone}
                        onChange={(e) => setCgPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="caregiver@example.com"
                        value={cgEmail}
                        onChange={(e) => setCgEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddCgForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCaregiver}
                      className="px-4 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl cursor-pointer shadow-xs"
                    >
                      Save Caregiver
                    </button>
                  </div>
                </div>
              )}

              {/* Caregiver Cards */}
              <div className="space-y-3">
                {caregivers.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No caregivers linked yet. Click &quot;Add Caregiver&quot; above to register family members.
                  </div>
                ) : (
                  caregivers.map((cg) => (
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

                        <div className="flex items-center gap-2">
                          {/* Sovereign Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => toggleCaregiverConsent(cg.id, !cg.consentGranted)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${cg.consentGranted ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                            title={cg.consentGranted ? 'Revoke Consent' : 'Grant Consent'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${cg.consentGranted ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                          </button>

                          {/* Delete Caregiver */}
                          <button
                            type="button"
                            onClick={() => removeCaregiver(cg.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Remove caregiver"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className={`font-semibold flex items-center gap-1 ${cg.consentGranted ? 'text-emerald-700' : 'text-slate-400'
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            ABHA ID: {user.abhaId}
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
