import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Lock, 
  Share2, 
  Edit3, 
  Trash2, 
  Users, 
  Clock, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { Resource, ResourceType } from '../../types/cloudx';
import { calculateAvailableResources } from '../../utils/osAlgorithms';

export const ResourceInventoryView: React.FC = () => {
  const { 
    resources, 
    apps, 
    currentUser, 
    addResource, 
    updateResource, 
    deleteResource 
  } = useCloudX();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [inspectResource, setInspectResource] = useState<Resource | null>(null);

  const availableMap = calculateAvailableResources(resources, apps);

  // Add Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'exclusive' as ResourceType,
    unit: 'Units',
    totalInstances: 2,
    description: '',
    isPreemptible: false
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addResource({
      name: formData.name,
      type: formData.type,
      unit: formData.unit,
      totalInstances: Number(formData.totalInstances),
      description: formData.description || 'Hardware or system resource',
      isPreemptible: formData.isPreemptible
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      type: 'exclusive',
      unit: 'Units',
      totalInstances: 2,
      description: '',
      isPreemptible: false
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    const res = updateResource(editingResource.id, {
      name: editingResource.name,
      totalInstances: Number(editingResource.totalInstances),
      description: editingResource.description,
      isPreemptible: editingResource.isPreemptible
    });
    if (!res.success) {
      alert(res.message);
      return;
    }
    setEditingResource(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Resource Inventory &amp; Capacity Control</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage shareable capacity resources and exclusive mutual-exclusion resources.
          </p>
        </div>

        {currentUser.role !== 'viewer' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource Type</span>
          </button>
        )}
      </div>

      {/* Shareable Resources Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span>Shareable Capacity Resources</span>
          <span className="text-xs text-slate-500 font-normal">(CPU, RAM, Storage, Bandwidth)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.filter((r) => r.type === 'shareable').map((res) => {
            const avail = availableMap[res.id] || 0;
            const allocated = res.totalInstances - avail;
            const percentUsed = Math.min(100, Math.round((allocated / res.totalInstances) * 100));

            return (
              <div key={res.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{res.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">{res.id}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{percentUsed}% Allocated</span>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Allocated: {allocated} {res.unit}</span>
                    <span>Available: {avail} / {res.totalInstances} {res.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => setInspectResource(res)}
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Resource Owners</span>
                  </button>

                  {currentUser.role !== 'viewer' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingResource(res)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                        title="Edit Capacity"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exclusive Resources Section */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-rose-400" />
          <span>Exclusive Mutual-Exclusion Resources</span>
          <span className="text-xs text-slate-500 font-normal">(GPU Execution Slots, Licenses, Storage Locks)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.filter((r) => r.type === 'exclusive').map((res) => {
            const avail = availableMap[res.id] || 0;
            const allocated = res.totalInstances - avail;
            const isFullyAllocated = avail === 0;

            return (
              <div key={res.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isFullyAllocated ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{res.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{res.unit}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                      isFullyAllocated
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isFullyAllocated ? 'LOCKED' : `${avail} Free`}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                {/* Instance Blocks Grid */}
                <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>Instance Allocation State</span>
                    <span>{allocated}/{res.totalInstances} Held</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from({ length: res.totalInstances }).map((_, idx) => {
                      const isHeld = idx < allocated;
                      return (
                        <span
                          key={idx}
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold border transition-all ${
                            isHeld
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                          title={isHeld ? `Instance #${idx + 1} Currently Allocated` : `Instance #${idx + 1} Free`}
                        >
                          {idx + 1}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => setInspectResource(res)}
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Owners ({allocated})</span>
                  </button>

                  {currentUser.role !== 'viewer' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingResource(res)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                        title="Edit Specs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            const result = deleteResource(res.id);
                            if (!result.success) alert(result.message);
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 bg-rose-500/10 border border-rose-500/20 rounded-lg"
                          title="Delete Resource"
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
      </div>

      {/* Inspect Resource Owners Drawer */}
      {inspectResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 relative">
            <button
              onClick={() => setInspectResource(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">{inspectResource.name} Ownership</h3>
            <p className="text-xs text-slate-400 mb-4">
              Detailed list of processes currently holding or requesting instances of {inspectResource.name}.
            </p>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-300">Current Holding Processes</h4>
                {apps.filter((a) => (a.currentAllocation[inspectResource.id] || 0) > 0).length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                    No processes currently hold instances of this resource.
                  </p>
                ) : (
                  apps.filter((a) => (a.currentAllocation[inspectResource.id] || 0) > 0).map((app) => (
                    <div key={app.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{app.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Process Status: {app.status}</div>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-1 bg-emerald-950/60 border border-emerald-800 rounded">
                        {app.currentAllocation[inspectResource.id]} {inspectResource.unit} Held
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="font-semibold text-slate-300">Pending Blocked Requests</h4>
                {apps.filter((a) => (a.pendingRequests[inspectResource.id] || 0) > 0).length === 0 ? (
                  <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                    No pending requests waiting for this resource.
                  </p>
                ) : (
                  apps.filter((a) => (a.pendingRequests[inspectResource.id] || 0) > 0).map((app) => (
                    <div key={app.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{app.name}</div>
                        <div className="text-[10px] text-rose-400 font-mono">Blocked Waiting</div>
                      </div>
                      <span className="font-mono text-xs font-bold text-rose-400 px-2 py-1 bg-rose-950/60 border border-rose-800 rounded">
                        Requesting {app.pendingRequests[inspectResource.id]} {inspectResource.unit}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Add New Resource Type</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hardware Encryption Key Slot"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="exclusive">Exclusive (Mutual Exclusion)</option>
                    <option value="shareable">Shareable (Capacity)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Total Capacity / Instances</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.totalInstances}
                    onChange={(e) => setFormData({ ...formData, totalInstances: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Unit Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. Devices, Keys, Slots"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
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
                  Create Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
