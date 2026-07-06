// /src/components/GossipVisualizer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../lib/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  RefreshCw, 
  Radio, 
  Activity, 
  Terminal as TerminalIcon, 
  Sliders, 
  HelpCircle, 
  Database,
  ShieldCheck,
  Server,
  Cpu
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  state: 'susceptible' | 'infected' | 'transmitting';
  roundInfected: number | null;
  peersTold: number;
  activityLevel: number;
  neighbors: number[];
}

interface Transmission {
  from: number;
  to: number;
}

export default function GossipVisualizer() {
  // Config state
  const [nodeCount, setNodeCount] = useState<number>(25);
  const [fanout, setFanout] = useState<number>(2);
  const [tickSpeed, setTickSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [infectionMode, setInfectionMode] = useState<'random' | 'manual'>('random');

  // Simulation run state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [round, setRound] = useState<number>(0);
  const [activeTransmissions, setActiveTransmissions] = useState<Transmission[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{ round: number; reachedPercent: number }>>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  // Time tracker for convergence
  const [startTime, setStartTime] = useState<number | null>(null);
  const [realConvergenceTime, setRealConvergenceTime] = useState<number>(0);

  // Network generation helper
  const generateNetwork = (count: number): Node[] => {
    const width = 580;
    const height = 380;
    const newNodes: Node[] = [];

    // 1. Position nodes randomly inside margins, avoiding dense overlap
    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      let tooClose = true;
      let attempts = 0;

      while (tooClose && attempts < 150) {
        x = Math.floor(Math.random() * (width - 80)) + 40;
        y = Math.floor(Math.random() * (height - 80)) + 40;
        tooClose = newNodes.some(n => Math.hypot(n.x - x, n.y - y) < 42);
        attempts++;
      }

      newNodes.push({
        id: i,
        label: `N${String(i + 1).padStart(2, '0')}`,
        x,
        y,
        state: 'susceptible',
        roundInfected: null,
        peersTold: 0,
        activityLevel: 0,
        neighbors: []
      });
    }

    // 2. Compute mesh connectivity using k-nearest neighbors
    newNodes.forEach((node, idx) => {
      const distances = newNodes
        .map((other, oIdx) => ({ idx: oIdx, dist: Math.hypot(node.x - other.x, node.y - other.y) }))
        .filter(item => item.idx !== idx)
        .sort((a, b) => a.dist - b.dist);

      const k = Math.min(3, distances.length);
      for (let j = 0; j < k; j++) {
        const neighborIdx = distances[j].idx;
        if (!node.neighbors.includes(neighborIdx)) {
          node.neighbors.push(neighborIdx);
        }
        if (!newNodes[neighborIdx].neighbors.includes(idx)) {
          newNodes[neighborIdx].neighbors.push(idx);
        }
      }
    });

    return newNodes;
  };

  // Initialize network on mount & nodeCount adjustments
  useEffect(() => {
    handleReset(nodeCount);
  }, [nodeCount]);

  // Handle fully resetting the state
  const handleReset = (countToUse = nodeCount) => {
    const freshNodes = generateNetwork(countToUse);
    setNodes(freshNodes);
    setRound(0);
    setActiveTransmissions([]);
    setIsPlaying(false);
    setIsComplete(false);
    setLogs([`[SYS 00] INTERACTIVE SHUTDOWN / NETWORK REINITIALIZED`, `[SYS 00] LOADED ${countToUse} NODES IN MESH CONFIG`]);
    setHistory([]);
    setHoveredNode(null);
    setStartTime(null);
    setRealConvergenceTime(0);
    audio.playMCBSwitchSound(false);
  };

  // Trigger manual or random patient zero initialization
  const initializePatientZero = (startNodes = nodes): Node[] => {
    if (startNodes.length === 0) return startNodes;

    audio.init();

    // Select Patient Zero index
    const zeroIdx = Math.floor(Math.random() * startNodes.length);
    const updated = startNodes.map((n, idx) => {
      if (idx === zeroIdx) {
        return {
          ...n,
          state: 'infected' as const,
          roundInfected: 0
        };
      }
      return n;
    });

    setRound(0);
    setHistory([{ round: 0, reachedPercent: Math.round((1 / startNodes.length) * 100) }]);
    setLogs([
      `[RND 00] PATIENT ZERO ${startNodes[zeroIdx].label} ACTIVATED (RANDOM)`,
      `[SYS] EPIDEMIC CONSENSUS PROPAGATION INITIATED`
    ]);
    setStartTime(Date.now());
    audio.playSuccessSound();

    return updated;
  };

  // Inject manually clicked patient zero
  const handleNodeClick = (clickedNode: Node) => {
    audio.init();
    
    // If consensus is already fully achieved, ignore clicks
    if (isComplete) return;

    setNodes(prev => {
      // Find if anyone is infected yet
      const someInfected = prev.some(n => n.state !== 'susceptible');
      
      const nextNodes = prev.map(n => {
        if (n.id === clickedNode.id) {
          // Play specialized hum
          audio.playHarp(clickedNode.id % 12);
          return {
            ...n,
            state: 'infected' as const,
            roundInfected: round
          };
        }
        return n;
      });

      const infectedCount = nextNodes.filter(n => n.state !== 'susceptible').length;
      const reachedPercent = Math.round((infectedCount / prev.length) * 100);

      if (!someInfected) {
        setRound(0);
        setHistory([{ round: 0, reachedPercent }]);
        setLogs(prevLogs => [
          `[RND 00] PATIENT ZERO ${clickedNode.label} COMMITTED (MANUAL)`,
          `[SYS] INTERACTIVE VIRTUAL CONTAGION INJECTED`,
          ...prevLogs
        ]);
        setStartTime(Date.now());
      } else {
        setHistory(prevHistory => {
          // Append or override last history point
          const filtered = prevHistory.filter(h => h.round !== round);
          return [...filtered, { round, reachedPercent }];
        });
        setLogs(prevLogs => [
          `[SYS] AD-HOC CONTAGION INJECTED AT NODE ${clickedNode.label}`,
          ...prevLogs
        ]);
      }

      return nextNodes;
    });
  };

  // Step single simulation cycle forward
  const handleStep = () => {
    if (isComplete) return;

    audio.init();

    setNodes(prevNodes => {
      const infected = prevNodes.filter(n => n.state === 'infected' || n.state === 'transmitting');

      // If absolutely no nodes are infected, assign patient zero first
      if (infected.length === 0) {
        const withZero = initializePatientZero(prevNodes);
        // Defer next ticks to the interval loop
        return withZero;
      }

      const transmissions: Transmission[] = [];
      const newlyTargeted: number[] = [];

      // For every infected node, select neighbors to share state with
      infected.forEach(node => {
        // Find adjacent neighbors who are uninfected (susceptible)
        const candidates = node.neighbors.filter(nIdx => prevNodes[nIdx].state === 'susceptible');
        if (candidates.length > 0) {
          const limit = Math.min(fanout, candidates.length);
          // Shuffle candidates to pick randomly
          const shuffled = [...candidates].sort(() => Math.random() - 0.5);
          const chosen = shuffled.slice(0, limit);

          chosen.forEach(targetIdx => {
            transmissions.push({ from: node.id, to: targetIdx });
            if (!newlyTargeted.includes(targetIdx)) {
              newlyTargeted.push(targetIdx);
            }
          });
        }
      });

      // No new transmissions -> Consensus finalized or deadlocked
      if (transmissions.length === 0) {
        setIsPlaying(false);
        setIsComplete(true);
        const reachedCount = prevNodes.filter(n => n.state !== 'susceptible').length;
        const total = prevNodes.length;
        const isFull = reachedCount === total;

        setLogs(prev => [
          isFull 
            ? `[RND ${String(round).padStart(2, '0')}] ✓ FULL CONSENSUS SECURED IN ${round} ROUNDS`
            : `[RND ${String(round).padStart(2, '0')}] ⚠ PROPAGATION BLOCKED (PARTIAL SHIELD)`,
          `[SYS] NETWORK STABLE (COV: ${reachedCount}/${total})`,
          ...prev
        ]);

        if (isFull) {
          audio.playSuccessSound();
        } else {
          audio.playErrorSound();
        }

        return prevNodes;
      }

      // Play short diagnostic transmission blip
      audio.playInputSound();

      // Trigger transient visual "Transmitting" states
      setActiveTransmissions(transmissions);

      const stage1Nodes = prevNodes.map(n => {
        const isTransmitting = transmissions.some(t => t.from === n.id);
        if (isTransmitting) {
          const targetInfectionsCount = transmissions.filter(t => t.from === n.id).length;
          return {
            ...n,
            state: 'transmitting' as const,
            peersTold: n.peersTold + targetInfectionsCount,
            activityLevel: n.activityLevel + 1
          };
        }
        return n;
      });

      // Deliver the state payloads at mid-cycle
      const speedMs = tickSpeed === 'slow' ? 1200 : tickSpeed === 'medium' ? 600 : 250;
      const deliveryDelay = Math.floor(speedMs * 0.45);

      setTimeout(() => {
        setNodes(currNodes => {
          return currNodes.map(node => {
            const isTransmitting = node.state === 'transmitting';
            const wasTargeted = newlyTargeted.includes(node.id);

            if (isTransmitting) {
              return { ...node, state: 'infected' as const };
            } else if (wasTargeted) {
              return { 
                ...node, 
                state: 'infected' as const,
                roundInfected: round + 1
              };
            }
            return node;
          });
        });
        setActiveTransmissions([]);
      }, deliveryDelay);

      // Log generation
      const reachedCount = prevNodes.filter(n => n.state !== 'susceptible').length + newlyTargeted.length;
      const reachedPercent = Math.round((reachedCount / prevNodes.length) * 100);

      const sendersLog = transmissions
        .slice(0, 3)
        .map(t => `${prevNodes[t.from].label}→${prevNodes[t.to].label}`)
        .join(', ');
      
      const overflowCount = transmissions.length - 3;
      const logDetails = `${sendersLog}${overflowCount > 0 ? ` (+${overflowCount} more)` : ''}`;

      setLogs(prev => {
        const nextLogs = [`[RND ${String(round + 1).padStart(2, '0')}] ${logDetails} | +${newlyTargeted.length} nodes`];
        if (reachedPercent >= 80 && prevNodes.filter(n => n.state !== 'susceptible').length / prevNodes.length < 0.8) {
          nextLogs.push(`[RND ${String(round + 1).padStart(2, '0')}] ⚡ CAPACITOR THRESHOLD CROSSED: 80% COVERAGE`);
        }
        return [...nextLogs, ...prev];
      });

      setRound(r => r + 1);
      setHistory(h => [...h, { round: round + 1, reachedPercent }]);

      // Check consensus convergence criteria
      if (reachedCount === prevNodes.length) {
        setIsPlaying(false);
        setIsComplete(true);
        setLogs(prev => [
          `[RND ${String(round + 1).padStart(2, '0')}] ✓ FULL CONSENSUS ACHIEVED (100% NODES RECOVERED)`,
          ...prev
        ]);
        audio.playSuccessSound();
      }

      return stage1Nodes;
    });
  };

  // Clock tick interval mechanism
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = tickSpeed === 'slow' ? 1200 : tickSpeed === 'medium' ? 600 : 250;
    const interval = setInterval(() => {
      handleStep();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, tickSpeed, fanout, round, isComplete]);

  // Update live convergence time
  useEffect(() => {
    if (startTime && !isComplete) {
      const timer = setInterval(() => {
        setRealConvergenceTime(Date.now() - startTime);
      }, 73);
      return () => clearInterval(timer);
    }
  }, [startTime, isComplete]);

  // Real Shannon entropy calculation
  const getShannonEntropy = (): number => {
    const total = nodes.length;
    if (total === 0) return 0;
    const infectedCount = nodes.filter(n => n.state !== 'susceptible').length;
    if (infectedCount === 0 || infectedCount === total) return 0;

    const p = infectedCount / total;
    const entropy = -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
    return parseFloat(entropy.toFixed(3));
  };

  // Compute status metrics
  const infectedCount = nodes.filter(n => n.state !== 'susceptible').length;
  const nodesPercent = nodes.length > 0 ? Math.round((infectedCount / nodes.length) * 100) : 0;

  // Retrieve dynamic status string
  const getStatusText = (): string => {
    if (isComplete && nodesPercent === 100) return '✓ CONSENSUS ACHIEVED';
    if (isComplete) return '⚠ PROPAGATION STALLED';
    if (isPlaying) return '⚡ EPIDEMIC COV PROPAGATING...';
    if (infectedCount > 0) return '⏸ SIMULATION PAUSED';
    return '🛰 AWAITING PATIENT ZERO';
  };

  return (
    <div className="w-full bg-[#0a0a0a] border border-[#222222] p-5 select-none text-left relative font-mono scanline-overlay text-white" id="gossip-protocol-visualizer">
      {/* Self-contained CSS style overrides for animations and custom layouts */}
      <style>{`
        @keyframes pulse-svg {
          0% { r: 6px; stroke-width: 1.5; stroke-opacity: 0.9; }
          50% { r: 15px; stroke-width: 4; stroke-opacity: 0.45; }
          100% { r: 6px; stroke-width: 1.5; stroke-opacity: 0.9; }
        }
        .pulse-ring-glow {
          animation: pulse-svg 1.8s infinite ease-in-out;
        }
        @keyframes dash-scroll {
          to { stroke-dashoffset: -20; }
        }
        .animate-dash-arrow {
          stroke-dasharray: 6, 4;
          animation: dash-scroll 0.8s linear infinite;
        }
        .scanline-overlay::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%);
          background-size: 100% 3px;
          z-index: 50;
          pointer-events: none;
        }
        .terminal-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .terminal-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .terminal-scroll::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }
        .terminal-scroll::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>

      {/* Grid structure for the 3 panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT PANEL: CONTROL SHELL (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between border border-[#1a1a1a] bg-[#0d0d0d] p-4 relative" id="gossip-left-panel">
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#00ff88]" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#00ff88]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#00ff88]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#00ff88]" />

          <div className="space-y-4">
            {/* Header Titles */}
            <div className="border-b border-[#1a1a1a] pb-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[#00ff88]">
                <Radio className="w-4 h-4 animate-pulse shrink-0" />
                <span className="text-[11px] font-black tracking-wider">// GOSSIP PROTOCOL // CACC</span>
              </div>
              <h2 className="text-sm font-black text-[#00ff88] tracking-widest uppercase">
                EPIDEMIC CONSENSUS VISUALIZER
              </h2>
            </div>

            {/* Parameter configuration sliders */}
            <div className="space-y-3.5">
              <span className="text-[10px] text-[#00ccff] font-bold tracking-widest uppercase block">// NODE CONFIG</span>
              
              {/* Node count slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>NODE COUNT</span>
                  <span className="text-[#00ff88]">{nodeCount} NODES</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  value={nodeCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNodeCount(val);
                    audio.playInputSound();
                  }}
                  disabled={isPlaying}
                  className="w-full h-1 accent-[#00ff88] bg-neutral-900 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Fanout slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>FANOUT (PEERS F)</span>
                  <span className="text-[#00ff88]">{fanout} PEERS</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={fanout}
                  onChange={(e) => {
                    setFanout(parseInt(e.target.value));
                    audio.playInputSound();
                  }}
                  className="w-full h-1 accent-[#00ff88] bg-neutral-900 cursor-pointer"
                />
              </div>

              {/* Tick speed slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>TICK SPEED</span>
                  <span className="text-[#00ff88] uppercase">{tickSpeed}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['slow', 'medium', 'fast'] as const).map(speedOption => (
                    <button
                      key={speedOption}
                      onClick={() => {
                        setTickSpeed(speedOption);
                        audio.playInputSound();
                      }}
                      className={`py-1 text-[9px] font-bold border uppercase transition-colors ${
                        tickSpeed === speedOption
                          ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30'
                          : 'bg-transparent text-gray-500 border-white/5 hover:text-white hover:bg-neutral-950'
                      }`}
                    >
                      {speedOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Infection mode toggle */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>PATIENT ZERO MODE</span>
                  <span className="text-[#00ff88] uppercase">{infectionMode === 'random' ? 'RANDOM' : 'MANUAL'}</span>
                </div>
                <button
                  onClick={() => {
                    setInfectionMode(prev => prev === 'random' ? 'manual' : 'random');
                    audio.playChime(3);
                  }}
                  className="w-full py-1.5 text-[9px] font-bold border border-white/5 uppercase transition-colors text-center bg-transparent text-gray-300 hover:text-[#00ff88]"
                >
                  {infectionMode === 'random' ? '🎯 RANDOM PATIENT ZERO' : '☝️ OPERATOR CLICK SELECT'}
                </button>
              </div>
            </div>

            {/* Live Telemetry metrics */}
            <div className="space-y-2.5 pt-3 border-t border-[#1a1a1a]">
              <span className="text-[10px] text-[#00ccff] font-bold tracking-widest uppercase block">// LIVE TELEMETRY</span>
              
              <div className="grid grid-cols-2 gap-2 text-left font-mono">
                <div className="bg-[#050505] border border-white/5 p-2 space-y-0.5">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block">RECON_ROUND</span>
                  <span className="text-xs text-white font-extrabold">RND {String(round).padStart(2, '0')}</span>
                </div>
                <div className="bg-[#050505] border border-white/5 p-2 space-y-0.5">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block">NODES_REACHED</span>
                  <span className="text-xs text-[#00ff88] font-extrabold">{infectedCount}/{nodes.length} ({nodesPercent}%)</span>
                </div>
                <div className="bg-[#050505] border border-white/5 p-2 space-y-0.5">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block">CONVERGENCE</span>
                  <span className="text-xs text-white font-extrabold">
                    {startTime ? `${realConvergenceTime.toFixed(0)}ms` : '0ms'}
                  </span>
                </div>
                <div className="bg-[#050505] border border-white/5 p-2 space-y-0.5">
                  <span className="text-[8px] text-gray-500 uppercase font-bold block">SHANNON_ENTROPY</span>
                  <span className="text-xs text-[#ff6b35] font-extrabold">{getShannonEntropy()} bits</span>
                </div>
              </div>

              {/* Flashing Status Bar */}
              <div className={`p-2 border font-bold text-[9px] tracking-widest text-center uppercase transition-all duration-300 ${
                isComplete && nodesPercent === 100
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30 animate-pulse'
                  : isComplete
                    ? 'bg-[#ff6b35]/10 text-[#ff6b35] border-[#ff6b35]/30'
                    : isPlaying
                      ? 'bg-[#00ccff]/10 text-[#00ccff] border-[#00ccff]/30 animate-pulse'
                      : 'bg-neutral-950 text-gray-400 border-white/5'
              }`}>
                {getStatusText()}
              </div>
            </div>
          </div>

          {/* Action trigger buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-4 border-t border-[#1a1a1a]">
            {isPlaying ? (
              <button
                onClick={() => {
                  setIsPlaying(false);
                  audio.playChime(2);
                }}
                className="col-span-2 py-2 border border-[#00ccff]/30 bg-[#00ccff]/5 text-[#00ccff] font-bold text-[10px] tracking-widest uppercase hover:bg-[#00ccff]/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5 fill-[#00ccff]" /> PAUSE ENGINE
              </button>
            ) : (
              <button
                onClick={() => {
                  if (isComplete) {
                    handleReset();
                  } else {
                    setIsPlaying(true);
                    if (nodes.every(n => n.state === 'susceptible')) {
                      // Automatically inject patient zero
                      setNodes(prev => initializePatientZero(prev));
                    } else if (!startTime) {
                      setStartTime(Date.now());
                    }
                  }
                }}
                className="col-span-2 py-2 bg-[#00ff88] text-black font-extrabold text-[10px] tracking-widest uppercase hover:bg-[#00e077] transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-black" /> {isComplete ? 'REPLAY PROTOCOL' : 'LAUNCH ENGINE'}
              </button>
            )}

            <button
              onClick={() => {
                handleReset();
              }}
              className="py-1.5 border border-white/5 bg-[#121212] text-gray-400 font-bold text-[9px] tracking-wider uppercase hover:text-white hover:bg-neutral-900 transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> RESET
            </button>

            <button
              onClick={() => {
                handleStep();
              }}
              disabled={isPlaying || isComplete}
              className="py-1.5 border border-white/5 bg-[#121212] text-gray-400 font-bold text-[9px] tracking-wider uppercase hover:text-[#00ff88] hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3" /> STEP
            </button>
          </div>
        </div>

        {/* CENTER PANEL: NETWORK CANVAS (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between border border-[#1a1a1a] bg-[#0c0c0c] relative min-h-[440px]" id="gossip-center-panel">
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#00ff88]" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#00ff88]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#00ff88]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#00ff88]" />

          <div className="p-3 border-b border-[#1a1a1a] flex justify-between items-center bg-[#070707]">
            <span className="text-[10px] text-[#00ff88] font-black tracking-widest uppercase flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#00ff88]" /> // LIVE NODE NETWORK MAP (CACC MESH)
            </span>
            <span className="text-[8px] text-gray-500 font-bold tracking-wider">PLANE // ACTIVE_LINKS</span>
          </div>

          {/* SVG Canvas Area */}
          <div className="flex-1 relative flex items-center justify-center bg-[#080808] p-1 overflow-hidden min-h-[380px]">
            {/* Background static matrix dots */}
            <div className="absolute inset-0 bg-[radial-gradient(#112215_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-25 pointer-events-none" />

            <svg viewBox="0 0 580 380" className="w-full h-full select-none z-10" style={{ maxHeight: '380px' }}>
              {/* 1. Render passive network mesh edges */}
              <g id="network-edges">
                {nodes.map(node => 
                  node.neighbors.map(neighborIdx => {
                    // Prevent duplicate line drawing (draw only once for undirected link)
                    if (node.id > neighborIdx) return null;
                    const neighbor = nodes[neighborIdx];
                    if (!neighbor) return null;

                    // Highlight line if part of active transmissions
                    const isActive = activeTransmissions.some(
                      t => (t.from === node.id && t.to === neighborIdx) || (t.from === neighborIdx && t.to === node.id)
                    );

                    return (
                      <line
                        key={`edge-${node.id}-${neighborIdx}`}
                        x1={node.x}
                        y1={node.y}
                        x2={neighbor.x}
                        y2={neighbor.y}
                        stroke={isActive ? '#00ccff' : '#142218'}
                        strokeWidth={isActive ? 1.5 : 1}
                        strokeOpacity={isActive ? 0.9 : 0.65}
                        className={isActive ? 'animate-dash-arrow' : ''}
                      />
                    );
                  })
                )}
              </g>

              {/* 2. Render flying transmission dots */}
              <g id="transmission-payloads">
                {activeTransmissions.map((t, idx) => {
                  const fromNode = nodes[t.from];
                  const toNode = nodes[t.to];
                  if (!fromNode || !toNode) return null;

                  return (
                    <circle key={`payload-${idx}`} r="3" fill="#00ccff" className="shadow-lg shadow-[#00ccff]/50">
                      <animate attributeName="cx" from={fromNode.x} to={toNode.x} dur="0.45s" repeatCount="indefinite" />
                      <animate attributeName="cy" from={fromNode.y} to={toNode.y} dur="0.45s" repeatCount="indefinite" />
                    </circle>
                  );
                })}
              </g>

              {/* 3. Render circular nodes */}
              <g id="network-nodes">
                {nodes.map(node => {
                  const isSusceptible = node.state === 'susceptible';
                  const isInfected = node.state === 'infected';
                  const isTransmitting = node.state === 'transmitting';

                  // Dynamic sizing/glow based on consensus metrics
                  const activityGlow = Math.min(8, node.activityLevel * 1.5);
                  
                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => handleNodeClick(node)}
                    >
                      {/* Pulse outer glow for active infected/transmitting nodes */}
                      {!isSusceptible && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="12"
                          fill="none"
                          stroke={isTransmitting ? '#00ccff' : '#00ff88'}
                          strokeWidth={2 + activityGlow}
                          className="pulse-ring-glow"
                        />
                      )}

                      {/* Main node bubble */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="10"
                        fill={isSusceptible ? '#151515' : isTransmitting ? '#00ccff' : '#00ff88'}
                        stroke={isSusceptible ? '#1c3d25' : isTransmitting ? '#00ccff' : '#00ff88'}
                        strokeWidth={1.5}
                        className="transition-all duration-300 group-hover:scale-110"
                      />

                      {/* Monospace interior node code (e.g. 07 for N07) */}
                      <text
                        x={node.x}
                        y={node.y + 3}
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="black"
                        fontFamily="monospace"
                        fill={isSusceptible ? '#00ff88' : '#010f01'}
                        fillOpacity={isSusceptible ? 0.35 : 1}
                        className="pointer-events-none select-none font-extrabold"
                      >
                        {String(node.id + 1).padStart(2, '0')}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Quick manual overlay instructions */}
            {infectionMode === 'manual' && nodes.every(n => n.state === 'susceptible') && (
              <div className="absolute inset-0 bg-black/45 flex flex-col justify-center items-center pointer-events-none text-center p-6 z-20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ccff] animate-ping mb-2" />
                <span className="text-xs font-bold text-[#00ccff] uppercase tracking-widest">// OPERATOR ACTION REQUIRED</span>
                <p className="text-[10px] text-gray-400 uppercase mt-1 max-w-xs leading-normal">
                  Click any node on the mesh grid to deploy patient zero and begin gossip convergence simulation.
                </p>
              </div>
            )}

            {/* Hover tooltip HUD overlay */}
            {hoveredNode && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/90 border border-white/10 p-2 font-mono text-[9px] text-gray-300 grid grid-cols-2 gap-x-4 gap-y-1 z-30 select-none shadow-2xl pointer-events-none">
                <div>NODE ID: <strong className="text-[#00ff88]">{hoveredNode.label}</strong></div>
                <div>STATE: <strong className={hoveredNode.state === 'susceptible' ? 'text-gray-500' : 'text-[#00ff88]'}>{hoveredNode.state.toUpperCase()}</strong></div>
                <div>ROUND INFECTED: <strong className="text-[#00ccff]">{hoveredNode.roundInfected !== null ? hoveredNode.roundInfected : 'N/A'}</strong></div>
                <div>GOSSIP ROUNDS: <strong className="text-[#ff6b35]">{hoveredNode.activityLevel} times</strong></div>
                <div className="col-span-2 text-gray-500 text-[8px] uppercase">NEIGHBORS: {hoveredNode.neighbors.map(idx => `N${String(idx+1).padStart(2, '0')}`).join(', ')}</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ANALYTICS SHELL (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between border border-[#1a1a1a] bg-[#0d0d0d] p-4 relative" id="gossip-right-panel">
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#00ff88]" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#00ff88]" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#00ff88]" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#00ff88]" />

          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {/* Live Chart Section */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#00ccff] font-bold tracking-widest uppercase block">// PROPAGATION CURVE</span>
              
              <div className="bg-[#050505] border border-white/5 p-1 h-[140px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={history.length > 0 ? history : [{ round: 0, reachedPercent: 0 }]}
                    margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="gossipGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#121a14" />
                    <XAxis 
                      dataKey="round" 
                      stroke="#333" 
                      fontSize={8} 
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#333" 
                      fontSize={8} 
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', borderColor: '#1a1a1a', borderRadius: '0px', fontFamily: 'monospace', fontSize: '9px' }}
                      labelStyle={{ color: '#00ff88', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="reachedPercent" 
                      stroke="#00ff88" 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill="url(#gossipGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between font-mono text-[7px] text-gray-500 uppercase tracking-widest px-1 font-bold">
                <span>RND 0</span>
                <span>% COVERAGE (TARGET: 100)</span>
              </div>
            </div>

            {/* Scrollable live terminal logs */}
            <div className="space-y-1.5 flex-1 flex flex-col justify-between min-h-[140px]">
              <span className="text-[10px] text-[#00ccff] font-bold tracking-widest uppercase block flex items-center gap-1">
                <TerminalIcon className="w-3.5 h-3.5" /> // ROUND LOG
              </span>
              
              <div className="bg-[#050505] border border-white/5 p-2 h-[130px] overflow-y-auto font-mono text-[8.5px] space-y-1 terminal-scroll select-none text-left">
                {logs.length > 0 ? (
                  logs.map((log, idx) => {
                    let colorClass = 'text-gray-400';
                    if (log.includes('✓')) colorClass = 'text-[#00ff88] font-bold';
                    else if (log.includes('⚠') || log.includes('⚡')) colorClass = 'text-[#ff6b35] font-bold';
                    else if (log.includes('[RND')) colorClass = 'text-[#00ccff]';
                    
                    return (
                      <div key={idx} className={`${colorClass} leading-tight uppercase`}>
                        {log}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-600 italic uppercase">Awaiting epidemic protocol startup...</div>
                )}
              </div>
            </div>

            {/* Dynamic theoretical node information block */}
            <div className="bg-[#050505] border border-white/5 p-2.5 text-left text-[8.5px] leading-relaxed text-gray-500 uppercase border-t border-[#1a1a1a]">
              <span className="text-[#00ff88] font-black block mb-0.5">// ALGORITHM NOTE:</span>
              Each round, every infected node selects F random peers (fanout=F) and shares state. Convergence guaranteed in O(log N) rounds. Used in De-Queue CACC for distributed zone agreement across ESP32 mesh.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
