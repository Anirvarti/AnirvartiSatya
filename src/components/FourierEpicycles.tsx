// /src/components/FourierEpicycles.tsx
import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../lib/audio';
import { Play, Pause, RotateCcw, Paintbrush, Sliders, ChevronRight, HelpCircle, Activity, Music, Sparkles } from 'lucide-react';

interface Complex {
  re: number;
  im: number;
  freq: number;
  amplitude: number;
  phase: number;
}

interface Point {
  x: number;
  y: number;
}

export default function FourierEpicycles() {
  // UI State
  const [activePreset, setActivePreset] = useState<string>('cheetah');
  const [maxEpicycles, setMaxEpicycles] = useState<number>(45);
  const [speed, setSpeed] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showCircles, setShowCircles] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showOriginal, setShowOriginal] = useState<boolean>(true);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'frequencies'>('visualizer');
  const [colorTheme, setColorTheme] = useState<string>('rainbow');

  // Interactive path state
  const [originalPath, setOriginalPath] = useState<Point[]>([]);
  const [dftCoefficients, setDftCoefficients] = useState<Complex[]>([]);
  const [reconstructedTrace, setReconstructedTrace] = useState<Point[]>([]);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Sound throttler
  const soundThrottleRef = useRef<number>(0);

  // Predefined mathematical shape vertices helpers
  const interpolatePath = (vertices: Point[], totalPoints: number = 200): Point[] => {
    const interpolated: Point[] = [];
    if (vertices.length === 0) return [];
    
    const distances: number[] = [0];
    let totalLength = 0;
    for (let i = 1; i < vertices.length; i++) {
      const dx = vertices[i].x - vertices[i - 1].x;
      const dy = vertices[i].y - vertices[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      totalLength += dist;
      distances.push(totalLength);
    }
    
    for (let i = 0; i < totalPoints; i++) {
      const targetDist = (i / (totalPoints - 1)) * totalLength;
      let segmentIdx = 0;
      while (segmentIdx < distances.length - 1 && distances[segmentIdx + 1] < targetDist) {
        segmentIdx++;
      }
      const dStart = distances[segmentIdx];
      const dEnd = distances[segmentIdx + 1];
      const segmentLength = dEnd - dStart;
      const t = segmentLength === 0 ? 0 : (targetDist - dStart) / segmentLength;
      
      const pStart = vertices[segmentIdx];
      const pEnd = vertices[segmentIdx + 1];
      
      interpolated.push({
        x: pStart.x + t * (pEnd.x - pStart.x),
        y: pStart.y + t * (pEnd.y - pStart.y)
      });
    }
    return interpolated;
  };

  // Generate Preset Paths
  const getPresetPath = (name: string): Point[] => {
    const width = 600;
    const height = 450;
    const cx = 0; // centered initially, we shift it later
    const cy = 0;

    switch (name) {
      case 'cheetah': {
        // Continuous sleek sprinting cheetah outline, fitting perfectly
        const vertices = [
          { x: -160, y: 40 },
          { x: -140, y: 20 },
          { x: -100, y: -10 },
          { x: -60, y: -25 },
          { x: 0, y: -35 },
          { x: 40, y: -50 },
          { x: 70, y: -70 },
          { x: 90, y: -50 },
          { x: 80, y: -30 },
          { x: 50, y: -20 },
          { x: 30, y: 10 },
          { x: 20, y: 50 },
          { x: 35, y: 90 },
          { x: 15, y: 95 },
          { x: 5, y: 50 },
          { x: -30, y: 20 },
          { x: -70, y: 25 },
          { x: -110, y: 60 },
          { x: -125, y: 95 },
          { x: -135, y: 90 },
          { x: -120, y: 30 },
          { x: -140, y: -10 },
          { x: -180, y: -40 },
          { x: -210, y: -80 },
          { x: -215, y: -75 },
          { x: -175, y: -20 },
          { x: -160, y: 40 }
        ];
        return interpolatePath(vertices, 200).map(p => ({ x: p.x + cx, y: p.y + cy + 20 }));
      }
      case 'infinity': {
        // Lemniscate of Bernoulli figure-8
        const points: Point[] = [];
        for (let i = 0; i < 200; i++) {
          const t = (i * Math.PI * 2) / 200;
          const scale = 220 / (3 - Math.cos(2 * t));
          points.push({
            x: scale * Math.cos(t),
            y: scale * Math.sin(2 * t) / 2
          });
        }
        return points;
      }
      case 'butterfly': {
        // Temple H. Fay's butterfly curve
        const points: Point[] = [];
        for (let i = 0; i < 200; i++) {
          const t = (i * Math.PI * 2) / 200;
          const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin(t / 12), 5);
          points.push({
            x: r * Math.sin(t) * 55,
            y: -r * Math.cos(t) * 55 - 10
          });
        }
        return points;
      }
      case 'star': {
        const vertices: Point[] = [];
        for (let i = 0; i < 11; i++) {
          const angle = (i * Math.PI * 2) / 10 - Math.PI / 2;
          const r = i % 2 === 0 ? 160 : 70;
          vertices.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
        }
        return interpolatePath(vertices, 180);
      }
      case 'treble': {
        // Musical Treble Clef
        const vertices = [
          { x: 0, y: 110 },
          { x: 0, y: -120 },
          { x: -20, y: -135 },
          { x: -35, y: -120 },
          { x: -25, y: -90 },
          { x: 0, y: -55 },
          { x: 28, y: -22 },
          { x: 45, y: 12 },
          { x: 28, y: 50 },
          { x: -12, y: 60 },
          { x: -50, y: 38 },
          { x: -55, y: 0 },
          { x: -32, y: -40 },
          { x: 0, y: -68 },
          { x: 18, y: -22 },
          { x: 6, y: 45 },
          { x: -12, y: 90 },
          { x: 0, y: 112 },
          { x: 18, y: 122 },
          { x: 22, y: 105 },
          { x: 12, y: 100 },
          { x: 0, y: 110 }
        ];
        return interpolatePath(vertices, 200).map(p => ({ x: p.x, y: p.y }));
      }
      default:
        return [];
    }
  };

  // Compute Discrete Fourier Transform (DFT) with Negative & Positive frequencies (avoids reconstruction warping/drifting)
  const computeDFT = (path: Point[]): Complex[] => {
    const N = path.length;
    const dft: Complex[] = [];
    
    for (let k = 0; k < N; k++) {
      let re = 0;
      let im = 0;
      
      for (let n = 0; n < N; n++) {
        const phi = (2 * Math.PI * k * n) / N;
        re += path[n].x * Math.cos(phi) + path[n].y * Math.sin(phi);
        im += -path[n].x * Math.sin(phi) + path[n].y * Math.cos(phi);
      }
      
      re = re / N;
      im = im / N;
      
      // Shift upper half of DFT coefficients to negative frequencies so they rotate clockwise
      const freq = k <= N / 2 ? k : k - N;
      const amplitude = Math.sqrt(re * re + im * im);
      const phase = Math.atan2(im, re);
      
      dft.push({ re, im, freq, amplitude, phase });
    }
    
    return dft;
  };

  // Prepare and process DFT coefficients
  const prepareDFT = (rawPath: Point[], width: number, height: number) => {
    if (rawPath.length === 0) return;

    // 1. Centroid calculation
    let sumX = 0;
    let sumY = 0;
    for (const p of rawPath) {
      sumX += p.x;
      sumY += p.y;
    }
    const centroidX = sumX / rawPath.length;
    const centroidY = sumY / rawPath.length;

    // 2. Centered path relative to origin (0,0)
    const centeredPath = rawPath.map(p => ({
      x: p.x - centroidX,
      y: p.y - centroidY
    }));

    // 3. Compute DFT
    const dftResult = computeDFT(centeredPath);

    // 4. Override X0 coefficient to map to exact canvas middle
    const x0 = dftResult.find(item => item.freq === 0);
    if (x0) {
      x0.re = width / 2;
      x0.im = height / 2;
      x0.amplitude = Math.sqrt(x0.re * x0.re + x0.im * x0.im);
      x0.phase = Math.atan2(x0.im, x0.re);
    }

    // 5. Sort remaining frequencies by amplitude descending, but keep X0 first
    const otherFrequencies = dftResult.filter(item => item.freq !== 0);
    otherFrequencies.sort((a, b) => b.amplitude - a.amplitude);

    const sortedCoefficients = x0 ? [x0, ...otherFrequencies] : otherFrequencies;
    setDftCoefficients(sortedCoefficients);
    setOriginalPath(rawPath.map(p => ({
      x: p.x - centroidX + width / 2,
      y: p.y - centroidY + height / 2
    })));
    setReconstructedTrace([]);
    timeRef.current = 0;
  };

  // Handle Preset Switching
  useEffect(() => {
    if (activePreset !== 'draw') {
      const canvas = canvasRef.current;
      const w = canvas ? canvas.width : 600;
      const h = canvas ? canvas.height : 450;
      const presetPoints = getPresetPath(activePreset);
      
      // Make coordinates absolute inside bounding box
      const absolutePoints = presetPoints.map(p => ({
        x: p.x + w / 2,
        y: p.y + h / 2
      }));
      prepareDFT(absolutePoints, w, h);
    }
  }, [activePreset]);

  // Handle resizing canvas dynamically based on container size
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const newWidth = Math.max(300, rect.width);
      
      canvas.width = newWidth;
      canvas.height = 450;

      // Re-trigger preset computation to realign coordinate center
      if (activePreset !== 'draw') {
        const presetPoints = getPresetPath(activePreset);
        const absolutePoints = presetPoints.map(p => ({
          x: p.x + newWidth / 2,
          y: p.y + 450 / 2
        }));
        prepareDFT(absolutePoints, newWidth, 450);
      } else if (originalPath.length > 0) {
        // Recenter user custom drawing path
        prepareDFT(originalPath, newWidth, 450);
      }
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Helper to retrieve color definitions depending on selected theme and element types
  const getEpicycleColor = (index: number, total: number, type: 'circle' | 'vector' | 'point') => {
    let h = 120; // default matrix green
    let s = 85;
    let l = 55;
    
    if (colorTheme === 'rainbow') {
      h = (index / total) * 360;
      s = 95;
      l = type === 'circle' ? 45 : 60;
    } else if (colorTheme === 'cyberpunk') {
      h = index % 2 === 0 ? 320 : 185; // Neon Magenta vs Cyan
      s = 100;
      l = 60;
    } else if (colorTheme === 'sunset') {
      h = 10 + (index / total) * 50; // Neon Orange/Gold/Red
      s = 100;
      l = 55;
    } else if (colorTheme === 'matrix') {
      h = 120;
      s = 95;
      l = 50 + (index % 3) * 10;
    }

    if (type === 'circle') {
      return `hsla(${h}, ${s}%, ${l}%, ${index === 1 ? 0.25 : index < 10 ? 0.15 : 0.05})`;
    } else if (type === 'vector') {
      return `hsla(${h}, ${s}%, ${l}%, ${index === 1 ? 0.85 : index < 10 ? 0.65 : 0.35})`;
    } else {
      return `hsla(${h}, ${s}%, ${l + 10}%, 0.95)`;
    }
  };

  // Main Animation Loop with Dynamic Multi-Color Styling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dftCoefficients.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const limit = Math.min(maxEpicycles, dftCoefficients.length);

    const render = () => {
      if (!ctx || !canvas) return;

      // Clear with elegant slight opacity to leave sub-trails
      ctx.fillStyle = 'rgba(8, 8, 8, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw the original user drawing path in faded style
      if (showOriginal && originalPath.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 6]);
        ctx.moveTo(originalPath[0].x, originalPath[0].y);
        for (let i = 1; i < originalPath.length; i++) {
          ctx.lineTo(originalPath[i].x, originalPath[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
      }

      // Rotating Epicycles (DFT vector summation)
      let x = 0;
      let y = 0;

      for (let i = 0; i < limit; i++) {
        const coeff = dftCoefficients[i];
        const prevX = x;
        const prevY = y;

        // X0 has frequency 0 (stands as root translation coordinate)
        const freq = coeff.freq;
        const angle = freq * timeRef.current + coeff.phase;

        // If it's the root, just translate directly
        if (i === 0) {
          x = coeff.re;
          y = coeff.im;
        } else {
          // Standard epicycle rotation math
          x += coeff.amplitude * Math.cos(angle);
          y += coeff.amplitude * Math.sin(angle);
        }

        // Draw circles representing amplitude orbits
        if (showCircles && i > 0 && coeff.amplitude > 1.5) {
          ctx.beginPath();
          ctx.arc(prevX, prevY, coeff.amplitude, 0, Math.PI * 2);
          ctx.strokeStyle = getEpicycleColor(i, limit, 'circle');
          ctx.lineWidth = i < 10 ? 1 : 0.5;
          ctx.stroke();
        }

        // Draw radial vector lines
        if (showVectors && i > 0) {
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = getEpicycleColor(i, limit, 'vector');
          ctx.lineWidth = i < 5 ? 1.5 : 0.8;
          ctx.stroke();

          // Highlight vector endpoints
          ctx.beginPath();
          ctx.arc(x, y, i < 5 ? 2.5 : 1.2, 0, Math.PI * 2);
          ctx.fillStyle = getEpicycleColor(i, limit, 'point');
          ctx.fill();
        }
      }

      // Add the final summed point into the traced array
      if (isPlaying) {
        reconstructedTrace.push({ x, y });
        // Prevent buffer bloat, keep it to total sample size to loop perfectly
        if (reconstructedTrace.length > dftCoefficients.length) {
          reconstructedTrace.shift();
        }

        // Optional high-tech musical synthesis feedback!
        if (audioFeedback && isPlaying) {
          soundThrottleRef.current++;
          if (soundThrottleRef.current % 18 === 0) {
            // map vertical coordinate to G-minor pentatonic index
            const normalizedY = Math.max(0, Math.min(1, y / canvas.height));
            const noteIndex = Math.floor((1 - normalizedY) * 11);
            audio.playHarp(noteIndex);
          }
        }
      }

      // Render the reconstructed trace line in vibrant multi-colors
      if (reconstructedTrace.length > 1) {
        for (let i = 1; i < reconstructedTrace.length; i++) {
          ctx.beginPath();
          ctx.moveTo(reconstructedTrace[i - 1].x, reconstructedTrace[i - 1].y);
          ctx.lineTo(reconstructedTrace[i].x, reconstructedTrace[i].y);
          
          let segmentColor = '#10B981';
          let shadowColor = '#10B981';
          
          if (colorTheme === 'rainbow') {
            const hue = (i / reconstructedTrace.length) * 360;
            segmentColor = `hsla(${hue}, 95%, 60%, 0.95)`;
            shadowColor = `hsla(${hue}, 95%, 60%, 0.6)`;
          } else if (colorTheme === 'cyberpunk') {
            const ratio = i / reconstructedTrace.length;
            segmentColor = ratio < 0.5 ? '#ff007f' : '#00ffff'; // neon pink to cyan
            shadowColor = segmentColor;
          } else if (colorTheme === 'sunset') {
            const ratio = i / reconstructedTrace.length;
            const h = 10 + ratio * 45; // gold to orange-red
            segmentColor = `hsla(${h}, 100%, 55%, 0.95)`;
            shadowColor = segmentColor;
          } else if (colorTheme === 'matrix') {
            segmentColor = '#10B981';
            shadowColor = '#059669';
          }

          ctx.strokeStyle = segmentColor;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = shadowColor;
          ctx.shadowBlur = 4;
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        }
      }

      // Playback progress step speed
      if (isPlaying) {
        const dt = (2 * Math.PI) / dftCoefficients.length;
        timeRef.current += dt * speed;
        if (timeRef.current >= Math.PI * 2) {
          timeRef.current = 0; // wrap loop
          // Play a chime at perfect periodic intervals
          if (audioFeedback) {
            audio.playChime(5);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    if (isPlaying || reconstructedTrace.length === 0) {
      animationFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dftCoefficients, maxEpicycles, speed, isPlaying, showCircles, showVectors, showOriginal, audioFeedback, colorTheme]);

  // Touch & Mouse Drawing Coordinates Handling
  const getCoordinatesFromEvent = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Stop event propagation to prevent background scroll interference on mobile
    if (e.cancelable) e.preventDefault();
    
    // Unlock Audio Context on first draw interaction
    audio.init();
    
    const coord = getCoordinatesFromEvent(e);
    if (!coord) return;

    setIsDrawing(true);
    setActivePreset('draw');
    setOriginalPath([coord]);
    setReconstructedTrace([]);
    setDftCoefficients([]);
    timeRef.current = 0;

    audio.playChime(1);
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();

    const coord = getCoordinatesFromEvent(e);
    if (!coord) return;

    setOriginalPath(prev => {
      const nextPath = [...prev, coord];
      // Draw standard raw canvas tracking in real-time
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.strokeStyle = '#06b6d4'; // bright drawing color
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(prev[prev.length - 1].x, prev[prev.length - 1].y);
        ctx.lineTo(coord.x, coord.y);
        ctx.stroke();
      }
      return nextPath;
    });

    // Play subtle auditory clicks during draw drag
    if (originalPath.length % 5 === 0) {
      audio.playInputSound();
    }
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 600;
    const h = canvas ? canvas.height : 450;

    // Reject drawings that have too few points
    if (originalPath.length < 5) {
      setOriginalPath([]);
      audio.playErrorSound();
      return;
    }

    // Downsample path to speed up and stabilize DFT if extremely long
    const cleanPath = originalPath.filter((v, i, a) => {
      if (i === 0) return true;
      const prevPt = a[i - 1];
      const dist = Math.hypot(v.x - prevPt.x, v.y - prevPt.y);
      return dist > 1.5; // filter out static duplicate points
    });

    const downsampled = cleanPath.length > 180 
      ? cleanPath.filter((_, idx) => idx % Math.ceil(cleanPath.length / 180) === 0)
      : cleanPath;

    if (downsampled.length > 5) {
      prepareDFT(downsampled, w, h);
      audio.playSuccessSound();
    } else {
      setOriginalPath([]);
      audio.playErrorSound();
    }
  };

  const clearCanvas = () => {
    setOriginalPath([]);
    setDftCoefficients([]);
    setReconstructedTrace([]);
    timeRef.current = 0;
    setActivePreset('draw');
    audio.playMCBSwitchSound(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Variance & approximation accuracy metric calculation
  const getApproximationAccuracy = (): number => {
    if (dftCoefficients.length === 0) return 0;
    const limit = Math.min(maxEpicycles, dftCoefficients.length);
    let cumulativePower = 0;
    let totalPower = 0;
    for (let i = 0; i < dftCoefficients.length; i++) {
      if (i > 0) { // bypass DC level term
        totalPower += dftCoefficients[i].amplitude ** 2;
        if (i < limit) {
          cumulativePower += dftCoefficients[i].amplitude ** 2;
        }
      }
    }
    if (totalPower === 0) return 100;
    return Math.min(100, (cumulativePower / totalPower) * 100);
  };

  return (
    <div className="w-full border border-[#222222] bg-[#0c0c0c] rounded-none p-5 text-left select-none space-y-6 flex flex-col" id="fourier-epicycles-station">
      
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="font-mono text-xs text-[#10B981] font-bold tracking-widest uppercase">// EXPERIMENTAL SIGNAL ENGINE</span>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight font-sans">
            Fourier Transform Epicycles
          </h3>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wide">
            Decompose coordinate vectors with the Discrete Fourier Transform (DFT) & reconstruct complex wave traces
          </p>
        </div>

        {/* Audio feedback, Preset toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audio.init();
              audio.playMCBSwitchSound(!audioFeedback);
              setAudioFeedback(!audioFeedback);
            }}
            className="relative p-0 bg-transparent border-0 outline-none cursor-pointer select-none transition-transform duration-200 active:scale-95 focus:outline-none"
            aria-label="Toggle Signal Audio Feed"
            title="Skeuomorphic MCB Audio Switch - Pull Lever to Toggle"
          >
            <svg width="110" height="140" viewBox="0 0 110 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl select-none">
              <defs>
                {/* White Italian Carrara Marble Linear Gradient */}
                <linearGradient id="mcb-marble" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f5f7f8" />
                  <stop offset="20%" stopColor="#e8ecef" />
                  <stop offset="40%" stopColor="#fbfcfd" />
                  <stop offset="65%" stopColor="#dbe1e6" />
                  <stop offset="85%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cbd3d9" />
                </linearGradient>

                {/* Brass / Copper Polish Gradient */}
                <linearGradient id="mcb-copper" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9a3412" />
                  <stop offset="30%" stopColor="#ea580c" />
                  <stop offset="50%" stopColor="#fdba74" />
                  <stop offset="70%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#7c2d12" />
                </linearGradient>

                {/* Metallic Steel / Silver Polish */}
                <linearGradient id="mcb-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>

                {/* Antique Brass / Bronze for screws & details */}
                <linearGradient id="mcb-brass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ca8a04" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>

                {/* Black Bakelite / Polymer 3D Handle shading */}
                <linearGradient id="mcb-bakelite" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0a0a0a" />
                  <stop offset="25%" stopColor="#262626" />
                  <stop offset="45%" stopColor="#404040" />
                  <stop offset="60%" stopColor="#171717" />
                  <stop offset="100%" stopColor="#050505" />
                </linearGradient>

                {/* Black Crossbar with high-contrast bevel */}
                <linearGradient id="mcb-crossbar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#404040" />
                  <stop offset="30%" stopColor="#171717" />
                  <stop offset="100%" stopColor="#0a0a0a" />
                </linearGradient>

                {/* Shadow filters for incredible 3D pop */}
                <filter id="mcb-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
                </filter>

                {/* Indicator green electrical glow */}
                <filter id="mcb-green-glow" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Drop Shadow under marble plate */}
              <g filter="url(#mcb-shadow)">
                {/* Main Marble Slab */}
                <rect x="4" y="4" width="102" height="132" rx="8" fill="url(#mcb-marble)" stroke="#334155" strokeWidth="2" />
              </g>

              {/* Marble Organic Veining (makes it feel absolutely premium & real) */}
              <path d="M10,25 Q32,45 22,80 T75,122" stroke="#cbd5e1" strokeWidth="1.2" fill="none" opacity="0.7" />
              <path d="M88,14 Q65,58 78,92 T24,128" stroke="#94a3b8" strokeWidth="0.8" fill="none" opacity="0.6" />
              <path d="M5,62 Q45,72 32,98" stroke="#94a3b8" strokeWidth="0.5" fill="none" opacity="0.4" />

              {/* Heavy Outer Brass Washers/Spacers behind corner screws */}
              <circle cx="12" cy="12" r="4.5" fill="url(#mcb-brass)" opacity="0.85" />
              <circle cx="98" cy="12" r="4.5" fill="url(#mcb-brass)" opacity="0.85" />
              <circle cx="12" cy="128" r="4.5" fill="url(#mcb-brass)" opacity="0.85" />
              <circle cx="98" cy="128" r="4.5" fill="url(#mcb-brass)" opacity="0.85" />

              {/* Corner Slotted Steel Screws */}
              <circle cx="12" cy="12" r="3" fill="url(#mcb-silver)" />
              <line x1="10" y1="10" x2="14" y2="14" stroke="#1e293b" strokeWidth="0.8" />

              <circle cx="98" cy="12" r="3" fill="url(#mcb-silver)" />
              <line x1="96" y1="14" x2="100" y2="10" stroke="#1e293b" strokeWidth="0.8" />

              <circle cx="12" cy="128" r="3" fill="url(#mcb-silver)" />
              <line x1="10.5" y1="125" x2="13.5" y2="131" stroke="#1e293b" strokeWidth="0.8" />

              <circle cx="98" cy="128" r="3" fill="url(#mcb-silver)" />
              <line x1="95" y1="128" x2="101" y2="128" stroke="#1e293b" strokeWidth="0.8" />

              {/* Top Copper Terminal / Jaws Connection Bar (where wires enter) */}
              <path d="M38,34 Q38,15 55,15" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
              <path d="M72,34 Q72,15 55,15" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
              <circle cx="55" cy="15" r="3" fill="#1e293b" />

              {/* Bottom Copper Terminal Connection Bar */}
              <path d="M38,102 Q38,118 55,118" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
              <path d="M72,102 Q72,118 55,118" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
              <circle cx="55" cy="118" r="3" fill="#1e293b" />

              {/* HINGES: Bottom pivots for the knife blades */}
              <rect x="33" y="96" width="10" height="14" rx="1.5" fill="url(#mcb-silver)" stroke="#334155" strokeWidth="0.7" />
              <circle cx="38" cy="103" r="2" fill="#1e293b" />
              <rect x="67" y="96" width="10" height="14" rx="1.5" fill="url(#mcb-silver)" stroke="#334155" strokeWidth="0.7" />
              <circle cx="72" cy="103" r="2" fill="#1e293b" />

              {/* CONTACT CLIPS / JAWS (Receives blades when closed at top) */}
              <rect x="32" y="32" width="12" height="14" rx="1" fill="url(#mcb-copper)" stroke="#7c2d12" strokeWidth="0.5" />
              <path d="M32,36 L44,36 M32,42 L44,42" stroke="#7c2d12" strokeWidth="0.8" />
              <line x1="38" y1="32" x2="38" y2="46" stroke="#222" strokeWidth="1.2" />

              <rect x="66" y="32" width="12" height="14" rx="1" fill="url(#mcb-copper)" stroke="#7c2d12" strokeWidth="0.5" />
              <path d="M66,36 L78,36 M66,42 L78,42" stroke="#7c2d12" strokeWidth="0.8" />
              <line x1="72" y1="32" x2="72" y2="46" stroke="#222" strokeWidth="1.2" />

              {/* LEVER BLADES & HANDLE ASSEMBLY */}
              <g 
                style={{
                  transform: audioFeedback ? 'rotate(0deg)' : 'rotate(-36deg)',
                  transformOrigin: '55px 103px',
                  transition: 'transform 0.22s cubic-bezier(0.25, 1.4, 0.4, 1.05)'
                }}
              >
                {/* Shadows of the blades onto the marble base */}
                <rect x="34" y="36" width="8" height="66" rx="1" fill="#000" opacity="0.25" transform="translate(4, 4)" />
                <rect x="68" y="36" width="8" height="66" rx="1" fill="#000" opacity="0.25" transform="translate(4, 4)" />

                {/* Left Brass/Copper Blade */}
                <rect x="35" y="36" width="6" height="66" rx="1" fill="url(#mcb-copper)" stroke="#7c2d12" strokeWidth="0.5" />
                
                {/* Right Brass/Copper Blade */}
                <rect x="69" y="36" width="6" height="66" rx="1" fill="url(#mcb-copper)" stroke="#7c2d12" strokeWidth="0.5" />

                {/* Transverse Insulated Black Crossbar */}
                <rect x="25" y="30" width="60" height="9" rx="2" fill="url(#mcb-crossbar)" stroke="#0f172a" strokeWidth="0.8" />
                <circle cx="38" cy="34.5" r="1.5" fill="url(#mcb-silver)" />
                <circle cx="72" cy="34.5" r="1.5" fill="url(#mcb-silver)" />

                {/* 3D Heavy Polymer Handle Base */}
                <rect x="46" y="24" width="18" height="7" rx="1.5" fill="url(#mcb-bakelite)" stroke="#000" strokeWidth="0.5" />

                {/* Lever Handle Stem & Bulbous Grip */}
                <path 
                  d="M50,24 C50,18 47,12 47,-2 C47,-10 51,-16 55,-16 C59,-16 63,-10 63,-2 C63,12 60,18 60,24 Z" 
                  fill="url(#mcb-bakelite)" 
                  stroke="#000" 
                  strokeWidth="0.7" 
                />
                
                {/* specular glint on Handle */}
                <path d="M51,18 C51,12 49,6 49,-2 C49,-8 50,-13 52,-13" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <ellipse cx="55" cy="-8" rx="4" ry="5" fill="rgba(255,255,255,0.08)" />
                <circle cx="53" cy="-11" r="2" fill="rgba(255,255,255,0.15)" />
              </g>

              {/* BRASS ENGRAVED LABELS PLACARD */}
              <g transform="translate(14, 114)">
                <rect x="0" y="0" width="82" height="14" rx="2" fill="url(#mcb-brass)" stroke="#451a03" strokeWidth="1" />
                <text 
                  x="41" 
                  y="9.5" 
                  textAnchor="middle" 
                  fontSize="6.5" 
                  fontFamily="monospace" 
                  fontWeight="900" 
                  fill="#1c0d02" 
                  letterSpacing="0.6"
                >
                  {audioFeedback ? 'SOUND: ON' : 'SOUND: MUTED'}
                </text>
              </g>

              {/* Status Neon Light and Metallic Ring */}
              <g transform="translate(55, 69)">
                <circle cx="0" cy="0" r="6" fill="url(#mcb-silver)" stroke="#1e293b" strokeWidth="0.8" />
                <circle 
                  cx="0" 
                  cy="0" 
                  r="4" 
                  fill={audioFeedback ? '#10b981' : '#ef4444'} 
                  filter={audioFeedback ? 'url(#mcb-green-glow)' : 'none'}
                  className="transition-all duration-300"
                />
                <circle cx="-1" cy="-1" r="1.2" fill="#fff" opacity="0.7" />
              </g>
            </svg>
          </button>
        </div>
      </div>

      {/* Preset selection bar */}
      <div className="flex flex-wrap gap-2 bg-[#050505] p-2 border border-white/5">
        <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest px-2 self-center font-bold">
          SELECT PATTERN:
        </span>
        {[
          { id: 'cheetah', label: ' Cheetah' },
          { id: 'infinity', label: 'Lemniscate ♾️' },
          { id: 'butterfly', label: 'Butterfly Fay' },
          { id: 'star', label: 'Gold Star 🌟' },
          { id: 'treble', label: 'Treble Clef 🎼' },
          { id: 'draw', label: '🖌️ Draw Custom' }
        ].map((p) => {
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                audio.init();
                audio.playChime(4);
                setActivePreset(p.id);
              }}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-all duration-300 border ${
                isActive
                  ? 'text-[#10B981] border-[#10B981]/40 bg-[#10B981]/5 font-bold'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Canvas and Sidebar HUD container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Canvas Area */}
        <div 
          className="lg:col-span-8 border border-[#222222] bg-[#080808] relative overflow-hidden flex flex-col items-stretch cursor-crosshair group select-none min-h-[450px]"
          ref={containerRef}
        >
          {/* Subtle watermarked grid label inside the canvas area */}
          <span className="absolute top-3 left-3 font-mono text-[8.5px] text-gray-600 tracking-widest uppercase font-black pointer-events-none select-none z-10">
            FFT CANVAS RECONSTRUCTION // PLANE_2D
          </span>

          <canvas
            ref={canvasRef}
            onMouseDown={handleStartDraw}
            onMouseMove={handleDrawMove}
            onMouseUp={handleEndDraw}
            onMouseLeave={handleEndDraw}
            onTouchStart={handleStartDraw}
            onTouchMove={handleDrawMove}
            onTouchEnd={handleEndDraw}
            className="w-full flex-1 touch-none"
          />

          {/* Quick HUD values overlaid on bottom of canvas */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 bg-black/60 backdrop-blur-md border border-white/5 px-3 py-2 font-mono text-[8.5px] text-gray-400 pointer-events-none select-none">
            <div className="flex gap-4">
              <span>SAMPLES (N): <strong className="text-white font-extrabold">{dftCoefficients.length}</strong></span>
              <span>EPICYCLES IN USE: <strong className="text-[#06b6d4] font-extrabold">{Math.min(maxEpicycles, dftCoefficients.length)}</strong></span>
            </div>
            <div className="flex gap-4">
              <span>POWER ACCURACY: <strong className="text-[#10B981] font-extrabold">{getApproximationAccuracy().toFixed(2)}%</strong></span>
              <span>LOOP_STEP: <strong className="text-white font-extrabold">{((timeRef.current / (Math.PI * 2)) * 100).toFixed(0)}%</strong></span>
            </div>
          </div>

          {/* Tutorial Overlay when canvas is cleared/draw mode */}
          {activePreset === 'draw' && originalPath.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none bg-black/40 select-none">
              <Paintbrush className="w-10 h-10 text-cyan-500/70 mb-3 animate-pulse" />
              <p className="font-mono text-xs text-white uppercase tracking-wider font-bold">
                Draw anything freehand!
              </p>
              <p className="font-mono text-[10px] text-gray-500 max-w-sm uppercase leading-relaxed mt-1">
                Click and drag your mouse or touch and draw with finger inside the canvas boundaries, then release to launch the Fourier decomposition.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar HUD Controls Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 border border-[#222222] bg-[#121212]/40 p-4">
          
          {/* Sub-tab diagnostics */}
          <div className="flex border-b border-white/5 pb-2">
            {[
              { id: 'visualizer', label: 'Decomposition Controls' },
              { id: 'frequencies', label: 'Frequency Spectrum' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  audio.playChime(3);
                  setActiveTab(t.id as any);
                }}
                className={`flex-1 pb-1 font-mono text-[9px] uppercase tracking-wider font-bold transition-all text-center border-b-2 ${
                  activeTab === t.id 
                    ? 'text-[#10B981] border-[#10B981]' 
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'visualizer' ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between pt-1">
              {/* Sliders and Controls */}
              <div className="space-y-4">
                
                {/* Epicycle Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-gray-400">
                    <span className="uppercase tracking-widest flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      EPICYCLES LIMIT
                    </span>
                    <span className="text-white font-black">{maxEpicycles} / 64</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="64"
                    value={maxEpicycles}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      setMaxEpicycles(count);
                      audio.playInputSound();
                    }}
                    className="w-full accent-[#10B981] bg-neutral-900 h-1 border border-white/10 rounded-none cursor-pointer"
                  />
                  <span className="block font-mono text-[8px] text-gray-500 uppercase leading-normal">
                    Higher counts represent higher frequency components which approximate finer micro-details (sharp corners, loops).
                  </span>
                </div>

                {/* Speed Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-gray-400">
                    <span className="uppercase tracking-widest">
                      SWEEP VELOCITY
                    </span>
                    <span className="text-white font-black">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => {
                      const spd = parseFloat(e.target.value);
                      setSpeed(spd);
                      audio.playInputSound();
                    }}
                    className="w-full accent-[#06b6d4] bg-neutral-900 h-1 border border-white/10 rounded-none cursor-pointer"
                  />
                </div>

                {/* Color Theme Selector */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#10B981]" /> SPECTRAL COLOR THEME
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'rainbow', label: '🌈 Rainbow' },
                      { id: 'cyberpunk', label: '⚡ Cyberpunk' },
                      { id: 'sunset', label: '🌅 Sunset' },
                      { id: 'matrix', label: '🟢 Matrix' }
                    ].map((themeOption) => {
                      const isThemeActive = colorTheme === themeOption.id;
                      return (
                        <button
                          key={themeOption.id}
                          onClick={() => {
                            audio.init();
                            audio.playChime(4);
                            setColorTheme(themeOption.id);
                          }}
                          className={`px-2 py-1.5 border font-mono text-[9px] tracking-wider uppercase text-left transition-all ${
                            isThemeActive
                              ? 'border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981] font-black'
                              : 'border-white/5 bg-transparent text-gray-400 hover:text-white'
                          }`}
                        >
                          {themeOption.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Layer visibilities */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <span className="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest block">
                    LAYER TOGGLES
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { state: showCircles, set: setShowCircles, label: 'Orbits (Circles)' },
                      { state: showVectors, set: setShowVectors, label: 'Vectors (Arms)' },
                      { state: showOriginal, set: setShowOriginal, label: 'Original Faded' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          audio.init();
                          audio.playChime(2);
                          item.set(!item.state);
                        }}
                        className={`px-2.5 py-1.5 border font-mono text-[9px] tracking-wider uppercase text-left transition-all flex items-center justify-between ${
                          item.state 
                            ? 'border-emerald-500/20 bg-emerald-500/5 text-[#10B981] font-black'
                            : 'border-white/5 bg-transparent text-gray-500'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.state ? 'bg-[#10B981] animate-pulse' : 'bg-neutral-800'}`} />
                      </button>
                    ))}
                    
                    {activePreset === 'draw' && (
                      <button
                        onClick={clearCanvas}
                        className="px-2.5 py-1.5 border border-rose-500/30 bg-rose-500/5 text-rose-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 font-mono text-[9px] tracking-wider uppercase text-center transition-all"
                      >
                        Reset Canvas 🧹
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Standard play controls */}
              <div className="flex gap-2.5 pt-3 border-t border-white/5 select-none">
                <button
                  onClick={() => {
                    audio.init();
                    audio.playChime(4);
                    setIsPlaying(!isPlaying);
                  }}
                  className="flex-1 py-2.5 bg-white hover:bg-gray-200 text-black font-mono text-[10px] tracking-widest uppercase font-black transition-colors flex items-center justify-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-black" />
                      Pause Sweep
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-black" />
                      Play Sweep
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    audio.init();
                    audio.playSuccessSound();
                    setReconstructedTrace([]);
                    timeRef.current = 0;
                  }}
                  className="px-4 py-2.5 border border-[#222222] hover:border-white text-gray-300 font-mono text-[10px] uppercase transition-colors flex items-center justify-center"
                  title="Restart animation trace from step 0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // Frequency spectrum tab
            <div className="space-y-4 flex-1 flex flex-col justify-between pt-1">
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="font-mono text-[9.5px] text-gray-400 font-black tracking-widest uppercase block flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#10B981]" /> Amplitude Spectrum
                  </span>
                  <p className="font-mono text-[8px] text-gray-500 leading-normal uppercase">
                    The absolute magnitude representing contribution of each sinusoidal frequency component to the final path.
                  </p>
                </div>

                {/* Minimalist Bar Graph representation */}
                <div className="flex-1 min-h-[160px] bg-black/60 border border-white/5 p-2 flex items-end justify-between gap-[2px]">
                  {dftCoefficients.slice(0, 32).map((item, idx) => {
                    if (idx === 0) return null; // bypass root level coordinate bar to keep scale reasonable
                    const maxVal = Math.max(...dftCoefficients.slice(1, 32).map(c => c.amplitude)) || 1;
                    const percent = Math.min(100, (item.amplitude / maxVal) * 100);
                    const isActive = idx < maxEpicycles;
                    return (
                      <div
                        key={idx}
                        className="flex-1 group relative flex flex-col justify-end h-full cursor-pointer"
                        title={`Freq: ${item.freq} | Amp: ${item.amplitude.toFixed(1)}`}
                        onClick={() => {
                          audio.playHarp(idx % 12);
                        }}
                      >
                        {/* Bar Segment */}
                        <div 
                          className={`w-full rounded-xs transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-t from-emerald-600 to-cyan-400 group-hover:brightness-125' 
                              : 'bg-neutral-800'
                          }`}
                          style={{ height: `${percent}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Spectrum annotations */}
                <div className="flex justify-between font-mono text-[7px] text-gray-500 uppercase tracking-widest px-1.5 font-bold">
                  <span>FUNDAMENTAL (F1)</span>
                  <span>HARMONICS (F32)</span>
                </div>

                {/* Highlight highest energy components */}
                <div className="bg-neutral-950 border border-white/5 p-2.5 font-mono text-[8px] space-y-1.5 rounded-sm">
                  <span className="text-gray-500 uppercase font-black block">// DOMINANT COMPONENT READOUT:</span>
                  {dftCoefficients.length > 2 ? (
                    <div className="space-y-1 text-gray-300 uppercase">
                      <div>1. FREQ <strong className="text-white">#{dftCoefficients[1].freq}</strong> - AMP <strong className="text-[#10B981]">{dftCoefficients[1].amplitude.toFixed(1)}</strong></div>
                      <div>2. FREQ <strong className="text-white">#{dftCoefficients[2].freq}</strong> - AMP <strong className="text-[#06b6d4]">{dftCoefficients[2].amplitude.toFixed(1)}</strong></div>
                    </div>
                  ) : (
                    <span className="text-gray-600 italic">No drawing vectors processed yet.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Theoretical explanation footer */}
          <div className="bg-black/60 p-2.5 border border-white/5 flex gap-2 font-mono text-[8px] text-gray-500 uppercase leading-relaxed font-bold">
            <HelpCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
            <p>
              In 1807, Fourier proved that any periodic path can be approximated as a sum of simple rotating circles. By computing the DFT, we convert your freehand spatial coordinates into frequency vectors.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
