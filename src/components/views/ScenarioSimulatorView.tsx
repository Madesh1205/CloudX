import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { NavViewId } from '../layout/Sidebar';

interface ScenarioSimulatorViewProps {
  onNavigate: (view: NavViewId) => void;
}

export const ScenarioSimulatorView: React.FC<ScenarioSimulatorViewProps> = ({ onNavigate }) => {
  const { loadScenarioPreset, deadlockResult, apps, settings, updateSettings } = useCloudX();

  const [activeScenarioId, setActiveScenarioId] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(1);

  const scenarioPresets = [
    {
      id: 1,
      title: 'Scenario 1: Normal Allocation',
      description: '3 applications request CPU & RAM resources within available capacity. All processes finish without deadlock.'
    },
    {
      id: 2,
      title: 'Scenario 2: Deadlock Simulation',
      description: 'P1 holds GPU Slot (R1) & requests License (R2). P2 holds License (R2) & requests GPU Slot (R1).'
    },
    {
      id: 3,
      title: 'Scenario 3: Deadlock Prevention',
      description: 'Fixed resource ordering policy enforced. P2 cannot request R1 after acquiring R2 out-of-order.'
    },
    {
      id: 4,
      title: 'Scenario 4: Banker\'s Algorithm',
      description: 'Loads matrix (A=3, B=3, C=2). Evaluates safe sequence P1 → P3 → P4 → P0 → P2 and rejects unsafe requests.'
    },
    {
      id: 5,
      title: 'Scenario 5: Deadlock Recovery',
      description: 'Starts in deadlocked state, then executes victim process termination to release resources and unblock P1.'
    }
  ];

  const handleSelectScenario = (id: number) => {
    setActiveScenarioId(id);
    setSimStep(1);
    setIsPlaying(false);
    loadScenarioPreset(id);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(500, 3000 / settings.simSpeed);
    const timer = setInterval(() => {
      setSimStep((prev) => (prev >= 5 ? 5 : prev + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, settings.simSpeed]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Interactive OS Scenario Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Run step-by-step real-time operating system allocation &amp; deadlock scenarios.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Scenario'}</span>
          </button>

          <button
            onClick={() => setSimStep((s) => Math.min(5, s + 1))}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1"
          >
            <span>Step Forward</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleSelectScenario(activeScenarioId)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            title="Reset Scenario"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {scenarioPresets.map((sc) => {
          const isSelected = activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc.id)}
              className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                isSelected
                  ? 'bg-blue-50 dark:bg-cyan-950/60 border-blue-500 dark:border-cyan-500 text-blue-900 dark:text-cyan-200 font-semibold shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{sc.title}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {sc.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Simulator Execution Stage */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5 shadow-xs dark:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-blue-700 dark:text-cyan-400 px-2.5 py-1 bg-blue-50 dark:bg-cyan-950 border border-blue-200 dark:border-cyan-800 rounded">
              Step #{simStep} of 5
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {scenarioPresets.find((s) => s.id === activeScenarioId)?.title}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Sim Speed:</span>
            <select
              value={settings.simSpeed}
              onChange={(e) => updateSettings({ simSpeed: Number(e.target.value) })}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
            >
              <option value="1">1x Speed</option>
              <option value="2">2x Speed</option>
              <option value="5">5x Speed</option>
            </select>
          </div>
        </div>

        {/* Dynamic Simulation Output Box */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-900 pb-2">
            <span>Active Workload Processes: {apps.length}</span>
            <span className={deadlockResult.isDeadlocked ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
              {deadlockResult.isDeadlocked ? 'DEADLOCK ACTIVE' : 'NOMINAL SAFE STATE'}
            </span>
          </div>

          <div className="space-y-2">
            {apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
                <span className="text-slate-900 dark:text-white font-medium">{app.name} ({app.id})</span>
                <span className="text-blue-600 dark:text-cyan-400">Allocated: {JSON.stringify(app.currentAllocation)}</span>
                <span className="text-amber-600 dark:text-amber-400">Requests: {JSON.stringify(app.pendingRequests)}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    app.status === 'running'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : app.status === 'blocked'
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick jump to RAG Graph */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onNavigate('rag_graph')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <span>View Live RAG Graph</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
