import React from 'react';
import { UserCheck, X } from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { DEMO_USERS } from '../../data/initialDemoData';
import { UserRole } from '../../types/cloudx';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRole } = useCloudX();

  if (!isOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Switch User Role &amp; Permissions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select a pre-configured account to test role permissions.</p>
          </div>
        </div>

        <div className="space-y-3 my-6">
          {DEMO_USERS.map((user) => {
            const isSelected = currentUser.role === user.role;
            return (
              <div
                key={user.id}
                onClick={() => handleSelectRole(user.role)}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex items-start gap-4 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-cyan-950/40 border-blue-500 dark:border-cyan-500/60 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</h4>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : user.role === 'operator'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-2">
                    {user.role === 'admin' && 'Full privileges: Server/App CRUD, All OS algorithms, Resource limits & Deadlock recovery.'}
                    {user.role === 'operator' && 'Operational privileges: Resource allocations within limits, server monitoring & detection.'}
                    {user.role === 'viewer' && 'Read-only access: View dashboards, allocation graphs, and algorithm results.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
