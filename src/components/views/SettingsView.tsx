import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  RotateCcw, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Sliders, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { AllocationPolicy, PreventionStrategy } from '../../types/cloudx';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoEnvironment, currentUser } = useCloudX();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <span>Platform Settings &amp; Policies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure global OS resource policies, prevention strategies, detection intervals, and environment state.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Policy & Prevention Panel */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Allocation Policy &amp; Prevention Strategy</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Global Allocation Engine Policy</label>
              <select
                value={settings.allocationPolicy}
                disabled={currentUser.role === 'viewer'}
                onChange={(e) => updateSettings({ allocationPolicy: e.target.value as AllocationPolicy })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium"
              >
                <option value="standard">Standard Allocation (First-Come, First-Served)</option>
                <option value="banker_avoidance">Banker's Algorithm (Deadlock Avoidance)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Banker's Avoidance mathematically evaluates every request to ensure system remains in a safe state.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Active Prevention Strategy Policy</label>
              <select
                value={settings.preventionStrategy}
                disabled={currentUser.role === 'viewer'}
                onChange={(e) => updateSettings({ preventionStrategy: e.target.value as PreventionStrategy })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium"
              >
                <option value="none">None (Allow all valid requests)</option>
                <option value="hold_and_wait">Hold &amp; Wait Prevention (Request all upfront)</option>
                <option value="resource_ordering">Resource Ordering (Ascending Resource Hierarchy)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automatic Detection & Simulation Panel */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Background Detection &amp; Simulation Speed</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <div>
                <div className="font-semibold text-white">Auto Deadlock Detection</div>
                <div className="text-[11px] text-slate-400">Background prober monitors RAG graph cycles</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoDeadlockDetection}
                disabled={currentUser.role === 'viewer'}
                onChange={(e) => updateSettings({ autoDeadlockDetection: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Detection Interval: {settings.detectionIntervalSec} seconds
              </label>
              <input
                type="range"
                min="3"
                max="60"
                step="1"
                value={settings.detectionIntervalSec}
                disabled={currentUser.role === 'viewer'}
                onChange={(e) => updateSettings({ detectionIntervalSec: parseInt(e.target.value) || 10 })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Environment Reset */}
      <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Reset Demo Environment</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Restores servers, applications, resources, and settings back to original initial sample data.
            </p>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
          >
            Reset All Demo Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        isDangerous={true}
        title="Reset CloudX Demo Environment?"
        description="This action will clear all local storage modifications, custom servers, applications, and resource allocations and restore original initial demo data."
        confirmLabel="Reset Environment"
        onConfirm={resetDemoEnvironment}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
