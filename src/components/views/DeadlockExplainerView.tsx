import React, { useState } from 'react';
import { 
  BookOpen, 
  Lock, 
  Clock, 
  Square, 
  RotateCw, 
  Play, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { PreventionStrategy } from '../../types/cloudx';

export const DeadlockExplainerView: React.FC = () => {
  const { loadScenarioPreset, updateSettings, settings } = useCloudX();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [simulatedCondition, setSimulatedCondition] = useState<PreventionStrategy>('none');

  const conditions = [
    {
      id: 1,
      title: '1. Mutual Exclusion',
      icon: Lock,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      definition: 'At least one resource must be held in a non-shareable mode. Only one process can use the resource at any given time.',
      example: 'Exclusive GPU Execution Slot or Single-Writer Storage Lock assigned to Banking DB cannot be shared with AI Image Processor simultaneously.',
      prevention: 'Make resources shareable wherever possible (e.g. read-only memory, virtualized spooling).'
    },
    {
      id: 2,
      title: '2. Hold and Wait',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      definition: 'A process must be holding at least one resource and waiting to acquire additional resources held by other processes.',
      example: 'Process P1 holds GPU Slot R1 while waiting for Software License R2, which is held by Process P2.',
      prevention: 'Require processes to request and acquire ALL required resources before starting execution.'
    },
    {
      id: 3,
      title: '3. No Preemption',
      icon: Square,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      definition: 'Resources cannot be preempted; a resource can be released only voluntarily by the process holding it after completing its task.',
      example: 'Operating System cannot forcibly revoke exclusive storage lock from P2 while P2 is blocked.',
      prevention: 'Allow preemption: if a process holding resources requests another that cannot be allocated, release all held resources.'
    },
    {
      id: 4,
      title: '4. Circular Wait',
      icon: RotateCw,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      definition: 'A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.',
      example: 'P1 → waits for R2 held by P2 → waits for R1 held by P1 (Circular Wait Chain P1 → R2 → P2 → R1 → P1).',
      prevention: 'Impose a strict global ordering on all resource types. Processes must request resources in ascending order.'
    }
  ];

  const handleSimulatePlayground = (strategy: PreventionStrategy) => {
    setSimulatedCondition(strategy);
    updateSettings({ preventionStrategy: strategy });
    if (strategy === 'none') {
      loadScenarioPreset(2); // Deadlock state
    } else {
      loadScenarioPreset(3); // Prevented state
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Four Necessary Conditions for Deadlock</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Coffman conditions required simultaneously for a deadlock state to occur in an operating system.
          </p>
        </div>

        <button
          onClick={() => handleSimulatePlayground('resource_ordering')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Play className="w-4 h-4" />
          <span>Simulate Deadlock Conditions</span>
        </button>
      </div>

      {/* 4 Conditions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {conditions.map((cond) => {
          const Icon = cond.icon;
          return (
            <div
              key={cond.id}
              className={`p-5 rounded-xl border space-y-3 ${cond.bgColor} transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${cond.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">{cond.title}</h3>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {cond.definition}
              </p>

              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">OS Cloud Scenario Example:</div>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                  {cond.example}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-xs">
                <span className="font-semibold text-cyan-300">Prevention Strategy: </span>
                <span className="text-slate-300">{cond.prevention}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Deadlock Prevention Simulator Playground */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Interactive Condition Elimination Playground</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a Coffman condition to break and observe live system safety status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleSimulatePlayground('none')}
            className={`p-3 rounded-lg border text-left text-xs transition-all ${
              simulatedCondition === 'none'
                ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">No Prevention (All 4 Hold)</span>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400 font-normal">All 4 conditions active → Deadlock occurs.</p>
          </button>

          <button
            onClick={() => handleSimulatePlayground('hold_and_wait')}
            className={`p-3 rounded-lg border text-left text-xs transition-all ${
              simulatedCondition === 'hold_and_wait'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">Break Hold &amp; Wait</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Batch request all resources upfront.</p>
          </button>

          <button
            onClick={() => handleSimulatePlayground('preemption')}
            className={`p-3 rounded-lg border text-left text-xs transition-all ${
              simulatedCondition === 'preemption'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">Allow Preemption</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Forcibly preempt resources when waiting.</p>
          </button>

          <button
            onClick={() => handleSimulatePlayground('resource_ordering')}
            className={`p-3 rounded-lg border text-left text-xs transition-all ${
              simulatedCondition === 'resource_ordering'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">Break Circular Wait</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Strict ascending resource acquisition order.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
