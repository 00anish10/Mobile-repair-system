import React, { useState } from 'react';
import { REPAIR_ISSUES } from '../data/mockData';
import type { DeviceType } from '../types';
import { useRepair } from '../context/RepairContext';
import { useToast } from '../hooks/useToast';

export const ProblemSelection: React.FC = ({
  problemId,
  setProblemId,
  problemDescription,
  setProblemDescription,
  errors,
  setErrors,
  currentStep,
  onNext,
}) => {
  const currentProblemObj = REPAIR_ISSUES.find((p) => p.id === problemId) || REPAIR_ISSUES[0];

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
              onClick={() => setProblemId(issue.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                problemId === issue.id
                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {issue.name}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {issue.description}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 shrink-0">
                $ {issue.basePriceRs.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
        {errors.problem && <p className="text-xs text-rose-500 mt-1">{errors.problem}</p>}
      </div>

      {/* Problem notes */}
      <div>
        <label htmlFor="problem-description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Describe the problem (optional)
        </label>
        <textarea
          id="problem-description"
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
          rows={2}
          placeholder="e.g. dropped on tile floor, touchscreen is unresponsive near bottom edge..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
    </div>
  );
};