import { useState, useEffect } from 'react';
import { TabId, Tab, Project, SkillCategory } from './types';
import { audio } from './lib/audio';
import ParticleCanvas from './components/ParticleCanvas';
import ThunderWorldMap from './components/ThunderWorldMap';
import AudioVisualizer from './components/AudioVisualizer';
import SkeuomorphicToggle from './components/SkeuomorphicToggle';
import CursorTrail from './components/CursorTrail';
import Terminal from './components/Terminal';
import Logo from './components/Logo';
import FourierEpicycles from './components/FourierEpicycles';
import SynthMatrix from './components/SynthMatrix';
import AcousticExplorer from './components/AcousticExplorer';
import SecureGallery from './components/SecureGallery';
import Certifications from './components/Certifications';
import FutureWorks from './components/FutureWorks';
import Extracurriculars from './components/Extracurriculars';
import GossipVisualizer from './components/GossipVisualizer';
import {
  Terminal as TerminalIcon,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  User,
  FolderGit2,
  Mail,
  Home,
  Github,
  Linkedin,
  ExternalLink,
  Sparkles,
  Cpu,
  Compass,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const SKILLS: SkillCategory[] = [
  {
    category: 'FRONTEND & WEB',
    items: ['ReactJS', 'JavaScript', 'Tailwind CSS', 'HTML & CSS', 'Bootstrap']
  },
  {
    category: 'BACKEND & DATABASES',
    items: ['Spring Boot', 'Java', 'NodeJS', 'ExpressJS', 'MySQL', 'MongoDB']
  },
  {
    category: 'HARDWARE & SYSTEMS',
    items: ['ESP32-WROOM-32', 'Raspberry Pi Zero 2W', 'BLE Sensing', 'MicroPython', 'Go', 'Docker', 'Kubernetes', 'AWS', 'Terraform']
  }
];

const PROJECTS: Project[] = [
  {
    id: 'de-queue',
    title: 'DE-QUEUE: PRIVACY-PRESERVING CROWD MANAGEMENT',
    description: 'Published crowd tracking research at GCON 2026 utilizing BLE RSSI, MAC clustering, and ESP32 nodes.',
    longDescription: 'Identified and corrected a previously undocumented BLE overcounting flaw caused by MAC address rotation, decreasing the error rate from 8.42x to 0.04x. Designed MRPC (MAC-Rotation-aware Proximity Clustering) algorithm. Mathematically proved privacy via Fano\'s inequality (< 18.2% max trajectory reconstruction), compliant with DPDP Act 2023. Successfully deployed physically on ESP32-WROOM-32 and Raspberry Pi Zero 2W nodes at NIST Canteen, reducing crowd variance by 74.7% - 79.5%.',
    role: 'Lead Researcher & Developer',
    year: '2026',
    tags: ['ESP32', 'MicroPython', 'FastAPI', 'WebSockets', 'React', 'Differential Privacy', 'SimPy'],
    metrics: [
      { label: 'Error Rate', value: '0.04x (vs 8.42x)' },
      { label: 'Variance Red.', value: '74.7% - 79.5%' }
    ],
    links: { github: 'https://github.com/10Durga' }
  },
  {
    id: 'go-extension',
    title: 'GO EXTENSION ARCHITECTURE',
    description: 'Multi-platform key remapper and browser settings daemon written in thread-safe Go.',
    longDescription: 'Designed a layered architectural layout for Chromium extensions (Chrome/Edge) paired with a thread-safe Go configuration daemon. Built an embedded real-time HTTP parameters dashboard allowing instant, seamless settings updates without system restarts, complete with infinite-loop key mapping prevention.',
    role: 'Solo Go Architect',
    year: '2025',
    tags: ['Go', 'Chromium Extension', 'Embedded Dashboard', 'Settings Sync', 'Concurrency'],
    metrics: [
      { label: 'Latency', value: '< 1ms' },
      { label: 'Sync Rate', value: 'Instant' }
    ],
    links: { github: 'https://github.com/10Durga' }
  },
  {
    id: 'visual-pos',
    title: 'FULL-STACK POS & VISUAL BILLING',
    description: 'ML-powered checkout with camera-based object detection, Spring Boot API, and React frontend.',
    longDescription: 'Developed a robust, modular Point of Sale platform integrating a ReactJS frontend and Spring Boot backend. Features secure transaction flows integrated with Razorpay, AWS deployment, and persistent storage via MySQL. Designed a novel camera-based visual billing interface using JavaScript computer vision for scanning items in real time.',
    role: 'IISER Intern Developer',
    year: '2025',
    tags: ['Spring Boot', 'Java', 'ReactJS', 'MySQL', 'AWS', 'Razorpay', 'Computer Vision'],
    metrics: [
      { label: 'Database', value: 'MySQL' },
      { label: 'Cloud Ingress', value: 'AWS Standard' }
    ],
    links: { github: 'https://github.com/10Durga' }
  }
];

export default function App() {
  const [entered, setEntered] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(PROJECTS[0]);
  const [aboutSubTab, setAboutSubTab] = useState<'profile' | 'experience' | 'publications' | 'academics' | 'credentials'>('profile');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [matrixEnabled, setMatrixEnabled] = useState<boolean>(false);
  const [matrixStep, setMatrixStep] = useState<number>(-1);
  const [beatTick, setBeatTick] = useState<boolean>(false);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [binaryGrid, setBinaryGrid] = useState<number[]>(() => {
    // Generate a solvable "Lights Out" puzzle by starting with all 1s (target state)
    // and simulating random clicks backwards to scramble it into a puzzle.
    const grid = Array(12).fill(1);
    const scrambleClicks = [1, 4, 7, 10, 2]; // hardcoded random pattern for puzzle
    scrambleClicks.forEach(idx => {
      grid[idx] = grid[idx] === 1 ? 0 : 1;
      if (idx % 6 !== 0) grid[idx - 1] = grid[idx - 1] === 1 ? 0 : 1;
      if (idx % 6 !== 5) grid[idx + 1] = grid[idx + 1] === 1 ? 0 : 1;
      if (idx >= 6) grid[idx - 6] = grid[idx - 6] === 1 ? 0 : 1;
      if (idx < 6) grid[idx + 6] = grid[idx + 6] === 1 ? 0 : 1;
    });
    return grid;
  });

  // Automatic rhythmic sequencer loop for the contact view matrix
  useEffect(() => {
    if (!matrixEnabled || manualMode || activeTab !== 'contact') {
      if (matrixEnabled && activeTab !== 'contact') {
        // Automatically disable matrix hardware switch if navigating away
        setMatrixEnabled(false);
      }
      setMatrixStep(-1);
      setBeatTick(false);
      return;
    }

    // A beautiful syncopated rhythmic progression in G-minor Pentatonic scale (indices 0 to 11)
    const pattern = [0, 2, 3, 5, 7, 8, 10, 11, 10, 8, 7, 5, 3, 2, 3, 5];
    let currentIdx = 0;

    const intervalId = setInterval(() => {
      const scaleIndex = pattern[currentIdx] % 12;
      setMatrixStep(scaleIndex);
      audio.playChime(scaleIndex);
      setBeatTick((prev) => !prev);
      currentIdx = (currentIdx + 1) % pattern.length;
    }, 280);

    return () => {
      clearInterval(intervalId);
    };
  }, [matrixEnabled, manualMode, activeTab]);

  // Load unlock progress and sound preference from local storage on mount
  useEffect(() => {
    const savedUnlock = localStorage.getItem('portfolio_unlocked') === 'true';
    if (savedUnlock) {
      setIsUnlocked(true);
    }

    // Dynamic UTC clock mimicking standard terminal metrics
    const updateTime = () => {
      const d = new Date();
      const utcString = d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setCurrentTime(utcString);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Keep state in sync with global audio status (solves desync issues across multiple components)
    const unsubscribe = audio.subscribe((playing) => {
      setIsMuted(!playing);
    });
    return unsubscribe;
  }, []);

  const handleEnterExperience = () => {
    setEntered(true);
    // Initialize & unmute audio context under browser user-interaction rules
    const status = audio.toggle(true);
    setIsMuted(!status);
  };

  const handleToggleMute = () => {
    const status = audio.toggle();
    setIsMuted(!status);
  };

  const handleUnlockSequence = () => {
    setIsUnlocked(true);
    localStorage.setItem('portfolio_unlocked', 'true');
    // Switch navigation automatically to newly revealed Projects page
    setTimeout(() => {
      setActiveTab('projects');
    }, 500);
  };

  const handleLockSequence = () => {
    setIsUnlocked(false);
    localStorage.removeItem('portfolio_unlocked');
    setActiveTab('terminal');
  };

  const handleTabChange = (tabId: TabId, isLocked: boolean) => {
    if (isLocked) {
      audio.playErrorSound();
      return;
    }
    audio.playChime(6); // play minor pentatonic note on menu click
    setActiveTab(tabId);
    setMatrixEnabled(false);
    setMenuOpen(false);
  };

  const TABS: Tab[] = [
    { id: 'home', label: 'HOME // ENTRY', isLocked: false },
    { id: 'about', label: 'ABOUT // PROFILE', isLocked: false },
    { id: 'terminal', label: 'GATEWAY // SHELL', isLocked: false },
    { id: 'gossip', label: 'CACC // GOSSIP ENGINE', isLocked: false },
    { id: 'projects', label: 'PROJECTS // DECRYPTED', isLocked: !isUnlocked },
    { id: 'synth', label: 'SYNTH // MATRIX', isLocked: !isUnlocked },
    { id: 'gallery', label: 'SECURE GALLERY // DRIVE', isLocked: !isUnlocked },
    { id: 'certs', label: 'CERTIFICATIONS // DEGREES', isLocked: !isUnlocked },
    { id: 'future', label: 'FUTURE WORKS // ROADMAP', isLocked: !isUnlocked },
    { id: 'activities', label: 'EXTRACURRICULARS // PAST', isLocked: !isUnlocked },
    { id: 'contact', label: 'CONTACT // LINKS', isLocked: !isUnlocked },
  ];

  // Helper function to play melodic notes on contact grid click
  const handleChimeMatrixClick = (idx: number) => {
    if (manualMode) {
      audio.playHarp(idx);
      setBinaryGrid((prev) => {
        const next = [...prev];
        
        // Toggle self and adjacent neighbors (cross pattern)
        const toggle = (i: number) => {
          if (i >= 0 && i < 12) next[i] = next[i] === 1 ? 0 : 1;
        };
        
        toggle(idx); // self
        if (idx % 6 !== 0) toggle(idx - 1); // left
        if (idx % 6 !== 5) toggle(idx + 1); // right
        if (idx >= 6) toggle(idx - 6); // up
        if (idx < 6) toggle(idx + 6); // down

        // If they light up all 12 nodes, play success chime and unlock
        if (next.every((val) => val === 1)) {
          audio.playSuccessSound();
          setIsUnlocked(true);
          localStorage.setItem('portfolio_unlocked', 'true');
        }
        return next;
      });
    } else {
      audio.playChime(idx);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#E0E0E0] relative overflow-hidden flex flex-col font-sans select-none selection:bg-[#10B981]/20 select-none">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
      
      {/* Retro scanline grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 retro-grid" />

      {/* Dynamic Background Constellation */}
      <ParticleCanvas />
      <ThunderWorldMap />

      {/* Spring-damped Custom Cursor */}
      <CursorTrail />

      {/* 1. Introductory Cinematic Overlay */}
      {!entered && (
        <div className="fixed inset-0 bg-[#040404] z-50 flex items-center justify-center overflow-y-auto select-none p-4 sm:p-8" id="gate-overlay">
          {/* Faded particle simulator layer behind gate */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none opacity-20 retro-grid" />
          
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10 my-auto py-6">
            
            {/* Left Column: Cheetah logo and primary title */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-6">
              {/* Golden Cheetah & Marble 1 Artwork Logo */}
              <Logo size={280} className="animate-fadeIn shadow-2xl border border-neutral-800 bg-black/40 p-1" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center text-[9px] text-[#DFBA5A] font-mono tracking-[0.45em] uppercase animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFBA5A]" />
                  Mainframe Connection: Standby
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase select-none font-sans" id="manifesto-header">
                  ANIRVARTI SATYA
                </h1>
                <p className="text-neutral-500 font-mono text-[9px] uppercase tracking-widest font-black">
                  Creative Technologist & System Architect
                </p>
              </div>
            </div>

            {/* Right Column: Poetic Manifesto and Gate Access */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6 border border-neutral-800/60 bg-[#0a0a0a]/85 backdrop-blur-md p-6 sm:p-8 rounded-none shadow-[2px_2px_20px_rgba(0,0,0,0.8)] relative max-h-[85vh] md:max-h-[70vh] overflow-hidden flex-1">
              
              {/* Tech details top bar */}
              <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3 font-mono text-[8px] text-neutral-500 uppercase tracking-widest font-bold">
                <span>[ MANIFESTO INDEX: 001 ]</span>
                <span className="text-[#DFBA5A] font-black">STORY PROTOCOL INITIALIZED</span>
              </div>

              {/* Scrollable Manifesto Section */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-2 terminal-scroll text-left">
                <div className="space-y-1">
                  <h2 className="text-[#DFBA5A] font-mono text-xs font-black tracking-[0.3em] uppercase block">
                    ANIRVARTI SATYA
                  </h2>
                  <span className="text-neutral-400 font-sans text-lg font-bold tracking-tight italic block">
                    Every legend begins at zero.
                  </span>
                </div>

                <div className="space-y-4 font-mono text-[11px] leading-relaxed text-neutral-300 uppercase tracking-wide">
                  <p className="border-l-2 border-[#DFBA5A]/50 pl-3">
                    I was not born at the summit.<br />
                    I began where every extraordinary journey begins—at 0.
                  </p>

                  <p>
                    The ground beneath me was never a limitation; it was my foundation.<br />
                    Every challenge became a lesson.<br />
                    Every setback became momentum.<br />
                    Every failure became another step toward greatness.
                  </p>

                  <p className="border-l-2 border-neutral-700 pl-3 text-neutral-400">
                    I am the cheetah.<br />
                    Not merely because it is the fastest creature on land,<br />
                    but because it refuses to stand still when there is a horizon left to chase.
                  </p>

                  <p>
                    Its spots are never identical.<br />
                    Neither is my journey.<br />
                    Every pattern tells a story.<br />
                    Every scar carries a lesson.<br />
                    Every experience shapes an identity that cannot be replicated.
                  </p>

                  <p className="border-l-2 border-[#DFBA5A]/50 pl-3">
                    Speed without purpose is meaningless.<br />
                    My race is not against others.<br />
                    It is against yesterday's version of myself.
                  </p>

                  <p className="text-white font-bold bg-[#DFBA5A]/5 border border-[#DFBA5A]/15 p-3">
                    The marble 1 before me is more than a number.<br />
                    It is discipline. It is excellence.<br />
                    It is the relentless pursuit of becoming the best, even when no one is watching.
                  </p>

                  <p>
                    I do not seek shortcuts.<br />
                    I seek mastery.
                  </p>

                  <p>
                    I believe that dreams are not achieved by talent alone, but through consistency, resilience, curiosity, and the courage to keep moving when the finish line is nowhere in sight.
                  </p>

                  <p className="text-[#DFBA5A] font-black text-center border-t border-b border-neutral-900 py-3.5 tracking-widest">
                    I WAS BORN AT 0. I AM BUILDING MYSELF INTO 1.
                  </p>

                  <p className="text-[10px] text-neutral-400 text-right italic font-sans pr-1">
                    "My destination is not simply to be Number One. My purpose is to become someone worthy of that position."
                  </p>
                </div>
              </div>

              {/* Bottom authorization actions */}
              <div className="pt-4 border-t border-neutral-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="font-mono text-[8px] text-neutral-600 uppercase tracking-widest leading-normal">
                  PORT: 3000 // SECURE GATEWAY INGRESS<br />
                  AUTHORIZING SENSORY SYNTHESIZER
                </div>

                <button
                  onClick={handleEnterExperience}
                  className="px-6 py-2.5 bg-transparent border border-[#DFBA5A] text-[#DFBA5A] font-mono text-[10px] tracking-[0.25em] uppercase rounded-none hover:bg-[#DFBA5A] hover:text-black hover:shadow-[0_0_20px_rgba(223,186,90,0.3)] transition-all duration-300 interactive-node flex items-center justify-center gap-2 group cursor-pointer"
                  id="enter-button"
                >
                  Enter Transmission
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
            
          </div>
        </div>
      )}

      {/* 2. Main Experience Layout (renders after entrance) */}
      {entered && (
        <div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 justify-between select-none">
          
          {/* Header */}
          <header className="flex items-center justify-between border-b border-[#222222] pb-5 shrink-0 select-none z-10 bg-[#080808]/40 backdrop-blur-md" id="main-header">
            <div className="flex items-center gap-3.5 select-none">
              <Logo size={42} animated={false} />
              <div className="flex flex-col">
                <span className="font-mono text-lg sm:text-xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#DFBA5A] via-[#FFF3C5] to-[#B58130] drop-shadow-[0_0_12px_rgba(223,186,90,0.75)]">ANIRVARTI SATYA</span>
                <span className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.2em] font-semibold">creative technologist</span>
              </div>
            </div>

            {/* Audio Waveform Widget & Skeuomorphic Audio Toggle */}
            <div className="flex items-center gap-4 sm:gap-5 bg-[#0b0b0b] border border-[#202020] px-3 sm:px-4 py-2 sm:py-2.5 rounded-none select-none relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),_0_2px_4px_rgba(0,0,0,0.4)]">
              {/* Return to 01 (Manifesto Gate) */}
              <button
                onClick={() => {
                  audio.playChime(1);
                  setEntered(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#DFBA5A]/30 bg-[#DFBA5A]/5 hover:bg-[#DFBA5A] text-[#DFBA5A] hover:text-black font-mono text-[9px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer interactive-node shadow-[0_0_8px_rgba(223,186,90,0.15)] hover:shadow-[0_0_15px_rgba(223,186,90,0.4)]"
                title="Return to Manifesto / Gateway"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">RETURN TO 01</span>
              </button>

              <div className="h-5 w-[1px] bg-neutral-800 hidden sm:block" />

              <AudioVisualizer isMuted={isMuted} />
              <SkeuomorphicToggle isOn={!isMuted} onToggle={handleToggleMute} />
            </div>
          </header>

          {/* Grid Layout containing Menu and Main Stage */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 my-8 items-start">
            
            {/* Sidebar Navigation */}
            <nav className="md:col-span-3 flex flex-col gap-2 select-none order-first md:order-last" id="sidebar-nav">
              
              {/* Skeuomorphic Miniature Circuit Breaker (MCB) Switch Station */}
              <div 
                className={`p-4 flex flex-col gap-3 select-none relative overflow-hidden transition-all duration-700 ease-in-out border ${
                  menuOpen 
                    ? 'border-[#10B981]/40 bg-gradient-to-b from-[#0b1b13] via-[#0e1210] to-[#0c0c0c] shadow-[0_0_35px_rgba(16,185,129,0.12),inset_0_0_25px_rgba(16,185,129,0.08)]' 
                    : 'border-neutral-950 bg-[#030303] shadow-[inset_0_4px_24px_rgba(0,0,0,0.98)]'
                }`}
              >
                {/* Background glow when ON */}
                {menuOpen && (
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#10B981]/5 blur-[35px] pointer-events-none animate-pulse" />
                )}

                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex flex-col">
                    <span className={`font-mono text-xs font-black tracking-widest uppercase transition-colors duration-500 ${
                      menuOpen ? 'text-white' : 'text-neutral-800'
                    }`}>
                      SYSTEM MAP
                    </span>
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-wider transition-colors duration-500 ${
                      menuOpen ? 'text-[#10B981]/60' : 'text-neutral-900'
                    }`}>
                      // MAIN_BUS: {menuOpen ? 'LATCHED' : 'TRIPPED'}
                    </span>
                  </div>

                  {/* Multi-Colored Blinking Neon LED Lamp */}
                  <div className={`flex items-center gap-2 border px-2.5 py-1 shadow-inner transition-colors duration-500 ${
                    menuOpen ? 'bg-[#050505] border-white/5' : 'bg-transparent border-neutral-950'
                  }`}>
                    <span className={`font-mono text-[7px] font-bold uppercase tracking-widest transition-colors duration-500 ${
                      menuOpen ? 'text-gray-500' : 'text-neutral-850'
                    }`}>
                      FEED:
                    </span>
                    <div 
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        menuOpen 
                          ? 'animate-colorBlink' 
                          : 'bg-neutral-950 border border-neutral-900 shadow-[0_0_2px_rgba(0,0,0,0.8)]'
                      }`} 
                      title={menuOpen ? 'Grid online - transmitting wave vectors' : 'Grid standby'}
                    />
                  </div>
                </div>

                <p className={`font-mono text-[11px] uppercase leading-relaxed tracking-wider relative z-10 transition-colors duration-500 font-medium ${
                  menuOpen ? 'text-[#10B981]/90 font-bold' : 'text-neutral-700/80'
                }`}>
                  Latching the high-load circuit-breaker establishes immediate structural directories mapping across local frame boundaries.
                </p>

                {/* The MCB Mechanical Leverage Mechanism */}
                <div className={`flex items-center justify-between border-t pt-3 relative z-10 transition-colors duration-500 ${
                  menuOpen ? 'border-white/5' : 'border-neutral-900/20'
                }`}>
                  <div className="flex flex-col">
                    <span className={`font-mono text-[8px] font-black tracking-widest uppercase transition-colors duration-300 ${menuOpen ? 'text-[#10B981]' : 'text-neutral-800'}`}>
                      CIRCUIT BREAKER
                    </span>
                    <span className={`font-mono text-[7px] transition-colors duration-300 ${menuOpen ? 'text-gray-500' : 'text-neutral-900'}`}>
                      [TYPE MCB-Q30]
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2.5">
                    {/* OFF Label */}
                    <span className={`font-mono text-[8px] font-black tracking-widest transition-colors duration-300 ${!menuOpen ? 'text-amber-500 font-black' : 'text-neutral-900'}`}>
                      TRIP
                    </span>

                    {/* Mechanical MCB Switch Toggle */}
                    <button
                      onClick={() => {
                        const targetState = !menuOpen;
                        audio.playMCBSwitchSound(targetState);
                        setMenuOpen(targetState);
                      }}
                      className="relative w-8 h-12 bg-neutral-950 border border-neutral-800 rounded-sm shadow-[inset_0_2px_5px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center cursor-pointer select-none group"
                      title="Flip main circuit breaker lever"
                    >
                      {/* Inner vertical track slot */}
                      <div className="absolute inset-y-1 w-1 bg-black rounded-sm pointer-events-none" />

                      {/* Small subtle micro status lights inside switch track */}
                      <div className={`absolute top-1 w-1 h-1 rounded-full transition-all duration-300 pointer-events-none ${menuOpen ? 'bg-emerald-500' : 'bg-neutral-900'}`} />
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full transition-all duration-300 pointer-events-none ${!menuOpen ? 'bg-amber-500' : 'bg-neutral-900'}`} />

                      {/* Lever Switch Handle */}
                      <div 
                        className={`absolute w-6 h-6 bg-gradient-to-b from-neutral-300 via-neutral-500 to-neutral-400 border border-neutral-600 rounded-sm shadow-[0_3px_5px_rgba(0,0,0,0.5)] transition-all duration-200 ease-in-out flex flex-col justify-between p-0.5 pointer-events-none ${
                          menuOpen 
                            ? '-translate-y-2.5' 
                            : 'translate-y-2.5'
                        }`}
                      >
                        {/* Metal horizontal ridges */}
                        <div className="w-full h-[1px] bg-white/35" />
                        <div className="w-full h-1 bg-black/20 rounded-xs" />
                        <div className="w-full h-[1px] bg-white/15" />
                      </div>
                    </button>

                    {/* ON Label */}
                    <span className={`font-mono text-[8px] font-black tracking-widest transition-colors duration-300 ${menuOpen ? 'text-[#10B981] font-black' : 'text-neutral-900'}`}>
                      LATCH
                    </span>
                  </div>
                </div>

              </div>

              {/* Collapsible System Tree Container */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden flex flex-col w-full relative ${
                  menuOpen 
                    ? 'max-h-[600px] opacity-100 mt-2 p-3 bg-[#0c0c0c]/80 border border-[#222222] backdrop-blur-md' 
                    : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                {/* Vertical Backbone tree line */}
                <div className="absolute left-[23px] top-6 bottom-8 w-[1px] bg-neutral-800 pointer-events-none" />

                <div className="space-y-1.5 relative z-10">
                  {TABS.map((tab, idx) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        style={{ 
                          transitionDelay: menuOpen ? `${idx * 70}ms` : '0ms',
                          transform: menuOpen ? 'translateX(0)' : 'translateX(-12px)',
                          opacity: menuOpen ? 1 : 0
                        }}
                        onClick={() => handleTabChange(tab.id, tab.isLocked)}
                        className={`flex items-center justify-between py-2.5 pr-3 text-left font-mono text-xs font-black tracking-wider transition-all duration-300 w-full interactive-node uppercase border rounded-none ${
                          isActive
                            ? 'text-[#10B981] bg-[#10B981]/5 border-[#10B981]/30 shadow-[inset_0_0_8px_rgba(16,185,129,0.04)] font-bold'
                            : 'text-gray-400 hover:text-white border-transparent hover:bg-white/5'
                        }`}
                      >
                        {/* Node Connector Line symbols for system map look */}
                        <div className="flex items-center gap-2.5 pl-1 w-full relative">
                          <span className="text-gray-600 font-bold tracking-normal select-none shrink-0">
                            {idx === TABS.length - 1 ? '└──' : '├──'}
                          </span>
                          
                          {/* Circle node dot */}
                          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 ${
                            isActive 
                              ? 'bg-[#10B981] shadow-[0_0_10px_#10B981] scale-125' 
                              : 'bg-neutral-800 border border-neutral-700'
                          }`} />

                          <span className="whitespace-normal break-words pr-1">{tab.label}</span>
                        </div>

                        {tab.isLocked ? (
                          <Lock className="w-3.5 h-3.5 text-rose-500/60 shrink-0" />
                        ) : (
                          isActive && <div className="w-1.5 h-1.5 bg-[#10B981] animate-ping shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Database State integrated inside System Map */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2 text-xs font-mono font-bold px-1 select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 uppercase tracking-wider">// COGNITIVE VAULT:</span>
                    {isUnlocked ? (
                      <span className="text-emerald-400 flex items-center gap-1.5 font-extrabold tracking-widest">
                        <Unlock className="w-3.5 h-3.5" /> DECRYPTED
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1.5 font-extrabold tracking-widest">
                        <Lock className="w-3.5 h-3.5 animate-pulse" /> CLASSIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal uppercase tracking-wider font-semibold">
                    {!isUnlocked ? (
                      'Decrypt mainframe using Terminal or Chime resonance workbench'
                    ) : (
                      'Port directories accessible'
                    )}
                  </p>

                  <div className="pt-3 border-t border-white/5 mt-1">
                    <button
                      onClick={() => {
                        audio.playChime(1);
                        setEntered(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#DFBA5A]/30 bg-[#DFBA5A]/5 hover:bg-[#DFBA5A] text-[#DFBA5A] hover:text-black font-mono text-[10px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer interactive-node shadow-[0_0_8px_rgba(223,186,90,0.15)] hover:shadow-[0_0_15px_rgba(223,186,90,0.35)]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      RETURN TO 01 (MANIFESTO)
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Stage (Content Display Container) */}
            <main className="md:col-span-9 flex flex-col justify-center min-h-[460px] relative select-none" id="main-content-stage">
              
              {/* Tab: HOME */}
              {activeTab === 'home' && (
                <div className="space-y-8 flex flex-col animate-fadeIn select-none" id="home-view">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#10B981] mb-2 uppercase tracking-[0.4em] block font-bold">// IDENTITY : ARCHITECT_V1.0.4</span>
                    <h1 className="text-5xl sm:text-[80px] md:text-[100px] leading-[0.85] font-black tracking-tighter text-white uppercase select-none">
                      Touch The<br />
                      <span className="text-stroke">Digital</span><br />
                      Matrices
                    </h1>
                  </div>

                  <p className="text-gray-300 font-mono text-xs leading-relaxed max-w-2xl select-none uppercase tracking-wide">
                    WELCOME TO MY ACOUSTIC-DIGITAL PORTAL. I AM A JAVA BACKEND AND EMBEDDED SYSTEMS ENGINEER MERGING MULTI-THREADED ARCHITECTURES WITH REAL-TIME SYNTHESIS. EXPERIMENT WITH THE PHYSICAL RESONANCE WORKBENCH BELOW TO UNLOCK PROTECTED SECTORS.
                  </p>

                  {/* Highly Interactive Musical Explorer Station */}
                  <AcousticExplorer onUnlockAll={handleUnlockSequence} isUnlocked={isUnlocked} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2 select-none">
                    <div className="border border-[#222222] bg-[#121212]/30 rounded-none p-5 hover:border-[#10B981]/40 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-[#10B981]" />
                        <span className="font-mono text-xs font-black text-white tracking-widest uppercase">The Terminal Quest</span>
                      </div>
                      <p className="text-gray-500 font-mono text-[11px] leading-relaxed select-none uppercase tracking-wide">
                        This repository is gated. Switch to the <b>GATEWAY // SHELL</b> tab and grep the system logs to recover credentials.
                      </p>
                    </div>

                    <div className="border border-[#222222] bg-[#121212]/30 rounded-none p-5 hover:border-[#10B981]/40 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-[#10B981]" />
                        <span className="font-mono text-xs font-black text-white tracking-widest uppercase">Acoustic Synth</span>
                      </div>
                      <p className="text-gray-500 font-mono text-[11px] leading-relaxed select-none uppercase tracking-wide">
                        The background atmosphere dynamically synthesizes audio tones, ensuring no external tracks are queried.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2 select-none">
                    <button
                      onClick={() => handleTabChange('about', false)}
                      className="px-6 py-3 bg-white text-black font-mono text-[11px] font-bold tracking-widest rounded-none hover:bg-gray-200 transition-colors interactive-node uppercase"
                    >
                      Read Profile // About
                    </button>
                    <button
                      onClick={() => handleTabChange('terminal', false)}
                      className="px-6 py-3 bg-transparent border border-[#222222] text-gray-300 font-mono text-[11px] tracking-widest rounded-none hover:border-[#10B981] hover:text-[#10B981] transition-all interactive-node uppercase"
                    >
                      Open Terminal Shell
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: ABOUT */}
              {activeTab === 'about' && (
                <div className="space-y-6 flex flex-col select-none" id="about-view">
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] text-[#10B981] tracking-[0.4em] uppercase block font-bold">// ARCHIVE : DOSSIER_M01</span>
                    <h2 className="text-4xl font-black tracking-tighter text-white font-sans uppercase">PROFESSIONAL DOSSIER</h2>
                  </div>

                  {/* Sub-tab Navigation */}
                  <div className="flex flex-wrap gap-2 border-b border-[#222222] pb-3" id="about-subtabs">
                    {(['profile', 'experience', 'publications', 'academics', 'credentials'] as const).map((subTab) => {
                      const isActive = aboutSubTab === subTab;
                      const labels: Record<string, string> = {
                        profile: '// 01 : PROFILE',
                        experience: '// 02 : CHRONOLOGY',
                        publications: '// 03 : PUBLICATIONS',
                        academics: '// 04 : ACADEMICS',
                        credentials: '// 05 : CREDENTIALS'
                      };
                      return (
                        <button
                          key={subTab}
                          onClick={() => {
                            audio.playChime(3);
                            setAboutSubTab(subTab);
                          }}
                          className={`px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-all duration-300 border ${
                            isActive
                              ? 'text-[#10B981] border-[#10B981]/50 bg-[#10B981]/5 font-bold'
                              : 'text-gray-500 border-transparent hover:text-white hover:bg-[#121212]'
                          } interactive-node`}
                        >
                          {labels[subTab]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-tab content */}
                  <div className="min-h-[300px] flex flex-col justify-between">
                    {aboutSubTab === 'profile' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#222222] bg-[#121212] p-5 select-none">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                            <Logo size={80} className="shrink-0 border border-[#222222] bg-black/60 p-1" />
                            <div>
                              <span className="font-mono text-[10px] text-[#10B981] font-bold tracking-widest block uppercase">// CANDIDATE IDENTITY SPECIFICATION</span>
                              <h3 className="text-2xl font-black text-white font-sans uppercase tracking-tight mt-1">SATYA PRAKASH</h3>
                              <span className="font-mono text-[10px] text-gray-500 block uppercase mt-0.5">Alias: ANIRVARTI SATYA</span>
                            </div>
                          </div>
                          <div className="font-mono text-left md:text-right">
                            <span className="text-[10px] text-gray-500 uppercase block">Focus Areas:</span>
                            <span className="text-xs text-[#10B981] font-bold uppercase block">Spring Boot // IoT Hardware // Crowd Safety</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="font-mono text-xs text-[#10B981] font-bold tracking-widest uppercase block">// PROFESSIONAL SUMMARY</span>
                          <p className="text-gray-300 font-mono text-xs leading-relaxed max-w-3xl uppercase">
                            I am SATYA PRAKASH, an enthusiastic Java Developer specializing in secure backend development (Spring Boot), hardware-software embedded systems (ESP32, Raspberry Pi Zero 2W), and robust full-stack applications. As a researcher, I designed the MRPC (MAC-Rotation-aware Proximity Clustering) algorithm and published pioneering work on privacy-preserving crowd management (DE-QUEUE) at GCON 2026. Online, I write, design, and research under my nickname ANIRVARTI SATYA, blending system-level robustness with highly refined interactive interfaces.
                          </p>
                        </div>

                        <div className="h-[1px] bg-[#222222]" />

                        {/* Skills Grid */}
                        <div className="space-y-4">
                          <span className="font-mono text-[11px] font-black tracking-[0.2em] text-white block uppercase">// COGNITIVE TECH INDEX</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
                            {SKILLS.map((cat, idx) => (
                              <div key={idx} className="border border-[#222222] bg-[#121212] rounded-none p-4 flex flex-col gap-3">
                                <span className="font-mono text-[11px] text-[#10B981] font-bold tracking-wider">{cat.category}</span>
                                <ul className="space-y-1.5 flex-1">
                                  {cat.items.map((skill, sIdx) => (
                                    <li key={sIdx} className="font-mono text-xs text-gray-500 flex items-center gap-2 uppercase">
                                      <span className="w-1.5 h-1.5 bg-[#10B981]" />
                                      {skill}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {aboutSubTab === 'experience' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                          <span className="font-mono text-xs text-[#10B981] font-bold tracking-widest uppercase block">// PROFESSIONAL CHRONOLOGY</span>
                          
                          {/* IISER Internship */}
                          <div className="border border-[#222222] bg-[#121212] p-5 relative">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                              <div>
                                <h3 className="font-mono text-xs font-black text-white uppercase">INTERNSHIP — IISER BERHAMPUR</h3>
                                <span className="font-mono text-[10px] text-gray-500 block uppercase">Software & ML Engineering Intern</span>
                              </div>
                              <span className="font-mono text-[10px] text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 mt-1 sm:mt-0 uppercase">MAY 2025 – JULY 2025</span>
                            </div>
                            <ul className="space-y-2 list-none pl-0">
                              <li className="font-mono text-xs text-gray-400 flex items-start gap-2.5">
                                <span className="text-[#10B981] select-none mt-0.5">▪</span>
                                <span>Built <b className="text-white">Kirana</b>, an ML-powered object detection application designed for inventory management and billing systems at small-scale neighborhood stores.</span>
                              </li>
                              <li className="font-mono text-xs text-gray-400 flex items-start gap-2.5">
                                <span className="text-[#10B981] select-none mt-0.5">▪</span>
                                <span>Developed and maintained a high-performance POS system using React.js frontend, Spring Boot backend, and MySQL database structure; integrated Razorpay APIs and deployed on AWS.</span>
                              </li>
                              <li className="font-mono text-xs text-gray-400 flex items-start gap-2.5">
                                <span className="text-[#10B981] select-none mt-0.5">▪</span>
                                <span>Designed and trained custom object detection models inside JavaScript computer vision pipelines for real-time checkout item scanning via webcamera.</span>
                              </li>
                            </ul>
                          </div>

                          {/* Cloud Computing Club */}
                          <div className="border border-[#222222] bg-[#121212] p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                              <div>
                                <h3 className="font-mono text-xs font-black text-white uppercase">CLOUD COMPUTING CLUB @ NIST</h3>
                                <span className="font-mono text-[10px] text-gray-500 block uppercase">Core Technical Member</span>
                              </div>
                              <span className="font-mono text-[10px] text-gray-500 uppercase">2022 – PRESENT</span>
                            </div>
                            <p className="font-mono text-xs text-gray-400 leading-relaxed">
                              Co-organized 10+ cloud workshops and infrastructure training seminars engaging over 200+ university students in virtualization, AWS deployment, and containerized architectures.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {aboutSubTab === 'publications' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                          <span className="font-mono text-xs text-[#10B981] font-bold tracking-widest uppercase block">// RESEARCH & PUBLICATIONS</span>
                          
                          {/* De-Queue publication */}
                          <div className="border border-[#222222] bg-[#121212] p-5">
                            <div className="border-b border-[#222222] pb-3 mb-3">
                              <span className="font-mono text-[10px] text-gray-500 block uppercase font-bold">// GCON 2026 // IIT GUWAHATI // PAPER #776</span>
                              <h3 className="font-mono text-sm font-black text-white uppercase mt-1">DE-QUEUE: PRIVACY-PRESERVING CROWD MANAGEMENT SYSTEM</h3>
                              <span className="font-mono text-[10px] text-[#10B981] block mt-1 uppercase">AIoT & Smart Systems · Poster Session A</span>
                            </div>

                            <ul className="space-y-2.5 list-none pl-0 mb-4">
                              <li className="font-mono text-xs text-gray-400 flex items-start gap-2.5">
                                <span className="text-[#10B981] select-none mt-0.5">▪</span>
                                <span>Identified and corrected a previously undocumented BLE overcounting flaw caused by MAC address rotation, lowering the error rate from <b className="text-white">8.42x to 0.04x</b>.</span>
                              </li>
                              <li className="font-mono text-xs text-gray-400 flex items-start gap-2.5">
                                <span className="text-[#10B981] select-none mt-0.5">▪</span>
                                <span>Designed MRPC (MAC-Rotation-aware Proximity Clustering) algorithm using RSSI threshold &lt; 8 dBm and dynamic time window &lt; 30s (resulting in 20/20 rotations caught, zero misses).</span>
                              </li>
                              <li className="font-mono text-xs text-gray-400 flex items-start gap-2.5">
                                <span className="text-[#10B981] select-none mt-0.5">▪</span>
                                <span>Proved theoretical privacy using Fano\'s inequality, achieving under 18.2% max trajectory reconstruction (fully compliant with DPDP Act 2023).</span>
                              </li>
                              <li className="font-mono text-xs text-gray-400 flex items-start gap-2.5">
                                <span className="text-[#10B981] select-none mt-0.5">▪</span>
                                <span>Deployed physically on ESP32-WROOM-32 microcontrollers and RPi Zero 2W nodes at NIST Canteen, with 63.8 minutes active scan cycles.</span>
                              </li>
                              <li className="font-mono text-xs text-gray-400 flex items-start gap-2.5">
                                <span className="text-[#10B981] select-none mt-0.5">▪</span>
                                <span>Achieved 74.7%–79.5% crowd variance reduction across Airport, Mall, and Hospital scenarios simulated using SimPy 4.1.</span>
                              </li>
                            </ul>

                            <div className="border-t border-[#222222] pt-3 flex flex-wrap gap-2">
                              <span className="font-mono text-[9px] text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-0.5 uppercase">ESP32</span>
                              <span className="font-mono text-[9px] text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-0.5 uppercase">MicroPython</span>
                              <span className="font-mono text-[9px] text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-0.5 uppercase">RPi Zero 2W</span>
                              <span className="font-mono text-[9px] text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-0.5 uppercase">FastAPI</span>
                              <span className="font-mono text-[9px] text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-0.5 uppercase">Differential Privacy</span>
                              <span className="font-mono text-[9px] text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-0.5 uppercase">SimPy</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {aboutSubTab === 'academics' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                          <span className="font-mono text-xs text-[#10B981] font-bold tracking-widest uppercase block">// EDUCATION ARCHIVES</span>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {/* B.Tech */}
                            <div className="border border-[#222222] bg-[#121212] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <div>
                                <span className="font-mono text-[10px] text-[#10B981] uppercase block">// BACHELOR OF TECHNOLOGY</span>
                                <h3 className="font-mono text-xs font-black text-white uppercase mt-0.5">NIST UNIVERSITY — BERHAMPUR, ODISHA</h3>
                                <span className="font-mono text-[11px] text-gray-500 block uppercase mt-1">Computer Science & Engineering (B.Tech CSE)</span>
                              </div>
                              <div className="mt-2 sm:mt-0 text-left sm:text-right font-mono">
                                <span className="text-white text-xs block font-bold">CGPA: 8.32</span>
                                <span className="text-gray-500 text-[10px] uppercase">2022 – 2026</span>
                              </div>
                            </div>

                            {/* Intermediate */}
                            <div className="border border-[#222222] bg-[#121212] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <div>
                                <span className="font-mono text-[10px] text-gray-500 uppercase block">// CLASS XII (INTERMEDIATE)</span>
                                <h3 className="font-mono text-xs font-black text-white uppercase mt-0.5">SOBH COLLEGE — GAYA, BIHAR</h3>
                                <span className="font-mono text-[11px] text-gray-500 block uppercase mt-1">Science stream (Physics, Chemistry, Mathematics)</span>
                              </div>
                              <div className="mt-2 sm:mt-0 text-left sm:text-right font-mono">
                                <span className="text-white text-xs block font-bold">SCORE: 73.6%</span>
                                <span className="text-gray-500 text-[10px] uppercase">2020 – 2022</span>
                              </div>
                            </div>

                            {/* Matriculation */}
                            <div className="border border-[#222222] bg-[#121212] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <div>
                                <span className="font-mono text-[10px] text-gray-500 uppercase block">// CLASS X (MATRICULATION)</span>
                                <h3 className="font-mono text-xs font-black text-white uppercase mt-0.5">NAZARETH ACADEMY — GAYA, BIHAR</h3>
                              </div>
                              <div className="mt-2 sm:mt-0 text-left sm:text-right font-mono">
                                <span className="text-white text-xs block font-bold">SCORE: 71.40%</span>
                                <span className="text-gray-500 text-[10px] uppercase">2017 – 2018</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {aboutSubTab === 'credentials' && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="space-y-4">
                          <span className="font-mono text-xs text-[#10B981] font-bold tracking-widest uppercase block">// CERTIFICATIONS & ACHIEVEMENTS</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* IntelliRide */}
                            <div className="border border-[#222222] bg-[#121212] p-4 flex flex-col justify-between">
                              <div>
                                <span className="font-mono text-[9px] text-[#10B981] block uppercase font-bold">// GFI 2026 // RECOGNITION</span>
                                <h4 className="font-mono text-xs font-black text-white uppercase mt-1">INTELLIRIDE SMART MOBILITY FRAMEWORK</h4>
                                <p className="font-mono text-[11px] text-gray-500 mt-2 leading-relaxed uppercase">
                                  Won Best Poster Runner-Up & ₹5,000 at Birla Global University / Syracuse University for a unified AI smart mobility architecture.
                                </p>
                              </div>
                            </div>

                            {/* AIoT4SE */}
                            <div className="border border-[#222222] bg-[#121212] p-4 flex flex-col justify-between">
                              <div>
                                <span className="font-mono text-[9px] text-gray-500 block uppercase font-bold">// NIST RESEARCH SUMMIT</span>
                                <h4 className="font-mono text-xs font-black text-white uppercase mt-1">AIOT RESEARCH PRESENTATIONS</h4>
                                <p className="font-mono text-[11px] text-gray-500 mt-2 leading-relaxed uppercase">
                                  Presented two research papers on AIoT-based air quality monitoring systems and offline Edge-AI crop advisory software platforms in April 2026.
                                </p>
                              </div>
                            </div>

                            {/* NSEDCS */}
                            <div className="border border-[#222222] bg-[#121212] p-4 flex flex-col justify-between">
                              <div>
                                <span className="font-mono text-[9px] text-gray-500 block uppercase font-bold">// NSEDCS-2025 // SCHEDULING</span>
                                <h4 className="font-mono text-xs font-black text-white uppercase mt-1">OPTIMIZED TASK SCHEDULING RESEARCH</h4>
                                <p className="font-mono text-[11px] text-gray-500 mt-2 leading-relaxed uppercase">
                                  Won 3rd place presenting "Fault Tolerant Optimised Task Scheduling" research.
                                </p>
                              </div>
                            </div>

                            {/* General */}
                            <div className="border border-[#222222] bg-[#121212] p-4 flex flex-col justify-between">
                              <div>
                                <span className="font-mono text-[9px] text-[#10B981] block uppercase font-bold">// ATHENA INDEX // EXTRA</span>
                                <h4 className="font-mono text-xs font-black text-white uppercase mt-1">HACKATHONS & TRAINING CREDENTIALS</h4>
                                <p className="font-mono text-[11px] text-gray-500 mt-2 leading-relaxed uppercase">
                                  Active participant in Infosys Springboard Ideathon, Bank of Baroda Hackathon 2024, and Google Study JAM 2023–24 (1st Cohort).
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="border border-[#222222] bg-[#121212] p-4">
                            <span className="font-mono text-[10px] text-gray-500 block uppercase font-bold">// RECENT UNIVERSITY DISTINCTIONS</span>
                            <p className="font-mono text-xs text-gray-400 mt-1 leading-normal uppercase">
                              NIST Tech Fests 2025: 1st Prize Paper Presentation (Abstract Writing) · 1st Prize Poster Presentation (Renewable Energy) · 2nd Prize Idea Pitching.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Philosophical Node */}
                  <div className="border-l-2 border-[#10B981] pl-4 py-1 italic font-mono text-xs text-gray-500 max-w-xl select-none mt-2">
                    "Minimalism is not the omission of aesthetic layers; it is the absolute consolidation of intent."
                  </div>
                </div>
              )}

              {/* Tab: TERMINAL */}
              {activeTab === 'terminal' && (
                <div className="space-y-5 flex flex-col items-stretch w-full select-none" id="terminal-view">
                  <div className="w-full flex items-center justify-between font-mono text-xs text-gray-500 select-none font-bold">
                    <span>// REMOTE TERMINAL CORE</span>
                    {!isUnlocked ? (
                      <span className="text-rose-500/80 animate-pulse flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> VAULT SECURED
                      </span>
                    ) : (
                      <span className="text-[#10B981] flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5" /> VAULT AUTHORIZED
                      </span>
                    )}
                  </div>

                  <Terminal onUnlock={handleUnlockSequence} onLock={handleLockSequence} isUnlocked={isUnlocked} />

                  <div className="w-full border border-[#222222] bg-[#121212] rounded-none p-4 text-left select-none">
                    <span className="font-mono text-xs text-white font-bold tracking-widest block mb-1">MISSION INSTRUCTIONS:</span>
                    <p className="font-mono text-xs text-gray-500 leading-relaxed select-none">
                      Look around the filesystem map by entering <code className="text-emerald-500 font-bold">ls</code> inside the console prompt. 
                      Read <code className="text-[#10B981]">README.txt</code> with <code className="text-emerald-500">cat README.txt</code>, locate the cryptographic salt inside <code className="text-[#10B981]">system_logs.cfg</code>, and execute the decryption command to unlock the database portals.
                    </p>
                  </div>

                  <FourierEpicycles />
                </div>
              )}

              {/* Tab: GOSSIP */}
              {activeTab === 'gossip' && (
                <GossipVisualizer />
              )}

              {/* Tab: PROJECTS (requires Unlock) */}
              {activeTab === 'projects' && (
                <div className="space-y-6 flex flex-col select-none animate-fadeIn" id="projects-view">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                    <div className="space-y-1">
                      <span className="font-mono text-xs text-[#10B981] tracking-widest uppercase font-bold">// SECURE AREA // ADMIN ACCESS</span>
                      <h2 className="text-4xl font-black tracking-tighter text-white font-sans uppercase">DECRYPTED REPOSITORIES</h2>
                    </div>
                    <span className="font-mono text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-none uppercase tracking-widest font-bold">Zone Verified</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 select-none items-stretch">
                    {/* Projects Listing Card Stack */}
                    <div className="md:col-span-5 flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-2 terminal-scroll">
                      {PROJECTS.map((proj) => {
                        const isSelected = selectedProject?.id === proj.id;
                        return (
                          <div
                            key={proj.id}
                            onClick={() => {
                              audio.playChime(4);
                              setSelectedProject(proj);
                            }}
                            className={`border rounded-none p-4 cursor-pointer text-left transition-all duration-300 select-none interactive-node ${
                              isSelected
                                ? 'bg-[#10B981]/5 border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                                : 'bg-[#121212]/30 border-[#222222] hover:border-white/20 hover:bg-[#121212]/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-[10px] text-gray-500 tracking-wider font-bold">{proj.year} // {proj.role}</span>
                              <span className="font-mono text-[9px] text-[#10B981] tracking-widest border border-[#10B981]/20 px-1.5 py-0.5 rounded-none uppercase font-black">decrypted</span>
                            </div>
                            <span className="font-mono text-xs font-black text-white block tracking-wider uppercase">{proj.title}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Project Full Details Showcase */}
                    <div className="md:col-span-7 border border-[#222222] bg-[#121212] rounded-none p-5 flex flex-col justify-between select-none">
                      {selectedProject ? (
                        <div className="space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                              <span className="font-mono text-xs text-[#10B981] font-black tracking-widest">{selectedProject.title}</span>
                              <span className="font-mono text-xs text-gray-500 font-bold">{selectedProject.year}</span>
                            </div>
                            <p className="text-gray-300 font-mono text-xs leading-relaxed">
                              {selectedProject.longDescription || selectedProject.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {selectedProject.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="font-mono text-[10px] text-gray-500 border border-[#222222] bg-[#0c0c0c] px-2 py-0.5 rounded-none">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Stats & Launch Project Link */}
                          <div className="border-t border-[#222222] pt-4 mt-4 select-none">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {selectedProject.metrics?.map((metric, mIdx) => (
                                <div key={mIdx} className="bg-[#0c0c0c] border border-[#222222] p-3 rounded-none flex flex-col justify-center">
                                  <span className="font-mono text-[9px] text-gray-500 tracking-wider block uppercase">{metric.label}</span>
                                  <span className="font-mono text-xs font-black text-[#10B981]">{metric.value}</span>
                                </div>
                              ))}
                            </div>

                            <a
                              href={selectedProject.links.github}
                              className="w-full py-2.5 bg-transparent border border-[#10B981] text-[#10B981] font-mono text-xs rounded-none tracking-widest uppercase hover:bg-[#10B981] hover:text-black transition-all text-center flex items-center justify-center gap-2 interactive-node"
                            >
                              Launch Project Interface
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full font-mono text-xs text-gray-500 select-none">
                          Select a secure repository to inspect parameters...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: SYNTH // MATRIX (requires Unlock) */}
              {activeTab === 'synth' && (
                <SynthMatrix />
              )}

              {/* Tab: SECURE GALLERY // DRIVE (requires Unlock) */}
              {activeTab === 'gallery' && (
                <SecureGallery />
              )}

              {/* Tab: CERTIFICATIONS // DEGREES (requires Unlock) */}
              {activeTab === 'certs' && (
                <Certifications />
              )}

              {/* Tab: FUTURE WORKS // ROADMAP (requires Unlock) */}
              {activeTab === 'future' && (
                <FutureWorks />
              )}

              {/* Tab: EXTRACURRICULARS // PAST (requires Unlock) */}
              {activeTab === 'activities' && (
                <Extracurriculars />
              )}

              {/* Tab: CONTACT (requires Unlock) */}
              {activeTab === 'contact' && (
                <div className="space-y-6 flex flex-col select-none animate-fadeIn" id="contact-view">
                  <div className="space-y-1">
                    <span className="font-mono text-xs text-[#10B981] tracking-widest uppercase block font-bold">// COMMUNICATION NETWORK</span>
                    <h2 className="text-4xl font-black tracking-tighter text-white font-sans uppercase">Connect Security Credentials</h2>
                  </div>

                  <p className="text-gray-300 font-mono text-sm leading-relaxed max-w-xl select-none">
                    Authorizations validated. Channels secured. Click any connection link below to establish synchronization, 
                    or interact with the **Sensory Chime Matrix** below to synthesize custom melodic loops directly into the audio pipeline.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 select-none">
                    
                    {/* Social connection cards */}
                    <div className="md:col-span-5 flex flex-col gap-3 select-none">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="referrer noopener"
                        className="border border-[#222222] bg-[#121212] hover:bg-[#10B981]/5 hover:border-[#10B981]/50 p-4 rounded-none flex items-center justify-between font-mono text-xs text-gray-400 hover:text-white transition-all interactive-node"
                      >
                        <span className="flex items-center gap-3">
                          <Github className="w-4 h-4 text-[#10B981]" />
                          GITHUB // PROTOCOLS
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                      </a>

                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="referrer noopener"
                        className="border border-[#222222] bg-[#121212] hover:bg-[#10B981]/5 hover:border-[#10B981]/50 p-4 rounded-none flex items-center justify-between font-mono text-xs text-gray-400 hover:text-white transition-all interactive-node"
                      >
                        <span className="flex items-center gap-3">
                          <Linkedin className="w-4 h-4 text-[#10B981]" />
                          LINKEDIN // INDEX
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                      </a>

                      <a
                        href="mailto:anirvarti@gmail.com"
                        className="border border-[#222222] bg-[#121212] hover:bg-[#10B981]/5 hover:border-[#10B981]/50 p-4 rounded-none flex items-center justify-between font-mono text-xs text-gray-400 hover:text-white transition-all interactive-node"
                      >
                        <span className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-[#10B981]" />
                          anirvarti@gmail.com
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                      </a>
                    </div>

                    {/* SENSORY PITCH MATRIX INSTRUMENT (Super high fidelity interaction!) */}
                    <div 
                      className={`md:col-span-7 rounded-none p-5 flex flex-col justify-between select-none relative overflow-hidden transition-all duration-700 ease-in-out border ${
                        matrixEnabled 
                          ? 'border-[#10B981]/40 bg-gradient-to-b from-[#0b1b13] via-[#0e1210] to-[#121212] shadow-[0_0_35px_rgba(16,185,129,0.12),inset_0_0_25px_rgba(16,185,129,0.08)]' 
                          : 'border-neutral-950 bg-[#030303] shadow-[inset_0_4px_24px_rgba(0,0,0,0.98)]'
                      }`} 
                      id="sensory-matrix-card"
                    >
                      {/* Ambient background light filament glow effect */}
                      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full bg-[#10B981]/10 blur-[60px] pointer-events-none transition-all duration-[1000ms] ${
                        matrixEnabled ? 'opacity-100 scale-125' : 'opacity-0 scale-50'
                      }`} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4 relative z-10">
                        <div className="space-y-1 select-none">
                          <span className={`font-mono text-xs font-bold tracking-widest block uppercase transition-colors duration-500 ${
                            matrixEnabled 
                              ? 'text-[#10B981] drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]' 
                              : 'text-neutral-800'
                          }`}>
                            Pentatonic Step Matrix
                          </span>
                          <span className={`font-mono text-[9px] font-bold uppercase tracking-wider transition-colors duration-500 ${
                            matrixEnabled 
                              ? 'text-[#10B981]/80' 
                              : 'text-neutral-900'
                          }`}>
                            // HARDWARE_BYPASS: {matrixEnabled ? 'ACTIVE' : 'STANDBY'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          {/* Old-School Skeuomorphic Toggle Switch Panel */}
                          <div className={`flex items-center gap-3.5 border px-4 py-2.5 rounded-none shrink-0 self-start sm:self-auto shadow-inner transition-all duration-500 ${
                            matrixEnabled 
                              ? 'bg-[#090909] border-white/5' 
                              : 'bg-transparent border-neutral-900/40 shadow-none'
                          }`}>
                            {/* Label Left (OFF) */}
                            <div className="flex flex-col items-end select-none">
                              <span className={`font-mono text-[8px] font-black tracking-widest uppercase transition-colors duration-200 ${
                                !matrixEnabled ? 'text-amber-500/45' : 'text-neutral-700'
                              }`}>
                                BYPASS
                              </span>
                              <span className={`font-mono text-[6px] font-black transition-colors duration-200 ${
                                !matrixEnabled ? 'text-amber-600/30' : 'text-neutral-800'
                              }`}>
                                [STANDBY]
                              </span>
                            </div>

                            {/* The Mechanical Toggle Switch */}
                            <button
                              onClick={() => {
                                const targetState = !matrixEnabled;
                                audio.playMCBSwitchSound(targetState);
                                setMatrixEnabled(targetState);
                              }}
                              className="relative w-8 h-12 bg-neutral-950 border border-neutral-800 rounded-sm shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center cursor-pointer select-none group"
                              title="Flip hardware switch"
                            >
                              {/* Inner vertical track */}
                              <div className="absolute inset-y-1 w-1.5 bg-black rounded-sm pointer-events-none" />

                              {/* Neon Indicator Lamps inside the switch container */}
                              {/* Top Lamp (ON) */}
                              <div className={`absolute top-1 w-1 h-1 rounded-full transition-all duration-300 pointer-events-none ${matrixEnabled ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-neutral-800'}`} />
                              {/* Bottom Lamp (OFF) */}
                              <div className={`absolute bottom-1 w-1 h-1 rounded-full transition-all duration-300 pointer-events-none ${!matrixEnabled ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-neutral-800'}`} />

                              {/* Sliding Lever Toggle Handle */}
                              <div 
                                className={`absolute w-6 h-6 bg-gradient-to-b from-neutral-300 via-neutral-500 to-neutral-400 border border-neutral-600 rounded-sm shadow-[0_3px_5px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-300 ease-in-out flex flex-col justify-between p-0.5 pointer-events-none ${
                                  matrixEnabled 
                                    ? '-translate-y-2' 
                                    : 'translate-y-2'
                                }`}
                              >
                                {/* Metal ridges/textures */}
                                <div className="w-full h-[1px] bg-white/20" />
                                <div className="w-full h-1 bg-black/10 rounded-sm" />
                                <div className="w-full h-[1px] bg-white/10" />
                              </div>
                            </button>

                            {/* Label Right (ON) */}
                            <div className="flex flex-col items-start select-none">
                              <span className={`font-mono text-[8px] font-black tracking-widest uppercase transition-colors duration-200 ${
                                matrixEnabled ? 'text-[#10B981] emerald-glow-text' : 'text-neutral-800'
                              }`}>
                                MATRIX
                              </span>
                              <span className={`font-mono text-[6px] font-black transition-colors duration-200 ${
                                matrixEnabled ? 'text-[#10B981]/80' : 'text-neutral-900'
                              }`}>
                                [EMIT]
                              </span>
                            </div>

                            {/* Divider line */}
                            <div className={`w-[1px] h-8 mx-1 transition-colors duration-500 ${
                              matrixEnabled ? 'bg-neutral-800' : 'bg-neutral-900/30'
                            }`} />

                            {/* RUN/CLK blinking neon LED */}
                            <div className="flex flex-col items-center gap-1 select-none">
                              <span className={`font-mono text-[7px] font-black tracking-widest transition-colors duration-200 ${
                                matrixEnabled ? 'text-[#10B981]' : 'text-neutral-800'
                              }`}>
                                RUN/CLK
                              </span>
                              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-100 ${
                                matrixEnabled 
                                  ? `animate-colorBlink ${beatTick ? 'scale-115' : 'scale-95 opacity-80'}`
                                  : 'bg-neutral-950 border border-neutral-900 shadow-[0_0_2px_rgba(0,0,0,0.8)]'
                              }`} />
                            </div>
                          </div>

                          {/* MANUAL MODE TOGGLE */}
                          <div className={`flex flex-col items-center justify-center border px-4 py-2.5 rounded-none shrink-0 self-start sm:self-auto shadow-inner transition-all duration-500 ${
                            matrixEnabled 
                              ? 'bg-[#090909] border-white/5' 
                              : 'bg-transparent border-neutral-900/40 shadow-none'
                          }`}>
                            <span className={`font-mono text-[7px] font-black tracking-widest uppercase mb-1.5 transition-colors duration-200 ${
                              matrixEnabled ? 'text-[#10B981]' : 'text-neutral-800'
                            }`}>
                              MANUAL LOGIC
                            </span>
                            <button
                              onClick={() => {
                                if (matrixEnabled) {
                                  audio.playInputSound();
                                  setManualMode(!manualMode);
                                }
                              }}
                              disabled={!matrixEnabled}
                              className={`px-3 py-1 font-mono text-[9px] font-black tracking-widest transition-all interactive-node uppercase border rounded-none ${
                                !matrixEnabled
                                  ? 'border-neutral-900 text-neutral-800 opacity-50 bg-neutral-950 cursor-not-allowed'
                                  : manualMode
                                    ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                    : 'bg-[#0c0c0c] border border-[#222222] text-gray-500 hover:border-[#10B981] hover:bg-[#10B981]/10 hover:text-[#10B981]'
                              }`}
                              title="Toggle manual binary puzzle mode"
                            >
                              {manualMode ? 'ACTIVE [0/1]' : 'ENGAGE'}
                            </button>
                          </div>
                        </div>

                      </div>

                      <p className={`font-mono text-[10px] leading-normal select-none uppercase tracking-wide mb-4 transition-colors duration-500 relative z-10 ${
                        matrixEnabled ? 'text-[#10B981]/80' : 'text-neutral-800/80'
                      }`}>
                        {manualMode
                          ? 'MANUAL LOGIC OVERRIDE. SOLVE THE NODE ISOLATION PUZZLE BY ALIGNING ALL SECTORS TO STATE [1] TO DECRYPT THE COGNITIVE VAULT.'
                          : 'FLIP THE HARDWARE TOGGLE TO EMIT MODE TO ENERGIZE THE PENTATONIC STEP MATRIX. CONSTRUCT LIVE HARMONIC ATMOSPHERES DIRECTLY INTO THE DIGITAL SYSTEM MAP PIPELINE.'}
                      </p>

                      {/* Interactive Grid with lock/offline state */}
                      <div className="relative z-10">
                        {/* Overlay when disabled */}
                        {!matrixEnabled && (
                          <div className="absolute inset-0 bg-neutral-950/98 border border-dashed border-neutral-900/40 flex flex-col items-center justify-center text-center p-6 z-20 space-y-3 select-none animate-fadeIn">
                            <span className="font-mono text-[10px] text-neutral-800 font-black tracking-[0.2em] uppercase flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                              [ STANDBY BULB MODE ]
                            </span>
                            <p className="font-mono text-[9px] text-neutral-800 uppercase leading-relaxed max-w-xs">
                              Skeuomorphic leverage mechanism waiting in dormant mode. Toggle ON to ignite the filaments.
                            </p>
                          </div>
                        )}

                        <div className={`grid grid-cols-6 gap-2 transition-all duration-300 ${!matrixEnabled ? 'opacity-25 blur-[1px]' : 'opacity-100'}`}>
                          {Array.from({ length: 12 }).map((_, idx) => {
                            const scaleNames = ['G3', 'A3', 'Bb3', 'D4', 'F4', 'G4', 'Bb4', 'C5', 'D5', 'F5', 'G5', 'Bb5'];
                            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1', '#d946ef'];
                            const name = manualMode ? `B${idx}` : scaleNames[idx % scaleNames.length];
                            const isActiveStep = manualMode ? binaryGrid[idx] === 1 : matrixStep === idx;
                            const manualColor = colors[idx % 12];
                            
                            return (
                              <button
                                key={idx}
                                disabled={!matrixEnabled}
                                onClick={() => handleChimeMatrixClick(idx)}
                                style={manualMode && isActiveStep ? {
                                  borderColor: manualColor,
                                  color: manualColor,
                                  backgroundColor: `${manualColor}33`,
                                  boxShadow: `0 0 15px ${manualColor}4D`
                                } : undefined}
                                className={`aspect-square transition-all duration-150 interactive-node uppercase relative overflow-hidden group/btn flex flex-col items-center justify-center font-mono text-[10px] ${
                                  !manualMode && isActiveStep
                                    ? 'bg-[#10B981]/25 border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.04] z-10'
                                    : (manualMode && isActiveStep) ? 'scale-[1.04] z-10'
                                    : 'bg-[#0c0c0c] border border-[#222222] text-gray-500 hover:border-[#10B981] hover:bg-[#10B981]/10 hover:text-[#10B981]'
                                }`}
                                title={`Play Note: ${name}`}
                              >
                                <span 
                                  className={`block text-[8px] transition-colors mb-0.5 ${isActiveStep && !manualMode ? 'text-[#10B981] animate-pulse' : 'text-gray-700 group-hover/btn:text-[#10B981]'}`}
                                  style={manualMode && isActiveStep ? { color: manualColor } : undefined}
                                >
                                  {manualMode ? (isActiveStep ? '1' : '0') : '●'}
                                </span>
                                <span className="font-bold">{name}</span>
                                <div 
                                  className={`absolute bottom-0 inset-x-0 h-[1px] transition-colors ${!manualMode && isActiveStep ? 'bg-[#10B981]' : 'bg-transparent group-hover/btn:bg-[#10B981]'}`}
                                  style={manualMode && isActiveStep ? { backgroundColor: manualColor } : undefined}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </main>

          </div>

          {/* Footer Metadata */}
          <footer className="border-t border-[#222222] pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-gray-500 shrink-0 select-none uppercase tracking-[0.2em]" id="main-footer">
            <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM LIVE: {currentTime}
              </span>
              <span>ENVIRONMENT: CLOUD RUN DOCKED</span>
              <span>GEO_LAT: 35.6762 / GEO_LON: 139.6503</span>
            </div>
            <div className="mt-2 sm:mt-0 text-center sm:text-right select-none text-[#10B981] font-bold">
              <span>ACCESS: {isUnlocked ? 'DECRYPTED_LEVEL' : 'GUEST_LEVEL'}</span>
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
