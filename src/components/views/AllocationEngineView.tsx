import React, { useState } from 'react';
import { 
  Sliders, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Zap
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { calculateAvailableResources } from '../../utils/osAlgorithms';

export const AllocationEngineView: React.FC = () => {
  const { 
    apps, 
    resources, 
    servers, 
    allocationRequests, 
    currentUser, 
    submitResourceRequest, 
    approveRequest, 
    rejectRequest, 
    releaseResource 
  } = useCloudX();

  const [selectedAppId, setSelectedAppId] = useState<string>(apps[0]?.id || '');
  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id || '');
  const [requestQuantity, setRequestQuantity] = useState<number>(1);
  const [lastFeedback, setLastFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const availableMap = calculateAvailableResources(resources, apps);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !selectedResourceId || requestQuantity <= 0) return;

    const res = submitResourceRequest(selectedAppId, selectedResourceId, Number(requestQuantity));
    setLastFeedback(res);
  };

  const selectedApp = apps.find((a) => a.id === selectedAppId);
  const selectedResource = resources.find((r) => r.id === selectedResourceId);
  const selectedServer = selectedApp ? servers.find((s) => s.id === selectedApp.serverId) : null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Resource Allocation Engine</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit resource requests, evaluate availability &amp; policy rules, and manage active allocations &amp; queues.
          </p>
        </div>
      </div>

      {/* Main Interactive Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Request Submission Form */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-xs dark:shadow-none">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Submit Resource Allocation Request</span>
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Select Application Process</label>
              <select
                value={selectedAppId}
                onChange={(e) => {
                  setSelectedAppId(e.target.value);
                  setLastFeedback(null);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Select Target Resource</label>
              <select
                value={selectedResourceId}
                onChange={(e) => {
                  setSelectedResourceId(e.target.value);
                  setLastFeedback(null);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type.toUpperCase()}) - {availableMap[r.id] || 0} Free
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Requested Instance Quantity</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Live Context Inspect */}
            {selectedApp && selectedResource && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Server Status:</span>
                  <span className={selectedServer?.status === 'online' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                    {selectedServer?.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Held:</span>
                  <span className="text-slate-900 dark:text-white">{selectedApp.currentAllocation[selectedResource.id] || 0} {selectedResource.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Declared Demand:</span>
                  <span className="text-slate-900 dark:text-white">{selectedApp.maxDemand[selectedResource.id] || 0} {selectedResource.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>System Available:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{availableMap[selectedResource.id] || 0} {selectedResource.unit}</span>
                </div>
              </div>
            )}

            {/* Form Submit Button */}
            <button
              type="submit"
              disabled={currentUser.role === 'viewer'}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                currentUser.role === 'viewer'
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Submit Request to Engine</span>
            </button>
          </form>

          {/* Feedback Display */}
          {lastFeedback && (
            <div
              className={`p-3.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                lastFeedback.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
              }`}
            >
              {lastFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold block">{lastFeedback.success ? 'Request Granted!' : 'Request Denied / Queued'}</span>
                <span>{lastFeedback.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Allocation Tables & Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Allocations Table */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-xs dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Active Resource Allocations Matrix</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Application</th>
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-3 text-right">Allocated</th>
                    <th className="py-2.5 px-3 text-right">Max Demand</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {apps.flatMap((app) =>
                    Object.entries(app.currentAllocation)
                      .filter(([_, qty]) => qty > 0)
                      .map(([resId, qty]) => {
                        const res = resources.find((r) => r.id === resId);
                        const max = app.maxDemand[resId] || 0;
                        return (
                          <tr key={`${app.id}-${resId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{app.name}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{res?.name || resId}</td>
                            <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">{qty} {res?.unit}</td>
                            <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400">{max} {res?.unit}</td>
                            <td className="py-3 px-3 text-center">
                              {currentUser.role !== 'viewer' && (
                                <button
                                  onClick={() => {
                                    const result = releaseResource(app.id, resId, 1);
                                    if (!result.success) alert(result.message);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-sans font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition-colors"
                                  title="Release 1 unit back to pool"
                                >
                                  Release 1
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Allocation Requests / Queue */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-xs dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Pending Requests Queue</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Request Time</th>
                    <th className="py-2.5 px-3">Application</th>
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-3 text-right">Requested</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {allocationRequests.map((req) => {
                    const app = apps.find((a) => a.id === req.appId);
                    const res = resources.find((r) => r.id === req.resourceId);
                    return (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">{req.requestTime}</td>
                        <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{app?.name || req.appId}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{res?.name || req.resourceId}</td>
                        <td className="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400">{req.requestedQuantity}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                              req.status === 'granted'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : req.status === 'waiting'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
                                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {req.status === 'waiting' && currentUser.role !== 'viewer' && (
                            <div className="flex items-center justify-center gap-1.5 font-sans">
                              <button
                                onClick={() => approveRequest(req.id)}
                                className="px-2 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectRequest(req.id)}
                                className="px-2 py-1 text-[10px] font-medium text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
