import React from 'react';
import { 
  LayoutDashboard, 
  Server, 
  Cpu, 
  Database, 
  Sliders, 
  GitFork, 
  BookOpen, 
  Calculator, 
  ShieldAlert, 
  RotateCcw, 
  PlayCircle, 
  FileText, 
  Settings,
  X
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';

export type NavViewId = 
  | 'dashboard'
  | 'servers'
  | 'apps'
  | 'resources'
  | 'allocation'
  | 'rag_graph'
  | 'explainer'
  | 'bankers'
  | 'detection'
  | 'recovery'
  | 'simulator'
  | 'logs'
  | 'settings';

interface SidebarProps {
  activeView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavViewId;
  label: string;
  icon: React.ElementType;
  badge?: string;
  section?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isMobileOpen,
  onCloseMobile
}) => {
  const { deadlockResult } = useCloudX();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Infrastructure' },
    { id: 'servers', label: 'Virtual Servers', icon: Server, section: 'Infrastructure' },
    { id: 'apps', label: 'Applications & Workloads', icon: Cpu, section: 'Infrastructure' },
    { id: 'resources', label: 'Resource Inventory', icon: Database, section: 'Infrastructure' },
    
    { id: 'allocation', label: 'Allocation Engine', icon: Sliders, section: 'OS Core Engine' },
    { id: 'rag_graph', label: 'Resource Allocation Graph', icon: GitFork, section: 'OS Core Engine' },
    { id: 'explainer', label: 'Deadlock Conditions', icon: BookOpen, section: 'OS Core Engine' },
    
    { id: 'bankers', label: "Banker's Algorithm", icon: Calculator, section: 'Algorithmic OS' },
    { 
      id: 'detection', 
      label: 'Deadlock Detection', 
      icon: ShieldAlert, 
      section: 'Algorithmic OS',
      badge: deadlockResult.isDeadlocked ? `${deadlockResult.deadlockedAppIds.length}` : undefined 
    },
    { id: 'recovery', label: 'Deadlock Recovery', icon: RotateCcw, section: 'Algorithmic OS' },
    
    { id: 'simulator', label: 'Scenario Simulator', icon: PlayCircle, section: 'Simulation & Auditing' },
    { id: 'logs', label: 'Activity & Audit Logs', icon: FileText, section: 'Simulation & Auditing' },
    { id: 'settings', label: 'Platform Settings', icon: Settings, section: 'Simulation & Auditing' }
  ];

  const handleNavClick = (viewId: NavViewId) => {
    onSelectView(viewId);
    onCloseMobile();
  };

  const sections = Array.from(new Set(navItems.map((item) => item.section)));

  return (
    <>
      {/* Mobile Backing Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">CloudX Navigation</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((sectionName) => (
            <div key={sectionName} className="space-y-1">
              <h3 className="px-3 text-[11px] font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {sectionName}
              </h3>
              <div className="mt-1 space-y-0.5">
                {navItems
                  .filter((item) => item.section === sectionName)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-rose-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Engine Info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Bankers &amp; RAG Engine</span>
          </div>
          <span className="font-mono text-[10px]">v2.4</span>
        </div>
      </aside>
    </>
  );
};
