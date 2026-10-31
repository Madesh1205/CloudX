import React, { useState } from 'react';
import { CloudXProvider } from './context/CloudXContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavViewId } from './components/layout/Sidebar';

import { DashboardView } from './components/views/DashboardView';
import { ServerManagementView } from './components/views/ServerManagementView';
import { ApplicationManagementView } from './components/views/ApplicationManagementView';
import { ResourceInventoryView } from './components/views/ResourceInventoryView';
import { AllocationEngineView } from './components/views/AllocationEngineView';
import { RAGGraphView } from './components/views/RAGGraphView';
import { DeadlockExplainerView } from './components/views/DeadlockExplainerView';
import { BankersAlgorithmView } from './components/views/BankersAlgorithmView';
import { DeadlockDetectionView } from './components/views/DeadlockDetectionView';
import { DeadlockRecoveryView } from './components/views/DeadlockRecoveryView';
import { ScenarioSimulatorView } from './components/views/ScenarioSimulatorView';
import { ActivityLogsView } from './components/views/ActivityLogsView';
import { SettingsView } from './components/views/SettingsView';

const VIEW_TITLES: Record<NavViewId, string> = {
  dashboard: 'Executive Dashboard',
  servers: 'Virtual Server Management',
  apps: 'Application Workloads & Processes',
  resources: 'Resource Inventory & Capacities',
  allocation: 'Resource Allocation Engine',
  rag_graph: 'Resource Allocation Graph (RAG)',
  explainer: 'Four Deadlock Conditions',
  bankers: "Banker's Algorithm (Avoidance)",
  detection: 'Deadlock Detection Dashboard',
  recovery: 'Deadlock Recovery Engine',
  simulator: 'Interactive Scenario Simulator',
  logs: 'Activity & Audit Logs',
  settings: 'Platform Settings & Policies'
};

function AppContent() {
  const [activeView, setActiveView] = useState<NavViewId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={(view) => setActiveView(view)} />;
      case 'servers':
        return <ServerManagementView />;
      case 'apps':
        return <ApplicationManagementView />;
      case 'resources':
        return <ResourceInventoryView />;
      case 'allocation':
        return <AllocationEngineView />;
      case 'rag_graph':
        return <RAGGraphView />;
      case 'explainer':
        return <DeadlockExplainerView />;
      case 'bankers':
        return <BankersAlgorithmView />;
      case 'detection':
        return <DeadlockDetectionView />;
      case 'recovery':
        return <DeadlockRecoveryView />;
      case 'simulator':
        return <ScenarioSimulatorView onNavigate={(view) => setActiveView(view)} />;
      case 'logs':
        return <ActivityLogsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(view) => setActiveView(view)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        activeViewTitle={VIEW_TITLES[activeView]}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => setActiveView(view)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950/60">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CloudXProvider>
      <AppContent />
    </CloudXProvider>
  );
}
