// /src/components/Extracurriculars.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Users, 
  Target, 
  Bookmark, 
  Activity,
  Award
} from 'lucide-react';
import { audio } from '../lib/audio';

interface ActivityRecord {
  id: string;
  title: string;
  role: string;
  location: string;
  timeline: string;
  description: string;
  outcomes: string[];
  teamSize: string;
  badge: string;
}

const ACTIVITIES: ActivityRecord[] = [
  {
    id: 'act-hack',
    title: 'University Hackathon Organization Committee',
    role: 'Technical & RF Lead Organizer',
    location: 'NIST Campus Assembly',
    timeline: '2025 - 2026',
    description: 'Spearheaded technical setup, BLE sensing nodes tracking metrics, and localized scoring dashboard deployment for 400+ developers, coordinating active real-time infrastructure and server orchestration.',
    outcomes: [
      'Engineered an offline-first BLE attendee radar tracking flow reducing friction',
      'Configured local server network preserving 100% uptime under concurrent requests',
      'Coordinated hardware inventory worth over $5,000 for smart prototyping'
    ],
    teamSize: '15 Coordinators',
    badge: 'COMMUNITY IMPACT'
  },
  {
    id: 'act-club',
    title: 'Open Source Hardware & IoT Research Club',
    role: 'Vice President & System Educator',
    location: 'Research Wing',
    timeline: '2024 - 2025',
    description: 'Designed and conducted hands-on, micro-modular bootcamps centered on ESP32 development, BLE packet sniffing, and low-latency system architectures, guiding over 120 aspiring engineers.',
    outcomes: [
      'Published 5 open-source firmware repositories with extensive hardware diagrams',
      'Mentored 3 student projects succeeding in regional innovative awards',
      'Structured structural documentation helping newcomers write clean micro-python loops'
    ],
    teamSize: '80+ Members',
    badge: 'TECHNICAL LEADERSHIP'
  },
  {
    id: 'act-rural',
    title: 'IoT Telemetry Rural Deployment Initiative',
    role: 'Volunteer Hardware Integrator',
    location: 'Odisha Rural Outskirts',
    timeline: 'Summer 2024',
    description: 'Volunteered to design and deploy low-cost solar-powered remote soil moisture monitoring telemetry setups utilizing ad-hoc ESP32 networks, transmitting parameter feeds to agricultural nodes.',
    outcomes: [
      'Deployed 8 standalone solar-powered telemetric nodes across remote test farms',
      'Reduced component costs by 45% using customized PCB integration profiles',
      'Conducted local language sessions explaining simple system maintenance'
    ],
    teamSize: '5 Volunteers',
    badge: 'HUMANITARIAN WORK'
  }
];

export default function Extracurriculars() {
  const [selectedAct, setSelectedAct] = useState<ActivityRecord>(ACTIVITIES[0]);

  return (
    <div className="space-y-6 flex flex-col select-none animate-fadeIn" id="extracurriculars-view">
      
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <div className="space-y-1">
          <span className="font-mono text-xs text-[#10B981] tracking-widest uppercase block font-bold">
            // HISTORICAL INVOLVEMENTS // FIELD OPERATIONS
          </span>
          <h2 className="text-4xl font-black tracking-tighter text-white font-sans uppercase">
            EXTRA-CURRICULARS
          </h2>
        </div>
        <div className="flex items-center gap-2 border border-[#10B981]/20 px-3 py-1 bg-[#10B981]/5">
          <Activity className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="font-mono text-[9px] text-[#10B981] uppercase tracking-widest font-black">
            Archive Loaded
          </span>
        </div>
      </div>

      <p className="text-gray-300 font-mono text-xs leading-relaxed max-w-xl select-none uppercase tracking-wide">
        Logs of community initiatives, leadership roles, and volunteer hardware deployments. Select an entry to read the field report.
      </p>

      {/* Split grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left side timeline cards */}
        <div className="md:col-span-5 flex flex-col gap-3 select-none">
          {ACTIVITIES.map((act) => {
            const isSelected = selectedAct.id === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  audio.playChime(4);
                  setSelectedAct(act);
                }}
                className={`border rounded-none p-4 cursor-pointer text-left transition-all duration-300 select-none w-full flex flex-col gap-2 relative overflow-hidden interactive-node ${
                  isSelected
                    ? 'bg-[#10B981]/5 border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                    : 'bg-[#121212]/30 border-[#222222] hover:border-white/20 hover:bg-[#121212]/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[8px] text-gray-500 tracking-widest font-black uppercase">
                    {act.timeline}
                  </span>
                  <span className="font-mono text-[8px] text-[#10B981] tracking-widest font-black uppercase border border-[#10B981]/20 px-1.5 py-0.5 rounded-none bg-[#10B981]/5">
                    {act.badge}
                  </span>
                </div>

                <span className="font-mono text-xs font-black text-white block tracking-wider uppercase">
                  {act.title}
                </span>

                <span className="font-mono text-[10px] text-gray-400 block uppercase">
                  Role: {act.role}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side Detailed Field report */}
        <div className="md:col-span-7 border border-[#222222] bg-[#121212] rounded-none p-5 flex flex-col justify-between select-none relative overflow-hidden">
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#222222] pb-2 gap-2">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] text-[#10B981] font-bold tracking-widest block uppercase">// DEPLOYMENT FIELD REPORT</span>
                  <h3 className="font-mono text-xs font-black text-white tracking-widest uppercase">{selectedAct.title}</h3>
                </div>
                <Trophy className="w-5 h-5 text-[#10B981] shrink-0" />
              </div>

              {/* Roles and Metadata details */}
              <div className="grid grid-cols-2 gap-3 bg-[#080808] border border-[#202020] p-3 rounded-none">
                <div className="space-y-1 font-mono text-[9px] leading-tight">
                  <span className="text-gray-500 block uppercase font-bold">ASSIGNED ROLE:</span>
                  <span className="text-[#10B981] font-black uppercase">{selectedAct.role}</span>
                </div>

                <div className="space-y-1 font-mono text-[9px] leading-tight">
                  <span className="text-gray-500 block uppercase font-bold">OPERATIONAL AREA:</span>
                  <span className="text-gray-300 font-bold uppercase">{selectedAct.location}</span>
                </div>

                <div className="space-y-1 font-mono text-[9px] leading-tight pt-2 border-t border-white/5">
                  <span className="text-gray-500 block uppercase font-bold">TIMELINE VECTOR:</span>
                  <span className="text-gray-300 font-bold uppercase">{selectedAct.timeline}</span>
                </div>

                <div className="space-y-1 font-mono text-[9px] leading-tight pt-2 border-t border-white/5">
                  <span className="text-gray-500 block uppercase font-bold">TEAM MAGNITUDE:</span>
                  <span className="text-gray-300 font-bold uppercase">{selectedAct.teamSize}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 font-mono text-xs leading-relaxed uppercase tracking-wider">
                {selectedAct.description}
              </p>

              {/* Key outcomes list */}
              <div className="space-y-2 pt-1">
                <span className="font-mono text-[8px] text-gray-500 font-black tracking-widest uppercase block">// MEASURABLE KEY OUTCOMES:</span>
                <div className="space-y-1.5">
                  {selectedAct.outcomes.map((outcome, oIdx) => (
                    <div key={oIdx} className="flex items-start gap-2 text-xs font-mono">
                      <Target className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span className="text-gray-300 uppercase text-[10px] tracking-wider leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
