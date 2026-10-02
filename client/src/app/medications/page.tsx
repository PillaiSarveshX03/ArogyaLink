'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Pill,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Trash2,
  Mail,
  ExternalLink,
  X,
  Info,
  HeartPulse,
  Activity,
  AlertCircle,
  FileText,
  Search,
  Loader2,
  CheckCircle2,
  Utensils,
  BookOpen
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { StructuredMedicationAnalysis } from '@/lib/types';

export default function MedicationsPage() {
  const { courses, medicines, removeCourse } = useApp();
  const [analyzingMed, setAnalyzingMed] = useState('');
  const [analysisResult, setAnalysisResult] = useState<StructuredMedicationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  const handleRunAiAnalysis = async (medName: string) => {
    setIsAnalyzing(true);
    setAnalyzingMed(medName);
    setAnalysisError(null);
    setAnalysisResult(null);

    // Scroll toward analysis area smoothly
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const result = await apiClient.analyzeMedication(medName, courses);
      setAnalysisResult(result);
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch {
      setAnalysisError(
        'Unable to complete the medication analysis right now. Your saved medication schedule is unchanged. Please try again shortly.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Medications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your verified medication courses, dosing parameters, and clinical warnings.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Prescription / Course
        </Link>
      </div>

      {/* Medication Courses Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No active medications yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any active medication courses registered. Upload a prescription or manually add your first medication to get started.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add First Medication
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const matchedMed = medicines.find(
              (m) => m.name.toLowerCase().includes(course.medicineName.toLowerCase().split(' ')[0])
            );
            const isCurrentlyAnalyzing = isAnalyzing && analyzingMed === course.medicineName;

            return (
              <div
                key={course.id}
                className={`bg-white rounded-2xl border p-5 shadow-card hover:border-slate-300 transition space-y-4 ${
                  isCurrentlyAnalyzing ? 'border-sky-400 ring-2 ring-sky-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{course.medicineName}</h3>
                      <p className="text-xs text-slate-500">
                        {course.dosage} • {course.frequency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="pill-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                    <button
                      onClick={() => removeCourse(course.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Remove Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-600 font-medium block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Scheduled Time(s)
                    </span>
                    <span className="font-bold text-slate-800">
                      {course.timesOfDay.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-600 font-medium block flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-slate-400" /> Meal Rule
                    </span>
                    <span className="font-bold text-slate-800 capitalize">
                      {course.mealRelation.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 mt-1 flex flex-wrap items-center justify-between gap-1.5">
                    <div>
                      <span className="text-[11px] text-slate-600 font-medium block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Duration
                      </span>
                      <span className="text-slate-800 font-medium">
                        {course.startDate} to {course.endDate || 'Ongoing'}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 self-center">
                      <Mail className="w-3 h-3 text-sky-600" /> Automated Email Reminders Active
                    </span>
                  </div>
                </div>

                {/* Verified Physician Note */}
                {course.prescribedBy && (
                  <p className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Prescribed by:</span> {course.prescribedBy}
                  </p>
                )}

                {/* Side Effects & Warnings */}
                {matchedMed && (
                  <div className="text-xs space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Common Side Effects:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {matchedMed.sideEffects?.map((effect, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Medication Analysis Button */}
                <button
                  type="button"
                  onClick={() => handleRunAiAnalysis(course.medicineName)}
                  disabled={isAnalyzing}
                  className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs border flex items-center justify-center gap-2 transition cursor-pointer ${
                    isCurrentlyAnalyzing
                      ? 'bg-sky-100 text-sky-800 border-sky-300 shadow-inner'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {isCurrentlyAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                      <span>✨ Analyzing {course.medicineName}...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Run AI Medication Analysis</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Analysis Section Anchor */}
      <div ref={analysisRef}>
        {/* Compact Loading State Banner */}
        {isAnalyzing && (
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-6 text-center shadow-sm space-y-2 animate-pulse">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-100 text-sky-600 mb-1">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              ✨ Analyzing {analyzingMed}...
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Compiling verified pharmacology references, dosage guidelines, food interactions, and personalized schedule parameters.
            </p>
          </div>
        )}

        {/* Safe Error Alert */}
        {analysisError && !isAnalyzing && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">Analysis Notice</h4>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">{analysisError}</p>
                </div>
              </div>
              <button
                onClick={() => setAnalysisError(null)}
                className="text-rose-400 hover:text-rose-700 p-1 rounded-lg"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Structured Medication Analysis Panel */}
        {analysisResult && !isAnalyzing && (
          <div className="bg-white rounded-2xl border-2 border-sky-300 p-6 sm:p-7 shadow-elevated space-y-6 transition-all">
            {/* 1. Header with Title, Badges, Close */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      ✨ {analysisResult.medicationName} — Medication Analysis
                    </h2>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {analysisResult.sourceType === 'verified_reference' ? 'Verified Clinical Reference' : 'AI Structured Synthesis'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fast educational guide grounded in clinical pharmacology references.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAnalysisResult(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl font-medium transition self-start sm:self-center"
              >
                <X className="w-3.5 h-3.5" />
                Close
              </button>
            </div>

            {/* 2. What is it? */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>What is it?</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                {analysisResult.whatIsIt}
              </p>
            </div>

            {/* 3. What is it used for? */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>What is it used for?</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysisResult.uses.map((use, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100"
                  >
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. How does it work? */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>How does it work?</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100">
                {analysisResult.howItWorks}
              </p>
            </div>

            {/* 5. Prescribed Dose vs General Dosing (Clean Distinction) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Your Prescribed Dose (Direct from MedBuddy Database) */}
              <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-sky-600" />
                    <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                      Your Prescribed Dose
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold bg-sky-200/70 text-sky-800 px-2 py-0.5 rounded-md">
                    MedBuddy Prescription
                  </span>
                </div>

                <div className="space-y-2 pt-1 text-xs text-slate-800">
                  <div className="flex items-baseline justify-between border-b border-sky-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Dose Amount:</span>
                    <span className="font-bold text-slate-900">{analysisResult.prescribedDose.dosage}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-sky-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Frequency:</span>
                    <span className="font-bold text-slate-900">{analysisResult.prescribedDose.frequency}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-sky-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Scheduled Time:</span>
                    <span className="font-bold text-slate-900">
                      {analysisResult.prescribedDose.scheduledTimes.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-sky-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Meal Rule:</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {analysisResult.prescribedDose.mealRelation}
                    </span>
                  </div>
                  {analysisResult.prescribedDose.duration && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-500 font-medium">Duration:</span>
                      <span className="font-medium text-slate-800">{analysisResult.prescribedDose.duration}</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-sky-800 italic pt-1">
                  This is your individualized regimen recorded in your MedBuddy schedule.
                </p>
              </div>

              {/* Right Column: Adult Dosing Information (General Reference) */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Adult Dosing Information
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    General Reference
                  </span>
                </div>

                <div className="space-y-2 pt-1 text-xs text-slate-800">
                  <div>
                    <span className="text-slate-500 font-medium block">Usual Clinical Range:</span>
                    <span className="font-medium text-slate-900">{analysisResult.adultDosing.usualRange}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Maximum Established Dose:</span>
                    <span className="font-medium text-slate-900">{analysisResult.adultDosing.maximumDose}</span>
                  </div>
                  {analysisResult.adultDosing.importantNotes && (
                    <ul className="pt-1 space-y-1 text-[11px] text-slate-600">
                      {analysisResult.adultDosing.importantNotes.map((note, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-amber-800 font-medium bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                  {analysisResult.adultDosing.disclaimer}
                </div>
              </div>
            </div>

            {/* 6. Children / Adolescents (Pediatric Information) */}
            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Children / Adolescents
                </h3>
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  {analysisResult.pediatricInformation.status}
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {analysisResult.pediatricInformation.summary}
              </p>
              {analysisResult.pediatricInformation.notes && (
                <ul className="text-xs text-amber-800 space-y-1 pt-1">
                  {analysisResult.pediatricInformation.notes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 7. Blood-Pressure Goals / Target Levels */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600 shrink-0" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Blood-Pressure Goals
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                  <span className="font-bold text-slate-800 block mb-1">Adult Reference Guidance:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {analysisResult.bloodPressureGoals.adultSummary}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                  <span className="font-bold text-slate-800 block mb-1">Pediatric Age/Height Interpretation:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {analysisResult.bloodPressureGoals.pediatricSummary}
                  </p>
                </div>
              </div>

              {analysisResult.bloodPressureGoals.clinicalFactors && (
                <div className="pt-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Clinical factors affecting individual targets: </span>
                  {analysisResult.bloodPressureGoals.clinicalFactors.join(' • ')}
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic">
                {analysisResult.bloodPressureGoals.note}
              </p>
            </div>

            {/* 8. Precautions & Interactions */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
                <span>Precautions & Interactions</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Medication Interactions */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-800 block">Medication Interactions:</span>
                  <ul className="space-y-1 text-slate-600">
                    {analysisResult.precautionsAndInteractions.medicationInteractions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-sky-500 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Food / Beverage Interactions */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-800 block">Food & Beverage Interactions:</span>
                  <ul className="space-y-1 text-slate-600">
                    {analysisResult.precautionsAndInteractions.foodBeverageInteractions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Alcohol Guidance */}
                  {analysisResult.precautionsAndInteractions.alcohol && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                      <strong>Alcohol: </strong> {analysisResult.precautionsAndInteractions.alcohol}
                    </div>
                  )}
                </div>

                {/* Medical Conditions */}
                {analysisResult.precautionsAndInteractions.medicalConditions && (
                  <div className="col-span-1 md:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 block">Relevant Medical Conditions:</span>
                    <ul className="space-y-1 text-slate-600">
                      {analysisResult.precautionsAndInteractions.medicalConditions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 9. Common Side Effects */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Common Side Effects</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.commonSideEffects.map((effect, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3 py-1 rounded-lg border border-slate-200/60 font-medium transition"
                  >
                    • {effect}
                  </span>
                ))}
              </div>
            </div>

            {/* 10. When to Seek Medical Attention */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  When to Seek Medical Attention
                </h3>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-rose-900">
                {analysisResult.whenToSeekMedicalAttention.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white/70 p-2 rounded-lg border border-rose-100">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 11. Google Search Link & Reference Sources */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
              {/* Dynamic Google Search Button */}
              <a
                href={analysisResult.googleSearch?.url || `https://www.google.com/search?q=${encodeURIComponent(analysisResult.medicationName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm hover:shadow self-start"
              >
                <Search className="w-3.5 h-3.5 text-sky-400" />
                <span>Search this medication on Google</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              {/* Authoritative Sourcing Badges */}
              {analysisResult.sources && analysisResult.sources.length > 0 && (
                <div className="text-right sm:max-w-md">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Authoritative Reference Sources:
                  </span>
                  <div className="flex flex-wrap gap-1 justify-start sm:justify-end mt-1">
                    {analysisResult.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                        title={src}
                      >
                        {src.split('(')[0].trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 12. Clinical Safety Guardrail Message */}
            <div className="flex items-start gap-2.5 bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>⚠ Clinical Safety: </strong>
                This analysis is for educational purposes only. It does not replace advice from a qualified healthcare professional. Do not start, stop, or change a medication or dose based solely on this analysis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
