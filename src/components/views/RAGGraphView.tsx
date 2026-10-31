import React, { useState, useRef, useEffect } from 'react';
import { 
  GitFork, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Info,
  X 
} from 'lucide-react';
import { useCloudX } from '../../context/CloudXContext';

interface NodePos {
  id: string;
  type: 'process' | 'resource';
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  isDeadlocked?: boolean;
}

interface Edge {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'assignment';
  quantity: number;
  isCycle?: boolean;
}

export const RAGGraphView: React.FC = () => {
  const { apps, resources, deadlockResult } = useCloudX();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<{ type: 'node' | 'edge'; data: any } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePos>>({});

  const deadlockedAppIdsSet = new Set(deadlockResult.deadlockedAppIds);
  const involvedResourceIdsSet = new Set(deadlockResult.involvedResourceIds);

  const resetNodeLayout = () => {
    const positions: Record<string, NodePos> = {};
    const activeApps = apps.filter((a) => a.status !== 'terminated');
    
    const appHeightStep = 90;
    const resHeightStep = 90;
    const startY = 80;

    activeApps.forEach((app, idx) => {
      positions[`P:${app.id}`] = {
        id: `P:${app.id}`,
        type: 'process',
        x: 180,
        y: startY + idx * appHeightStep,
        label: app.name,
        sublabel: `Priority: ${app.priority} (${app.status.toUpperCase()})`,
        isDeadlocked: deadlockedAppIdsSet.has(app.id)
      };
    });

    resources.forEach((res, idx) => {
      positions[`R:${res.id}`] = {
        id: `R:${res.id}`,
        type: 'resource',
        x: 620,
        y: startY + idx * resHeightStep,
        label: res.name,
        sublabel: `${res.totalInstances} ${res.unit} (${res.type.toUpperCase()})`,
        isDeadlocked: involvedResourceIdsSet.has(res.id)
      };
    });

    setNodePositions(positions);
  };

  useEffect(() => {
    resetNodeLayout();
  }, [apps.length, resources.length, deadlockResult.isDeadlocked]);

  const edges: Edge[] = [];
  const cycleEdgesSet = new Set<string>();

  deadlockResult.cycles.forEach((cycle) => {
    for (let i = 0; i < cycle.processIds.length; i++) {
      const pId = cycle.processIds[i];
      const rId = cycle.resourceIds[i] || cycle.resourceIds[0];
      if (pId && rId) {
        cycleEdgesSet.add(`P:${pId}->R:${rId}`);
        cycleEdgesSet.add(`R:${rId}->P:${pId}`);
      }
    }
  });

  apps.forEach((app) => {
    if (app.status === 'terminated') return;

    Object.entries(app.pendingRequests).forEach(([resId, qty]) => {
      if (qty > 0) {
        const edgeId = `P:${app.id}->R:${resId}`;
        edges.push({
          id: edgeId,
          from: `P:${app.id}`,
          to: `R:${resId}`,
          type: 'request',
          quantity: qty,
          isCycle: cycleEdgesSet.has(edgeId)
        });
      }
    });

    Object.entries(app.currentAllocation).forEach(([resId, qty]) => {
      if (qty > 0) {
        const edgeId = `R:${resId}->P:${app.id}`;
        edges.push({
          id: edgeId,
          from: `R:${resId}`,
          to: `P:${app.id}`,
          type: 'assignment',
          quantity: qty,
          isCycle: cycleEdgesSet.has(edgeId)
        });
      }
    });
  });

  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const pos = nodePositions[nodeId];
    if (!pos) return;
    setDraggingNodeId(nodeId);
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    setNodePositions((prev) => ({
      ...prev,
      [draggingNodeId]: {
        ...prev[draggingNodeId],
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      }
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs dark:shadow-none">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Resource Allocation Graph (RAG)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time directed graph visualization of Process (circles) and Resource (squares) dependencies.
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
            className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
            className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetNodeLayout}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5"
            title="Reset Graph Layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Graph Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-[600px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-xs dark:shadow-none"
      >
        <svg className="w-full h-full absolute inset-0 pointer-events-none z-0">
          <defs>
            <marker
              id="arrow-request"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
            </marker>
            <marker
              id="arrow-assignment"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
            </marker>
            <marker
              id="arrow-cycle"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
            </marker>
          </defs>
        </svg>

        {/* Graph Transform Container */}
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'top left',
            transition: draggingNodeId ? 'none' : 'transform 0.1s ease-out'
          }}
          className="w-full h-full relative"
        >
          {/* Render Directed Edges */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {edges.map((edge) => {
              const fromNode = nodePositions[edge.from];
              const toNode = nodePositions[edge.to];
              if (!fromNode || !toNode) return null;

              const isCycle = edge.isCycle;
              const markerId = isCycle
                ? 'arrow-cycle'
                : edge.type === 'request'
                ? 'arrow-request'
                : 'arrow-assignment';

              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const cx = fromNode.x + dx / 2;
              const cy = fromNode.y + dy / 2 + (edge.type === 'request' ? -20 : 20);

              const pathString = `M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`;

              return (
                <g key={edge.id} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedElement({ type: 'edge', data: edge })}>
                  <path
                    d={pathString}
                    fill="none"
                    stroke={isCycle ? '#e11d48' : edge.type === 'request' ? '#2563eb' : '#059669'}
                    strokeWidth={isCycle ? 3 : 2}
                    strokeDasharray={edge.type === 'request' ? '5,5' : 'none'}
                    markerEnd={`url(#${markerId})`}
                    className={isCycle ? 'animate-pulse' : ''}
                  />
                  <text
                    x={cx}
                    y={cy - 6}
                    fill={isCycle ? '#e11d48' : edge.type === 'request' ? '#2563eb' : '#059669'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {edge.quantity}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Render Nodes */}
          {Object.values(nodePositions).map((node) => {
            const isProcess = node.type === 'process';
            const isDeadlocked = node.isDeadlocked;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                onClick={() => setSelectedElement({ type: 'node', data: node })}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`absolute p-3 rounded-xl border transition-all cursor-move flex flex-col items-center justify-center shadow-md ${
                  isProcess
                    ? isDeadlocked
                      ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 shadow-rose-500/20 ring-2 ring-rose-500/50 animate-pulse'
                      : 'bg-blue-50 dark:bg-cyan-950/80 border-blue-400 dark:border-cyan-500/60 shadow-blue-500/10 hover:border-blue-600'
                    : isDeadlocked
                    ? 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 shadow-rose-500/20'
                    : 'bg-white dark:bg-slate-900 border-indigo-400 dark:border-indigo-500/60 hover:border-indigo-600'
                }`}
              >
                {isProcess ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center font-mono font-bold text-xs text-blue-700 dark:text-cyan-300">
                      {node.id.replace('P:', '')}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">{node.label}</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{node.sublabel}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-500/20 border border-indigo-500 flex items-center justify-center font-mono font-bold text-[10px] text-indigo-700 dark:text-indigo-300">
                        {node.id.replace('R:', '')}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">{node.label}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{node.sublabel}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] space-y-2 backdrop-blur-md z-20 shadow-md">
          <div className="font-semibold text-slate-900 dark:text-slate-200">Graph Legend</div>
          <div className="flex items-center gap-3 font-mono text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-blue-500 bg-blue-100 dark:bg-cyan-950" /> Process Node
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-indigo-500 bg-white dark:bg-slate-900" /> Resource Node
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-blue-600 dark:bg-cyan-400 border-dashed" /> Request (P → R)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-600 dark:bg-emerald-400" /> Assignment (R → P)
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <span className="w-4 h-1 bg-rose-500" /> Deadlock Cycle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
