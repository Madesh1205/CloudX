import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, 
  UserRole, 
  Server, 
  Resource, 
  AppWorkload, 
  AllocationRequest, 
  DeadlockDetectionResult, 
  AppSettings, 
  ActivityLog,
  PreventionStrategy,
  AllocationPolicy,
  ProcessStatus,
  Checkpoint
} from '../types/cloudx';

import { 
  DEMO_USERS, 
  INITIAL_SERVERS, 
  INITIAL_RESOURCES, 
  INITIAL_APPS, 
  INITIAL_SETTINGS, 
  INITIAL_LOGS 
} from '../data/initialDemoData';

import { 
  calculateAvailableResources, 
  runBankersSafetyAlgorithm, 
  runBankersRequestAlgorithm, 
  detectDeadlock 
} from '../utils/osAlgorithms';

interface CloudXContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  
  servers: Server[];
  addServer: (server: Omit<Server, 'id' | 'createdAt'>) => void;
  updateServer: (id: string, updates: Partial<Server>) => void;
  deleteServer: (id: string) => { success: boolean; message: string };
  toggleServerStatus: (id: string, status: Server['status']) => { success: boolean; message: string };

  apps: AppWorkload[];
  addApp: (app: Omit<AppWorkload, 'id' | 'createdAt' | 'currentAllocation' | 'pendingRequests' | 'status'>) => void;
  updateApp: (id: string, updates: Partial<AppWorkload>) => void;
  deleteApp: (id: string) => { success: boolean; message: string };
  setAppStatus: (id: string, status: ProcessStatus) => void;
  createAppCheckpoint: (appId: string, note?: string) => void;
  rollbackAppCheckpoint: (appId: string) => { success: boolean; message: string };

  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => { success: boolean; message: string };
  deleteResource: (id: string) => { success: boolean; message: string };

  allocationRequests: AllocationRequest[];
  submitResourceRequest: (appId: string, resourceId: string, quantity: number) => { success: boolean; message: string };
  approveRequest: (requestId: string) => { success: boolean; message: string };
  rejectRequest: (requestId: string) => { success: boolean; message: string };
  releaseResource: (appId: string, resourceId: string, quantity: number) => { success: boolean; message: string };

  deadlockResult: DeadlockDetectionResult;
  runDeadlockDetection: () => DeadlockDetectionResult;
  recoverTerminateApp: (appId: string) => { success: boolean; message: string };
  recoverTerminateAllDeadlocked: () => { success: boolean; message: string };
  recoverPreemptResource: (victimAppId: string, requesterAppId: string, resourceId: string, quantity: number) => { success: boolean; message: string };

  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  activityLogs: ActivityLog[];
  logEvent: (event: Omit<ActivityLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => void;
  exportLogsToCSV: () => void;

  loadScenarioPreset: (scenarioId: number) => void;
  resetDemoEnvironment: () => void;
}

const CloudXContext = createContext<CloudXContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SERVERS: 'cloudx_servers_v1',
  APPS: 'cloudx_apps_v1',
  RESOURCES: 'cloudx_resources_v1',
  REQUESTS: 'cloudx_requests_v1',
  SETTINGS: 'cloudx_settings_v1',
  LOGS: 'cloudx_logs_v1',
  USER: 'cloudx_user_v1'
};

export const CloudXProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEMO_USERS[0];
  });

  // 2. Core Entities State
  const [servers, setServers] = useState<Server[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_SERVERS;
  });

  const [apps, setApps] = useState<AppWorkload[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_APPS;
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESOURCES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_RESOURCES;
  });

  const [allocationRequests, setAllocationRequests] = useState<AllocationRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_SETTINGS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_LOGS;
  });

  // 3. Deadlock State
  const [deadlockResult, setDeadlockResult] = useState<DeadlockDetectionResult>(() => {
    return detectDeadlock(INITIAL_APPS, INITIAL_RESOURCES);
  });

  // LocalStorage Persist Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVERS, JSON.stringify(servers));
  }, [servers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(allocationRequests));
  }, [allocationRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Sync Theme class on <html> element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Activity logger
  const logEvent = useCallback((event: Omit<ActivityLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => {
    const newLog: ActivityLog = {
      ...event,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 499)]); // keep max 500 logs
  }, [currentUser]);

  // Role Switcher
  const switchRole = useCallback((role: UserRole) => {
    const user = DEMO_USERS.find((u) => u.role === role) || {
      id: `user_${role}`,
      name: `Demo ${role.toUpperCase()}`,
      email: `${role}@cloudx.io`,
      role,
      avatar: ''
    };
    setCurrentUser(user);
    logEvent({
      eventType: 'settings_changed',
      description: `Switched user session role to ${role.toUpperCase()}.`,
      result: 'info'
    });
  }, [logEvent]);

  // Deadlock Detection Runner
  const runDeadlockDetection = useCallback((): DeadlockDetectionResult => {
    const result = detectDeadlock(apps, resources);
    setDeadlockResult(result);

    if (result.isDeadlocked) {
      logEvent({
        eventType: 'deadlock_detected',
        description: `Deadlock detected involving ${result.deadlockedAppIds.length} process(es).`,
        result: 'error'
      });
    }

    return result;
  }, [apps, resources, logEvent]);

  // Auto deadlock detection timer
  useEffect(() => {
    if (!settings.autoDeadlockDetection) return;
    const intervalMs = settings.detectionIntervalSec * 1000;
    const timer = setInterval(() => {
      runDeadlockDetection();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [settings.autoDeadlockDetection, settings.detectionIntervalSec, runDeadlockDetection]);

  // -------------------------------------------------------------
  // SERVER MANAGEMENT
  // -------------------------------------------------------------
  const addServer = (serverData: Omit<Server, 'id' | 'createdAt'>) => {
    if (currentUser.role === 'viewer') return;
    const newServer: Server = {
      ...serverData,
      id: `srv_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    setServers((prev) => [...prev, newServer]);
    logEvent({
      eventType: 'server_created',
      description: `Created virtual server ${newServer.name} (${newServer.cpuCores} Cores, ${newServer.ramGB}GB RAM).`,
      result: 'success'
    });
  };

  const updateServer = (id: string, updates: Partial<Server>) => {
    if (currentUser.role === 'viewer') return;
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    logEvent({
      eventType: 'settings_changed',
      description: `Updated server configuration for ${id}.`,
      result: 'info'
    });
  };

  const deleteServer = (id: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Permission denied. Only Cloud Administrator can delete servers.' };
    }
    const assignedApps = apps.filter((a) => a.serverId === id && a.status !== 'terminated');
    if (assignedApps.length > 0) {
      return {
        success: false,
        message: `Cannot delete server. It has ${assignedApps.length} active application(s) assigned: ${assignedApps.map((a) => a.name).join(', ')}.`
      };
    }
    const target = servers.find((s) => s.id === id);
    setServers((prev) => prev.filter((s) => s.id !== id));
    logEvent({
      eventType: 'settings_changed',
      description: `Deleted server ${target?.name || id}.`,
      result: 'warning'
    });
    return { success: true, message: `Server ${target?.name || id} successfully deleted.` };
  };

  const toggleServerStatus = (id: string, status: Server['status']): { success: boolean; message: string } => {
    if (currentUser.role === 'viewer') {
      return { success: false, message: 'Permission denied.' };
    }
    const server = servers.find((s) => s.id === id);
    if (!server) return { success: false, message: 'Server not found.' };

    if (status === 'offline') {
      // Check assigned workloads
      const runningApps = apps.filter((a) => a.serverId === id && (a.status === 'running' || a.status === 'blocked'));
      if (runningApps.length > 0) {
        // Automatically transition running apps on this server to blocked/waiting state
        setApps((prev) =>
          prev.map((a) => (a.serverId === id && (a.status === 'running' || a.status === 'ready') ? { ...a, status: 'blocked' } : a))
        );
      }
    } else if (status === 'online') {
      // Resume blocked workloads on server boot
      setApps((prev) =>
        prev.map((a) => (a.serverId === id && a.status === 'blocked' ? { ...a, status: 'running' } : a))
      );
    }

    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    logEvent({
      eventType: 'settings_changed',
      description: `Changed server ${server.name} status to ${status.toUpperCase()}.`,
      result: status === 'online' ? 'success' : 'warning'
    });

    // Re-run detection after server state change
    setTimeout(() => runDeadlockDetection(), 100);

    return { success: true, message: `Server ${server.name} status set to ${status}.` };
  };

  // -------------------------------------------------------------
  // APPLICATION & PROCESS MANAGEMENT
  // -------------------------------------------------------------
  const addApp = (appData: Omit<AppWorkload, 'id' | 'createdAt' | 'currentAllocation' | 'pendingRequests' | 'status'>) => {
    if (currentUser.role === 'viewer') return;
    const newApp: AppWorkload = {
      ...appData,
      id: `app_${Date.now().toString(36)}`,
      currentAllocation: {},
      pendingRequests: {},
      status: 'created',
      createdAt: new Date().toISOString()
    };
    setApps((prev) => [...prev, newApp]);
    logEvent({
      eventType: 'app_created',
      description: `Registered new workload ${newApp.name} (${newApp.category.toUpperCase()}) with priority ${newApp.priority}.`,
      result: 'success'
    });
  };

  const updateApp = (id: string, updates: Partial<AppWorkload>) => {
    if (currentUser.role === 'viewer') return;
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteApp = (id: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Permission denied. Only Cloud Administrator can delete applications.' };
    }
    const app = apps.find((a) => a.id === id);
    if (!app) return { success: false, message: 'Application not found.' };

    const totalHeld = Object.values(app.currentAllocation).reduce((acc, qty) => acc + qty, 0);
    if (totalHeld > 0 && app.status !== 'terminated') {
      return {
        success: false,
        message: `Cannot delete ${app.name}. It currently holds ${totalHeld} active resource instance(s). Terminate the process first.`
      };
    }

    setApps((prev) => prev.filter((a) => a.id !== id));
    logEvent({
      eventType: 'settings_changed',
      description: `Deleted application ${app.name}.`,
      result: 'info'
    });
    return { success: true, message: `Application ${app.name} removed.` };
  };

  const setAppStatus = (id: string, status: ProcessStatus) => {
    if (currentUser.role === 'viewer') return;
    
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;

        // If transitioning to terminated or completed, release all held resources
        if (status === 'terminated' || status === 'completed') {
          return {
            ...a,
            status,
            currentAllocation: {},
            pendingRequests: {}
          };
        }
        return { ...a, status };
      })
    );

    const targetApp = apps.find((a) => a.id === id);
    logEvent({
      eventType: status === 'completed' ? 'process_completed' : 'settings_changed',
      appName: targetApp?.name,
      description: `Process ${targetApp?.name} status updated to ${status.toUpperCase()}.`,
      result: status === 'terminated' ? 'warning' : 'info'
    });

    setTimeout(() => runDeadlockDetection(), 100);
  };

  const createAppCheckpoint = (appId: string, note?: string) => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    const checkpoint: Checkpoint = {
      id: `chk_${Date.now()}`,
      appId: app.id,
      timestamp: new Date().toLocaleTimeString(),
      allocations: { ...app.currentAllocation },
      status: app.status,
      note: note || 'User created manual state snapshot.'
    };

    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, checkpoint } : a)));
    logEvent({
      eventType: 'settings_changed',
      appName: app.name,
      description: `Created checkpoint for ${app.name} at ${checkpoint.timestamp}.`,
      result: 'success'
    });
  };

  const rollbackAppCheckpoint = (appId: string): { success: boolean; message: string } => {
    if (currentUser.role === 'viewer') return { success: false, message: 'Permission denied.' };
    const app = apps.find((a) => a.id === appId);
    if (!app || !app.checkpoint) {
      return { success: false, message: 'No valid checkpoint found for this application.' };
    }

    const { allocations, status } = app.checkpoint;
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, currentAllocation: { ...allocations }, status, pendingRequests: {} } : a))
    );

    logEvent({
      eventType: 'recovery_executed',
      appName: app.name,
      description: `Rolled back application ${app.name} to checkpoint state taken at ${app.checkpoint.timestamp}.`,
      result: 'success'
    });

    setTimeout(() => runDeadlockDetection(), 100);
    return { success: true, message: `Successfully rolled back ${app.name} to checkpoint.` };
  };

  // -------------------------------------------------------------
  // RESOURCE INVENTORY
  // -------------------------------------------------------------
  const addResource = (resData: Omit<Resource, 'id'>) => {
    if (currentUser.role === 'viewer') return;
    const newRes: Resource = {
      ...resData,
      id: `res_${Date.now().toString(36)}`
    };
    setResources((prev) => [...prev, newRes]);
    logEvent({
      eventType: 'settings_changed',
      resourceName: newRes.name,
      description: `Added resource type ${newRes.name} (${newRes.totalInstances} ${newRes.unit}).`,
      result: 'success'
    });
  };

  const updateResource = (id: string, updates: Partial<Resource>): { success: boolean; message: string } => {
    if (currentUser.role === 'viewer') return { success: false, message: 'Permission denied.' };
    const res = resources.find((r) => r.id === id);
    if (!res) return { success: false, message: 'Resource not found.' };

    if (updates.totalInstances !== undefined) {
      // Calculate total allocated across all apps
      let currentAllocatedSum = 0;
      apps.forEach((app) => {
        if (app.status !== 'terminated') {
          currentAllocatedSum += app.currentAllocation[id] || 0;
        }
      });

      if (updates.totalInstances < currentAllocatedSum) {
        return {
          success: false,
          message: `Cannot reduce total capacity to ${updates.totalInstances}. Currently allocated: ${currentAllocatedSum} units.`
        };
      }
    }

    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    logEvent({
      eventType: 'settings_changed',
      resourceName: res.name,
      description: `Updated resource ${res.name} properties.`,
      result: 'info'
    });
    return { success: true, message: `Resource ${res.name} updated.` };
  };

  const deleteResource = (id: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Permission denied. Only Cloud Administrator can delete resources.' };
    }
    const res = resources.find((r) => r.id === id);
    if (!res) return { success: false, message: 'Resource not found.' };

    let currentAllocatedSum = 0;
    apps.forEach((app) => {
      if (app.status !== 'terminated') {
        currentAllocatedSum += app.currentAllocation[id] || 0;
      }
    });

    if (currentAllocatedSum > 0) {
      return {
        success: false,
        message: `Cannot delete ${res.name}. It has ${currentAllocatedSum} active instance(s) allocated.`
      };
    }

    setResources((prev) => prev.filter((r) => r.id !== id));
    logEvent({
      eventType: 'settings_changed',
      resourceName: res.name,
      description: `Deleted resource type ${res.name}.`,
      result: 'warning'
    });
    return { success: true, message: `Resource ${res.name} deleted.` };
  };

  // -------------------------------------------------------------
  // RESOURCE ALLOCATION ENGINE
  // -------------------------------------------------------------
  const submitResourceRequest = (
    appId: string, 
    resourceId: string, 
    quantity: number
  ): { success: boolean; message: string } => {
    if (currentUser.role === 'viewer') {
      return { success: false, message: 'Permission denied. Viewers cannot submit allocation requests.' };
    }
    if (quantity <= 0) {
      return { success: false, message: 'Request quantity must be greater than zero.' };
    }

    const app = apps.find((a) => a.id === appId);
    const res = resources.find((r) => r.id === resourceId);

    if (!app || !res) {
      return { success: false, message: 'Invalid process or resource identifier.' };
    }

    if (app.status === 'terminated' || app.status === 'completed') {
      return { success: false, message: `Cannot allocate resources to process ${app.name} in state ${app.status.toUpperCase()}.` };
    }

    const server = servers.find((s) => s.id === app.serverId);
    if (!server || server.status !== 'online') {
      return { success: false, message: `Cannot allocate resources. Assigned server ${server?.name || app.serverId} is OFFLINE.` };
    }

    // Check Max Demand Constraint
    const currentAllocated = app.currentAllocation[resourceId] || 0;
    const maxDemand = app.maxDemand[resourceId] || 0;
    if (currentAllocated + quantity > maxDemand) {
      const msg = `Request REJECTED! Requested total (${currentAllocated + quantity}) exceeds declared maximum demand (${maxDemand}) for process ${app.name}.`;
      logEvent({
        eventType: 'request_submitted',
        appName: app.name,
        resourceName: res.name,
        description: msg,
        result: 'error'
      });
      return { success: false, message: msg };
    }

    // -------------------------------------------------------------
    // DEADLOCK PREVENTION POLICY ENFORCEMENT
    // -------------------------------------------------------------
    if (settings.preventionStrategy === 'resource_ordering') {
      // Fixed Resource Ordering rule: Apps must request resources in strict ascending order of ID
      const orderedResourceIds = ['res_gpu', 'res_gpu_slot', 'res_license', 'res_lock', 'res_hw_dev'];
      const targetIndex = orderedResourceIds.indexOf(resourceId);

      if (targetIndex !== -1) {
        // Check if app holds or requests any resource higher in the ordering
        for (let i = targetIndex + 1; i < orderedResourceIds.length; i++) {
          const higherResId = orderedResourceIds[i];
          if ((app.currentAllocation[higherResId] || 0) > 0) {
            const higherRes = resources.find((r) => r.id === higherResId);
            const msg = `PREVENTION VIOLATION (Resource Ordering)! Cannot request ${res.name} while holding higher-order resource ${higherRes?.name}. (Order Violation)`;
            logEvent({
              eventType: 'request_submitted',
              appName: app.name,
              resourceName: res.name,
              description: msg,
              result: 'error'
            });
            return { success: false, message: msg };
          }
        }
      }
    } else if (settings.preventionStrategy === 'hold_and_wait') {
      // Hold and Wait Prevention: Must hold 0 exclusive resources if requesting new ones unless all available together
      const holdsExclusive = Object.entries(app.currentAllocation).some(([rId, q]) => {
        const r = resources.find((res) => res.id === rId);
        return r?.type === 'exclusive' && q > 0;
      });

      const avail = calculateAvailableResources(resources, apps)[resourceId] || 0;
      if (holdsExclusive && avail < quantity) {
        // Must release current holdings to prevent Hold and Wait!
        const msg = `PREVENTION TRIGGERED (Hold & Wait)! Process ${app.name} holds exclusive resources but requested resource is unavailable. Must release held resources before waiting.`;
        logEvent({
          eventType: 'request_submitted',
          appName: app.name,
          resourceName: res.name,
          description: msg,
          result: 'warning'
        });
        return { success: false, message: msg };
      }
    }

    // -------------------------------------------------------------
    // ALLOCATION POLICY ENFORCEMENT
    // -------------------------------------------------------------
    const availableResources = calculateAvailableResources(resources, apps);
    const availableQty = availableResources[resourceId] || 0;

    if (settings.allocationPolicy === 'banker_avoidance') {
      // Execute Banker's Avoidance check
      const requestedMap: Record<string, number> = { [resourceId]: quantity };
      const bankerResult = runBankersRequestAlgorithm(appId, requestedMap, apps, resources);

      if (!bankerResult.allowed) {
        // Set request to waiting queue
        setApps((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, pendingRequests: { ...a.pendingRequests, [resourceId]: quantity }, status: 'blocked' } : a))
        );

        logEvent({
          eventType: 'request_submitted',
          appName: app.name,
          resourceName: res.name,
          description: `Banker's Avoidance: ${bankerResult.reason}`,
          result: 'warning'
        });

        return { success: false, message: `Banker's Avoidance: ${bankerResult.reason}` };
      }
    } else {
      // Standard Allocation: Check immediate availability
      if (availableQty < quantity) {
        // Place in waiting queue
        setApps((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, pendingRequests: { ...a.pendingRequests, [resourceId]: quantity }, status: 'blocked' } : a))
        );

        const newRequest: AllocationRequest = {
          id: `req_${Date.now()}`,
          appId,
          resourceId,
          requestedQuantity: quantity,
          allocatedQuantity: 0,
          status: 'waiting',
          requestTime: new Date().toLocaleTimeString(),
          responseMessage: `Insufficient available capacity (${availableQty} available). Added to waiting queue.`
        };

        setAllocationRequests((prev) => [newRequest, ...prev]);
        logEvent({
          eventType: 'request_submitted',
          appName: app.name,
          resourceName: res.name,
          description: `Requested ${quantity} instance(s) of ${res.name}. Placed in WAITING queue due to insufficient instances.`,
          result: 'warning'
        });

        setTimeout(() => runDeadlockDetection(), 100);
        return { success: false, message: `Insufficient instances available (${availableQty}). Request placed in waiting queue.` };
      }
    }

    // Grant Allocation Immediately!
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        const currentQty = a.currentAllocation[resourceId] || 0;
        const newAlloc = { ...a.currentAllocation, [resourceId]: currentQty + quantity };
        const newPending = { ...a.pendingRequests };
        delete newPending[resourceId];
        return {
          ...a,
          currentAllocation: newAlloc,
          pendingRequests: newPending,
          status: 'running'
        };
      })
    );

    const grantedReq: AllocationRequest = {
      id: `req_${Date.now()}`,
      appId,
      resourceId,
      requestedQuantity: quantity,
      allocatedQuantity: quantity,
      status: 'granted',
      requestTime: new Date().toLocaleTimeString(),
      responseMessage: `Successfully allocated ${quantity} ${res.unit} of ${res.name}.`
    };

    setAllocationRequests((prev) => [grantedReq, ...prev]);
    logEvent({
      eventType: 'allocated',
      appName: app.name,
      resourceName: res.name,
      description: `Granted ${quantity} ${res.unit} of ${res.name} to ${app.name}.`,
      result: 'success'
    });

    setTimeout(() => runDeadlockDetection(), 100);
    return { success: true, message: `Granted ${quantity} ${res.unit} of ${res.name} to ${app.name}.` };
  };

  const approveRequest = (requestId: string): { success: boolean; message: string } => {
    const req = allocationRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };

    const app = apps.find((a) => a.id === req.appId);
    const res = resources.find((r) => r.id === req.resourceId);
    if (!app || !res) return { success: false, message: 'Associated application or resource missing.' };

    const avail = calculateAvailableResources(resources, apps)[req.resourceId] || 0;
    if (avail < req.requestedQuantity) {
      return { success: false, message: `Cannot approve. Only ${avail} instance(s) available.` };
    }

    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== req.appId) return a;
        const curr = a.currentAllocation[req.resourceId] || 0;
        const newPending = { ...a.pendingRequests };
        delete newPending[req.resourceId];
        return {
          ...a,
          currentAllocation: { ...a.currentAllocation, [req.resourceId]: curr + req.requestedQuantity },
          pendingRequests: newPending,
          status: 'running'
        };
      })
    );

    setAllocationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'granted', allocatedQuantity: req.requestedQuantity } : r))
    );

    logEvent({
      eventType: 'allocated',
      appName: app.name,
      resourceName: res.name,
      description: `Manually approved allocation request for ${req.requestedQuantity} instance(s) of ${res.name}.`,
      result: 'success'
    });

    setTimeout(() => runDeadlockDetection(), 100);
    return { success: true, message: `Request approved.` };
  };

  const rejectRequest = (requestId: string): { success: boolean; message: string } => {
    const req = allocationRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };

    const app = apps.find((a) => a.id === req.appId);
    const res = resources.find((r) => r.id === req.resourceId);

    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== req.appId) return a;
        const newPending = { ...a.pendingRequests };
        delete newPending[req.resourceId];
        return {
          ...a,
          pendingRequests: newPending,
          status: Object.values(newPending).some((q) => q > 0) ? 'blocked' : 'running'
        };
      })
    );

    setAllocationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected', responseMessage: 'Rejected by Cloud Administrator.' } : r))
    );

    logEvent({
      eventType: 'request_submitted',
      appName: app?.name,
      resourceName: res?.name,
      description: `Rejected resource allocation request for ${app?.name}.`,
      result: 'warning'
    });

    setTimeout(() => runDeadlockDetection(), 100);
    return { success: true, message: `Request rejected.` };
  };

  const releaseResource = (appId: string, resourceId: string, quantity: number): { success: boolean; message: string } => {
    if (currentUser.role === 'viewer') return { success: false, message: 'Permission denied.' };
    const app = apps.find((a) => a.id === appId);
    const res = resources.find((r) => r.id === resourceId);
    if (!app || !res) return { success: false, message: 'Application or resource not found.' };

    const currentlyAllocated = app.currentAllocation[resourceId] || 0;
    if (currentlyAllocated < quantity) {
      return { success: false, message: `Cannot release ${quantity} units. Process only holds ${currentlyAllocated} units.` };
    }

    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        const newAlloc = { ...a.currentAllocation };
        newAlloc[resourceId] = currentlyAllocated - quantity;
        if (newAlloc[resourceId] <= 0) delete newAlloc[resourceId];
        return { ...a, currentAllocation: newAlloc };
      })
    );

    logEvent({
      eventType: 'released',
      appName: app.name,
      resourceName: res.name,
      description: `Released ${quantity} ${res.unit} of ${res.name} held by ${app.name}.`,
      result: 'info'
    });

    setTimeout(() => runDeadlockDetection(), 100);
    return { success: true, message: `Released ${quantity} ${res.unit} of ${res.name}.` };
  };

  // -------------------------------------------------------------
  // DEADLOCK RECOVERY METHODS
  // -------------------------------------------------------------
  const recoverTerminateApp = (appId: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Permission denied. Only Cloud Administrator can perform process termination recovery.' };
    }
    const app = apps.find((a) => a.id === appId);
    if (!app) return { success: false, message: 'Process not found.' };

    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'terminated', currentAllocation: {}, pendingRequests: {} } : a))
    );

    logEvent({
      eventType: 'recovery_executed',
      appName: app.name,
      description: `RECOVERY EXECUTION: Terminated process ${app.name} to break deadlock cycle. Released all held resources.`,
      result: 'success'
    });

    setTimeout(() => runDeadlockDetection(), 100);
    return { success: true, message: `Terminated process ${app.name}. Held resources released to system.` };
  };

  const recoverTerminateAllDeadlocked = (): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') return { success: false, message: 'Permission denied.' };
    const deadlockedIds = deadlockResult.deadlockedAppIds;
    if (deadlockedIds.length === 0) {
      return { success: false, message: 'No deadlocked processes currently active.' };
    }

    setApps((prev) =>
      prev.map((a) => (deadlockedIds.includes(a.id) ? { ...a, status: 'terminated', currentAllocation: {}, pendingRequests: {} } : a))
    );

    logEvent({
      eventType: 'recovery_executed',
      description: `RECOVERY EXECUTION: Mass terminated all ${deadlockedIds.length} deadlocked processes. Deadlock cleared.`,
      result: 'warning'
    });

    setTimeout(() => runDeadlockDetection(), 100);
    return { success: true, message: `Terminated ${deadlockedIds.length} deadlocked process(es).` };
  };

  const recoverPreemptResource = (
    victimAppId: string, 
    requesterAppId: string, 
    resourceId: string, 
    quantity: number
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'admin') return { success: false, message: 'Permission denied.' };

    const victim = apps.find((a) => a.id === victimAppId);
    const requester = apps.find((a) => a.id === requesterAppId);
    const res = resources.find((r) => r.id === resourceId);

    if (!victim || !requester || !res) {
      return { success: false, message: 'Victim, requester, or resource not found.' };
    }

    const victimHeld = victim.currentAllocation[resourceId] || 0;
    if (victimHeld < quantity) {
      return { success: false, message: `Victim ${victim.name} only holds ${victimHeld} instance(s) of ${res.name}.` };
    }

    setApps((prev) =>
      prev.map((a) => {
        if (a.id === victimAppId) {
          const newAlloc = { ...a.currentAllocation };
          newAlloc[resourceId] = victimHeld - quantity;
          if (newAlloc[resourceId] <= 0) delete newAlloc[resourceId];
          return { ...a, currentAllocation: newAlloc, status: 'blocked' };
        }
        if (a.id === requesterAppId) {
          const reqHeld = a.currentAllocation[resourceId] || 0;
          const newPending = { ...a.pendingRequests };
          delete newPending[resourceId];
          return {
            ...a,
            currentAllocation: { ...a.currentAllocation, [resourceId]: reqHeld + quantity },
            pendingRequests: newPending,
            status: 'running'
          };
        }
        return a;
      })
    );

    logEvent({
      eventType: 'recovery_executed',
      appName: requester.name,
      resourceName: res.name,
      description: `RECOVERY EXECUTION (Preemption): Forcibly preempted ${quantity} ${res.name} from ${victim.name} and reallocated to ${requester.name}.`,
      result: 'success'
    });

    setTimeout(() => runDeadlockDetection(), 100);
    return { success: true, message: `Preempted ${quantity} ${res.name} from ${victim.name} to ${requester.name}.` };
  };

  // -------------------------------------------------------------
  // SETTINGS & LOG EXPORTER
  // -------------------------------------------------------------
  const updateSettings = (updates: Partial<AppSettings>) => {
    if (currentUser.role === 'viewer') return;
    setSettings((prev) => ({ ...prev, ...updates }));
    logEvent({
      eventType: 'settings_changed',
      description: `Updated platform settings (Policy: ${updates.allocationPolicy || settings.allocationPolicy}).`,
      result: 'info'
    });
  };

  const exportLogsToCSV = () => {
    const headers = ['ID', 'Timestamp', 'Event Type', 'User', 'Role', 'App', 'Resource', 'Description', 'Result'];
    const rows = activityLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      l.eventType,
      `"${l.userName}"`,
      l.userRole,
      `"${l.appName || ''}"`,
      `"${l.resourceName || ''}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      l.result
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CloudX_Activity_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // PRESET SCENARIOS & RESET
  // -------------------------------------------------------------
  const loadScenarioPreset = (scenarioId: number) => {
    if (scenarioId === 1) {
      // Scenario 1: Normal Allocation
      setServers(INITIAL_SERVERS);
      setResources(INITIAL_RESOURCES);
      setApps([
        {
          id: 'sc1_p1',
          name: 'P1: Web Gateway',
          category: 'web',
          serverId: 'srv_alpha',
          priority: 2,
          requiredCpu: 2,
          requiredRam: 4,
          requiredStorage: 20,
          requiredNetwork: 400,
          maxDemand: { res_cpu: 4, res_ram: 8, res_license: 1 },
          currentAllocation: { res_cpu: 2, res_ram: 4, res_license: 1 },
          pendingRequests: {},
          status: 'running',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sc1_p2',
          name: 'P2: Data Pipeline',
          category: 'database',
          serverId: 'srv_beta',
          priority: 3,
          requiredCpu: 4,
          requiredRam: 8,
          requiredStorage: 100,
          requiredNetwork: 800,
          maxDemand: { res_cpu: 8, res_ram: 16, res_lock: 1 },
          currentAllocation: { res_cpu: 4, res_ram: 8, res_lock: 1 },
          pendingRequests: {},
          status: 'running',
          createdAt: new Date().toISOString()
        }
      ]);
      setSettings((prev) => ({ ...prev, allocationPolicy: 'standard', preventionStrategy: 'none' }));
    } else if (scenarioId === 2) {
      // Scenario 2: Deadlock Simulation (P1 holds R1 wants R2; P2 holds R2 wants R1)
      setApps([
        {
          id: 'sc2_p1',
          name: 'Process 1 (P1)',
          category: 'ai',
          serverId: 'srv_beta',
          priority: 3,
          requiredCpu: 4,
          requiredRam: 8,
          requiredStorage: 50,
          requiredNetwork: 500,
          maxDemand: { res_gpu_slot: 1, res_license: 1 },
          currentAllocation: { res_gpu_slot: 1 },
          pendingRequests: { res_license: 1 },
          status: 'blocked',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sc2_p2',
          name: 'Process 2 (P2)',
          category: 'video',
          serverId: 'srv_beta',
          priority: 4,
          requiredCpu: 4,
          requiredRam: 8,
          requiredStorage: 50,
          requiredNetwork: 500,
          maxDemand: { res_license: 1, res_gpu_slot: 1 },
          currentAllocation: { res_license: 1 },
          pendingRequests: { res_gpu_slot: 1 },
          status: 'blocked',
          createdAt: new Date().toISOString()
        }
      ]);
      setResources([
        { id: 'res_gpu_slot', name: 'R1: GPU Execution Slot', type: 'exclusive', unit: 'Slot', totalInstances: 1, description: 'Exclusive GPU slot', isPreemptible: false },
        { id: 'res_license', name: 'R2: Software License', type: 'exclusive', unit: 'License', totalInstances: 1, description: 'Exclusive Software license', isPreemptible: false }
      ]);
      setSettings((prev) => ({ ...prev, allocationPolicy: 'standard', preventionStrategy: 'none' }));
    } else if (scenarioId === 3) {
      // Scenario 3: Deadlock Prevention (Resource Ordering)
      setSettings((prev) => ({ ...prev, preventionStrategy: 'resource_ordering' }));
      loadScenarioPreset(2);
    } else if (scenarioId === 4) {
      // Scenario 4: Banker's Algorithm Sample Matrix
      setResources([
        { id: 'res_A', name: 'Resource A', type: 'shareable', unit: 'Units', totalInstances: 10, description: 'Bankers A', isPreemptible: false },
        { id: 'res_B', name: 'Resource B', type: 'shareable', unit: 'Units', totalInstances: 5, description: 'Bankers B', isPreemptible: false },
        { id: 'res_C', name: 'Resource C', type: 'shareable', unit: 'Units', totalInstances: 7, description: 'Bankers C', isPreemptible: false }
      ]);
      setApps([
        { id: 'P0', name: 'P0', category: 'web', serverId: 'srv_alpha', priority: 5, requiredCpu: 1, requiredRam: 1, requiredStorage: 1, requiredNetwork: 1, maxDemand: { res_A: 7, res_B: 5, res_C: 3 }, currentAllocation: { res_A: 0, res_B: 1, res_C: 0 }, pendingRequests: {}, status: 'running', createdAt: new Date().toISOString() },
        { id: 'P1', name: 'P1', category: 'web', serverId: 'srv_alpha', priority: 4, requiredCpu: 1, requiredRam: 1, requiredStorage: 1, requiredNetwork: 1, maxDemand: { res_A: 3, res_B: 2, res_C: 2 }, currentAllocation: { res_A: 2, res_B: 0, res_C: 0 }, pendingRequests: {}, status: 'running', createdAt: new Date().toISOString() },
        { id: 'P2', name: 'P2', category: 'web', serverId: 'srv_alpha', priority: 3, requiredCpu: 1, requiredRam: 1, requiredStorage: 1, requiredNetwork: 1, maxDemand: { res_A: 9, res_B: 0, res_C: 2 }, currentAllocation: { res_A: 3, res_B: 0, res_C: 2 }, pendingRequests: {}, status: 'running', createdAt: new Date().toISOString() },
        { id: 'P3', name: 'P3', category: 'web', serverId: 'srv_alpha', priority: 2, requiredCpu: 1, requiredRam: 1, requiredStorage: 1, requiredNetwork: 1, maxDemand: { res_A: 2, res_B: 2, res_C: 2 }, currentAllocation: { res_A: 2, res_B: 1, res_C: 1 }, pendingRequests: {}, status: 'running', createdAt: new Date().toISOString() },
        { id: 'P4', name: 'P4', category: 'web', serverId: 'srv_alpha', priority: 1, requiredCpu: 1, requiredRam: 1, requiredStorage: 1, requiredNetwork: 1, maxDemand: { res_A: 4, res_B: 3, res_C: 3 }, currentAllocation: { res_A: 0, res_B: 0, res_C: 2 }, pendingRequests: {}, status: 'running', createdAt: new Date().toISOString() }
      ]);
      setSettings((prev) => ({ ...prev, allocationPolicy: 'banker_avoidance' }));
    } else if (scenarioId === 5) {
      // Scenario 5: Deadlock Recovery
      loadScenarioPreset(2);
    }

    logEvent({
      eventType: 'settings_changed',
      description: `Loaded interactive Scenario #${scenarioId} preset data.`,
      result: 'info'
    });

    setTimeout(() => runDeadlockDetection(), 150);
  };

  const resetDemoEnvironment = () => {
    localStorage.removeItem(STORAGE_KEYS.SERVERS);
    localStorage.removeItem(STORAGE_KEYS.APPS);
    localStorage.removeItem(STORAGE_KEYS.RESOURCES);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);

    setServers(INITIAL_SERVERS);
    setApps(INITIAL_APPS);
    setResources(INITIAL_RESOURCES);
    setAllocationRequests([]);
    setSettings(INITIAL_SETTINGS);
    setActivityLogs(INITIAL_LOGS);

    logEvent({
      eventType: 'settings_changed',
      description: 'Reset CloudX environment to default demo state.',
      result: 'warning'
    });

    setTimeout(() => runDeadlockDetection(), 100);
  };

  return (
    <CloudXContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,

        servers,
        addServer,
        updateServer,
        deleteServer,
        toggleServerStatus,

        apps,
        addApp,
        updateApp,
        deleteApp,
        setAppStatus,
        createAppCheckpoint,
        rollbackAppCheckpoint,

        resources,
        addResource,
        updateResource,
        deleteResource,

        allocationRequests,
        submitResourceRequest,
        approveRequest,
        rejectRequest,
        releaseResource,

        deadlockResult,
        runDeadlockDetection,
        recoverTerminateApp,
        recoverTerminateAllDeadlocked,
        recoverPreemptResource,

        settings,
        updateSettings,

        activityLogs,
        logEvent,
        exportLogsToCSV,

        loadScenarioPreset,
        resetDemoEnvironment
      }}
    >
      {children}
    </CloudXContext.Provider>
  );
};

export const useCloudX = () => {
  const context = useContext(CloudXContext);
  if (!context) {
    throw new Error('useCloudX must be used within a CloudXProvider');
  }
  return context;
};
