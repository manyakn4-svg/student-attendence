import React, { useState } from 'react';
import { 
  Calculator, Sparkles, CheckCircle2, AlertTriangle, 
  HelpCircle, RefreshCw, ArrowRight, BookOpen, Sliders, TrendingUp 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateClassesCanMiss, calculateClassesNeeded, calculatePercentage } from '../utils/calculations';

export const CalculatorPage: React.FC = () => {
  const { subjects, subjectStats } = useApp();

  const [attended, setAttended] = useState<number>(34);
  const [conducted, setConducted] = useState<number>(40);
  const [target, setTarget] = useState<number>(75);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // What-If Simulator state
  const [futureMissed, setFutureMissed] = useState<number>(0);
  const [futureAttended, setFutureAttended] = useState<number>(0);

  // Quick prefill from real subject
  const handleSelectSubject = (subId: string) => {
    setSelectedSubjectId(subId);
    const found = subjectStats.find((s) => s.subject.id === subId);
    if (found) {
      setAttended(found.attended);
      setConducted(found.conducted);
      setTarget(found.target);
    }
  };

  // Calculations
  const currentPct = calculatePercentage(attended, conducted);
  const classesCanMiss = calculateClassesCanMiss(attended, conducted, target);
  const classesNeeded = calculateClassesNeeded(attended, conducted, target);

  // What-If projection
  const projectedAttended = attended + futureAttended;
  const projectedConducted = conducted + futureAttended + futureMissed;
  const projectedPct = calculatePercentage(projectedAttended, projectedConducted);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Class-Skip &amp; Target Attendance Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Evaluate exact class-skip margins, consecutive recovery requirements, and what-if scenarios
        </p>
      </div>

      {/* Quick Pre-fill from Registered Subjects */}
      {subjects.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Quick Pre-Fill from Your Enrolled Courses:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {subjectStats.map((stat) => (
              <button
                key={stat.subject.id}
                onClick={() => handleSelectSubject(stat.subject.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  selectedSubjectId === stat.subject.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className="font-mono font-bold mr-1">{stat.subject.code}:</span>
                <span>{stat.subject.name.length > 25 ? stat.subject.name.substring(0, 22) + '...' : stat.subject.name}</span>
                <span className="ml-1 text-[11px] opacity-75">({stat.attended}/{stat.conducted})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Interactive Calculator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span>Attendance Parameters</span>
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Classes Attended
            </label>
            <input
              type="number"
              min="0"
              max={conducted}
              value={attended}
              onChange={(e) => setAttended(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Total Classes Conducted
            </label>
            <input
              type="number"
              min={attended}
              value={conducted}
              onChange={(e) => setConducted(Math.max(attended, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Required Target Percentage
              </label>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {target}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>60%</span>
              <span className="font-bold text-slate-600 dark:text-slate-400">75% (Standard)</span>
              <span>85%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <span>Current Status:</span>
              <span className="font-extrabold text-base">
                {currentPct}% ({attended}/{conducted})
              </span>
            </div>
          </div>
        </div>

        {/* Right Output Panels (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Result 1: How many classes can I miss? */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scenario A: Skipping Limit
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  How many future classes can I miss?
                </h4>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              {currentPct < target ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                      You cannot miss any classes!
                    </p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                      Your current attendance ({currentPct}%) is already below your target of {target}%. Skipping even 1 more lecture will push you further into detention.
                    </p>
                  </div>
                </div>
              ) : classesCanMiss === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      Zero Safe Skips (Right on the Edge)
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      You are currently at {currentPct}%. Missing even a single future class will drop you below your {target}% target.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {classesCanMiss}
                  </span>
                  <div>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200 block">
                      {classesCanMiss === 1 ? 'Class can be missed safely' : 'Classes can be missed safely'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Even after missing {classesCanMiss} classes, your attendance will remain at or above {target}%.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              Formula: floor((Attended × 100 / Target) - Conducted) = floor(({attended} × 100 / {target}) - {conducted})
            </div>
          </div>

          {/* Result 2: How many classes do I need to attend? */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scenario B: Recovery Requirement
                </span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  How many classes do I need to attend?
                </h4>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              {currentPct >= target ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      Target Already Achieved!
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Your current attendance ({currentPct}%) is already at or above your required target of {target}%.
                    </p>
                  </div>
                </div>
              ) : classesNeeded === -1 ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                      Mathematically Impossible (Target: 100%)
                    </p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                      Once a class has been missed, you can never mathematically regain 100% attendance because past missed sessions cannot be undone. Consider adjusting your target to 90% or 95%.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {classesNeeded}
                  </span>
                  <div>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200 block">
                      Consecutive classes required
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      You must attend the next {classesNeeded} classes consecutively without missing any to reach {target}%.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              Formula: ceil((Target × Conducted - 100 × Attended) / (100 - Target))
            </div>
          </div>
        </div>
      </div>

      {/* Scenario 3: What-If Future Simulator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              What-If Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate upcoming future lectures and see your projected attendance score
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Attend Next Classes:</span>
                <span className="text-emerald-600 font-mono font-bold text-sm">+{futureAttended} classes</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={futureAttended}
                onChange={(e) => setFutureAttended(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Miss Next Classes:</span>
                <span className="text-rose-600 font-mono font-bold text-sm">+{futureMissed} classes</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={futureMissed}
                onChange={(e) => setFutureMissed(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                setFutureAttended(0);
                setFutureMissed(0);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
            >
              Reset Simulator
            </button>
          </div>

          {/* Projection Preview Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-center items-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Projected Attendance
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className={`text-4xl font-black font-mono ${projectedPct >= target ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {projectedPct}%
              </span>
              <span className="text-xs text-slate-400">
                ({projectedAttended}/{projectedConducted})
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs">
              {projectedPct >= target
                ? `You will remain safely at or above your ${target}% target.`
                : `You will fall below your ${target}% target.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
