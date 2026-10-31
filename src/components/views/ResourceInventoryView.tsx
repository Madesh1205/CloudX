import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Lock, 
  Share2, 
  Edit3, 
  Trash2, 
  Users, 
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Resource Inventory &amp; Capacity Control</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage shareable capacity resources and exclusive mutual-exclusion resources.
          </p>
        </div>

        {currentUser.role !== 'viewer' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource Type</span>
          </button>
        )}
      </div>

      {/* Shareable Resources Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Shareable Capacity Resources</span>
          <span className="text-xs text-slate-500 font-normal">(CPU, RAM, Storage, Bandwidth)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.filter((r) => r.type === 'shareable').map((res) => {
            const avail = availableMap[res.id] || 0;
            const allocated = res.totalInstances - avail;
            const percentUsed = Math.min(100, Math.round((allocated / res.totalInstances) * 100));

            return (
              <div key={res.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-xs dark:shadow-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{res.name}</h4>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{res.id}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{percentUsed}% Allocated</span>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Allocated: {allocated} {res.unit}</span>
                    <span>Available: {avail} / {res.totalInstances} {res.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setInspectResource(res)}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Resource Owners</span>
                  </button>

                  {currentUser.role !== 'viewer' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingResource(res)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
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
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Exclusive Mutual-Exclusion Resources</span>
          <span className="text-xs text-slate-500 font-normal">(GPU Execution Slots, Licenses, Storage Locks)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.filter((r) => r.type === 'exclusive').map((res) => {
            const avail = availableMap[res.id] || 0;
            const allocated = res.totalInstances - avail;
            const isFullyAllocated = avail === 0;

            return (
              <div key={res.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-xs dark:shadow-none">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isFullyAllocated ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{res.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{res.unit}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                      isFullyAllocated
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {isFullyAllocated ? 'LOCKED' : `${avail} Free`}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                {/* Instance Blocks Grid */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex justify-between">
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
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
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
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => setInspectResource(res)}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Owners ({allocated})</span>
                  </button>

                  {currentUser.role !== 'viewer' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingResource(res)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
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
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 bg-rose-500/10 border border-rose-500/20 rounded-lg"
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
    </div>
  );
};
