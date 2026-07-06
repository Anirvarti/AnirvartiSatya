import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../lib/audio';
import { 
  Play, 
  Pause, 
  Trash2, 
  Sparkles, 
  Activity, 
  Sliders, 
  Tv, 
  Volume2, 
  RefreshCw 
} from 'lucide-react';

export default function SynthMatrix() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(110);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [glitchActive, setGlitchActive] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => Math.round(audio.getVolume() * 100));

  // 12 Rows corresponding to G-minor Pentatonic Scale Notes
  // index 0 is Bb5 (high), index 11 is G3 (low)
  const scaleNotes = [
    { name: 'Bb5', freqIdx: 11 },
    { name: 'G5', freqIdx: 10 },
    { name: 'F5', freqIdx: 9 },
    { name: 'D5', freqIdx: 8 },
    { name: 'C5', freqIdx: 7 },
    { name: 'Bb4', freqIdx: 6 },
    { name: 'G4', freqIdx: 5 },
    { name: 'F4', freqIdx: 4 },
    { name: 'D4', freqIdx: 3 },
    { name: 'Bb3', freqIdx: 2 },
    { name: 'A3', freqIdx: 1 },
    { name: 'G3', freqIdx: 0 }
  ];

  // Grid State: 12 rows x 8 steps (columns)
  const [grid, setGrid] = useState<boolean[][]>(() => 
    Array.from({ length: 12 }, () => Array(8).fill(false))
  );

  const activeStepRef = useRef<number>(-1);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize with a preset on mount
  useEffect(() => {
    loadAmbientPreset();
    // Start drawing the oscilloscope
    drawOscilloscope();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Sync BPM timer changes
  useEffect(() => {
    if (isPlaying) {
      stopSequencer();
      startSequencer();
    }
  }, [bpm, isPlaying]);

  // Handle step playback loop
  const startSequencer = () => {
    const stepDurationMs = (60 / bpm / 2) * 1000; // eighth notes
    
    const playNextStep = () => {
      activeStepRef.current = (activeStepRef.current + 1) % 8;
      const currentStep = activeStepRef.current;
      setActiveStep(currentStep);

      // Read active cells in this column & play notes
      grid.forEach((row, rowIdx) => {
        if (row[currentStep]) {
          const freqIdx = scaleNotes[rowIdx].freqIdx;
          audio.playChime(freqIdx);
        }
      });

      // Subtle pulse on beat
      if (currentStep === 0 && glitchActive) {
        triggerPulseEffect();
      }
    };

    // Trigger instantly then set interval
    playNextStep();
    timerRef.current = window.setInterval(playNextStep, stepDurationMs);
  };

  const stopSequencer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveStep(-1);
    activeStepRef.current = -1;
  };

  const togglePlayback = () => {
    audio.playChime(5);
    if (isPlaying) {
      stopSequencer();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  // Toggle single cell
  const toggleCell = (row: number, col: number) => {
    audio.playChime(scaleNotes[row].freqIdx);
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = !next[row][col];
      return next;
    });
  };

  // Clear all cells
  const clearGrid = () => {
    audio.playErrorSound();
    setGrid(Array.from({ length: 12 }, () => Array(8).fill(false)));
  };

  // Procedural Generator: Ambient Echo
  const loadAmbientPreset = () => {
    const newGrid = Array.from({ length: 12 }, () => Array(8).fill(false));
    // Program a beautiful Pentatonic ambient pattern (D4, G4, D5, G5 arpeggio)
    newGrid[11][0] = true; // G3 on step 0
    newGrid[8][2] = true;  // D4 on step 2
    newGrid[6][4] = true;  // G4 on step 4
    newGrid[3][6] = true;  // D5 on step 6
    newGrid[1][4] = true;  // G5 on step 4
    newGrid[5][2] = true;  // Bb4 on step 2
    setGrid(newGrid);
    audio.playSuccessSound();
  };

  // Procedural Generator: Cyberpunk Trance
  const loadCyberpunkPreset = () => {
    const newGrid = Array.from({ length: 12 }, () => Array(8).fill(false));
    // High density rhythm
    newGrid[11][0] = true; // G3
    newGrid[11][4] = true; // G3
    newGrid[9][1] = true;  // Bb3
    newGrid[9][5] = true;  // Bb3
    newGrid[6][2] = true;  // G4
    newGrid[3][3] = true;  // D5
    newGrid[1][6] = true;  // G5
    newGrid[4][7] = true;  // C5
    setGrid(newGrid);
    audio.playSuccessSound();
  };

  // Procedural Generator: Chaos Cascade
  const loadChaosPreset = () => {
    const newGrid = Array.from({ length: 12 }, () => Array(8).fill(false));
    for (let col = 0; col < 8; col++) {
      // Pick 1 or 2 random rows for each column
      const r1 = Math.floor(Math.random() * 12);
      newGrid[r1][col] = true;
      if (Math.random() > 0.6) {
        const r2 = Math.floor(Math.random() * 12);
        newGrid[r2][col] = true;
      }
    }
    setGrid(newGrid);
    audio.playSuccessSound();
  };

  // Draw real-time oscilloscope using analyser node from global audio engine
  const drawOscilloscope = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const analyser = audio.getAnalyserNode();
      if (!analyser) {
        // Fallback drawing static wave if context isn't running yet
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 1.5;
        const width = canvas.width;
        const height = canvas.height;
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.05) * 8;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.02)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Draw Wave
      ctx.beginPath();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 4;

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.shadowBlur = 0; // reset
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
  };

  // Pulse effect that physically shifts body style attributes to look glitched on-beat!
  const triggerPulseEffect = () => {
    const root = document.documentElement;
    root.style.transform = 'scale(1.002) skewX(0.1deg)';
    root.style.filter = 'contrast(1.05) brightness(1.02) hue-rotate(1deg)';
    setTimeout(() => {
      root.style.transform = '';
      root.style.filter = '';
    }, 100);
  };

  // Toggle screen aberration mode
  const toggleGlitchEffect = () => {
    audio.playChime(3);
    setGlitchActive(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('crt-glitch-mode');
      } else {
        document.body.classList.remove('crt-glitch-mode');
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 flex flex-col select-none animate-fadeIn" id="synth-matrix-panel">
      {/* Visual background element */}
      <style>{`
        .crt-glitch-mode {
          animation: crtAberration 4.5s infinite alternate;
        }
        @keyframes crtAberration {
          0% { filter: contrast(1) saturate(1); }
          40% { filter: contrast(1.02) saturate(1.05) drop-shadow(0px 0px 1px rgba(16,185,129,0.1)); }
          41% { filter: contrast(1.08) hue-rotate(-2deg); }
          42% { filter: contrast(1) saturate(1); }
          85% { filter: contrast(1.01) saturate(0.98); }
          86% { filter: contrast(1.15) hue-rotate(2deg) skewX(-0.5deg); }
          88% { filter: contrast(1) saturate(1); }
        }
      `}</style>

      {/* Header */}
      <div className="space-y-1 text-left">
        <span className="font-mono text-xs text-[#10B981] tracking-widest uppercase block font-bold">// HARDWARE COGNITIVE SEQUENCER</span>
        <h2 className="text-4xl font-black tracking-tighter text-white font-sans uppercase">Neuro Synth-Wave Grid</h2>
        <p className="text-gray-400 font-mono text-xs leading-relaxed max-w-xl">
          Interact with my real-time client sound synth. Construct minimal ambient structures, speed up frequencies, or overclock the central aesthetic render pipeline!
        </p>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: STEP SEQUENCER GRID (Col-Span 8) */}
        <div className="xl:col-span-8 border border-[#222222] bg-[#121212]/40 p-5 rounded-none space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayback}
                className={`font-mono text-xs font-black px-5 py-2.5 uppercase tracking-widest flex items-center gap-2 transition-all ${
                  isPlaying 
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' 
                    : 'bg-[#10B981] text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" /> HALT TRANSMISSION
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" /> COMMENCE SYNTH
                  </>
                )}
              </button>

              <button
                onClick={clearGrid}
                className="border border-[#222222] bg-black hover:border-rose-500 hover:text-rose-500 hover:bg-rose-950/10 px-3.5 py-2.5 font-mono text-xs text-gray-500 uppercase transition-all flex items-center gap-1.5"
                title="Erase Current Sequencer Sequence"
              >
                <Trash2 className="w-3.5 h-3.5" /> Wipe Sector
              </button>
            </div>

            {/* Presets Grid */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-gray-600 uppercase font-black mr-1">// PRESETS:</span>
              <button
                onClick={loadAmbientPreset}
                className="border border-[#222222] hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 px-2.5 py-1.5 font-mono text-[10px] text-gray-400 uppercase transition-all"
              >
                Ambient Drone
              </button>
              <button
                onClick={loadCyberpunkPreset}
                className="border border-[#222222] hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 px-2.5 py-1.5 font-mono text-[10px] text-gray-400 uppercase transition-all"
              >
                Cyber Trance
              </button>
              <button
                onClick={loadChaosPreset}
                className="border border-[#222222] hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/5 px-2.5 py-1.5 font-mono text-[10px] text-gray-400 uppercase transition-all"
              >
                Chaos Cascade
              </button>
            </div>
          </div>

          {/* Actual Sequencer Matrix */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[480px] space-y-1.5">
              
              {/* Header Playback step indicators */}
              <div className="grid grid-cols-12 gap-1.5 items-center">
                {/* Note header spacer */}
                <div className="col-span-2 text-right pr-3">
                  <span className="font-mono text-[8px] text-gray-600 uppercase font-bold tracking-widest">KEY FREQ</span>
                </div>
                {/* Steps columns */}
                <div className="col-span-10 grid grid-cols-8 gap-1.5">
                  {Array.from({ length: 8 }).map((_, stepIdx) => (
                    <div 
                      key={stepIdx} 
                      className={`text-center py-1 transition-all rounded-sm ${
                        activeStep === stepIdx 
                          ? 'bg-[#10B981]/15 border-b-2 border-[#10B981]' 
                          : 'bg-black/20'
                      }`}
                    >
                      <span className={`font-mono text-[9px] font-black ${
                        activeStep === stepIdx ? 'text-[#10B981] animate-pulse' : 'text-gray-600'
                      }`}>
                        STP_0{stepIdx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {scaleNotes.map((note, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-12 gap-1.5 items-center">
                  {/* Left row labels */}
                  <div className="col-span-2 text-right pr-3 border-r border-[#222222] h-full flex items-center justify-end">
                    <span className="font-mono text-[11px] font-bold text-[#10B981]/80 hover:text-[#10B981] select-none transition-colors">
                      {note.name}
                    </span>
                  </div>

                  {/* Steps cells */}
                  <div className="col-span-10 grid grid-cols-8 gap-1.5">
                    {grid[rowIdx].map((isActive, colIdx) => {
                      const isCurrentStep = activeStep === colIdx;
                      let cellClass = 'bg-[#090909] border-white/5 text-gray-800 hover:border-[#10B981]/40';
                      
                      if (isActive) {
                        if (isCurrentStep) {
                          cellClass = 'bg-[#10B981] border-[#10B981] text-black shadow-[0_0_12px_#10B981] scale-105';
                        } else {
                          cellClass = 'bg-[#10B981]/35 border-[#10B981]/60 text-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.15)]';
                        }
                      } else if (isCurrentStep) {
                        cellClass = 'bg-[#10B981]/5 border-yellow-500/20 text-gray-500';
                      }

                      return (
                        <button
                          key={colIdx}
                          onClick={() => toggleCell(rowIdx, colIdx)}
                          className={`h-9 border transition-all duration-150 flex items-center justify-center font-mono text-[9px] ${cellClass}`}
                          title={`Toggle ${note.name} at Step ${colIdx + 1}`}
                        >
                          {isActive ? '●' : '·'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-white/5 pt-3 font-mono text-[9px] text-gray-500 uppercase">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>Interactive sound loops run directly inside your local browser memory buffer</span>
          </div>

        </div>

        {/* Right Column: HARDWARE CONTROLS & LIVE OSCILLOSCOPE (Col-Span 4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Live Waveform Oscilloscope */}
          <div className="border border-[#222222] bg-black p-4 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#10B981] animate-pulse" /> Oscilloscope Trace
              </span>
              <span className="font-mono text-[8px] text-[#10B981] border border-[#10B981]/25 px-1 py-0.5 uppercase bg-[#10B981]/5 tracking-widest">
                LIVE_FEED_READY
              </span>
            </div>

            <div className="h-28 bg-[#080808] border border-[#222222] rounded-sm overflow-hidden relative">
              <canvas 
                ref={canvasRef} 
                width={340} 
                height={112} 
                className="w-full h-full block"
              />
            </div>

            <p className="font-mono text-[9px] text-gray-500 leading-normal uppercase">
              Web Audio synthesizer waveform showing fundamental oscillations and 3rd harmonic metallic resonance sweeps.
            </p>
          </div>

          {/* Sandbox Modulators */}
          <div className="border border-[#222222] bg-[#121212]/40 p-5 text-left space-y-5">
            <span className="font-mono text-xs text-white font-bold tracking-widest block uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#10B981]" /> Hardware Modulators
            </span>

            {/* BPM Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[10px] text-gray-400 uppercase">
                <span>Sequencer Velocity:</span>
                <span className="text-[#10B981] font-black">{bpm} BPM</span>
              </div>
              <input 
                type="range" 
                min="60" 
                max="220" 
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-full h-1 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
              <span className="block font-mono text-[8px] text-gray-600 uppercase">
                Alters standard loop frequency step trigger cycles
              </span>
            </div>

            <div className="h-[1px] bg-white/5" />

            {/* CRT Aberration Switch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="font-mono text-[11px] text-white uppercase font-bold flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-yellow-500" /> Aberration CRT Scanlines
                  </span>
                  <span className="font-mono text-[8px] text-gray-500 uppercase max-w-xs mt-0.5 leading-normal">
                    Flickers visual contrast and chromatic saturation syncing with loop metrics
                  </span>
                </div>
                <button
                  onClick={toggleGlitchEffect}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    glitchActive ? 'bg-[#10B981]' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                      glitchActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-white/5" />

            {/* Audio Engine volume controller */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-left">
                <span className="font-mono text-[11px] text-white uppercase font-bold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#10B981]" /> Hardware Volume
                </span>
                <span className="font-mono text-[10px] text-gray-400 font-bold">{volume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setVolume(val);
                  audio.setVolume(val / 100);
                }}
                className="w-full h-1 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
              />
              <span className="block font-mono text-[8px] text-gray-600 uppercase">
                Adjust the master gain level of the hardware synthesis loops
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
