import React from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Database,
  ArrowRight,
  Clock 
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';

export const DeadlockDetectionView: React.FC = () => {
  const { 
    deadlockResult, 
    runDeadlockDetection, 
    apps, 
    resources, 
    settings, 
    updateSettings 
  } = useCloudX();

  const handleManualRun = () => {
    runDeadlockDetection();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Deadlock Detection Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multi-instance algorithm and Wait-For Graph cycle detection evaluating real system deadlock states.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleManualRun}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Run Detection Algorithm</span>
          </button>
        </div>
      </div>

      {/* Detection Status Hero Card */}
      <div
        className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          deadlockResult.isDeadlocked
            ? 'bg-rose-950/40 border-rose-500/60 shadow-xl shadow-rose-950/40'
            : 'bg-emerald-950/40 border-emerald-500/40 shadow-xl shadow-emerald-950/40'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              deadlockResult.isDeadlocked ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {deadlockResult.isDeadlocked ? (
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white">
                {deadlockResult.isDeadlocked ? 'DEADLOCK DETECTED IN PIPELINE' : 'NO DEADLOCK DETECTED'}
              </h3>
              {deadlockResult.detectedAt && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Last Checked: {deadlockResult.detectedAt}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {deadlockResult.message}
            </p>
          </div>
        </div>

        {/* Auto Detection Toggle */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-xs shrink-0">
          <div className="flex items-center justify-between gap-4 font-semibold text-slate-300">
            <span>Automatic Background Detection</span>
            <input
              type="checkbox"
              checked={settings.autoDeadlockDetection}
              onChange={(e) => updateSettings({ autoDeadlockDetection: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Interval: {settings.detectionIntervalSec} seconds
          </div>
        </div>
      </div>

      {/* Deadlock Breakdown Details Grid */}
      {deadlockResult.isDeadlocked && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deadlocked Applications List */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-rose-400" />
              <span>Deadlocked Workload Processes ({deadlockResult.deadlockedAppIds.length})</span>
            </h3>

            <div className="space-y-3">
              {deadlockResult.deadlockedAppIds.map((appId) => {
                const app = apps.find((a) => a.id === appId);
                if (!app) return null;
                return (
                  <div
                    key={appId}
                    className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{app.name}</h4>
                      <p className="text-[11px] font-mono text-rose-300/80 mt-0.5">
                        Priority {app.priority} · Status: {app.status.toUpperCase()}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      BLOCKED
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Involved Resources List */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" />
              <span>Involved Resources ({deadlockResult.involvedResourceIds.length})</span>
            </h3>

            <div className="space-y-3">
              {deadlockResult.involvedResourceIds.map((resId) => {
                const res = resources.find((r) => r.id === resId);
                if (!res) return null;
                return (
                  <div
                    key={resId}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white">{res.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{res.type.toUpperCase()} · Total: {res.totalInstances} {res.unit}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Oversubscribed / Contended
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Circular Chains */}
          {deadlockResult.cycles.length > 0 && (
            <div className="md:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-white">Circular Wait Dependency Chains</h3>
              <div className="space-y-2 font-mono text-xs text-rose-300">
                {deadlockResult.cycles.map((cycle, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-rose-500/40 rounded-lg flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Chain #{idx + 1}:</span>
                    <span>{cycle.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
