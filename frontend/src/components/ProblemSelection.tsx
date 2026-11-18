import React from 'react';
import { REPAIR_ISSUES } from '../data/mockData';

interface ProblemSelectionProps {
  problemId: string;
  setProblemId: (value: string) => void;
  problemDescription: string;
  setProblemDescription: (value: string) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  currentStep: number;
  onNext: () => void;
}

export const ProblemSelection: React.FC<ProblemSelectionProps> = ({
  problemId,
  setProblemId,
  problemDescription,
  setProblemDescription,
  errors,
  setErrors,
  currentStep,
  onNext,
}) => {
  void currentStep;
  void onNext;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          What issue are you experiencing?
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REPAIR_ISSUES.map((issue) => (
            <button
              key={issue.id}
              type="button"
              onClick={() => {
                setProblemId(issue.id);
                setErrors((prev) => ({ ...prev, problem: '' }));
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                problemId === issue.id
                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{issue.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {issue.description}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                  ~{issue.estimatedMinutes} mins • {issue.warrantyMonths}-month warranty
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 shrink-0">
                ${issue.basePriceRs.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
        {errors.problem && <p className="text-xs text-rose-500 mt-1">{errors.problem}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="problem-description"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            Describe the problem (optional)
          </label>
          <span className="text-[10px] text-slate-400">{problemDescription.length}/400</span>
        </div>
        <textarea
          id="problem-description"
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value.slice(0, 400))}
          rows={3}
          placeholder="e.g. dropped on tile floor, touchscreen is unresponsive near the bottom edge..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
    </div>
  );
};
