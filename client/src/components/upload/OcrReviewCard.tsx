'use client';

import React, { useState } from 'react';
import { Check, Edit3, ShieldAlert, Sparkles, CornerDownRight, RotateCcw } from 'lucide-react';
import { OcrExtractionResult } from '@/lib/types';

interface OcrReviewCardProps {
  ocrResult: OcrExtractionResult;
  imageUrl?: string;
  onConfirm: (confirmedMed: {
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
    mealRelation: 'before_meal' | 'with_meal' | 'after_meal';
  }) => void;
  onRetake: () => void;
}

export const OcrReviewCard: React.FC<OcrReviewCardProps> = ({
  ocrResult,
  imageUrl,
  onConfirm,
  onRetake,
}) => {
  const firstExtracted = ocrResult.extractedMedicines[0] || {
    name: 'Metformin 500mg',
    dosage: '500mg',
    frequency: 'Twice daily',
    mealRelation: 'after_meal',
    instructions: '1 tablet twice daily, after food',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(firstExtracted.name);
  const [dosage, setDosage] = useState(firstExtracted.dosage);
  const [frequency, setFrequency] = useState(firstExtracted.frequency);
  const [instructions, setInstructions] = useState(firstExtracted.instructions);
  const [mealRelation, setMealRelation] = useState<'before_meal' | 'with_meal' | 'after_meal'>(
    firstExtracted.mealRelation || 'after_meal'
  );

  const handleProceed = () => {
    onConfirm({
      name,
      dosage,
      frequency,
      instructions,
      mealRelation,
    });
  };

  return (
    <div className="space-y-5 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 2: OCR Preview & Review</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Patient verification step: verify AI-extracted parameters before scheduling.
        </p>
      </div>

      {/* Captured Image Preview with Scanning Viewfinder */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900/5 aspect-video flex items-center justify-center shadow-card">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Scanned Prescription / Medicine packaging"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <span className="text-xs font-semibold text-slate-400">Captured Rx Packaging Image</span>
          </div>
        )}

        {/* Viewfinder brackets */}
        <div className="absolute inset-3 border-2 border-white/80 rounded-xl pointer-events-none"></div>

        {/* Confidence badge */}
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          OCR Match: {Math.round(ocrResult.confidence * 100)}%
        </div>
      </div>

      {/* Extracted Card Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            AI-Extracted Data
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit' : 'Edit Fields'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Medicine Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dosage</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Meal Relation</label>
              <select
                value={mealRelation}
                onChange={(e) => setMealRelation(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="after_meal">After food</option>
                <option value="with_meal">With meal</option>
                <option value="before_meal">Before food</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Instructions</label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-slate-900">{name}</span>
              <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                {dosage}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
              {instructions}
            </p>
          </div>
        )}

        {/* Product Guardrail Note */}
        <div className="pt-1 flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg">
          <ShieldAlert className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
          <span>
            This information is AI-extracted for your review. You have full authority to modify any extracted value.
          </span>
        </div>
      </div>

      {/* Action Buttons matching Design 1 */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          Review and Confirm
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Correct Details
        </button>

        <button
          type="button"
          onClick={onRetake}
          className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Retake or choose different photo
        </button>
      </div>
    </div>
  );
};
