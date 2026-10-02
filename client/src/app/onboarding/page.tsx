'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  Calendar,
  Phone,
  ShieldCheck,
  Stethoscope,
  Heart,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building,
  Mail,
  AlertCircle,
  FileText,
  BadgeCheck,
  Loader2
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { DoctorProfile, CaregiverConsent } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding, addCaregiver } = useApp();

  // Multi-step index: 0 = Profile & DOB, 1 = ABHA & Medical History, 2 = Family Doctor, 3 = Caregivers & Finish
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Core Patient Profile
  const [name, setName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [phone, setPhone] = useState(user?.phone || '+91 ');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');

  // Step 2: ABHA & Medical History
  const [abhaId, setAbhaId] = useState(user?.abhaId || '');
  const [abhaAddress, setAbhaAddress] = useState(user?.abhaAddress || '');
  const [medicalHistory, setMedicalHistory] = useState<string[]>(user?.medicalHistory || []);
  const [newHistoryItem, setNewHistoryItem] = useState('');
  const [isAbhaFetching, setIsAbhaFetching] = useState(false);
  const [showAbhaDemoModal, setShowAbhaDemoModal] = useState(false);
  const [abhaVerifiedBadge, setAbhaVerifiedBadge] = useState(false);

  // Step 3: Family Doctor
  const [doctorName, setDoctorName] = useState(user?.doctorName || '');
  const [doctorId, setDoctorId] = useState(user?.doctorId || '');
  const [doctorHospital, setDoctorHospital] = useState(user?.doctorHospital || '');
  const [doctorEmail, setDoctorEmail] = useState(user?.doctorEmail || '');
  const [doctorPhone, setDoctorPhone] = useState(user?.doctorPhone || '+91 ');

  // Step 4: Caregiver Registration
  const [caregiverList, setCaregiverList] = useState<Array<Omit<CaregiverConsent, 'id'>>>([]);
  const [cgName, setCgName] = useState('');
  const [cgRelation, setCgRelation] = useState('Family Member');
  const [cgPhone, setCgPhone] = useState('+91 ');
  const [cgEmail, setCgEmail] = useState('');

  // Sync draft or prefilled data
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.dateOfBirth && !dateOfBirth) setDateOfBirth(user.dateOfBirth);
      if (user.phone && phone === '+91 ') setPhone(user.phone);
    }

    // Check draft in local storage
    if (typeof window !== 'undefined') {
      const draft = localStorage.getItem('arogyalink_onboarding_draft');
      if (draft) {
        try {
          const d = JSON.parse(draft);
          if (d.name) setName(d.name);
          if (d.dateOfBirth) setDateOfBirth(d.dateOfBirth);
          if (d.phone) setPhone(d.phone);
          if (d.bloodGroup) setBloodGroup(d.bloodGroup);
          if (d.abhaId) setAbhaId(d.abhaId);
          if (d.abhaAddress) setAbhaAddress(d.abhaAddress);
          if (d.medicalHistory) setMedicalHistory(d.medicalHistory);
          if (d.doctorName) setDoctorName(d.doctorName);
          if (d.doctorId) setDoctorId(d.doctorId);
          if (d.doctorHospital) setDoctorHospital(d.doctorHospital);
          if (d.doctorEmail) setDoctorEmail(d.doctorEmail);
          if (d.doctorPhone) setDoctorPhone(d.doctorPhone);
          if (d.caregiverList) setCaregiverList(d.caregiverList);
        } catch { }
      }
    }
  }, [user]);

  // Persist draft changes
  const saveDraft = () => {
    if (typeof window !== 'undefined') {
      const draftData = {
        name,
        dateOfBirth,
        phone,
        bloodGroup,
        abhaId,
        abhaAddress,
        medicalHistory,
        doctorName,
        doctorId,
        doctorHospital,
        doctorEmail,
        doctorPhone,
        caregiverList
      };
      localStorage.setItem('arogyalink_onboarding_draft', JSON.stringify(draftData));
    }
  };

  // ABHA ID Input Auto-Formatting (XX-XXXX-XXXX-XXXX)
  const handleAbhaIdChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 14);
    let formatted = '';
    for (let i = 0; i < digitsOnly.length; i++) {
      if (i === 2 || i === 6 || i === 10) {
        formatted += '-';
      }
      formatted += digitsOnly[i];
    }
    setAbhaId(formatted);
  };

  // Simulated ABHA Fetch Demo
  const triggerAbhaDemoFetch = async () => {
    setIsAbhaFetching(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.simulateAbhaFetch({
        abhaId: abhaId || '91-4452-9812-4301',
        abhaAddress: abhaAddress || `${(name || 'user').toLowerCase().replace(/\s+/g, '.')}@abdm`
      });

      if (res && res.success) {
        setAbhaId(res.abhaId);
        setAbhaAddress(res.abhaAddress);
        if (!dateOfBirth && res.dateOfBirth) setDateOfBirth(res.dateOfBirth);
        if (res.medicalHistory && res.medicalHistory.length > 0) {
          // Merge unique medical history
          const combined = Array.from(new Set([...medicalHistory, ...res.medicalHistory]));
          setMedicalHistory(combined);
        }
        if (res.primaryDoctor) {
          if (!doctorName) setDoctorName(res.primaryDoctor.name);
          if (!doctorId) setDoctorId(res.primaryDoctor.registrationId);
          if (!doctorHospital) setDoctorHospital(res.primaryDoctor.hospitalAddress);
          if (!doctorEmail) setDoctorEmail(res.primaryDoctor.email);
          if (!doctorPhone || doctorPhone === '+91 ') setDoctorPhone(res.primaryDoctor.phone);
        }
        setAbhaVerifiedBadge(true);
        setShowAbhaDemoModal(true);
      }
    } catch {
      setErrorMessage('Could not connect to ABHA demonstration sandbox.');
    } finally {
      setIsAbhaFetching(false);
    }
  };

  const handleAddMedicalHistory = () => {
    if (newHistoryItem.trim() && !medicalHistory.includes(newHistoryItem.trim())) {
      setMedicalHistory([...medicalHistory, newHistoryItem.trim()]);
      setNewHistoryItem('');
    }
  };

  const handleRemoveMedicalHistory = (index: number) => {
    setMedicalHistory(medicalHistory.filter((_, i) => i !== index));
  };

  // Add Caregiver to temporary list
  const handleAddCaregiverDraft = () => {
    if (!cgName.trim() || !cgPhone.trim()) {
      setErrorMessage('Caregiver Name and Phone Number are required.');
      return;
    }
    setErrorMessage(null);
    const newEntry: Omit<CaregiverConsent, 'id'> = {
      name: cgName.trim(),
      relation: cgRelation.trim(),
      phone: cgPhone.trim(),
      email: cgEmail.trim() || 'alerts@caregiver.example',
      consentGranted: true,
      grantedAt: new Date().toLocaleString(),
      notifyOnMissedDose: true,
      notifyAfterMinutes: 45,
      notifyOnLowStock: true,
    };
    setCaregiverList([...caregiverList, newEntry]);
    setCgName('');
    setCgRelation('Family Member');
    setCgPhone('+91 ');
    setCgEmail('');
  };

  const handleRemoveCaregiverDraft = (index: number) => {
    setCaregiverList(caregiverList.filter((_, i) => i !== index));
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    setErrorMessage(null);

    // Step 0 Validation (Mandatory Fields)
    if (currentStep === 0) {
      if (!name.trim()) {
        setErrorMessage('Full Name is required to establish your medical identity.');
        return;
      }
      if (!dateOfBirth) {
        setErrorMessage('Date of Birth is mandatory for age-specific dosage safety.');
        return;
      }
    }

    // Step 1 Validation (ABHA format if provided)
    if (currentStep === 1) {
      if (abhaId.trim() && !/^\d{2}-\d{4}-\d{4}-\d{4}$/.test(abhaId.trim())) {
        setErrorMessage('ABHA Record ID must be a 14-digit format: XX-XXXX-XXXX-XXXX');
        return;
      }
      if (abhaAddress.trim() && !abhaAddress.endsWith('@abdm')) {
        setErrorMessage('ABHA Address must end with @abdm (e.g. username@abdm)');
        return;
      }
    }

    // Step 2 Validation (Doctor details)
    if (currentStep === 2) {
      if (!doctorName.trim()) {
        setErrorMessage('Primary / Family Doctor Name is required for emergency escalation.');
        return;
      }
      if (!doctorHospital.trim()) {
        setErrorMessage('Clinic / Hospital Address is required.');
        return;
      }
      if (!doctorEmail.trim() || !doctorEmail.includes('@')) {
        setErrorMessage('A valid Doctor Email is required to receive clinical alerts.');
        return;
      }
      if (!doctorPhone.trim() || doctorPhone.length < 8) {
        setErrorMessage('Doctor Phone Number with country code is required (e.g. +91 98765 43210).');
        return;
      }
    }

    saveDraft();
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Final Submission
  const handleFinishOnboarding = async () => {
    // Abandonment Rule Check: Must have Full Name and DOB
    if (!name.trim() || !dateOfBirth) {
      setErrorMessage('Full Name and Date of Birth are strictly required to complete onboarding.');
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const doctorProfile: DoctorProfile = {
      name: doctorName.trim(),
      registrationId: doctorId.trim() || undefined,
      hospitalAddress: doctorHospital.trim(),
      email: doctorEmail.trim(),
      phone: doctorPhone.trim(),
    };

    const finalProfileData = {
      name: name.trim(),
      dateOfBirth,
      phone: phone.trim(),
      bloodGroup,
      abhaId: abhaId.trim() || undefined,
      abhaAddress: abhaAddress.trim() || undefined,
      medicalHistory,
      doctorName: doctorProfile.name,
      doctorId: doctorProfile.registrationId,
      doctorHospital: doctorProfile.hospitalAddress,
      doctorEmail: doctorProfile.email,
      doctorPhone: doctorProfile.phone,
      doctor: doctorProfile,
      onboardingCompleted: true,
    };

    try {
      const success = await completeOnboarding(finalProfileData);

      // Save any draft caregivers
      if (caregiverList.length > 0) {
        for (const cg of caregiverList) {
          await addCaregiver(cg);
        }
      }

      if (success) {
        router.push('/');
      } else {
        setErrorMessage('Could not save onboarding profile. Please check your connection.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Image
            src="/logo.png"
            alt="ArogyaLink"
            width={220}
            height={80}
            className="h-12 sm:h-14 w-auto mx-auto object-contain"
            priority
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Patient Identity & Clinical Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Please establish your sovereign patient identity, ABHA credentials, and emergency doctor contacts.
          </p>
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className={`p-2 rounded-xl transition ${currentStep === 0 ? 'bg-sky-600 text-white' : currentStep > 0 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'}`}>
              <span className="block text-[10px] uppercase font-semibold">Step 1</span>
              Identity & DOB
            </div>
            <div className={`p-2 rounded-xl transition ${currentStep === 1 ? 'bg-sky-600 text-white' : currentStep > 1 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'}`}>
              <span className="block text-[10px] uppercase font-semibold">Step 2</span>
              ABHA & History
            </div>
            <div className={`p-2 rounded-xl transition ${currentStep === 2 ? 'bg-sky-600 text-white' : currentStep > 2 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'}`}>
              <span className="block text-[10px] uppercase font-semibold">Step 3</span>
              Family Doctor
            </div>
            <div className={`p-2 rounded-xl transition ${currentStep === 3 ? 'bg-sky-600 text-white' : 'text-slate-400'}`}>
              <span className="block text-[10px] uppercase font-semibold">Step 4</span>
              Caregivers
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-6">

          {/* STEP 0: PATIENT IDENTITY & DATE OF BIRTH */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600" />
                  Core Patient Identity
                </h2>
                <p className="text-xs text-slate-500">
                  Full Name and Date of Birth are mandatory to establish your personal health schedule.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500 bg-white"
                  >
                    <option value="A+">A+ Positive</option>
                    <option value="A-">A- Negative</option>
                    <option value="B+">B+ Positive</option>
                    <option value="B-">B- Negative</option>
                    <option value="AB+">AB+ Positive</option>
                    <option value="AB-">AB- Negative</option>
                    <option value="O+">O+ Positive</option>
                    <option value="O-">O- Negative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Phone Number (with Country Code)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Abandonment Rule Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Abandonment Safeguard Rule</p>
                  <p className="text-[11px] text-amber-800">
                    If this onboarding setup is closed before your mandatory fields (Name and Date of Birth) are saved, you will be automatically returned to this onboarding page on your next login attempt.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: ABHA INTEGRATION & MEDICAL HISTORY */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Indian National Health Authority (ABHA) Integration
                </h2>
                <p className="text-xs text-slate-500">
                  Link your Ayushman Bharat Digital Mission (ABDM) credentials or import verified medical history.
                </p>
              </div>


              {/* ABHA Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ABHA Record ID (14 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={17}
                    placeholder="XX-XXXX-XXXX-XXXX"
                    value={abhaId}
                    onChange={(e) => handleAbhaIdChange(e.target.value)}
                    className="w-full text-xs font-mono font-bold tracking-wider px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500 uppercase"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Formatted as: 91-XXXX-XXXX-XXXX</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ABHA Address
                  </label>
                  <input
                    type="text"
                    placeholder="username@abdm"
                    value={abhaAddress}
                    onChange={(e) => setAbhaAddress(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Must end with @abdm</span>
                </div>
              </div>


              {/* Demonstration "Fetch from ABHA" Banner */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h3 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    ABDM Gateway Demonstration API
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    For verification and showcase, simulate an instantaneous fetch of ABDM records & medical history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerAbhaDemoFetch}
                  disabled={isAbhaFetching}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isAbhaFetching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Connecting ABDM...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Fetch from ABHA Demo
                    </>
                  )}
                </button>
              </div>



              {/* Medical History Collection (Manual Entry or Tag Management) */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Medical History & Chronic Conditions
                  </h3>
                  {abhaVerifiedBadge && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <BadgeCheck className="w-3 h-3 text-emerald-600" />
                      ABDM Verified
                    </span>
                  )}
                </div>

                {medicalHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No medical history recorded yet. You can click &quot;Fetch from ABHA Demo&quot; or manually add items below.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicalHistory(idx)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add diagnosed condition or surgery (e.g. Asthma, Penicillin allergy)..."
                    value={newHistoryItem}
                    onChange={(e) => setNewHistoryItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMedicalHistory()}
                    className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicalHistory}
                    className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FAMILY DOCTOR & EMERGENCY CONTACTS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  Primary / Family Doctor Profile
                </h2>
                <p className="text-xs text-slate-500">
                  Maintained dynamically so your physician can receive automated clinical alerts in case of health emergencies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Doctor Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alok Verma"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Doctor ID / Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DMC-24981 or MCI-12345"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Hospital / Clinic Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Health City, Sarita Vihar, New Delhi"
                    value={doctorHospital}
                    onChange={(e) => setDoctorHospital(e.target.value)}
                    className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Doctor Email ID (for Alerts) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="dr.verma@hospital.example"
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Doctor Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="+91 98110 55432"
                      value={doctorPhone}
                      onChange={(e) => setDoctorPhone(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Include country code (+91)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MULTI-CAREGIVER REGISTRATION & FINISH */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Multi-Caregiver Registration (Phase-1 Foundation)
                </h2>
                <p className="text-xs text-slate-500">
                  Register one or more trusted caregivers. You maintain sovereign consent over alert dispatches.
                </p>
              </div>

              {/* Added Caregivers List */}
              {caregiverList.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">Linked Caregivers</h3>
                  {caregiverList.map((cg, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{cg.name} ({cg.relation})</p>
                        <p className="text-[11px] text-slate-500">{cg.phone} • {cg.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCaregiverDraft(i)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Caregiver Form */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-sky-50/40 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-sky-600" />
                  Add a Family Member or Caregiver
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Caregiver Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={cgName}
                      onChange={(e) => setCgName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Daughter / Spouse / Nurse"
                      value={cgRelation}
                      onChange={(e) => setCgRelation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number (+91)</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43211"
                      value={cgPhone}
                      onChange={(e) => setCgPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email ID</label>
                    <input
                      type="email"
                      placeholder="caregiver@example.com"
                      value={cgEmail}
                      onChange={(e) => setCgEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCaregiverDraft}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Caregiver
                </button>
              </div>

              {/* Ready to Finish Notice */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Ready to Initialize Your Personalized Health Space</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Clicking &quot;Complete Onboarding&quot; will permanently save your profile details, unlock all navigation privileges, and initialize your clean dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={isSubmitting}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Onboarding...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Onboarding
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Demonstration ABHA Modal */}
      {showAbhaDemoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <BadgeCheck className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">ABDM Sandbox Records Retrieved</h3>
              <p className="text-xs text-slate-500">
                Indian National Health Authority gateway returned verified diagnostic history.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-2">
              <p><strong>ABHA Record ID:</strong> {abhaId}</p>
              <p><strong>ABHA Address:</strong> {abhaAddress}</p>
              <p><strong>Clinical Diagnoses:</strong> {medicalHistory.length} verified conditions imported.</p>
              <p><strong>Physician:</strong> {doctorName} ({doctorId})</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAbhaDemoModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Accept & Populate Form
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
