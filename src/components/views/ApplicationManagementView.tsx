import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Trash2, 
  Bookmark, 
  Server,
  Layers,
  X 
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { AppWorkload, ApplicationCategory } from '../../types/cloudx';

export const ApplicationManagementView: React.FC = () => {
  const { 
    apps, 
    servers, 
    resources, 
    currentUser, 
    addApp, 
    deleteApp, 
    setAppStatus, 
    createAppCheckpoint, 
    rollbackAppCheckpoint 
  } = useCloudX();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppForCheckpoint, setSelectedAppForCheckpoint] = useState<AppWorkload | null>(null);
  const [checkpointNote, setCheckpointNote] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'web' as ApplicationCategory,
    serverId: servers[0]?.id || '',
    priority: 3,
    requiredCpu: 2,
    requiredRam: 4,
    requiredStorage: 20,
    requiredNetwork: 500,
    maxCpu: 4,
    maxRam: 8,
    maxGpuSlot: 1,
    maxLicense: 1
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.serverId) return;

    addApp({
      name: formData.name,
      category: formData.category,
      serverId: formData.serverId,
      priority: Number(formData.priority),
      requiredCpu: Number(formData.requiredCpu),
      requiredRam: Number(formData.requiredRam),
      requiredStorage: Number(formData.requiredStorage),
      requiredNetwork: Number(formData.requiredNetwork),
      maxDemand: {
        res_cpu: Number(formData.maxCpu),
        res_ram: Number(formData.maxRam),
        res_gpu_slot: Number(formData.maxGpuSlot),
        res_license: Number(formData.maxLicense)
      }
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      category: 'web',
      serverId: servers[0]?.id || '',
      priority: 3,
      requiredCpu: 2,
      requiredRam: 4,
      requiredStorage: 20,
      requiredNetwork: 500,
      maxCpu: 4,
      maxRam: 8,
      maxGpuSlot: 1,
      maxLicense: 1
    });
  };

  const handleTakeCheckpoint = () => {
    if (!selectedAppForCheckpoint) return;
    createAppCheckpoint(selectedAppForCheckpoint.id, checkpointNote);
    setSelectedAppForCheckpoint(null);
    setCheckpointNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Application Workloads &amp; Process Management</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register workloads, declare maximum resource demands, execute process control, and manage checkpoints.
          </p>
        </div>

        {currentUser.role !== 'viewer' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Workload</span>
          </button>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {apps.map((app) => {
          const server = servers.find((s) => s.id === app.serverId);
          const totalAllocated = Object.values(app.currentAllocation).reduce((acc, q) => acc + q, 0);

          return (
            <div
              key={app.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 hover:border-blue-300 dark:hover:border-slate-700 transition-all shadow-xs dark:shadow-none"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-mono font-bold text-sm shrink-0">
                    P{app.priority}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{app.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {app.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>ID: {app.id}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Server className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {server?.name || app.serverId}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right Status & Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-mono font-semibold px-3 py-1 rounded-full uppercase border ${
                      app.status === 'running'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : app.status === 'blocked' || app.status === 'waiting'
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 animate-pulse'
                        : app.status === 'completed'
                        ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {app.status}
                  </span>

                  {currentUser.role !== 'viewer' && (
                    <div className="flex items-center gap-1.5">
                      {app.status !== 'running' && app.status !== 'terminated' && (
                        <button
                          onClick={() => setAppStatus(app.id, 'running')}
                          className="px-2.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1"
                          title="Start/Resume Process"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start</span>
                        </button>
                      )}

                      {app.status === 'running' && (
                        <button
                          onClick={() => setAppStatus(app.id, 'waiting')}
                          className="px-2.5 py-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1"
                          title="Pause Process"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </button>
                      )}

                      {app.status !== 'terminated' && (
                        <button
                          onClick={() => setAppStatus(app.id, 'terminated')}
                          className="px-2.5 py-1.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1"
                          title="Terminate Process & Release Resources"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>Terminate</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAppForCheckpoint(app)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
                        title="Create State Checkpoint"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      </button>

                      {app.checkpoint && (
                        <button
                          onClick={() => {
                            const res = rollbackAppCheckpoint(app.id);
                            if (!res.success) alert(res.message);
                          }}
                          className="p-1.5 text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors"
                          title={`Rollback to checkpoint taken at ${app.checkpoint.timestamp}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            const res = deleteApp(app.id);
                            if (!res.success) alert(res.message);
                          }}
                          className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
                          title="Delete Application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Demand & Allocation Matrices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Declared Maximum Demands */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Declared Maximum Demands</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(app.maxDemand).map(([resId, maxQty]) => {
                      const res = resources.find((r) => r.id === resId);
                      return (
                        <span key={resId} className="text-[11px] font-mono px-2 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {res?.name || resId}: <strong className="text-slate-900 dark:text-white">{maxQty}</strong> {res?.unit || 'units'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Current Allocations */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Current Active Allocations</span>
                    <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">{totalAllocated} total units</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(app.currentAllocation).length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No resources currently held.</span>
                    ) : (
                      Object.entries(app.currentAllocation).map(([resId, allocQty]) => {
                        const res = resources.find((r) => r.id === resId);
                        if (allocQty <= 0) return null;
                        return (
                          <span key={resId} className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            {res?.name || resId}: <strong className="text-slate-900 dark:text-white">{allocQty}</strong>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Workload Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Register New Application Workload</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Workload / Process Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Model Inference Worker"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ApplicationCategory })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="web">Web Application</option>
                    <option value="database">Database Service</option>
                    <option value="ai">AI Workload</option>
                    <option value="video">Video Processing</option>
                    <option value="background">Background Job</option>
                    <option value="file">File Processing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Assigned Server</label>
                  <select
                    value={formData.serverId}
                    onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {servers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Priority (1 = Highest, 10 = Lowest)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Max CPU Demand (Cores)</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={formData.maxCpu}
                    onChange={(e) => setFormData({ ...formData, maxCpu: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg"
                >
                  Register Workload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
