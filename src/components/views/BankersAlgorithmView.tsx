import React, { useState } from 'react';
import { 
  Calculator, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { runBankersSafetyAlgorithm, runBankersRequestAlgorithm } from '../../utils/osAlgorithms';
import { BankerSafetyResult } from '../../types/cloudx';

export const BankersAlgorithmView: React.FC = () => {
  const { apps, resources, loadScenarioPreset } = useCloudX();

  const [requestAppId, setRequestAppId] = useState<string>(apps[0]?.id || '');
  const [requestResId, setRequestResId] = useState<string>(resources[0]?.id || '');
  const [requestQty, setRequestQty] = useState<number>(1);
  const [requestResult, setRequestResult] = useState<{ allowed: boolean; reason: string; safetyResult?: BankerSafetyResult } | null>(null);

  const safetyResult = runBankersSafetyAlgorithm(apps, resources);

  const handleRunRequestTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAppId || !requestResId || requestQty <= 0) return;

    const resMap: Record<string, number> = { [requestResId]: Number(requestQty) };
    const res = runBankersRequestAlgorithm(requestAppId, resMap, apps, resources);
    setRequestResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Deadlock Avoidance – Banker's Algorithm</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            E.W. Dijkstra's resource allocation and deadlock avoidance algorithm calculating system state safety.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadScenarioPreset(4)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Classic Sample Dataset</span>
          </button>
        </div>
      </div>

      {/* System Safety Status Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          safetyResult.isSafe
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {safetyResult.isSafe ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <div>
            <h3 className="text-sm font-bold">
              {safetyResult.isSafe ? 'System State is SAFE' : 'System State is UNSAFE'}
            </h3>
            <p className="text-xs opacity-90 mt-0.5">{safetyResult.explanation}</p>
          </div>
        </div>

        {safetyResult.isSafe && (
          <div className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-mono text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 dark:text-slate-400">Safe Order:</span>
            <span className="font-bold text-slate-900 dark:text-white">{safetyResult.safeSequence.map(id => apps.find(a => a.id === id)?.name || id).join(' → ')}</span>
          </div>
        )}
      </div>

      {/* Main Banker's Matrix Table */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-xs dark:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Banker's Allocation &amp; Need Matrix</h3>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>Formula: <strong className="text-blue-600 dark:text-blue-400">Need = Maximum − Allocation</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Process ID</th>
                <th className="py-2.5 px-3">Process Name</th>
                <th className="py-2.5 px-3 text-center bg-slate-50 dark:bg-slate-950/40">Current Allocation</th>
                <th className="py-2.5 px-3 text-center bg-slate-100 dark:bg-slate-950/80">Maximum Demand</th>
                <th className="py-2.5 px-3 text-center bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">Remaining Need</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {apps.filter(a => a.status !== 'terminated').map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">{app.id}</td>
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{app.name}</td>
                  
                  {/* Allocation Vector */}
                  <td className="py-3 px-3 text-center bg-slate-50 dark:bg-slate-950/40 font-bold text-emerald-700 dark:text-emerald-400">
                    {resources.map((r) => `${r.name.slice(0, 3)}:${app.currentAllocation[r.id] || 0}`).join(' | ')}
                  </td>

                  {/* Maximum Demand Vector */}
                  <td className="py-3 px-3 text-center bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300">
                    {resources.map((r) => `${r.name.slice(0, 3)}:${app.maxDemand[r.id] || 0}`).join(' | ')}
                  </td>

                  {/* Calculated Need Vector */}
                  <td className="py-3 px-3 text-center bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold">
                    {resources.map((r) => `${r.name.slice(0, 3)}:${safetyResult.needMatrix[app.id]?.[r.id] || 0}`).join(' | ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Available Vector Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
          <span className="text-slate-600 dark:text-slate-400 font-semibold">Available Resource Vector (Work):</span>
          <div className="flex items-center gap-4 text-blue-700 dark:text-blue-300 font-bold">
            {resources.map((r) => (
              <span key={r.id}>
                {r.name}: <strong className="text-slate-900 dark:text-white">{safetyResult.availableVector[r.id] || 0}</strong> {r.unit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step-by-Step Calculation Trace */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-xs dark:shadow-none">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Safety Algorithm Execution Step-by-Step Trace</span>
        </h3>

        <div className="space-y-3">
          {safetyResult.steps.map((step) => (
            <div
              key={step.step}
              className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">Step #{step.step}</span>
                {step.candidateAppName && (
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Process {step.candidateAppName} Executed &amp; Completed
                  </span>
                )}
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{step.explanation}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                <div>Work Before: <span className="text-slate-900 dark:text-white">{JSON.stringify(step.workBefore)}</span></div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                <div>Work After: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{JSON.stringify(step.workAfter)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banker's Request Evaluation Playground */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-xs dark:shadow-none">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Test Resource Request against Banker's Avoidance</span>
        </h3>

        <form onSubmit={handleRunRequestTest} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Target Process</label>
            <select
              value={requestAppId}
              onChange={(e) => setRequestAppId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            >
              {apps.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Target Resource</label>
            <select
              value={requestResId}
              onChange={(e) => setRequestResId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Request Qty</label>
            <input
              type="number"
              min="1"
              value={requestQty}
              onChange={(e) => setRequestQty(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Evaluate Safety</span>
            </button>
          </div>
        </form>

        {requestResult && (
          <div
            className={`p-4 rounded-lg border text-xs leading-relaxed space-y-2 ${
              requestResult.allowed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="font-bold text-sm">
              {requestResult.allowed ? 'Decision: REQUEST GRANTED (SAFE)' : 'Decision: REQUEST DENIED / BLOCKED (UNSAFE)'}
            </div>
            <p>{requestResult.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};
