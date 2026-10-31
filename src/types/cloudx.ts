export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export type ServerStatus = 'online' | 'offline' | 'maintenance';

export interface Server {
  id: string;
  name: string;
  location: string;
  cpuCores: number;
  ramGB: number;
  storageGB: number;
  networkMbps: number;
  status: ServerStatus;
  description: string;
  createdAt: string;
}

export type ProcessStatus = 
  | 'created'
  | 'ready'
  | 'running'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'terminated';

export type ApplicationCategory = 
  | 'web'
  | 'database'
  | 'ai'
  | 'video'
  | 'background'
  | 'file';

export interface Checkpoint {
  id: string;
  appId: string;
  timestamp: string;
  allocations: Record<string, number>;
  status: ProcessStatus;
  note?: string;
}

export interface AppWorkload {
  id: string;
  name: string;
  category: ApplicationCategory;
  serverId: string;
  priority: number; // 1 (Highest) to 10 (Lowest)
  requiredCpu: number;
  requiredRam: number;
  requiredStorage: number;
  requiredNetwork: number;
  maxDemand: Record<string, number>; // resourceId -> max instances
  currentAllocation: Record<string, number>; // resourceId -> current instances
  pendingRequests: Record<string, number>; // resourceId -> requested quantity
  status: ProcessStatus;
  checkpoint?: Checkpoint;
  createdAt: string;
}

export type ResourceType = 'shareable' | 'exclusive';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  unit: string;
  totalInstances: number;
  description: string;
  isPreemptible: boolean;
}

export type AllocationStatus = 'granted' | 'rejected' | 'waiting';

export interface AllocationRequest {
  id: string;
  appId: string;
  resourceId: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  status: AllocationStatus;
  requestTime: string;
  responseMessage?: string;
}

export interface CycleInfo {
  processIds: string[];
  resourceIds: string[];
  description: string;
}

export interface DeadlockDetectionResult {
  isDeadlocked: boolean;
  detectedAt?: string;
  deadlockedAppIds: string[];
  involvedResourceIds: string[];
  cycles: CycleInfo[];
  message: string;
}

export type PreventionStrategy = 
  | 'none'
  | 'shareable'
  | 'hold_and_wait'
  | 'preemption'
  | 'resource_ordering';

export type AllocationPolicy = 'standard' | 'banker_avoidance' | 'strict_prevention';

export interface AppSettings {
  theme: 'dark' | 'light';
  allocationPolicy: AllocationPolicy;
  preventionStrategy: PreventionStrategy;
  autoDeadlockDetection: boolean;
  detectionIntervalSec: number;
  simSpeed: number; // 1x, 2x, 5x
  maxCpuPerApp: number;
  maxRamPerApp: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  eventType: 
    | 'app_created'
    | 'server_created'
    | 'request_submitted'
    | 'allocated'
    | 'released'
    | 'process_completed'
    | 'deadlock_detected'
    | 'recovery_executed'
    | 'settings_changed';
  userId: string;
  userName: string;
  userRole: UserRole;
  appId?: string;
  appName?: string;
  resourceId?: string;
  resourceName?: string;
  description: string;
  result: 'success' | 'warning' | 'error' | 'info';
}

export interface BankerStep {
  step: number;
  candidateAppId?: string;
  candidateAppName?: string;
  workBefore: Record<string, number>;
  workAfter: Record<string, number>;
  finishState: Record<string, boolean>;
  explanation: string;
}

export interface BankerSafetyResult {
  isSafe: boolean;
  safeSequence: string[];
  steps: BankerStep[];
  needMatrix: Record<string, Record<string, number>>;
  availableVector: Record<string, number>;
  explanation: string;
}

export interface RecoveryRecommendation {
  victimAppId: string;
  victimAppName: string;
  reason: string;
  score: number;
  heldResources: Record<string, number>;
  priority: number;
}
