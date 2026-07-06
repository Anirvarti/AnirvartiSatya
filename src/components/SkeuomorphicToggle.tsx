// /src/components/SkeuomorphicToggle.tsx
import { motion } from "motion/react";
import { audio } from "../lib/audio";

interface SkeuomorphicToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

export default function SkeuomorphicToggle({ isOn, onToggle }: SkeuomorphicToggleProps) {
  const handleClick = () => {
    // Play the amazing vintage switch sound (ON or OFF acoustic release profile)
    try {
      audio.playMCBSwitchSound(!isOn);
    } catch (e) {
      console.warn("Sound play deferred", e);
    }
    onToggle();
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none" id="skeuomorphic-audio-toggle">
      {/* Mini status indicator above the plate */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[8px] text-gray-500 tracking-wider uppercase">SOUND:</span>
        <span className={`font-mono text-[8px] font-bold tracking-wider uppercase transition-colors duration-200 ${
          isOn ? "text-[#10B981]" : "text-rose-500"
        }`}>
          {isOn ? "ARMED" : "MUTED"}
        </span>
      </div>

      {/* The Brushed Brass Faceplate */}
      <button
        onClick={handleClick}
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center p-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]/50 cursor-pointer transition-all duration-200 active:scale-95 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),_0_6px_10px_rgba(0,0,0,0.55),_0_2px_4px_rgba(0,0,0,0.45)] border border-[#523d29] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #a6865d 0%, #7d603d 35%, #59432b 70%, #402f1d 100%)",
        }}
        title={isOn ? "Mute Cybernetic Audio" : "Activate Cybernetic Audio"}
      >
        {/* Fine vertical brushed-metal lines overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 2px)",
            backgroundSize: "2px 100%"
          }}
        />

        {/* 4 Corner Faceplate Screws (Mini flathead brass screws for detail) */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#dfc199] to-[#3a2a1b] shadow-[0_0.5px_0.5px_rgba(0,0,0,0.5)] flex items-center justify-center">
          <div className="w-[1px] h-1 bg-[#1c130b] rotate-45" />
        </div>
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#dfc199] to-[#3a2a1b] shadow-[0_0.5px_0.5px_rgba(0,0,0,0.5)] flex items-center justify-center">
          <div className="w-[1px] h-1 bg-[#1c130b] -rotate-12" />
        </div>
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#dfc199] to-[#3a2a1b] shadow-[0_0.5px_0.5px_rgba(0,0,0,0.5)] flex items-center justify-center">
          <div className="w-[1px] h-1 bg-[#1c130b] rotate-12" />
        </div>
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#dfc199] to-[#3a2a1b] shadow-[0_0.5px_0.5px_rgba(0,0,0,0.5)] flex items-center justify-center">
          <div className="w-[1px] h-1 bg-[#1c130b] -rotate-45" />
        </div>

        {/* Central Bezel Ring (Machined brass collar) */}
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center p-1 border border-[#3e2c1c]/50 shadow-[0_1px_1px_rgba(255,255,255,0.2),_inset_0_1.5px_3px_rgba(0,0,0,0.7)]"
          style={{
            background: "conic-gradient(from 45deg, #322315, #886c4a, #dcc6a8, #886c4a, #322315, #886c4a, #dcc6a8, #886c4a, #322315)",
          }}
        >
          {/* Inner dark aperture (cavity socket) */}
          <div className="w-6 h-6 rounded-full bg-[#100b07] shadow-[inset_0_3px_5px_rgba(0,0,0,0.95)] flex items-center justify-center relative overflow-visible">
            
            {/* The Lever Arm assembly */}
            <motion.div
              className="relative w-4 h-8 flex flex-col items-center justify-center origin-center"
              animate={{
                // 3D mechanical rotate-tilt with micro squash-stretch
                rotateX: isOn ? -22 : 22,
                y: isOn ? -2 : 2,
              }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 20,
                mass: 0.8
              }}
              style={{
                perspective: 300,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Dynamic light shadow cast inside socket */}
              <div 
                className={`absolute w-3.5 h-3.5 rounded-full bg-black/80 blur-[2px] pointer-events-none transition-all duration-150 ${
                  isOn ? "top-3" : "-top-0.5"
                }`}
              />

              {/* Toggle Lever Needle Design */}
              <div className="relative w-3.5 h-7 flex flex-col items-center">
                {/* 1. Metal pivot core shank */}
                <div className="w-1.5 h-2 bg-gradient-to-r from-[#20150d] via-[#4d3827] to-[#1a110a] absolute top-4 z-10" />

                {/* 2. The Knurled handle handle tip */}
                <div 
                  className="w-3.5 h-5 rounded-md relative overflow-hidden z-20 border border-[#4a3522] shadow-[0_2px_4px_rgba(0,0,0,0.6),_inset_0_1px_1px_rgba(255,255,255,0.45)]"
                  style={{
                    background: "linear-gradient(90deg, #6c4f34 0%, #b28c61 30%, #eadaad 50%, #9e7b54 80%, #46311f 100%)",
                  }}
                >
                  {/* Real Knurling texture overlay (Cross-hatch mesh) */}
                  <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="knurl-pattern" width="3" height="3" patternUnits="userSpaceOnUse">
                        {/* Cross hatching lines */}
                        <line x1="0" y1="0" x2="3" y2="3" stroke="#fff" strokeWidth="0.6" />
                        <line x1="3" y1="0" x2="0" y2="3" stroke="#000" strokeWidth="0.6" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#knurl-pattern)" />
                  </svg>

                  {/* Specular light glare line */}
                  <div className="absolute top-0 bottom-0 left-[45%] w-[1.5px] bg-white/40 blur-[0.5px] pointer-events-none" />
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </button>
    </div>
  );
}
