'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Plus, Check, Pill, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface CourseCreationFormProps {
  initialData: {
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
    mealRelation: 'before_meal' | 'with_meal' | 'after_meal';
  };
}

export const CourseCreationForm: React.FC<CourseCreationFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { addCourse } = useApp();

  const [medicineName, setMedicineName] = useState(initialData.name);
  const [dosage, setDosage] = useState(initialData.dosage);
  const [frequency, setFrequency] = useState(initialData.frequency || 'Twice daily');
  const [doseQuantity, setDoseQuantity] = useState(1);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00 AM', '08:00 PM']);
  const [mealRelation, setMealRelation] = useState<'before_meal' | 'with_meal' | 'after_meal'>(
    initialData.mealRelation || 'after_meal'
  );
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes] = useState('Prescribed dosage verified by patient');

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    addCourse({
      medicineName,
      dosage,
      frequency,
      doseQuantity,
      timesOfDay: selectedTimes.length > 0 ? selectedTimes : ['08:00 AM'],
      mealRelation,
      startDate,
      endDate,
      notes,
    });

    // Route to dashboard with confirmation
    router.push('/?created=true');
  };

  return (
    <form onSubmit={handleCreateSchedule} className="space-y-4 sm:space-y-5 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 3: Add to Your Course</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure deterministic dose intervals and personalized daily schedule.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-card space-y-4">
        {/* Medicine Name */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Medicine Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              className="w-full text-base sm:text-xs font-semibold border border-slate-300 rounded-xl px-3 py-3 sm:py-2.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Frequency & Quantity */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full text-base sm:text-xs font-medium border border-slate-300 rounded-xl px-3 py-3 sm:py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
            >
              <option>Once daily</option>
              <option>Twice daily</option>
              <option>Three times daily</option>
              <option>Every 8 hours</option>
              <option>As needed (PRN)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Dose Quantity</label>
            <div className="flex items-center">
              <input
                type="number"
                min={0.5}
                step={0.5}
                max={10}
                value={doseQuantity}
                onChange={(e) => setDoseQuantity(parseFloat(e.target.value) || 1)}
                className="w-full text-base sm:text-xs font-semibold border border-slate-300 rounded-xl px-3 py-3 sm:py-2.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Times of Day */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Time(s) of Day</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Morning', time: '08:00 AM' },
              { label: 'Afternoon', time: '02:00 PM' },
              { label: 'Evening', time: '08:00 PM' },
              { label: 'Bedtime', time: '10:00 PM' },
            ].map((slot) => {
              const isSelected = selectedTimes.includes(slot.time);
              return (
                <button
                  type="button"
                  key={slot.time}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTimes(selectedTimes.filter((t) => t !== slot.time));
                    } else {
                      setSelectedTimes([...selectedTimes, slot.time]);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition min-h-[44px] cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 text-sky-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{slot.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{slot.time}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal Considerations */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Meal Considerations</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'before_meal', label: 'Before' },
              { id: 'with_meal', label: 'With' },
              { id: 'after_meal', label: 'After food' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setMealRelation(opt.id as any)}
                className={`py-2.5 px-2 rounded-xl border text-xs font-semibold text-center transition min-h-[44px] cursor-pointer ${
                  mealRelation === opt.id
                    ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Start Date & Course End Date */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Course Start
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-base sm:text-xs font-medium border border-slate-300 rounded-xl px-2.5 py-2.5 text-slate-700"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Course End
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-base sm:text-xs font-medium border border-slate-300 rounded-xl px-2.5 py-2.5 text-slate-700"
            />
          </div>
        </div>

        {/* Deterministic Schedule Notice */}
        <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200 text-[11px] text-sky-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            Deterministic rules will schedule dose reminders. Automated email notifications will be sent to your registered signup email address at each scheduled time.
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="submit"
        className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition min-h-[48px] cursor-pointer"
      >
        <Check className="w-4 h-4 stroke-[3]" />
        Create Schedule
      </button>
    </form>
  );
};
