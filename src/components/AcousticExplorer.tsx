import React, { useState, useEffect } from "react";
import { audio } from "../lib/audio";
import AlgorithmMatrix from "./AlgorithmMatrix";
import {
  Music,
  Sparkles,
  Activity,
  User,
  Cpu,
  Code,
  BookOpen,
  Unlock,
  Volume2,
  VolumeX,
  ChevronRight,
  Fingerprint,
} from "lucide-react";

interface AcousticExplorerProps {
  onUnlockAll: () => void;
  isUnlocked: boolean;
}

export default function AcousticExplorer({
  onUnlockAll,
  isUnlocked,
}: AcousticExplorerProps) {
  const [resonance, setResonance] = useState<number>(0);
  const [hasPlayedNode, setHasPlayedNode] = useState<{
    [key: string]: boolean;
  }>({});
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // No Harmonic Matrix state needed here

  // Decryption Milestones
  const hasUnlockedNode1 = resonance >= 25;
  const hasUnlockedNode2 = resonance >= 50;
  const hasUnlockedNode3 = resonance >= 75;
  const hasUnlockedNode4 = resonance >= 100;

  useEffect(() => {
    // Sync with global sound state
    setSoundEnabled(audio.getPlayingStatus());
  }, []);

  const toggleSoundEngine = () => {
    const isPlaying = audio.toggle();
    setSoundEnabled(isPlaying);
    if (isPlaying) {
      increaseResonance(10, "sound-engine-init");
    }
  };

  const increaseResonance = (amount: number, sourceId: string) => {
    if (!audio.getPlayingStatus() && sourceId !== "sound-engine-init") {
      audio.toggle(true);
      setSoundEnabled(true);
    }

    setResonance((prev) => {
      const next = Math.min(100, prev + amount);
      if (next === 100 && prev < 100) {
        audio.playSuccessSound();
      }
      return next;
    });

    setHasPlayedNode((prev) => ({
      ...prev,
      [sourceId]: true,
    }));
  };



  // Fully decrypt portfolio bypass
  const handleBypassUnlock = () => {
    audio.playSuccessSound();
    onUnlockAll();
  };

  return (
    <div
      className="space-y-6 select-none animate-fadeIn text-white text-left"
      id="acoustic-instrument-workbench"
    >
      {/* Sound Alert Banner if sound is muted */}
      {!soundEnabled && (
        <div className="border border-yellow-500/20 bg-yellow-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VolumeX className="w-5 h-5 text-yellow-500 animate-pulse shrink-0" />
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-black text-yellow-500 uppercase tracking-wider">
                // LOCAL HARMONIC AUDIO DISCONNECTED
              </span>
              <p className="font-mono text-[10px] text-gray-400 uppercase leading-normal">
                This experience is built with live, high-fidelity browser
                synthesizers. Initialize audio output for the full interactive
                visual-sonic portfolio.
              </p>
            </div>
          </div>
          <button
            onClick={toggleSoundEngine}
            className="w-full sm:w-auto font-mono text-[10px] bg-yellow-500 hover:bg-yellow-400 text-black font-black px-4 py-2 uppercase tracking-widest transition-all"
          >
            INITIALIZE AUDIO MODULE
          </button>
        </div>
      )}

      {/* Main Section layout: Instrumental Station on Left, Decrypted Data Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: THE INSTRUMENT BOARD (Col-Span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between border border-[#222222] bg-[#121212]/30 p-5 rounded-none relative overflow-hidden gap-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.02),transparent_70%)] pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#10B981] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 animate-pulse" /> DEVICE STATION
                CORE // CHIME_V2
              </span>
              <span className="font-mono text-[9px] text-gray-500 uppercase">
                VOL_GAIN: ACTIVE
              </span>
            </div>
            <h3 className="text-lg font-black font-sans uppercase tracking-tight text-white flex items-center gap-1.5">
              Interactive Neuro-Acoustic Synthesizer
            </h3>
            <p className="font-mono text-[10px] text-gray-400 leading-normal uppercase">
              Play the instruments below. As you trigger custom waveforms, your{" "}
              <span className="text-[#10B981] font-bold">RESONANCE MATRIX</span>{" "}
              grows to progressively decrypt my secure candidate information.
            </p>
          </div>

          {/* Algorithmic Visualizer */}
          <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center min-h-[500px]">
            <AlgorithmMatrix onProgress={increaseResonance} isActive={soundEnabled} />
          </div>

          {/* Master Progress Bar */}
          <div className="space-y-2 border-t border-white/5 pt-4 z-10">
            <div className="flex items-center justify-between font-mono text-[10px] text-gray-400 uppercase font-black">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />{" "}
                Sonic Decryption Meter
              </span>
              <span className="text-[#10B981] font-black">
                {resonance}% COGNITIVE SYNC
              </span>
            </div>

            <div className="h-3 bg-[#080808] border border-white/5 p-0.5 rounded-none overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-[#10B981] shadow-[0_0_10px_#10B981] transition-all duration-300"
                style={{ width: `${resonance}%` }}
              />
              {/* Percentage triggers */}
              <div className="absolute inset-0 flex justify-between pointer-events-none px-2 items-center">
                <span
                  className={`text-[7px] font-mono font-bold uppercase ${resonance >= 25 ? "text-black font-black" : "text-gray-600"}`}
                >
                  25%
                </span>
                <span
                  className={`text-[7px] font-mono font-bold uppercase ${resonance >= 50 ? "text-black font-black" : "text-gray-600"}`}
                >
                  50%
                </span>
                <span
                  className={`text-[7px] font-mono font-bold uppercase ${resonance >= 75 ? "text-black font-black" : "text-gray-600"}`}
                >
                  75%
                </span>
                <span
                  className={`text-[7px] font-mono font-bold uppercase ${resonance >= 100 ? "text-black font-black" : "text-gray-600"}`}
                >
                  100%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between font-mono text-[8px] text-gray-600 uppercase">
              <span>
                Strike, swipe, or tap instruments to generate data resonance
              </span>
              <span>milestones: 25% | 50% | 75% | 100%</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVEALED COGNITIVE PORTFOLIO DATA (Col-Span 5) */}
        <div className="lg:col-span-5 border border-[#222222] bg-[#0c0c0c] p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.015)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

          <div className="space-y-4 z-10">
            <span className="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
              // DECRYPTED CANDIDATE MATRIX STREAM
            </span>

            {/* Display status if nothing unlocked */}
            {!hasUnlockedNode1 && (
              <div className="h-64 border border-dashed border-white/5 bg-black/40 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Fingerprint className="w-10 h-10 text-gray-600 animate-pulse" />
                <div className="space-y-1">
                  <span className="font-mono text-xs text-gray-400 uppercase font-bold tracking-widest">
                    Acoustic Signal Blocked
                  </span>
                  <p className="font-mono text-[9px] text-gray-500 uppercase leading-normal max-w-xs">
                    Harmonics currently below 25% filter resonance. Stroke the
                    glowing strings or hit drum pads to sync with the candidate
                    database.
                  </p>
                </div>
              </div>
            )}

            {/* NODE 1: Candidate Profile Specification (25% resonance) */}
            {hasUnlockedNode1 && (
              <div className="border border-emerald-950 bg-black/80 p-4 space-y-2 animate-scaleUp text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
                <div className="flex items-center justify-between font-mono text-[9px] text-[#10B981] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> // SECURE_NODE_01 //
                    IDENTITY
                  </span>
                  <span className="text-[8px] border border-[#10B981]/20 px-1 py-0.2 bg-[#10B981]/5">
                    DECRYPT_OK
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans text-sm font-black text-white uppercase tracking-tight">
                    SATYA PRAKASH // ANIRVARTI
                  </h4>
                  <p className="font-mono text-[10px] text-gray-400 uppercase leading-relaxed">
                    Java Backend Engineer merging Spring Boot microservices with
                    embedded IoT microcontrollers. Specializes in real-time,
                    privacy-preserving algorithms.
                  </p>
                </div>
              </div>
            )}

            {/* NODE 2: Cognitive Tech Index (50% resonance) */}
            {hasUnlockedNode2 && (
              <div className="border border-emerald-950 bg-black/80 p-4 space-y-2 animate-scaleUp text-left relative overflow-hidden">
                <div className="flex items-center justify-between font-mono text-[9px] text-[#10B981] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Code className="w-3.5 h-3.5" /> // SECURE_NODE_02 //
                    COGNITION
                  </span>
                  <span className="text-[8px] border border-[#10B981]/20 px-1 py-0.2 bg-[#10B981]/5">
                    DECRYPT_OK
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-sans text-xs font-bold text-white uppercase tracking-tight">
                    Engineering Tool Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Spring Boot",
                      "Java SE",
                      "IoT Hardware",
                      "C++",
                      "ESP32/Arduino",
                      "Raspberry Pi",
                      "PostgreSQL",
                      "Redis",
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[8px] text-[#10B981] border border-[#10B981]/30 bg-[#10B981]/5 px-2 py-0.5 uppercase font-bold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NODE 3: Key Architectural Innovations (75% resonance) */}
            {hasUnlockedNode3 && (
              <div className="border border-emerald-950 bg-black/80 p-4 space-y-2 animate-scaleUp text-left relative overflow-hidden">
                <div className="flex items-center justify-between font-mono text-[9px] text-[#10B981] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> // SECURE_NODE_03 //
                    INNOVATIONS
                  </span>
                  <span className="text-[8px] border border-[#10B981]/20 px-1 py-0.2 bg-[#10B981]/5">
                    DECRYPT_OK
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-sans text-xs font-bold text-white uppercase tracking-tight">
                    DE-QUEUE & MRPC Architecture
                  </h4>
                  <p className="font-mono text-[10px] text-gray-400 uppercase leading-relaxed">
                    Designed the MAC-Rotation-aware Proximity Clustering (MRPC)
                    algorithm allowing accurate queue estimation without
                    collecting persistent unique IDs. Published at GCON 2026.
                  </p>
                </div>
              </div>
            )}

            {/* NODE 4: Final Decryption Overlord & Bypass (100% resonance) */}
            {hasUnlockedNode4 && (
              <div className="border border-[#10B981] bg-[#10B981]/5 p-4 space-y-3 animate-scaleUp text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none" />
                <div className="flex items-center justify-between font-mono text-[9px] text-[#10B981] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" /> // SECURE_NODE_04 //
                    ACCESS APPROVED
                  </span>
                  <span className="text-[8px] border border-[#10B981]/50 px-1.5 py-0.5 bg-[#10B981]/15 uppercase font-black">
                    ROOT_CLEAR
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[10px] text-gray-300 uppercase leading-normal">
                    Decryption full lock cleared. All restricted portfolio
                    projects, contacts, and hidden logs have been mapped to the
                    mainframe navigation.
                  </p>
                  <button
                    onClick={handleBypassUnlock}
                    className="w-full font-mono text-[11px] bg-[#10B981] hover:bg-[#10B981]/90 text-black font-black py-2.5 px-4 uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> Grant Full Directory Access
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-white/5 pt-3 flex items-center justify-between font-mono text-[8px] text-gray-500 uppercase z-10">
            <span>
              RES_COMPILING: {resonance >= 100 ? "COMPLETE" : "STANDBY"}
            </span>
            <span>
              DATA SEGMENTS:{" "}
              {resonance >= 100
                ? "4/4"
                : `${resonance >= 75 ? "3" : resonance >= 50 ? "2" : resonance >= 25 ? "1" : "0"}/4`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
