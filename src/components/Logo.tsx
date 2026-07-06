// /src/components/Logo.tsx
import { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export default function Logo({ className = '', size = 150, animated = true }: LogoProps) {
  return (
    <div 
      className={`relative select-none flex items-center justify-center overflow-hidden ${className} ${
        animated ? 'hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500' : ''
      }`}
      style={{ width: size, height: size }}
      id="anirvarti-cheetah-logo"
    >
      {/* High-fidelity Vector representation of Cheetah and Marble 1 */}
      <svg
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        <defs>
          {/* Gold Gradients */}
          <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBA5A" />
            <stop offset="50%" stopColor="#C5A03E" />
            <stop offset="100%" stopColor="#916F1F" />
          </linearGradient>
          <linearGradient id="cheetahBody" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A5A16" />
            <stop offset="40%" stopColor="#B58130" />
            <stop offset="70%" stopColor="#E2B15B" />
            <stop offset="100%" stopColor="#F7D38C" />
          </linearGradient>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E2B15B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E2B15B" stopOpacity="0" />
          </radialGradient>
          
          {/* Marble "1" Gradients */}
          <linearGradient id="marbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#F5F5F3" />
            <stop offset="70%" stopColor="#E8E8E5" />
            <stop offset="100%" stopColor="#D4D4D0" />
          </linearGradient>
          <linearGradient id="marbleShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9E9E9B" />
          </linearGradient>

          {/* Dark Wooden Base Reflection Gradient */}
          <linearGradient id="woodBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A1508" />
            <stop offset="40%" stopColor="#1C0E05" />
            <stop offset="100%" stopColor="#0B0502" />
          </linearGradient>
          <linearGradient id="reflectionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2B15B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          
          {/* Subtle Scanline Grid for Logo Backdrop */}
          <pattern id="logoGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Ambient Dark/Black Background */}
        <rect width="400" height="500" fill="#040404" />
        <rect width="400" height="500" fill="url(#logoGrid)" />

        {/* Dynamic Warm Radial Glow behind the contact point */}
        <circle cx="240" cy="180" r="140" fill="url(#goldGlow)" />

        {/* Gold Text Signature inside image */}
        <g id="gold-brand-text">
          <text
            x="70"
            y="95"
            fill="url(#goldText)"
            fontFamily="'Inter', 'Space Grotesk', sans-serif"
            fontSize="18"
            fontWeight="900"
            letterSpacing="0.25em"
            opacity="0.9"
          >
            ANIRVARTI SATYA
          </text>
        </g>

        {/* REFLECTIONS ON WOODEN BASE */}
        <g id="reflective-surface">
          {/* Horizontal division line representing table top */}
          <line x1="30" y1="365" x2="370" y2="365" stroke="#3A2010" strokeWidth="1.5" opacity="0.6" />
          
          {/* Inverted mirror reflection of the Cheetah */}
          <path
            d="M 172 365 C 172 410, 222 410, 212 435 C 205 440, 190 443, 175 445 C 130 445, 110 435, 125 410 C 135 390, 155 375, 168 365"
            fill="url(#reflectionGrad)"
            opacity="0.3"
            transform="scale(1, -1) translate(0, -730)"
          />
          {/* Inverted mirror reflection of the numeral 1 */}
          <rect
            x="236"
            y="365"
            width="100"
            height="100"
            fill="url(#reflectionGrad)"
            opacity="0.25"
            transform="scale(1, -1) translate(0, -730)"
          />
        </g>

        {/* MARBLE NUMERAL 1 */}
        <g id="marble-one-sculpture">
          {/* Main vertical column of the "1" */}
          <path
            d="M 262 120 L 305 120 L 305 335 L 262 335 Z"
            fill="url(#marbleGrad)"
          />
          
          {/* Left Serif beak of the "1" */}
          <path
            d="M 262 120 C 255 125, 238 135, 236 142 L 236 150 L 262 144 Z"
            fill="url(#marbleGrad)"
          />
          
          {/* Large bottom platform of the "1" */}
          <path
            d="M 236 335 L 332 335 C 335 335, 335 348, 332 348 L 236 348 C 233 348, 233 335, 236 335 Z"
            fill="url(#marbleGrad)"
          />

          {/* Marble veining patterns */}
          <path d="M 280 120 Q 285 180, 275 220 T 290 310" stroke="rgba(0,0,0,0.11)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 292 140 Q 280 200, 295 250" stroke="rgba(0,0,0,0.07)" strokeWidth="1" strokeLinecap="round" />
          <path d="M 245 338 L 255 344" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round" />
          <path d="M 270 340 L 285 346" stroke="rgba(0,0,0,0.1)" strokeWidth="1" strokeLinecap="round" />

          {/* 3D highlights and shadows on the marble 1 */}
          <path d="M 262 120 L 262 335" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <path d="M 305 120 L 305 335" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
          <path d="M 236 335 L 332 335" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
        </g>

        {/* CHEETAH SCULPTURE */}
        <g id="cheetah-sculpture">
          {/* Cheetah body paths - standing, reaching upward with natural curves */}
          {/* Tail */}
          <path
            d="M 125 345 C 110 345, 95 335, 90 320 C 85 300, 100 285, 115 288 C 125 290, 135 305, 130 320 C 126 332, 135 340, 142 342"
            stroke="url(#cheetahBody)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />

          {/* Hind legs folded / sitting base */}
          <path
            d="M 120 345 C 110 330, 115 310, 130 305 C 145 300, 165 315, 172 330 C 178 342, 175 352, 162 352 C 145 352, 130 348, 120 345 Z"
            fill="url(#cheetahBody)"
          />

          {/* Sleek torso arching upward */}
          <path
            d="M 148 335 C 145 295, 170 245, 185 210 C 195 185, 210 160, 218 135"
            stroke="url(#cheetahBody)"
            strokeWidth="32"
            strokeLinecap="round"
            fill="none"
          />

          {/* Front legs stretching up to touch the marble 1 */}
          {/* Left leg (reaching high) */}
          <path
            d="M 204 160 L 245 130"
            stroke="url(#cheetahBody)"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right leg (touching the 1 body) */}
          <path
            d="M 210 175 L 254 148"
            stroke="url(#cheetahBody)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cheetah Head, ears and muzzle looking up */}
          <path
            d="M 218 135 C 220 128, 226 122, 230 125 C 234 128, 236 135, 232 142 C 228 148, 222 148, 218 135 Z"
            fill="url(#cheetahBody)"
          />
          {/* Ear */}
          <path
            d="M 218 131 L 214 123 L 221 127 Z"
            fill="url(#cheetahBody)"
            stroke="#653F0F"
            strokeWidth="1"
          />

          {/* Cheetah Spotted Pattern (realistic random placement on body/legs) */}
          {/* Head spots */}
          <circle cx="222" cy="132" r="2.5" fill="#1C1105" />
          <circle cx="226" cy="135" r="2" fill="#1C1105" />
          
          {/* Neck & shoulder spots */}
          <ellipse cx="212" cy="148" rx="3.5" ry="2" fill="#1C1105" transform="rotate(-20 212 148)" />
          <circle cx="206" cy="154" r="3" fill="#1C1105" />
          <circle cx="216" cy="158" r="4" fill="#1C1105" />

          {/* Front leg spots */}
          <circle cx="225" cy="144" r="2.5" fill="#1C1105" />
          <circle cx="236" cy="136" r="2" fill="#1C1105" />
          <circle cx="242" cy="141" r="2.5" fill="#1C1105" />

          {/* Back spine spots */}
          <ellipse cx="196" cy="178" rx="6" ry="4" fill="#1C1105" transform="rotate(-35 196 178)" />
          <ellipse cx="186" cy="198" rx="6.5" ry="4.5" fill="#1C1105" transform="rotate(-30 186 198)" />
          <ellipse cx="178" cy="218" rx="7" ry="5" fill="#1C1105" transform="rotate(-25 178 218)" />
          <ellipse cx="168" cy="242" rx="7.5" ry="5" fill="#1C1105" transform="rotate(-20 168 242)" />
          <ellipse cx="160" cy="268" rx="8" ry="5.5" fill="#1C1105" transform="rotate(-15 160 268)" />
          <ellipse cx="154" cy="295" rx="8.5" ry="6" fill="#1C1105" transform="rotate(-10 154 295)" />

          {/* Chest & belly spots */}
          <circle cx="185" cy="186" r="3.5" fill="#1C1105" />
          <circle cx="174" cy="208" r="4" fill="#1C1105" />
          <circle cx="166" cy="232" r="4.5" fill="#1C1105" />
          <circle cx="158" cy="258" r="5" fill="#1C1105" />

          {/* Sitting leg/hip spots */}
          <ellipse cx="145" cy="314" rx="7" ry="5" fill="#1C1105" transform="rotate(15 145 314)" />
          <ellipse cx="132" cy="328" rx="6.5" ry="4.5" fill="#1C1105" transform="rotate(30 132 328)" />
          <circle cx="156" cy="328" r="5" fill="#1C1105" />
          <circle cx="166" cy="340" r="4" fill="#1C1105" />
          <circle cx="146" cy="344" r="3.5" fill="#1C1105" />

          {/* Tail spots */}
          <circle cx="126" cy="314" r="3" fill="#1C1105" />
          <circle cx="114" cy="296" r="2.5" fill="#1C1105" />
          <circle cx="100" cy="294" r="2.5" fill="#1C1105" />
          <circle cx="92" cy="312" r="3" fill="#1C1105" />
          <circle cx="106" cy="328" r="3.5" fill="#1C1105" />
        </g>

        {/* GLOW AT TOUCH/CONTACT POINT */}
        <g id="contact-glow">
          <circle cx="245" cy="130" r="10" fill="#FFEAA7" opacity="0.4" />
          <circle cx="245" cy="130" r="3" fill="#FFFFFF" />
        </g>

        {/* SOLID MAIOLIC WOOD BASE TABLE */}
        <g id="wood-table-rim">
          <rect x="20" y="352" width="360" height="13" fill="url(#woodBase)" rx="1" />
          {/* Wood shine edge line */}
          <line x1="20" y1="353" x2="380" y2="353" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="20" y1="364" x2="380" y2="364" stroke="#000000" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
