import { useEffect, useRef, useState } from 'react';
import { audio } from '../lib/audio';

interface AudioVisualizerProps {
  isMuted: boolean;
}

export default function AudioVisualizer({ isMuted: propIsMuted }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(audio.getPlayingStatus());

  useEffect(() => {
    // Subscribe to global audio state changes
    const unsubscribe = audio.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const analyser = audio.getAnalyserNode();

      // If muted or no active audio context, draw a resting flat line with minor noise
      if (!isPlaying || !analyser) {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        // Add tiny, calm ambient vibration even when silent, to look alive
        for (let i = 0; i < width; i++) {
          const x = i;
          const noise = Math.sin(Date.now() * 0.003 + i * 0.08) * 0.4;
          const y = height / 2 + noise;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 1;
        ctx.stroke();
        return;
      }

      // Query real-time waveform data
      analyser.getByteTimeDomainData(dataArray);

      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#10B981'; // Emerald glow
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 4;

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Normalize time-domain sample (normally 0-255, centered at 128)
        const v = dataArray[i] / 128.0;
        let y = v * (height / 2);

        // Limit range slightly to prevent overflow
        if (y < 1) y = 1;
        if (y > height - 1) y = height - 1;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow for performance
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={60}
      height={18}
      className="opacity-80 hover:opacity-100 transition-opacity bg-transparent"
    />
  );
}
