'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';
import { PrescriptionUploader } from '@/components/upload/PrescriptionUploader';
import { OcrReviewCard } from '@/components/upload/OcrReviewCard';
import { CourseCreationForm } from '@/components/upload/CourseCreationForm';
import { OcrExtractionResult } from '@/lib/types';

export default function UploadWizardPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [ocrResult, setOcrResult] = useState<OcrExtractionResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>();
  const [confirmedMed, setConfirmedMed] = useState<{
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
    mealRelation: 'before_meal' | 'with_meal' | 'after_meal';
  } | null>(null);

  const handleExtraction = (result: OcrExtractionResult, sampleImage?: string) => {
    setOcrResult(result);
    setPreviewImage(sampleImage);
    setCurrentStep(2);
  };

  const handleOcrConfirm = (confirmedData: typeof confirmedMed) => {
    setConfirmedMed(confirmedData);
    setCurrentStep(3);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
          Step {currentStep} of 3
        </span>
      </div>

      {/* Step Progress Indicators */}
      <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-card">
        {[
          { num: 1, title: 'Upload Photo' },
          { num: 2, title: 'Review' },
          { num: 3, title: 'Create Course' },
        ].map((step, idx) => {
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <React.Fragment key={step.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <span
                  className={`text-xs hidden sm:inline font-semibold ${isCurrent ? 'text-slate-900' : isDone ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                >
                  {step.title}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded transition-colors ${isDone ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Wizard Content Step Panels */}
      {currentStep === 1 && (
        <PrescriptionUploader onExtractionComplete={handleExtraction} />
      )}

      {currentStep === 2 && ocrResult && (
        <OcrReviewCard
          ocrResult={ocrResult}
          imageUrl={previewImage}
          onConfirm={handleOcrConfirm}
          onRetake={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && confirmedMed && (
        <CourseCreationForm initialData={confirmedMed} />
      )}

      {/* Product Safety Rule Banner */}
      <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Product Guardrail:</strong> AI extracts text for assistance only. Patient confirmation is strictly required before any course or schedule is generated.
        </p>
      </div>
    </div>
  );
}
