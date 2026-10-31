import React, { useState } from 'react';
import { 
  Cloud, 
  ShieldAlert, 
  UserCheck, 
  Moon, 
  Sun, 
  Menu,
  RotateCcw
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  activeViewTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, activeViewTitle }) => {
  const { currentUser, deadlockResult, settings, updateSettings, resetDemoEnvironment } = useCloudX();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const isDark = settings.theme === 'dark';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 lg:gap-8 px-4 lg:px-6 py-3 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shrink-0">
        {/* Zone 1: Brand wordmark & mobile trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg shadow-md shadow-cyan-500/20 text-white">
              <Cloud className="w-5 h-5" />
            </div>
            <a href="/" className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-1.5">
              CloudX <span className="text-xs font-mono font-medium text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/60">OS Engine</span>
            </a>
          </div>
        </div>

        {/* Zone 2: Contextual Page Title / Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 shrink-0">
          <span>Infrastructure</span>
          <span aria-hidden="true" className="text-slate-600">/</span>
          <span className="text-cyan-400 font-semibold">{activeViewTitle}</span>
        </div>

        {/* Zone 3: Actions, Role Selector & Alert Banner */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Deadlock Alert Indicator */}
          {deadlockResult.isDeadlocked && (
            <div className="animate-pulse flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 text-xs font-mono font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Deadlock Alert! ({deadlockResult.deadlockedAppIds.length})</span>
            </div>
          )}

          {/* User Role Switcher Trigger */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg transition-all text-xs text-slate-200"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-600"
              referrerPolicy="no-referrer"
            />
            <span className="hidden sm:inline font-medium text-white">{currentUser.name.split(' ')[0]}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase ${
                currentUser.role === 'admin'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : currentUser.role === 'operator'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
              }`}
            >
              {currentUser.role}
            </span>
            <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Reset Environment Quick Action */}
          <button
            onClick={() => {
              if (window.confirm('Reset CloudX environment to default sample data?')) {
                resetDemoEnvironment();
              }
            }}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-lg transition-colors"
            title="Reset to sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </>
  );
};
