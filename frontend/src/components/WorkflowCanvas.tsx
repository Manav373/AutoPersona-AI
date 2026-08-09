import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Clock, Globe, Brain, Sparkles, FileText, Send, Database,
  FileCheck, Play, ZoomIn, ZoomOut, Target, Maximize2,
  RefreshCw, Link2, X, Move, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Agent, RunLog, TopicReview } from '../types';

export interface CanvasNodeData {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  nodeClass: string;
  icon: React.ElementType;
  x: number;
  y: number;
  params: { label: string; value: string }[];
  description: string;
  descriptionDetail: string;
}

export interface ConnectionData {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: 'default' | 'green' | 'red' | 'dashed';
}

export interface SelectedNodeInfo {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  color?: string;
  icon: React.ElementType;
  params: { label: string; value: string }[];
  description: string;
  descriptionDetail: string;
}

interface WorkflowCanvasProps {
  agents: Agent[];
  selectedAgentId: string;
  onTriggerCycle: () => void;
  isTriggering: boolean;
  latestLog?: RunLog;
  latestReview?: TopicReview;
  onSelectNode: (node: SelectedNodeInfo) => void;
  selectedNodeId: string | null;
  nodes?: CanvasNodeData[];
  setNodes?: React.Dispatch<React.SetStateAction<CanvasNodeData[]>>;
  connections?: ConnectionData[];
  setConnections?: React.Dispatch<React.SetStateAction<ConnectionData[]>>;
  showToast?: (msg: string) => void;
}

export const INITIAL_NODES: CanvasNodeData[] = [
  {
    id: 'schedule-trigger',
    title: 'Schedule Trigger',
    subtitle: 'Every 2 hours',
    type: 'trigger',
    nodeClass: 'node-schedule',
    icon: Clock,
    x: 360,
    y: 40,
    params: [
      { label: 'Trigger Type', value: 'Interval' },
      { label: 'Interval', value: '2 Hours' },
      { label: 'Timezone', value: '(UTC) Coordinated Universal Time' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Triggers the workflow on a fixed interval. Useful for autonomous agents that need to run periodically.',
  },
  {
    id: 'discover-topics',
    title: 'Discover Topics',
    subtitle: 'Web Search',
    type: 'discover',
    nodeClass: 'node-discover',
    icon: Globe,
    x: 360,
    y: 150,
    params: [
      { label: 'Search Query', value: 'Live AI & Tech News' },
      { label: 'Max Results', value: '8 Candidates' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Searches live web news sources for candidate topics within target interest domains.',
  },
  {
    id: 'ai-judge',
    title: 'AI Editorial Judge',
    subtitle: 'Evaluate Relevance',
    type: 'process',
    nodeClass: 'node-judge',
    icon: Brain,
    x: 360,
    y: 260,
    params: [
      { label: 'Verdict', value: 'ACCEPT' },
      { label: 'Novelty Score', value: '85%' },
      { label: 'Relevance Score', value: '78%' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Applies persona standards to reject low-quality or repeat topics.',
  },
  {
    id: 'generate-content',
    title: 'Generate Content',
    subtitle: 'AI Agent',
    type: 'process',
    nodeClass: 'node-generate',
    icon: Sparkles,
    x: 200,
    y: 400,
    params: [
      { label: 'Speaker Persona', value: 'AI Agent' },
      { label: 'POV', value: 'first person' },
      { label: 'Tone', value: 'Analytical' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Synthesizes post text in persona voice.',
  },
  {
    id: 'add-rationale',
    title: 'Add Publishing Rationale',
    subtitle: 'Add Sources & Why',
    type: 'process',
    nodeClass: 'node-rationale',
    icon: FileText,
    x: 200,
    y: 510,
    params: [
      { label: 'Why Selected', value: 'Included' },
      { label: 'Why Relevant Now', value: 'Included' },
      { label: 'Sources', value: 'Attached' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Appends editorial rationale and sources.',
  },
  {
    id: 'publish-post',
    title: 'Publish Post (Simulated)',
    subtitle: 'Output',
    type: 'output',
    nodeClass: 'node-publish',
    icon: Send,
    x: 200,
    y: 620,
    params: [
      { label: 'API Route', value: '/api/agent/feed' },
      { label: 'Status', value: 'Ready' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Publishes post payload to the feed API.',
  },
  {
    id: 'update-memory',
    title: 'Update Memory',
    subtitle: 'Vector Store',
    type: 'memory',
    nodeClass: 'node-memory',
    icon: Database,
    x: 480,
    y: 620,
    params: [
      { label: 'Storage', value: 'SQLite agent.db' },
      { label: 'Dedup Key', value: 'Persisted' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Saves published topic key to memory.',
  },
  {
    id: 'log-rejected',
    title: 'Log Rejected Topic',
    subtitle: 'Data Store',
    type: 'output',
    nodeClass: 'node-reject',
    icon: FileCheck,
    x: 520,
    y: 400,
    params: [
      { label: 'Action', value: 'Log Rejection' },
      { label: 'Reason', value: 'Failed novelty threshold' },
    ],
    description: 'What does this node do?',
    descriptionDetail: 'Stores rejected candidate topics.',
  },
];

export const INITIAL_CONNECTIONS: ConnectionData[] = [
  { id: 'c1', from: 'schedule-trigger', to: 'discover-topics' },
  { id: 'c2', from: 'discover-topics', to: 'ai-judge' },
  { id: 'c3', from: 'ai-judge', to: 'generate-content', label: 'Approved', type: 'green' },
  { id: 'c4', from: 'ai-judge', to: 'log-rejected', label: 'Rejected', type: 'red' },
  { id: 'c5', from: 'generate-content', to: 'add-rationale' },
  { id: 'c6', from: 'add-rationale', to: 'publish-post' },
  { id: 'c7', from: 'publish-post', to: 'update-memory', type: 'green' },
  { id: 'c8', from: 'ai-judge', to: 'update-memory', type: 'dashed' },
];

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  agents,
  selectedAgentId,
  onTriggerCycle,
  isTriggering,
  latestLog,
  latestReview,
  onSelectNode,
  selectedNodeId,
  nodes: externalNodes,
  setNodes: externalSetNodes,
  connections: externalConnections,
  setConnections: externalSetConnections,
  showToast,
}) => {
  const currentAgent = agents.find((a) => a.agentId === selectedAgentId) || agents[0];
  const p = currentAgent?.persona;

  const [localNodes, localSetNodes] = useState<CanvasNodeData[]>(INITIAL_NODES);
  const [localConnections, localSetConnections] = useState<ConnectionData[]>(INITIAL_CONNECTIONS);

  const nodes = externalNodes || localNodes;
  const setNodes = externalSetNodes || localSetNodes;
  const connections = externalConnections || localConnections;
  const setConnections = externalSetConnections || localSetConnections;

  // Dynamically personalize nodes when selected agent changes
  useEffect(() => {
    if (!p) return;
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === 'discover') {
          return {
            ...n,
            params: [
              { label: 'Domain', value: p.domain || 'AI & Technology' },
              { label: 'Primary Interest', value: p.interests?.[0] || 'Target News' },
              { label: 'Search Query', value: `site:news "${p.domain}" live updates` },
              { label: 'Limit', value: '5 candidates/cycle' },
            ],
          };
        }
        if (n.id === 'judge') {
          return {
            ...n,
            params: [
              { label: 'Evaluator Persona', value: p.name || 'AI Evaluator' },
              { label: 'Editorial Standard', value: p.publishingStandards?.[0] || 'Novelty %' },
              { label: 'Min Novelty Score', value: '75%' },
              { label: 'Min Relevance', value: '80%' },
            ],
          };
        }
        if (n.id === 'persona-voice') {
          return {
            ...n,
            params: [
              { label: 'Agent Persona', value: p.name || 'Autonomous Agent' },
              { label: 'Voice Tone', value: p.voice?.tone || 'Analytical' },
              { label: 'Writing POV', value: `${p.voice?.personPOV || 'first'} person` },
              { label: 'Sentence Style', value: p.voice?.sentenceStyle || 'Direct' },
            ],
          };
        }
        return n;
      })
    );
  }, [p?.name, p?.domain, p?.voice?.tone]);

  // Infinite Canvas Pan & Zoom State (n8n Style)
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Interactive Connecting Mode State
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const activeNodes = externalNodes && Array.isArray(externalNodes) ? externalNodes : localNodes;
  const updateNodes = externalSetNodes || localSetNodes;

  const activeConnections = externalConnections && Array.isArray(externalConnections) ? externalConnections : localConnections;
  const updateConnections = externalSetConnections || localSetConnections;

  const getNode = (id: string) => activeNodes.find((n) => n.id === id);

  // --- Infinite Canvas Background Panning (n8n Workboard Pan) ---
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only pan if clicking canvas background (not on a node box, button or port)
    const target = e.target as HTMLElement;
    if (
      target.closest('.n8n-node-box') ||
      target.closest('.node-port-dot') ||
      target.closest('.canvas-view-controls') ||
      target.closest('.floating-bottom-bar') ||
      target.closest('.canvas-minimap-box')
    ) {
      return;
    }

    // Complete connection if in connecting mode when clicking background
    if (connectingFromId) {
      setConnectingFromId(null);
    }

    setIsPanning(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - panStartRef.current.startX;
      const dy = moveEvent.clientY - panStartRef.current.startY;
      setPanOffset({
        x: panStartRef.current.initialPanX + dx,
        y: panStartRef.current.initialPanY + dy,
      });
    };

    const onPointerUp = () => {
      setIsPanning(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Track Mouse Position for Live Cable & Trackpad Wheel Zoom / Pan
  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom with wheel
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoomLevel((z) => Math.min(2.0, Math.max(0.3, Number((z + zoomDelta).toFixed(2)))));
    } else {
      // Pan with wheel (Mac trackpad 2D scroll or wheel scroll)
      setPanOffset((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  };

  // Track Mouse Movement on Infinite Canvas for Connecting Cable
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (connectingFromId && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - panOffset.x) / zoomLevel,
        y: (e.clientY - rect.top - panOffset.y) / zoomLevel,
      });
    }
  };

  // Disengage connecting mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connectingFromId) {
        setConnectingFromId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectingFromId]);

  // Unlimited Node Dragging Handler (Allows dragging anywhere in infinite 2D space)
  const handleNodePointerDown = (id: string, e: React.PointerEvent) => {
    if (connectingFromId) {
      if (connectingFromId !== id) {
        e.stopPropagation();
        e.preventDefault();
        completeConnection(connectingFromId, id);
      } else {
        setConnectingFromId(null);
      }
      return;
    }

    e.stopPropagation();
    setDraggingNodeId(id);

    const targetNode = getNode(id);
    if (!targetNode) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialNodeX = targetNode.x;
    const initialNodeY = targetNode.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoomLevel;
      const dy = (moveEvent.clientY - startY) / zoomLevel;

      // Unlimited node dragging (no min/max bounds)
      updateNodes((prevNodes) =>
        (prevNodes || []).map((n) =>
          n.id === id ? { ...n, x: Math.round(initialNodeX + dx), y: Math.round(initialNodeY + dy) } : n
        )
      );
    };

    const onPointerUp = () => {
      setDraggingNodeId(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Fit View / Center Nodes Action
  const handleFitView = useCallback(() => {
    if (activeNodes.length === 0) {
      setPanOffset({ x: 0, y: 0 });
      setZoomLevel(1);
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    activeNodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const nodeW = 210, nodeH = 70;
    const centerX = (minX + maxX + nodeW) / 2;
    const centerY = (minY + maxY + nodeH) / 2;

    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const viewportCenterX = rect.width / 2;
      const viewportCenterY = rect.height / 2;

      setPanOffset({
        x: viewportCenterX - centerX,
        y: viewportCenterY - centerY,
      });
      setZoomLevel(1);
    }
  }, [activeNodes]);

  // Start Interactive Connecting from a port dot or connect button
  const startConnecting = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (connectingFromId === nodeId) {
      setConnectingFromId(null);
      return;
    }
    if (connectingFromId && connectingFromId !== nodeId) {
      completeConnection(connectingFromId, nodeId);
      return;
    }
    setConnectingFromId(nodeId);
    if (showToast) {
      showToast(`🔌 Click another node to connect from "${getNode(nodeId)?.title || nodeId}"`);
    }
  };

  // Complete connection to target node and immediately disengage connecting mode
  const completeConnection = (from: string, to: string) => {
    setConnectingFromId(null);
    if (!from || !to || from === to) return;
    const exists = activeConnections.some((c) => (c.from === from && c.to === to) || (c.from === to && c.to === from));
    if (!exists) {
      const newConn: ConnectionData = {
        id: `c-${Date.now()}`,
        from,
        to,
        type: 'default',
      };
      updateConnections((prev) => [...(prev || []), newConn]);
      if (showToast) {
        showToast(`🔗 Connected "${getNode(from)?.title}" ➔ "${getNode(to)?.title}"`);
      }
    }
  };

  // Remove connection
  const handleDeleteConnection = (connId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateConnections((prev) => (prev || []).filter((c) => c.id !== connId));
    if (showToast) {
      showToast(`Removed connection cable`);
    }
  };

  const handleDeleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeNodes.length <= 1) return;
    updateNodes((prev) => (prev || []).filter((n) => n.id !== id));
    updateConnections((prev) => (prev || []).filter((c) => c.from !== id && c.to !== id));
  };

  // Stable Port Anchor & Dynamic Bezier Path Calculator
  const computeCablePath = (fromId: string, toId: string) => {
    const A = getNode(fromId);
    const B = getNode(toId);
    if (!A || !B) return null;

    const NODE_W = 210;
    const NODE_H = 54;

    // Stable anchor ports: Source (Bottom port) ➔ Target (Top port)
    const startX = A.x + NODE_W / 2;
    const startY = A.y + NODE_H;
    const endX = B.x + NODE_W / 2;
    const endY = B.y;

    const dy = endY - startY;
    const dx = endX - startX;

    let cp1X = startX;
    let cp1Y = startY;
    let cp2X = endX;
    let cp2Y = endY;

    if (dy >= 20) {
      // B is below A: smooth vertical bezier
      const curvature = Math.max(30, dy * 0.45);
      cp1Y += curvature;
      cp2Y -= curvature;
    } else {
      // B is above or beside A: graceful loop around
      const curvatureX = Math.max(80, Math.abs(dx) * 0.5);
      const curvatureY = Math.max(80, Math.abs(dy) * 0.7);

      if (dx > 50) {
        cp1X += curvatureX;
        cp2X -= curvatureX;
      } else if (dx < -50) {
        cp1X -= curvatureX;
        cp2X += curvatureX;
      } else {
        cp1Y += curvatureY;
        cp2Y -= curvatureY;
      }
    }

    const path = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

    // Cubic Bezier Midpoint
    const midX = 0.125 * startX + 0.375 * cp1X + 0.375 * cp2X + 0.125 * endX;
    const midY = 0.125 * startY + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * endY;

    return { path, midX, midY };
  };

  return (
    <div
      ref={viewportRef}
      className={`canvas-body-viewport ${isPanning ? 'panning' : ''}`}
      onPointerDown={handleCanvasPointerDown}
      onMouseMove={handleCanvasMouseMove}
      onWheel={handleCanvasWheel}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#050508',
        backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        cursor: isPanning ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Interactive Connecting Banner */}
      {connectingFromId && (
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--purple-active)',
            border: '1px solid var(--purple)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px var(--purple-glow)',
          }}
        >
          <Link2 size={15} />
          Connecting from "{getNode(connectingFromId)?.title}" — Click any target node to connect
          <button
            onClick={() => setConnectingFromId(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '6px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Right Zoom & Pan Controls */}
      <div className="canvas-view-controls">
        <button className="ctrl-btn" title="Zoom In" onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}>
          <ZoomIn size={13} />
        </button>
        <button className="ctrl-btn" title="Zoom Out" onClick={() => setZoomLevel((z) => Math.max(0.3, z - 0.15))}>
          <ZoomOut size={13} />
        </button>
        <button className="ctrl-btn" title="Center & Fit View" onClick={handleFitView}>
          <Maximize2 size={13} />
        </button>
        <button
          className="ctrl-btn"
          title="Reset Zoom & Pan"
          onClick={() => {
            setPanOffset({ x: 0, y: 0 });
            setZoomLevel(1);
          }}
        >
          <Target size={13} />
        </button>
      </div>

      {/* Infinite Canvas Graph Workboard Container */}
      <div
        className="canvas-graph-container"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {/* SVG Cable Connections Layer */}
        <svg
          className="graph-svg-layer"
          style={{
            position: 'absolute',
            left: -5000,
            top: -5000,
            width: 10000,
            height: 10000,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <g transform="translate(5000, 5000)">
            {/* Dynamic Active Connections Render */}
            {activeConnections.map((conn) => {
              const cable = computeCablePath(conn.from, conn.to);
              if (!cable?.path) return null;

              const colorClass = conn.type === 'green' ? 'green' : conn.type === 'red' ? 'red' : conn.type === 'dashed' ? 'dashed' : '';
              const strokeColor = conn.type === 'green' ? '#22c55e' : conn.type === 'red' ? '#ef4444' : 'rgba(99, 102, 241, 0.6)';

              return (
                <g key={conn.id} className="cable-group" style={{ pointerEvents: 'auto' }}>
                  {/* Base Solid Connection Cable */}
                  <path
                    d={cable.path}
                    className={`graph-cable ${colorClass}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={2}
                  />

                  {/* Animated Flowing Workflow Dash Overlay */}
                  <path
                    d={cable.path}
                    className={`graph-cable-flow ${colorClass} ${isTriggering ? 'running' : ''}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={2}
                    strokeDasharray="6 10"
                  />

                  {/* Delete cable button on hover midpoint */}
                  <g
                    className="cable-delete-btn"
                    onClick={(e) => handleDeleteConnection(conn.id, e)}
                    style={{ cursor: 'pointer', opacity: 0.85 }}
                  >
                    <circle cx={cable.midX} cy={cable.midY} r="9" fill="var(--bg-card-solid)" stroke="var(--border)" />
                    <text x={cable.midX} y={cable.midY + 3.5} textAnchor="middle" fill="var(--text-secondary)" fontSize="10px" fontWeight="bold">×</text>
                  </g>
                </g>
              );
            })}

            {/* Live Connecting Cable following mouse cursor */}
            {connectingFromId && getNode(connectingFromId) && (
              <path
                d={`M ${getNode(connectingFromId)!.x + 105} ${getNode(connectingFromId)!.y + 54} L ${mousePos.x} ${mousePos.y}`}
                className="graph-cable green"
                fill="none"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            )}
          </g>
        </svg>

        {/* Dynamically Positioned Branch Badges (Anchored to Cable Midpoints) */}
        {activeConnections.map((conn) => {
          if (!conn.label) return null;
          const cable = computeCablePath(conn.from, conn.to);
          if (!cable) return null;

          return (
            <span
              key={`badge-${conn.id}`}
              className={`branch-badge ${conn.label.toLowerCase() === 'approved' ? 'approved' : 'rejected'}`}
              style={{
                left: `${cable.midX - 28}px`,
                top: `${cable.midY - 20}px`,
                pointerEvents: 'auto',
              }}
            >
              {conn.label}
            </span>
          );
        })}

        {/* Draggable Unlimited Nodes */}
        {activeNodes.map((node) => {
          const Icon = node.icon || Globe;
          const isSelected = selectedNodeId === node.id;
          const isConnectingFrom = connectingFromId === node.id;

          const categoryTheme = node.type === 'trigger'
            ? { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', glow: 'rgba(34, 197, 94, 0.25)' }
            : node.type === 'discover'
            ? { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)', glow: 'rgba(56, 189, 248, 0.25)' }
            : node.type === 'memory'
            ? { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', glow: 'rgba(168, 85, 247, 0.25)' }
            : { color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', glow: 'rgba(99, 102, 241, 0.25)' };

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.88, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onPointerDown={(e) => handleNodePointerDown(node.id, e)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                position: 'absolute',
                minWidth: '200px',
                background: 'var(--bg-card-solid)',
                border: isSelected
                  ? '1.5px solid #6366f1'
                  : isConnectingFrom
                  ? '1.5px solid #22c55e'
                  : `1px solid ${categoryTheme.border}`,
                borderRadius: '14px',
                padding: '12px 14px',
                cursor: 'grab',
                pointerEvents: 'auto',
                zIndex: isConnectingFrom ? 50 : isSelected ? 20 : 5,
                boxShadow: isSelected
                  ? `0 0 0 3px ${categoryTheme.glow}, 0 12px 36px rgba(0, 0, 0, 0.2)`
                  : `0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
                backdropFilter: 'blur(16px)',
                userSelect: 'none',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode({
                  id: node.id,
                  title: node.title,
                  subtitle: node.subtitle,
                  type: node.nodeClass,
                  icon: Icon,
                  params: node.params,
                  description: node.description,
                  descriptionDetail: node.descriptionDetail,
                });
              }}
            >
              {/* Top Port Dot */}
              <motion.div
                whileHover={{ scale: 1.5 }}
                whileTap={{ scale: 0.8 }}
                style={{
                  position: 'absolute', width: '10px', height: '10px', borderRadius: '50%',
                  background: 'var(--bg-card-solid)', border: `2px solid ${categoryTheme.color}`, cursor: 'crosshair', zIndex: 6,
                  top: '-6px', left: '50%', transform: 'translateX(-50%)',
                  boxShadow: `0 0 6px ${categoryTheme.color}`,
                }}
                onClick={(e) => startConnecting(node.id, e)}
                title="Click port to connect to another node"
              />
              {/* Left Port Dot */}
              <motion.div
                whileHover={{ scale: 1.5 }}
                whileTap={{ scale: 0.8 }}
                style={{
                  position: 'absolute', width: '10px', height: '10px', borderRadius: '50%',
                  background: 'var(--bg-card-solid)', border: `2px solid ${categoryTheme.color}`, cursor: 'crosshair', zIndex: 6,
                  left: '-6px', top: '50%', transform: 'translateY(-50%)',
                  boxShadow: `0 0 6px ${categoryTheme.color}`,
                }}
                onClick={(e) => startConnecting(node.id, e)}
                title="Click port to connect to another node"
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: categoryTheme.bg, border: `1px solid ${categoryTheme.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: categoryTheme.color, flexShrink: 0,
                  boxShadow: `0 0 12px ${categoryTheme.bg}`,
                }}>
                  <Icon size={16} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
                    {node.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: categoryTheme.color }} />
                    {node.subtitle}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ background: 'none', border: 'none', fontSize: '12px', color: categoryTheme.color, opacity: 0.85, cursor: 'pointer', padding: '3px' }}
                  onClick={(e) => startConnecting(node.id, e)}
                  title="Connect node"
                >
                  <Link2 size={13} />
                </motion.button>

                {activeNodes.length > 2 && (
                  <motion.button
                    whileHover={{ scale: 1.2, color: '#ef4444' }}
                    whileTap={{ scale: 0.9 }}
                    style={{ background: 'none', border: 'none', fontSize: '15px', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', lineHeight: 1 }}
                    onClick={(e) => handleDeleteNode(node.id, e)}
                    title="Remove node"
                  >
                    ×
                  </motion.button>
                )}
              </div>

              {/* Right Port Dot */}
              <motion.div
                whileHover={{ scale: 1.5 }}
                whileTap={{ scale: 0.8 }}
                style={{
                  position: 'absolute', width: '10px', height: '10px', borderRadius: '50%',
                  background: 'var(--bg-card-solid)', border: `2px solid ${categoryTheme.color}`, cursor: 'crosshair', zIndex: 6,
                  right: '-6px', top: '50%', transform: 'translateY(-50%)',
                  boxShadow: `0 0 6px ${categoryTheme.color}`,
                }}
                onClick={(e) => startConnecting(node.id, e)}
                title="Click port to connect to another node"
              />
              {/* Bottom Port Dot */}
              <motion.div
                whileHover={{ scale: 1.5 }}
                whileTap={{ scale: 0.8 }}
                style={{
                  position: 'absolute', width: '10px', height: '10px', borderRadius: '50%',
                  background: 'var(--bg-card-solid)', border: `2px solid ${categoryTheme.color}`, cursor: 'crosshair', zIndex: 6,
                  bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
                  boxShadow: `0 0 6px ${categoryTheme.color}`,
                }}
                onClick={(e) => startConnecting(node.id, e)}
                title="Click port to connect to another node"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Floating Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
        style={{
          position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(12, 12, 20, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '14px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(16px)', zIndex: 20, pointerEvents: 'auto',
        }}
      >
        <motion.button
          onClick={onTriggerCycle}
          disabled={isTriggering || selectedAgentId === 'all'}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff',
            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
            opacity: (isTriggering || selectedAgentId === 'all') ? 0.5 : 1,
          }}
        >
          <Play size={13} fill="#fff" />
          {isTriggering ? 'Running...' : 'Run Workflow'}
        </motion.button>
        <button
          title="Center & Fit Nodes View"
          onClick={handleFitView}
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', color: '#9d9db8', cursor: 'pointer' }}
        >
          <Compass size={14} />
        </button>
        <button
          title="Reset Layout & Connections"
          onClick={() => {
            updateNodes(INITIAL_NODES);
            updateConnections(INITIAL_CONNECTIONS);
            setPanOffset({ x: 0, y: 0 });
            setZoomLevel(1);
          }}
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', color: '#9d9db8', cursor: 'pointer' }}
        >
          <RefreshCw size={14} />
        </button>
      </motion.div>

      {/* Bottom-Right Dynamic Mini Map */}
      <div className="canvas-minimap-box" style={{ pointerEvents: 'auto' }}>
        {activeNodes.map((n) => (
          <div
            key={n.id}
            className="minimap-preview-dot"
            style={{
              left: `${Math.min(130, Math.max(10, ((n.x + panOffset.x) / 1000) * 130))}px`,
              top: `${Math.min(90, Math.max(10, ((n.y + panOffset.y) / 800) * 90))}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
