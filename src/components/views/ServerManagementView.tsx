import React, { useState } from 'react';
import { 
  Server as ServerIcon, 
  Plus, 
  Power, 
  RotateCw, 
  Trash2, 
  Edit3, 
  Info, 
  HardDrive, 
  Cpu, 
  Database, 
  Wifi, 
  CheckCircle2, 
  AlertOctagon,
  X 
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { Server, ServerStatus } from '../../types/cloudx';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const ServerManagementView: React.FC = () => {
  const { 
    servers, 
    apps, 
    currentUser, 
    addServer, 
    updateServer, 
    deleteServer, 
    toggleServerStatus 
  } = useCloudX();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [inspectServer, setInspectServer] = useState<Server | null>(null);
  const [stoppingServer, setStoppingServer] = useState<Server | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: 'us-east-1 (N. Virginia)',
    cpuCores: 8,
    ramGB: 16,
    storageGB: 200,
    networkMbps: 1000,
    description: ''
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addServer({
      name: formData.name,
      location: formData.location,
      cpuCores: Number(formData.cpuCores),
      ramGB: Number(formData.ramGB),
      storageGB: Number(formData.storageGB),
      networkMbps: Number(formData.networkMbps),
      status: 'online',
      description: formData.description || 'Virtual compute instance'
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      location: 'us-east-1 (N. Virginia)',
      cpuCores: 8,
      ramGB: 16,
      storageGB: 200,
      networkMbps: 1000,
      description: ''
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServer) return;
    updateServer(editingServer.id, {
      name: editingServer.name,
      location: editingServer.location,
      cpuCores: Number(editingServer.cpuCores),
      ramGB: Number(editingServer.ramGB),
      storageGB: Number(editingServer.storageGB),
      networkMbps: Number(editingServer.networkMbps),
      description: editingServer.description
    });
    setEditingServer(null);
  };

  const handlePowerClick = (server: Server) => {
    if (server.status === 'online') {
      const runningCount = apps.filter((a) => a.serverId === server.id && a.status === 'running').length;
      if (runningCount > 0) {
        setStoppingServer(server);
        return;
      }
      toggleServerStatus(server.id, 'offline');
    } else {
      toggleServerStatus(server.id, 'online');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-cyan-400" />
            <span>Virtual Server Infrastructure</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provision, inspect, and configure host compute nodes for running OS workloads.
          </p>
        </div>

        {currentUser.role !== 'viewer' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Virtual Server</span>
          </button>
        )}
      </div>

      {/* Server Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => {
          const assignedApps = apps.filter((a) => a.serverId === server.id && a.status !== 'terminated');
          const isOnline = server.status === 'online';

          // Calculate current server load
          let usedCpu = 0;
          let usedRam = 0;
          let usedStorage = 0;

          assignedApps.forEach((app) => {
            usedCpu += app.currentAllocation['res_cpu'] || app.requiredCpu || 0;
            usedRam += app.currentAllocation['res_ram'] || app.requiredRam || 0;
            usedStorage += app.currentAllocation['res_storage'] || app.requiredStorage || 0;
          });

          const cpuUsagePercent = Math.min(100, Math.round((usedCpu / server.cpuCores) * 100));
          const ramUsagePercent = Math.min(100, Math.round((usedRam / server.ramGB) * 100));

          return (
            <div
              key={server.id}
              className={`p-5 bg-slate-900 border rounded-xl space-y-4 transition-all relative ${
                isOnline ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/50 bg-slate-900/40 opacity-75'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    <ServerIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{server.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{server.id} · {server.location}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                    isOnline
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {server.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {server.description}
              </p>

              {/* Hardware Spec Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{server.cpuCores} CPU Cores</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{server.ramGB} GB RAM</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{server.storageGB} GB NVMe</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-amber-400" />
                  <span>{server.networkMbps} Mbps</span>
                </div>
              </div>

              {/* Load Progress Bars */}
              <div className="space-y-2 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>CPU Load ({usedCpu}/{server.cpuCores} Cores)</span>
                    <span>{cpuUsagePercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        cpuUsagePercent > 85 ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${cpuUsagePercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>RAM Load ({usedRam}/{server.ramGB} GB)</span>
                    <span>{ramUsagePercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        ramUsagePercent > 85 ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${ramUsagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                <button
                  onClick={() => setInspectServer(server)}
                  className="px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>

                {currentUser.role !== 'viewer' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePowerClick(server)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isOnline
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                      title={isOnline ? 'Stop Server' : 'Start Server'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleServerStatus(server.id, 'online')}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                      title="Restart Server"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setEditingServer(server)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                      title="Edit Server Specs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          const res = deleteServer(server.id);
                          if (!res.success) alert(res.message);
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors"
                        title="Delete Server"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Server Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Provision New Virtual Server</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Server Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Server Delta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Region / Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                  <option value="us-west-2 (Oregon)">us-west-2 (Oregon)</option>
                  <option value="eu-west-1 (Ireland)">eu-west-1 (Ireland)</option>
                  <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">CPU Cores</label>
                  <input
                    type="number"
                    min="1"
                    max="128"
                    value={formData.cpuCores}
                    onChange={(e) => setFormData({ ...formData, cpuCores: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">RAM Capacity (GB)</label>
                  <input
                    type="number"
                    min="1"
                    max="512"
                    value={formData.ramGB}
                    onChange={(e) => setFormData({ ...formData, ramGB: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Storage NVMe (GB)</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={formData.storageGB}
                    onChange={(e) => setFormData({ ...formData, storageGB: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Network Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    value={formData.networkMbps}
                    onChange={(e) => setFormData({ ...formData, networkMbps: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Operational details for server..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-cyan-600 hover:bg-cyan-500 font-semibold rounded-lg"
                >
                  Provision Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Server Drawer */}
      {inspectServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectServer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                <ServerIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{inspectServer.name}</h3>
                <p className="text-xs font-mono text-slate-400">{inspectServer.id} · {inspectServer.location}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-2">
                <h4 className="font-semibold text-slate-200">Server Status &amp; Specs</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono">
                  <div>CPU: {inspectServer.cpuCores} Cores</div>
                  <div>RAM: {inspectServer.ramGB} GB</div>
                  <div>Storage: {inspectServer.storageGB} GB</div>
                  <div>Network: {inspectServer.networkMbps} Mbps</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-2">Assigned Workload Processes</h4>
                {apps.filter((a) => a.serverId === inspectServer.id).length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                    No active workloads assigned to this server.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {apps.filter((a) => a.serverId === inspectServer.id).map((app) => (
                      <div
                        key={app.id}
                        className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-white">{app.name}</div>
                          <div className="text-[11px] text-slate-400">Category: {app.category} · Priority: {app.priority}</div>
                        </div>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stopping Server Confirmation Warning Modal */}
      {stoppingServer && (
        <ConfirmationModal
          isOpen={true}
          isDangerous={true}
          title={`Stop Virtual Server ${stoppingServer.name}?`}
          description={`WARNING: Stopping this host node will block or interrupt ${
            apps.filter((a) => a.serverId === stoppingServer.id && a.status === 'running').length
          } active process(es) assigned to it. Requests for resources on an offline server will be rejected!`}
          confirmLabel="Stop Server & Block Workloads"
          onConfirm={() => toggleServerStatus(stoppingServer.id, 'offline')}
          onClose={() => setStoppingServer(null)}
        />
      )}
    </div>
  );
};
