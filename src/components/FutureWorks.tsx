// /src/components/FutureWorks.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Cpu, 
  Rocket, 
  LineChart, 
  CheckCircle, 
  Network, 
  Terminal, 
  Gauge, 
  Workflow,
  Sparkles
} from 'lucide-react';
import { audio } from '../lib/audio';

interface FutureProject {
  id: string;
  title: string;
  codename: string;
  timeline: string;
  progress: number; // 0 to 100
  conceptualFramework: string;
  targetStack: string[];
  metrics: { label: string; value: string }[];
  schematicAscii: string;
}

const FUTURE_WORKS: FutureProject[] = [
  {
    id: 'f-chronos',
    title: 'Decentralized Quantum Ledger',
    codename: 'PROJECT CHRONOS',
    timeline: 'Q3 2026 - Q1 2027',
    progress: 35,
    conceptualFramework: 'Layer-1 consensus framework engineered to defend critical telemetry nodes against Shor\'s algorithm threat vectors utilizing lattice-based cryptography signatures.',
    targetStack: ['Rust', 'WebAssembly', 'CRYSTALS-Dilithium', 'gRPC', 'RocksDB'],
    metrics: [
      { label: 'Target Latency', value: '< 2.5ms' },
      { label: 'Resistance standard', value: 'NIST Round 3 Post-Quantum' }
    ],
    schematicAscii: `
  [ NODE_A ] -- ( lattice sig ) --> [ MEMPOOL ]
       |                                |
  ( quantum check )              ( verified slot )
       v                                v
  [ SECURE_BLOCK ] <================ [ LEDGER_A ]
    `
  },
  {
    id: 'f-aether',
    title: 'Neural Mesh Local Routing',
    codename: 'PROJECT AETHERNET',
    timeline: 'Q4 2026',
    progress: 60,
    conceptualFramework: 'Adaptive ad-hoc routing protocol utilizing decentralized neural weight matrices computed locally inside hardware endpoints to self-heal communication networks under heavy spectrum jamming.',
    targetStack: ['Go', 'TensorFlow Lite', 'eBPF', 'BLE Mesh', 'protobuf'],
    metrics: [
      { label: 'Self-Heal Speed', value: '180ms adaptive failover' },
      { label: 'Spectra Range', value: '2.4GHz - 5.8GHz ad-hoc' }
    ],
    schematicAscii: `
     +----------+        [ BLE MESH NETWORK ]
     | ESP32-A1 | <====> [ Dynamic Path ] <====> [ ESP32-B2 ]
     +----------+                                +----------+
          ^                                           ^
          | ( local weights )       ( local weights ) |
     [ TF-LITE NODE ]                           [ TF-LITE NODE ]
    `
  },
  {
    id: 'f-deepharp',
    title: 'Algorithmic Synthesizer Core',
    codename: 'PROJECT DEEPHARP',
    timeline: 'Q1 2027',
    progress: 15,
    conceptualFramework: 'Mathematical polyphonic audio generator translating live network flow packets (IP headers, size, delta time) directly into dynamic modular soundscapes.',
    targetStack: ['TypeScript', 'Web Audio API', 'Tone.js', 'WebSockets', 'RxJS'],
    metrics: [
      { label: 'Voices Polyphony', value: '64 simultaneous oscillators' },
      { label: 'Sync resolution', value: 'Phase-locked microsecond clock' }
    ],
    schematicAscii: `
  IP PACKET --> [ PARSER ] --> [ PITCH MATRIX ] --> [ VCA OSC ]
                                                           |
  TIME DELTA -> [ DECAY ]  --> [ LFO FILTER ]  <==========+
    `
  }
];

export default function FutureWorks() {
  const [selectedProject, setSelectedProject] = useState<FutureProject>(FUTURE_WORKS[0]);

  return (
    <div className="space-y-6 flex flex-col select-none animate-fadeIn" id="future-works-view">
      
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <div className="space-y-1">
          <span className="font-mono text-xs text-[#10B981] tracking-widest uppercase block font-bold">
            // CONCEPTUAL ROADMAP // INITIATIVE VECTOR
          </span>
          <h2 className="text-4xl font-black tracking-tighter text-white font-sans uppercase">
            FUTURE WORKS
          </h2>
        </div>
        <div className="flex items-center gap-2 border border-[#10B981]/20 px-3 py-1 bg-[#10B981]/5">
          <Sparkles className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
          <span className="font-mono text-[9px] text-[#10B981] uppercase tracking-widest font-black">
            Pipeline Live
          </span>
        </div>
      </div>

      <p className="text-gray-300 font-mono text-xs leading-relaxed max-w-xl select-none uppercase tracking-wide">
        Advanced prototyping projects designed to push the computational envelope. Selecting a research folder opens the active architectural parameters ledger.
      </p>

      {/* Main split grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left projects pipeline listing */}
        <div className="md:col-span-5 flex flex-col gap-3 select-none">
          {FUTURE_WORKS.map((proj) => {
            const isSelected = selectedProject.id === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => {
                  audio.playChime(4);
                  setSelectedProject(proj);
                }}
                className={`border rounded-none p-4 cursor-pointer text-left transition-all duration-300 select-none w-full flex flex-col gap-2.5 relative overflow-hidden interactive-node ${
                  isSelected
                    ? 'bg-[#10B981]/5 border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                    : 'bg-[#121212]/30 border-[#222222] hover:border-white/20 hover:bg-[#121212]/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[8px] text-gray-500 tracking-widest font-black uppercase">
                    {proj.timeline}
                  </span>
                  <span className="font-mono text-[8px] text-[#10B981] tracking-widest font-black uppercase border border-[#10B981]/20 px-1 py-0.5 rounded-none bg-[#10B981]/5">
                    {proj.codename}
                  </span>
                </div>

                <span className="font-mono text-xs font-black text-white block tracking-wider uppercase">
                  {proj.title}
                </span>

                {/* Progress Bar */}
                <div className="space-y-1 w-full pt-1">
                  <div className="flex justify-between font-mono text-[8px] text-gray-500">
                    <span>PROTOTYPE PHASE</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-[#10B981]/60 to-[#10B981] transition-all duration-500 shadow-[0_0_6px_#10B981]" 
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right blueprints showcase */}
        <div className="md:col-span-7 border border-[#222222] bg-[#121212] rounded-none p-5 flex flex-col justify-between select-none relative overflow-hidden">
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-[#10B981]" />
                  <span className="font-mono text-xs text-[#10B981] font-black tracking-widest uppercase">
                    {selectedProject.codename}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-gray-500 font-bold">{selectedProject.timeline}</span>
              </div>

              {/* Description */}
              <p className="text-gray-300 font-mono text-xs leading-relaxed uppercase tracking-wider">
                {selectedProject.conceptualFramework}
              </p>

              {/* Target Tech Stack */}
              <div className="space-y-1.5 pt-1">
                <span className="font-mono text-[8px] text-gray-500 font-black tracking-widest uppercase block">// TARGET RESEARCH STACK:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.targetStack.map((tag, tIdx) => (
                    <span key={tIdx} className="font-mono text-[9px] text-[#10B981] border border-[#10B981]/20 bg-[#10B981]/5 px-2 py-0.5 rounded-none uppercase font-black">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* System architecture schematic */}
              <div className="space-y-1.5 pt-2">
                <span className="font-mono text-[8px] text-gray-500 font-black tracking-widest uppercase block">// SCHEMATIC TOPOLOGY LOGS:</span>
                <pre className="w-full bg-[#080808] border border-[#202020] p-3 text-[9px] text-emerald-500/80 font-mono leading-normal overflow-x-auto text-left shadow-inner rounded-none select-all">
                  {selectedProject.schematicAscii.trim()}
                </pre>
              </div>

            </div>

            {/* Metrics */}
            <div className="border-t border-[#222222] pt-4 mt-3">
              <div className="grid grid-cols-2 gap-4">
                {selectedProject.metrics.map((metric, mIdx) => (
                  <div key={mIdx} className="bg-[#0c0c0c] border border-[#222222] p-2.5 rounded-none flex flex-col justify-center">
                    <span className="font-mono text-[8px] text-gray-500 tracking-wider block uppercase font-bold">{metric.label}</span>
                    <span className="font-mono text-xs font-black text-[#10B981]">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
