import { 
  User, 
  Server, 
  Resource, 
  AppWorkload, 
  AppSettings,
  ActivityLog 
} from '../types/cloudx';

export const DEMO_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Sarah Chen (Admin)',
    email: 'admin@cloudx.io',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_operator',
    name: 'Marcus Vance (Operator)',
    email: 'operator@cloudx.io',
    role: 'operator',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_viewer',
    name: 'Dr. Alan Turing (Viewer)',
    email: 'viewer@cloudx.io',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SERVERS: Server[] = [
  {
    id: 'srv_alpha',
    name: 'Cloud Server Alpha',
    location: 'us-east-1 (N. Virginia)',
    cpuCores: 8,
    ramGB: 16,
    storageGB: 200,
    networkMbps: 1000,
    status: 'online',
    description: 'High-availability compute node for web microservices and ingress routers.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'srv_beta',
    name: 'Cloud Server Beta',
    location: 'us-west-2 (Oregon)',
    cpuCores: 16,
    ramGB: 32,
    storageGB: 500,
    networkMbps: 2500,
    status: 'online',
    description: 'Enterprise data tier server hosting transactional DBs and AI accelerator clusters.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'srv_gamma',
    name: 'Cloud Server Gamma',
    location: 'eu-west-1 (Ireland)',
    cpuCores: 4,
    ramGB: 8,
    storageGB: 100,
    networkMbps: 500,
    status: 'online',
    description: 'Edge worker server for batch background processing and automated snapshot backups.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res_cpu',
    name: 'CPU Capacity',
    type: 'shareable',
    unit: 'Cores',
    totalInstances: 28,
    description: 'Shared virtual CPU core processing time units.',
    isPreemptible: true
  },
  {
    id: 'res_ram',
    name: 'RAM Capacity',
    type: 'shareable',
    unit: 'GB',
    totalInstances: 56,
    description: 'Shared volatile memory capacity.',
    isPreemptible: false
  },
  {
    id: 'res_storage',
    name: 'Storage Capacity',
    type: 'shareable',
    unit: 'GB',
    totalInstances: 800,
    description: 'Shared NVMe block storage space.',
    isPreemptible: false
  },
  {
    id: 'res_net',
    name: 'Network Bandwidth',
    type: 'shareable',
    unit: 'Mbps',
    totalInstances: 4000,
    description: 'High-speed fiber connectivity bandwidth.',
    isPreemptible: true
  },
  {
    id: 'res_gpu',
    name: 'GPU Accelerator Device',
    type: 'exclusive',
    unit: 'Device',
    totalInstances: 4,
    description: 'Exclusive Hardware Accelerator GPU card for model inference.',
    isPreemptible: false
  },
  {
    id: 'res_gpu_slot',
    name: 'GPU Execution Slot',
    type: 'exclusive',
    unit: 'Slot',
    totalInstances: 2,
    description: 'Exclusive hardware execution queue slot for CUDA tensor pipeline.',
    isPreemptible: false
  },
  {
    id: 'res_license',
    name: 'Software Licence',
    type: 'exclusive',
    unit: 'Licence',
    totalInstances: 3,
    description: 'Enterprise commercial software module license key.',
    isPreemptible: false
  },
  {
    id: 'res_lock',
    name: 'Exclusive Storage Lock',
    type: 'exclusive',
    unit: 'Lock',
    totalInstances: 2,
    description: 'Single-writer atomic write lock on cloud storage volume.',
    isPreemptible: false
  },
  {
    id: 'res_hw_dev',
    name: 'Dedicated Hardware Device',
    type: 'exclusive',
    unit: 'Device',
    totalInstances: 1,
    description: 'Exclusive physical HSM security module device.',
    isPreemptible: false
  }
];

export const INITIAL_APPS: AppWorkload[] = [
  {
    id: 'app_ecommerce',
    name: 'E-commerce Platform',
    category: 'web',
    serverId: 'srv_alpha',
    priority: 2,
    requiredCpu: 4,
    requiredRam: 8,
    requiredStorage: 40,
    requiredNetwork: 800,
    maxDemand: {
      res_cpu: 6,
      res_ram: 12,
      res_storage: 60,
      res_net: 1000,
      res_license: 1,
      res_lock: 1
    },
    currentAllocation: {
      res_cpu: 4,
      res_ram: 8,
      res_storage: 40,
      res_net: 800,
      res_license: 1,
      res_lock: 0
    },
    pendingRequests: {},
    status: 'running',
    checkpoint: {
      id: 'chk_101',
      appId: 'app_ecommerce',
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString(),
      allocations: { res_cpu: 4, res_ram: 8, res_storage: 40, res_net: 800, res_license: 1 },
      status: 'running',
      note: 'Stable production snapshot before sale event.'
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'app_bank_db',
    name: 'Banking Database',
    category: 'database',
    serverId: 'srv_beta',
    priority: 1,
    requiredCpu: 8,
    requiredRam: 16,
    requiredStorage: 200,
    requiredNetwork: 1200,
    maxDemand: {
      res_cpu: 12,
      res_ram: 24,
      res_storage: 300,
      res_net: 1500,
      res_lock: 2,
      res_hw_dev: 1
    },
    currentAllocation: {
      res_cpu: 8,
      res_ram: 16,
      res_storage: 200,
      res_net: 1200,
      res_lock: 1,
      res_hw_dev: 1
    },
    pendingRequests: {},
    status: 'running',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'app_ai_vision',
    name: 'AI Image Processing',
    category: 'ai',
    serverId: 'srv_beta',
    priority: 4,
    requiredCpu: 4,
    requiredRam: 12,
    requiredStorage: 80,
    requiredNetwork: 500,
    maxDemand: {
      res_cpu: 8,
      res_ram: 16,
      res_storage: 120,
      res_net: 800,
      res_gpu: 2,
      res_gpu_slot: 1,
      res_license: 1
    },
    currentAllocation: {
      res_cpu: 4,
      res_ram: 12,
      res_storage: 80,
      res_net: 500,
      res_gpu: 2,
      res_gpu_slot: 1,
      res_license: 1
    },
    pendingRequests: {},
    status: 'running',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'app_video_stream',
    name: 'Video Streaming Service',
    category: 'video',
    serverId: 'srv_alpha',
    priority: 3,
    requiredCpu: 2,
    requiredRam: 4,
    requiredStorage: 100,
    requiredNetwork: 1000,
    maxDemand: {
      res_cpu: 4,
      res_ram: 8,
      res_storage: 150,
      res_net: 1500,
      res_gpu: 1
    },
    currentAllocation: {
      res_cpu: 2,
      res_ram: 4,
      res_storage: 100,
      res_net: 1000,
      res_gpu: 1
    },
    pendingRequests: {},
    status: 'running',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'app_backup_service',
    name: 'Backup Service',
    category: 'background',
    serverId: 'srv_gamma',
    priority: 8,
    requiredCpu: 2,
    requiredRam: 4,
    requiredStorage: 50,
    requiredNetwork: 200,
    maxDemand: {
      res_cpu: 4,
      res_ram: 8,
      res_storage: 100,
      res_net: 400
    },
    currentAllocation: {
      res_cpu: 2,
      res_ram: 4,
      res_storage: 50,
      res_net: 200
    },
    pendingRequests: {},
    status: 'running',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'dark',
  allocationPolicy: 'standard',
  preventionStrategy: 'none',
  autoDeadlockDetection: true,
  detectionIntervalSec: 10,
  simSpeed: 1,
  maxCpuPerApp: 16,
  maxRamPerApp: 32
};

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_01',
    timestamp: new Date(Date.now() - 3600000 * 5).toLocaleTimeString(),
    eventType: 'server_created',
    userId: 'user_admin',
    userName: 'Sarah Chen (Admin)',
    userRole: 'admin',
    description: 'Provisioned virtual servers Cloud Server Alpha, Beta, and Gamma.',
    result: 'success'
  },
  {
    id: 'log_02',
    timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(),
    eventType: 'app_created',
    userId: 'user_admin',
    userName: 'Sarah Chen (Admin)',
    userRole: 'admin',
    appName: 'E-commerce Platform',
    description: 'Registered workload E-commerce Platform assigned to Cloud Server Alpha.',
    result: 'info'
  },
  {
    id: 'log_03',
    timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString(),
    eventType: 'allocated',
    userId: 'user_operator',
    userName: 'Marcus Vance (Operator)',
    userRole: 'operator',
    appName: 'Banking Database',
    resourceName: 'Exclusive Storage Lock',
    description: 'Granted 1 unit of Exclusive Storage Lock to Banking Database.',
    result: 'success'
  },
  {
    id: 'log_04',
    timestamp: new Date(Date.now() - 3600000 * 1).toLocaleTimeString(),
    eventType: 'allocated',
    userId: 'user_operator',
    userName: 'Marcus Vance (Operator)',
    userRole: 'operator',
    appName: 'AI Image Processing',
    resourceName: 'GPU Execution Slot',
    description: 'Granted 1 GPU Execution Slot to AI Image Processing workload.',
    result: 'success'
  }
];
