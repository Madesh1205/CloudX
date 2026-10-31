import React from 'react';
import { 
  Server, 
  Cpu, 
  Database, 
  HardDrive, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Clock, 
  ArrowUpRight,
  Zap,
  Layers,
  Sliders
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { calculateAvailableResources } from '../../utils/osAlgorithms';
import { NavViewId } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (view: NavViewId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    servers, 
    apps, 
    resources, 
    deadlockResult, 
    activityLogs,
    allocationRequests 
  } = useCloudX();

  // Compute live stats from actual data
  const onlineServers = servers.filter((s) => s.status === 'online').length;
  const offlineServers = servers.filter((s) => s.status === 'offline').length;

  const runningApps = apps.filter((a) => a.status === 'running').length;
  const waitingApps = apps.filter((a) => a.status === 'waiting' || a.status === 'blocked').length;

  const availableMap = calculateAvailableResources(resources, apps);

  const cpuRes = resources.find((r) => r.id === 'res_cpu');
  const totalCpu = cpuRes ? cpuRes.totalInstances : 0;
  const availCpu = cpuRes ? availableMap['res_cpu'] || 0 : 0;
  const usedCpu = Math.max(0, totalCpu - availCpu);
  const cpuPercent = totalCpu > 0 ? Math.round((usedCpu / totalCpu) * 100) : 0;

  const ramRes = resources.find((r) => r.id === 'res_ram');
  const totalRam = ramRes ? ramRes.totalInstances : 0;
  const availRam = ramRes ? availableMap['res_ram'] || 0 : 0;
  const usedRam = Math.max(0, totalRam - availRam);
  const ramPercent = totalRam > 0 ? Math.round((usedRam / totalRam) * 100) : 0;

  const storageRes = resources.find((r) => r.id === 'res_storage');
  const totalStorage = storageRes ? storageRes.totalInstances : 0;
  const availStorage = storageRes ? availableMap['res_storage'] || 0 : 0;
  const usedStorage = Math.max(0, totalStorage - availStorage);
  const storagePercent = totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0;

  let activeAllocationsCount = 0;
  apps.forEach((app) => {
    if (app.status !== 'terminated') {
      Object.values(app.currentAllocation).forEach((qty) => {
        activeAllocationsCount += qty;
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Deadlock Alert or System Nominal */}
      {deadlockResult.isDeadlocked ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-400">
                CRITICAL ALERT: Deadlock Detected in System Pipeline
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">
                {deadlockResult.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('recovery')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>Resolve Deadlock</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">
                Infrastructure Operating Safely (Safe State)
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                All process resource requests satisfied. Safe execution sequence maintained.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('bankers')}
            className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>View Safety Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Servers */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Virtual Servers</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">{servers.length}</div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-emerald-400 font-medium">{onlineServers} Online</span>
              <span>·</span>
              <span className="text-slate-500">{offlineServers} Offline</span>
            </div>
          </div>
        </div>

        {/* Card 2: Applications */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Workload Processes</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">{apps.length}</div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-emerald-400 font-medium">{runningApps} Running</span>
              <span>·</span>
              <span className={waitingApps > 0 ? 'text-amber-400 font-medium' : 'text-slate-500'}>
                {waitingApps} Blocked/Wait
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Allocations */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Allocations</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">{activeAllocationsCount}</div>
            <div className="text-xs text-slate-400 mt-1">
              Across {resources.length} registered resource types
            </div>
          </div>
        </div>

        {/* Card 4: Deadlock Alerts */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Deadlock Alerts</span>
            <div className={`p-2 rounded-lg ${deadlockResult.isDeadlocked ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold font-mono ${deadlockResult.isDeadlocked ? 'text-rose-400' : 'text-slate-200'}`}>
              {deadlockResult.deadlockedAppIds.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {deadlockResult.isDeadlocked ? 'Circular dependencies active' : 'Zero circular waits'}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Utilization Meters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meter 1: CPU */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">CPU Capacity Utilization</h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">{cpuPercent}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cpuPercent > 90 ? 'bg-rose-500' : cpuPercent > 75 ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                }`}
                style={{ width: `${Math.min(100, cpuPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{usedCpu} Cores Used</span>
              <span>{availCpu} Cores Available ({totalCpu} Total)</span>
            </div>
          </div>
        </div>

        {/* Meter 2: RAM */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">RAM Memory Utilization</h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">{ramPercent}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  ramPercent > 90 ? 'bg-rose-500' : ramPercent > 75 ? 'bg-amber-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(100, ramPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{usedRam} GB Used</span>
              <span>{availRam} GB Available ({totalRam} Total)</span>
            </div>
          </div>
        </div>

        {/* Meter 3: Storage */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">NVMe Storage Utilization</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{storagePercent}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  storagePercent > 90 ? 'bg-rose-500' : storagePercent > 75 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{ width: `${Math.min(100, storagePercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{usedStorage} GB Used</span>
              <span>{availStorage} GB Available ({totalStorage} Total)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status & Resource Breakdown Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Workload Processes Overview */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Active Application Workloads</h3>
            </div>
            <button
              onClick={() => onNavigate('apps')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Apps</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-xs font-bold shrink-0">
                    P{app.priority}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-medium text-white truncate">{app.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {app.category.toUpperCase()} · Server: {servers.find((s) => s.id === app.serverId)?.name || app.serverId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border ${
                      app.status === 'running'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : app.status === 'blocked' || app.status === 'waiting'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Recent System Activity</h3>
            </div>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Audit Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-start gap-3"
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    log.result === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : log.result === 'error'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-200 truncate">{log.description}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>{log.userName} ({log.userRole})</span>
                    {log.appName && (
                      <>
                        <span>·</span>
                        <span className="text-cyan-400">{log.appName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
