import { 
  AppWorkload, 
  Resource, 
  BankerSafetyResult, 
  BankerStep, 
  DeadlockDetectionResult,
  CycleInfo,
  RecoveryRecommendation
} from '../types/cloudx';

/**
 * Calculates Available resources = Total Capacity - Total Currently Allocated
 */
export function calculateAvailableResources(
  resources: Resource[],
  apps: AppWorkload[]
): Record<string, number> {
  const available: Record<string, number> = {};

  resources.forEach((r) => {
    let allocatedSum = 0;
    apps.forEach((app) => {
      // Exclude terminated processes from resource holding calculations
      if (app.status !== 'terminated') {
        allocatedSum += app.currentAllocation[r.id] || 0;
      }
    });
    available[r.id] = Math.max(0, r.totalInstances - allocatedSum);
  });

  return available;
}

/**
 * Calculates Need Matrix = Max Demand - Current Allocation
 */
export function calculateNeedMatrix(
  apps: AppWorkload[],
  resources: Resource[]
): Record<string, Record<string, number>> {
  const need: Record<string, Record<string, number>> = {};

  apps.forEach((app) => {
    need[app.id] = {};
    resources.forEach((r) => {
      const max = app.maxDemand[r.id] || 0;
      const alloc = app.currentAllocation[r.id] || 0;
      need[app.id][r.id] = Math.max(0, max - alloc);
    });
  });

  return need;
}

/**
 * Banker's Safety Algorithm
 * Determines if the current state of processes, allocations, max demands, and available resources is SAFE.
 */
export function runBankersSafetyAlgorithm(
  apps: AppWorkload[],
  resources: Resource[],
  customAvailable?: Record<string, number>,
  customAllocation?: Record<string, Record<string, number>>,
  customMaxDemand?: Record<string, Record<string, number>>
): BankerSafetyResult {
  const activeApps = apps.filter((a) => a.status !== 'terminated' && a.status !== 'completed');
  
  const available = customAvailable || calculateAvailableResources(resources, apps);
  const needMatrix = calculateNeedMatrix(activeApps, resources);
  
  // Create working copies
  const work: Record<string, number> = { ...available };
  const finish: Record<string, boolean> = {};
  activeApps.forEach((app) => {
    finish[app.id] = false;
  });

  const safeSequence: string[] = [];
  const steps: BankerStep[] = [];
  let stepCount = 1;

  let foundProcess = true;

  while (foundProcess) {
    foundProcess = false;

    for (const app of activeApps) {
      if (!finish[app.id]) {
        // Check if Need[app.id] <= Work for all resources
        let canExecute = true;
        for (const res of resources) {
          const resNeed = customMaxDemand && customAllocation
            ? Math.max(0, (customMaxDemand[app.id]?.[res.id] || 0) - (customAllocation[app.id]?.[res.id] || 0))
            : (needMatrix[app.id]?.[res.id] || 0);

          if (resNeed > (work[res.id] || 0)) {
            canExecute = false;
            break;
          }
        }

        if (canExecute) {
          const workBefore = { ...work };
          
          // Assume process completes and releases all allocated resources
          resources.forEach((res) => {
            const alloc = customAllocation
              ? (customAllocation[app.id]?.[res.id] || 0)
              : (app.currentAllocation[res.id] || 0);
            work[res.id] = (work[res.id] || 0) + alloc;
          });

          finish[app.id] = true;
          safeSequence.push(app.id);
          foundProcess = true;

          steps.push({
            step: stepCount++,
            candidateAppId: app.id,
            candidateAppName: app.name,
            workBefore,
            workAfter: { ...work },
            finishState: { ...finish },
            explanation: `Process ${app.name} (${app.id}) can satisfy its remaining resource needs with available work vector. Process finishes and releases its allocations into Work vector.`
          });

          break; // restart outer loop to scan remaining unfinished processes
        }
      }
    }
  }

  const isSafe = activeApps.every((app) => finish[app.id]);

  if (!isSafe) {
    const unfinishedApps = activeApps.filter((a) => !finish[a.id]).map((a) => a.name);
    steps.push({
      step: stepCount,
      workBefore: { ...work },
      workAfter: { ...work },
      finishState: { ...finish },
      explanation: `UNSAFE STATE DETECTED! Could not find a safe execution order for remaining processes: ${unfinishedApps.join(', ')}.`
    });
  }

  return {
    isSafe,
    safeSequence,
    steps,
    needMatrix,
    availableVector: available,
    explanation: isSafe
      ? `System is in a SAFE state. Safe execution sequence found: ${safeSequence.map(id => apps.find(a => a.id === id)?.name || id).join(' → ')}`
      : `System is in an UNSAFE state! Granting requests under this condition could lead to a deadlock.`
  };
}

/**
 * Banker's Resource Request Algorithm
 * Simulates requesting resources and checks if granting it yields a SAFE state.
 */
export function runBankersRequestAlgorithm(
  requestAppId: string,
  requestedResources: Record<string, number>,
  apps: AppWorkload[],
  resources: Resource[]
): {
  allowed: boolean;
  reason: string;
  safetyResult?: BankerSafetyResult;
} {
  const app = apps.find((a) => a.id === requestAppId);
  if (!app) {
    return { allowed: false, reason: 'Application process not found.' };
  }

  if (app.status === 'terminated' || app.status === 'completed') {
    return { allowed: false, reason: 'Cannot allocate resources to a terminated or completed process.' };
  }

  const needMatrix = calculateNeedMatrix(apps, resources);
  const available = calculateAvailableResources(resources, apps);

  // 1. Check Request <= Need
  for (const resId of Object.keys(requestedResources)) {
    const qty = requestedResources[resId];
    if (qty <= 0) continue;
    const need = needMatrix[app.id]?.[resId] || 0;
    if (qty > need) {
      return {
        allowed: false,
        reason: `Request for ${qty} instance(s) of resource exceeds process declared maximum need (${need}).`
      };
    }
  }

  // 2. Check Request <= Available
  for (const resId of Object.keys(requestedResources)) {
    const qty = requestedResources[resId];
    if (qty <= 0) continue;
    const avail = available[resId] || 0;
    if (qty > avail) {
      return {
        allowed: false,
        reason: `Insufficient available instances for resource (Requested: ${qty}, Available: ${avail}). Request queued.`
      };
    }
  }

  // 3. Pretend to allocate resources
  const tempAvailable = { ...available };
  const tempAllocation: Record<string, Record<string, number>> = {};
  const tempMax: Record<string, Record<string, number>> = {};

  apps.forEach((a) => {
    tempAllocation[a.id] = { ...a.currentAllocation };
    tempMax[a.id] = { ...a.maxDemand };
  });

  Object.keys(requestedResources).forEach((resId) => {
    const qty = requestedResources[resId];
    if (qty > 0) {
      tempAvailable[resId] = (tempAvailable[resId] || 0) - qty;
      tempAllocation[app.id][resId] = (tempAllocation[app.id][resId] || 0) + qty;
    }
  });

  // 4. Run safety algorithm on temporary state
  const safetyResult = runBankersSafetyAlgorithm(
    apps,
    resources,
    tempAvailable,
    tempAllocation,
    tempMax
  );

  if (safetyResult.isSafe) {
    return {
      allowed: true,
      reason: `Request granted! The resulting state is SAFE with sequence: ${safetyResult.safeSequence.map(id => apps.find(a => a.id === id)?.name || id).join(' → ')}`,
      safetyResult
    };
  } else {
    return {
      allowed: false,
      reason: `Request denied! Granting these resources would leave the system in an UNSAFE state. (Banker's Avoidance)`,
      safetyResult
    };
  }
}

/**
 * Deadlock Detection Algorithm
 * Detects actual deadlocks in current system state using multi-instance detection and cycle graph analysis.
 */
export function detectDeadlock(
  apps: AppWorkload[],
  resources: Resource[]
): DeadlockDetectionResult {
  const activeApps = apps.filter((a) => a.status !== 'terminated' && a.status !== 'completed');
  const available = calculateAvailableResources(resources, apps);

  // Work = Available
  const work: Record<string, number> = { ...available };
  const finish: Record<string, boolean> = {};

  activeApps.forEach((app) => {
    // If process holds 0 resources and has 0 pending requests, mark finish as true
    const holdsAny = Object.values(app.currentAllocation).some((qty) => qty > 0);
    const requestsAny = Object.values(app.pendingRequests).some((qty) => qty > 0);
    
    if (!holdsAny && !requestsAny) {
      finish[app.id] = true;
    } else {
      finish[app.id] = false;
    }
  });

  let found = true;
  while (found) {
    found = false;
    for (const app of activeApps) {
      if (!finish[app.id]) {
        // Check if outstanding Request <= Work
        let canFinish = true;
        for (const res of resources) {
          const req = app.pendingRequests[res.id] || 0;
          if (req > (work[res.id] || 0)) {
            canFinish = false;
            break;
          }
        }

        if (canFinish) {
          // Process can complete, release its allocated resources
          resources.forEach((res) => {
            work[res.id] = (work[res.id] || 0) + (app.currentAllocation[res.id] || 0);
          });
          finish[app.id] = true;
          found = true;
          break;
        }
      }
    }
  }

  // Deadlocked processes are those where finish[i] === false
  const deadlockedAppIds = activeApps.filter((app) => !finish[app.id]).map((a) => a.id);
  const isDeadlocked = deadlockedAppIds.length > 0;

  // Identify involved resources
  const involvedResourceIds = new Set<string>();
  if (isDeadlocked) {
    deadlockedAppIds.forEach((appId) => {
      const app = apps.find((a) => a.id === appId);
      if (app) {
        Object.entries(app.currentAllocation).forEach(([resId, qty]) => {
          if (qty > 0) involvedResourceIds.add(resId);
        });
        Object.entries(app.pendingRequests).forEach(([resId, qty]) => {
          if (qty > 0) involvedResourceIds.add(resId);
        });
      }
    });
  }

  // Find explicit circular chains in RAG graph
  const cycles: CycleInfo[] = findGraphCycles(apps, resources, deadlockedAppIds);

  return {
    isDeadlocked,
    detectedAt: isDeadlocked ? new Date().toLocaleTimeString() : undefined,
    deadlockedAppIds,
    involvedResourceIds: Array.from(involvedResourceIds),
    cycles,
    message: isDeadlocked
      ? `DEADLOCK DETECTED! ${deadlockedAppIds.length} process(es) in circular wait/blocked state: ${deadlockedAppIds.map(id => apps.find(a => a.id === id)?.name).join(', ')}.`
      : `No deadlock detected. All active processes can acquire required resources and finish execution.`
  };
}

/**
 * Finds directed cycles in the Resource Allocation Graph (RAG)
 * Process -> Resource (Request edge)
 * Resource -> Process (Assignment edge)
 */
function findGraphCycles(
  apps: AppWorkload[],
  resources: Resource[],
  deadlockedAppIds: string[]
): CycleInfo[] {
  const cycles: CycleInfo[] = [];
  if (deadlockedAppIds.length === 0) return cycles;

  // Build Adjacency List
  // Node IDs: App -> `P:${appId}`, Resource -> `R:${resId}`
  const graph: Record<string, string[]> = {};

  apps.forEach((app) => {
    const pNode = `P:${app.id}`;
    graph[pNode] = graph[pNode] || [];

    // Request edges: Process -> Resource
    Object.entries(app.pendingRequests).forEach(([resId, qty]) => {
      if (qty > 0) {
        const rNode = `R:${resId}`;
        graph[pNode].push(rNode);
        graph[rNode] = graph[rNode] || [];
      }
    });

    // Assignment edges: Resource -> Process
    Object.entries(app.currentAllocation).forEach(([resId, qty]) => {
      if (qty > 0) {
        const rNode = `R:${resId}`;
        graph[rNode] = graph[rNode] || [];
        if (!graph[rNode].includes(pNode)) {
          graph[rNode].push(pNode);
        }
      }
    });
  });

  // Cycle detection using DFS
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const currentPath: string[] = [];

  function dfs(node: string) {
    visited.add(node);
    recStack.add(node);
    currentPath.push(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recStack.has(neighbor)) {
        // Cycle detected! Extract cycle path
        const cycleStartIndex = currentPath.indexOf(neighbor);
        if (cycleStartIndex !== -1) {
          const rawCycle = currentPath.slice(cycleStartIndex);
          const pIds = rawCycle.filter((n) => n.startsWith('P:')).map((n) => n.replace('P:', ''));
          const rIds = rawCycle.filter((n) => n.startsWith('R:')).map((n) => n.replace('R:', ''));

          // Check if cycle has unique signature
          const pNames = pIds.map((id) => apps.find((a) => a.id === id)?.name || id);
          const rNames = rIds.map((id) => resources.find((r) => r.id === id)?.name || id);

          const desc = `${pNames.join(' → ')} → ${rNames.join(' → ')} → ${pNames[0]}`;
          if (!cycles.some((c) => c.description === desc)) {
            cycles.push({
              processIds: pIds,
              resourceIds: rIds,
              description: desc
            });
          }
        }
      }
    }

    recStack.delete(node);
    currentPath.pop();
  }

  Object.keys(graph).forEach((node) => {
    if (!visited.has(node)) {
      dfs(node);
    }
  });

  return cycles;
}

/**
 * Calculates victim process recommendation for deadlock recovery
 */
export function recommendRecoveryVictim(
  deadlockedAppIds: string[],
  apps: AppWorkload[]
): RecoveryRecommendation[] {
  const recommendations: RecoveryRecommendation[] = [];

  deadlockedAppIds.forEach((appId) => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    let totalAllocatedUnits = 0;
    Object.values(app.currentAllocation).forEach((qty) => {
      totalAllocatedUnits += qty;
    });

    // Score calculation formula:
    // Lower priority number (1 is high priority, 10 is low) -> Higher priority process.
    // Higher score = better candidate for victim termination!
    // Factors:
    // + (Priority weight): low priority app gets +30
    // + (Resource held weight): holding more resources frees up more blocked processes +20 * totalUnits
    // + (Has Checkpoint): easier rollback +25
    const priorityFactor = app.priority * 5; // priority 10 => 50 pts, priority 1 => 5 pts
    const resourceFactor = totalAllocatedUnits * 10;
    const checkpointFactor = app.checkpoint ? 25 : 0;

    const totalScore = priorityFactor + resourceFactor + checkpointFactor;

    let reason = `Priority level ${app.priority} (1-10). Holds ${totalAllocatedUnits} resource instance(s).`;
    if (app.checkpoint) {
      reason += ` Has active checkpoint taken at ${app.checkpoint.timestamp} (Rollback friendly).`;
    }

    recommendations.push({
      victimAppId: app.id,
      victimAppName: app.name,
      reason,
      score: totalScore,
      heldResources: { ...app.currentAllocation },
      priority: app.priority
    });
  });

  // Sort candidates by score descending (highest score = recommended victim)
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations;
}
