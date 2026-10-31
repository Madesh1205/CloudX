import React, { useState } from 'react';
import { 
  RotateCcw, 
  Award, 
  Bookmark, 
  Trash2 
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { recommendRecoveryVictim } from '../../utils/osAlgorithms';

export const DeadlockRecoveryView: React.FC = () => {
  const { 
    deadlockResult, 
    apps, 
    resources, 
    currentUser, 
    recoverTerminateApp, 
    recoverTerminateAllDeadlocked, 
    recoverPreemptResource, 
    rollbackAppCheckpoint 
  } = useCloudX();

  const [activeTab, setActiveTab] = useState<'termination' | 'preemption' | 'rollback'>('termination');
  const [selectedVictimId, setSelectedVictimId] = useState<string>('');
  const [selectedRequesterId, setSelectedRequesterId] = useState<string>('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');

  const recommendations = recommendRecoveryVictim(deadlockResult.deadlockedAppIds, apps);
  const recommendedVictim = recommendations[0];

  const handleTerminateOne = (appId: string) => {
    const res = recoverTerminateApp(appId);
    alert(res.message);
  };

  const handleTerminateAll = () => {
    if (window.confirm('Terminate ALL processes involved in deadlock?')) {
      const res = recoverTerminateAllDeadlocked();
      alert(res.message);
    }
  };

  const handlePreemptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVictimId || !selectedRequesterId || !selectedResourceId) return;
    const res = recoverPreemptResource(selectedVictimId, selectedRequesterId, selectedResourceId, 1);
    alert(res.message);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Deadlock Recovery Engine</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Execute process termination, resource preemption, or checkpoint rollback to clear circular wait conditions.
          </p>
        </div>
      </div>

      {/* Recommended Victim Recommendation Card */}
      {deadlockResult.isDeadlocked && recommendedVictim && (
        <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/40 rounded-xl space-y-3 shadow-xs dark:shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-sm">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Recommended Recovery Victim (Algorithmic Cost Minimization)</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-800 dark:text-indigo-300 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/80 rounded border border-indigo-300 dark:border-indigo-700">
              Score: {recommendedVictim.score} pts
            </span>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-950/70 rounded-lg border border-indigo-200 dark:border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{recommendedVictim.victimAppName}</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{recommendedVictim.reason}</p>
            </div>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => handleTerminateOne(recommendedVictim.victimAppId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs shrink-0"
              >
                Terminate Recommended Victim
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recovery Method Tabs */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5 shadow-xs dark:shadow-none">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('termination')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'termination'
                ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            A. Process Termination
          </button>
          <button
            onClick={() => setActiveTab('preemption')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'preemption'
                ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            B. Resource Preemption
          </button>
          <button
            onClick={() => setActiveTab('rollback')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'rollback'
                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            C. Process Rollback (Checkpoints)
          </button>
        </div>

        {/* Tab A: Termination */}
        {activeTab === 'termination' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Terminating a deadlocked process immediately aborts its execution and releases all held resources back to the available pool.
              </p>
              {currentUser.role === 'admin' && deadlockResult.isDeadlocked && (
                <button
                  onClick={handleTerminateAll}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs shrink-0"
                >
                  Terminate ALL Deadlocked ({deadlockResult.deadlockedAppIds.length})
                </button>
              )}
            </div>

            <div className="space-y-2">
              {deadlockResult.deadlockedAppIds.length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic text-xs">
                  No deadlocked processes currently require termination.
                </div>
              ) : (
                deadlockResult.deadlockedAppIds.map((appId) => {
                  const app = apps.find((a) => a.id === appId);
                  if (!app) return null;
                  const totalHeld = Object.values(app.currentAllocation).reduce((acc, q) => acc + q, 0);

                  return (
                    <div
                      key={appId}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{app.name}</h4>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          Holds {totalHeld} resource unit(s) · Priority: {app.priority}
                        </p>
                      </div>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleTerminateOne(app.id)}
                          className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 rounded-lg"
                        >
                          Terminate Process
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab B: Preemption */}
        {activeTab === 'preemption' && (
          <form onSubmit={handlePreemptSubmit} className="space-y-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              Forcibly preempt a resource instance from a victim process and reallocate it to a blocked requesting process.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Select Victim Process</label>
                <select
                  value={selectedVictimId}
                  onChange={(e) => setSelectedVictimId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Victim --</option>
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.priority})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Select Requester Process</label>
                <select
                  value={selectedRequesterId}
                  onChange={(e) => setSelectedRequesterId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Requester --</option>
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Select Resource</label>
                <select
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Resource --</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={currentUser.role !== 'admin'}
                className={`px-4 py-2 font-semibold text-white rounded-lg ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Execute Resource Preemption
              </button>
            </div>
          </form>
        )}

        {/* Tab C: Rollback */}
        {activeTab === 'rollback' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restores processes with active checkpoints to their pre-deadlock snapshot state.
            </p>

            <div className="space-y-2">
              {apps.filter((a) => a.checkpoint).length === 0 ? (
                <div className="p-4 text-center text-slate-500 italic text-xs">
                  No active checkpoints currently saved. Take a checkpoint from Application Management first.
                </div>
              ) : (
                apps.filter((a) => a.checkpoint).map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{app.name}</h4>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-mono">
                        Checkpoint taken at {app.checkpoint?.timestamp}: {app.checkpoint?.note}
                      </p>
                    </div>
                    {currentUser.role !== 'viewer' && (
                      <button
                        onClick={() => {
                          const res = rollbackAppCheckpoint(app.id);
                          alert(res.message);
                        }}
                        className="px-3.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Snapshot</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
