'use client';

import React, { useState } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, FileText, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { OcrExtractionResult } from '@/lib/types';
import { apiClient } from '@/lib/api';

interface PrescriptionUploaderProps {
  onExtractionComplete: (result: OcrExtractionResult, sampleImage?: string) => void;
}

export const PrescriptionUploader: React.FC<PrescriptionUploaderProps> = ({ onExtractionComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const samplePrescriptions = [
    {
      title: 'Metformin 500mg (Box Scan)',
      subtitle: 'Type 2 Diabetes Oral Tablet',
      badge: 'Box Packaging',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      extractedData: {
        rawText: "Metformin Hydrochloride 500mg\n30 Tablets\nTake 1 tablet twice daily after food\nBatch: CT5421 Exp: 12/2027",
        confidence: 0.96,
        extractedMedicines: [
          {
            name: "Metformin 500mg",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "30 days",
            mealRelation: "after_meal" as const,
            instructions: "1 tablet twice daily, after food"
          }
        ],
        doctorName: "Dr. Alok Verma",
        hospitalOrClinic: "Endocrine Care Clinic",
        prescriptionDate: new Date().toISOString().split('T')[0]
      }
    },
    {
      title: 'Doctor Rx Slip (Cardiology)',
      subtitle: 'Amlodipine 5mg & Atorvastatin 10mg',
      badge: 'Doctor Slip',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      extractedData: {
        rawText: "Rx\n1. Tab. Amlodipine 5mg - OD Morning after breakfast\n2. Tab. Atorvastatin 10mg - OD Night after dinner\nDr. Sunita Rao, MD (Cardiology)",
        confidence: 0.93,
        extractedMedicines: [
          {
            name: "Amlodipine Besylate",
            dosage: "5mg",
            frequency: "Once daily",
            duration: "60 days",
            mealRelation: "after_meal" as const,
            instructions: "1 tablet daily morning after breakfast"
          },
          {
            name: "Atorvastatin Calcium",
            dosage: "10mg",
            frequency: "Once daily",
            duration: "60 days",
            mealRelation: "after_meal" as const,
            instructions: "1 tablet daily night after dinner"
          }
        ],
        doctorName: "Dr. Sunita Rao",
        hospitalOrClinic: "Metro Heart Institute",
        prescriptionDate: new Date().toISOString().split('T')[0]
      }
    }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('image', file);

    const result = await apiClient.uploadPrescription(formData);
    setIsProcessing(false);
    onExtractionComplete(result);
  };

  const handleSelectSample = async (sample: typeof samplePrescriptions[0]) => {
    setSelectedFileName(sample.title);
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsProcessing(false);
    onExtractionComplete(sample.extractedData, sample.imageUrl);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Step 1: Upload a Photo</h2>
        <p className="text-xs text-slate-500 mt-1">
          Capture or upload your doctor's prescription slip or medicine packaging for AI OCR extraction.
        </p>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="bg-white rounded-3xl border-2 border-dashed border-sky-300 p-8 text-center max-w-md mx-auto shadow-card hover:border-sky-500 transition relative">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="camera-input"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 shadow-xs">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
            ) : (
              <Camera className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-base font-bold text-slate-800">
            {isProcessing ? 'AI Agent Extracting Text...' : 'Capture Prescription or Medicine Image'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tap to open camera or browse files (PNG, JPG, PDF)
          </p>

          <button
            type="button"
            className="mt-5 w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 pointer-events-none"
          >
            <Camera className="w-4 h-4" />
            {isProcessing ? 'Processing OCR...' : 'Capture / Upload Image'}
          </button>
        </div>
      </div>

      {/* One-Click Quick Test Demonstrations */}
      <div className="max-w-md mx-auto space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Or test with sample verified Rx
          </span>
          <span className="text-[11px] text-sky-600 font-medium">Instant OCR Demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {samplePrescriptions.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample)}
              disabled={isProcessing}
              className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/30 text-left transition shadow-xs group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-sky-100 text-slate-700 group-hover:text-sky-700 px-2 py-0.5 rounded">
                  {sample.badge}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-sky-500 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">{sample.title}</p>
              <p className="text-[11px] text-slate-400 truncate">{sample.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
