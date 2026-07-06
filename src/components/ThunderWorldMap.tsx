import { useEffect, useState } from "react";

export default function ThunderWorldMap() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let timeoutId: number;

    const triggerThunder = () => {
      const startTime = Date.now();
      const duration = 2000; // Exactly 2 seconds of high fidelity flickering

      const flash = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          setOpacity(0);
          scheduleNextThunder();
          return;
        }

        // Inside the 2-second cycle, alternate between bright bursts and dim background glows
        const isBright = Math.random() > 0.4;
        const currentOpacity = isBright 
          ? Math.random() * 0.6 + 0.35 // Bright flash (0.35 to 0.95 opacity)
          : Math.random() * 0.15 + 0.04; // Dim glow (0.04 to 0.19 opacity)
        
        setOpacity(currentOpacity);
        
        // Staggered rapid micro-flickers (50ms to 160ms) to create authentic thunderstorm lightning
        const nextFlashDelay = Math.random() * 110 + 50;
        timeoutId = window.setTimeout(flash, nextFlashDelay);
      };

      flash();
    };

    const scheduleNextThunder = () => {
      // Thunder triggers every 8 to 18 seconds
      const nextTime = Math.random() * 10000 + 8000;
      timeoutId = window.setTimeout(triggerThunder, nextTime);
    };

    scheduleNextThunder();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Highly accurate detailed country/continent paths scaled to viewBox="0 0 800 400"
  const continents = [
    {
      name: "Greenland",
      d: "M 315,35 L 330,28 L 350,25 L 362,35 L 365,55 L 358,75 L 340,92 L 328,88 L 324,70 L 316,55 Z",
    },
    {
      name: "North America",
      d: "M 40,70 L 60,65 L 80,68 L 95,50 L 110,40 L 130,45 L 140,30 L 150,32 L 155,45 L 175,40 L 190,55 L 210,48 L 225,55 L 245,52 L 255,75 L 240,82 L 250,90 L 265,85 L 275,95 L 278,110 L 265,112 L 260,118 L 255,115 L 245,128 L 250,140 L 240,148 L 225,142 L 210,165 L 205,185 L 195,195 L 180,210 L 172,215 L 170,205 L 176,192 L 170,180 L 158,185 L 148,170 L 152,160 L 140,158 L 135,148 L 122,145 L 110,148 L 98,140 L 85,145 L 75,135 L 70,115 L 62,118 L 55,108 L 48,112 L 42,95 L 45,85 Z",
    },
    {
      name: "South America",
      d: "M 172,215 L 182,212 L 195,214 L 208,210 L 218,218 L 228,220 L 235,232 L 248,245 L 254,260 L 250,272 L 242,285 L 234,305 L 222,330 L 208,360 L 196,380 L 188,388 L 184,385 L 186,370 L 180,355 L 185,340 L 182,320 L 174,305 L 168,280 L 164,265 L 166,245 L 170,230 Z",
    },
    {
      name: "Africa",
      d: "M 342,188 L 355,182 L 370,185 L 388,180 L 395,188 L 405,185 L 410,192 L 406,202 L 415,208 L 426,202 L 434,208 L 442,204 L 448,212 L 458,210 L 466,224 L 482,235 L 476,248 L 465,258 L 458,272 L 452,295 L 442,318 L 430,335 L 418,348 L 410,348 L 404,332 L 408,315 L 400,298 L 396,280 L 382,268 L 370,255 L 358,248 L 344,242 L 336,230 L 334,215 L 338,205 Z",
    },
    {
      name: "Madagascar",
      d: "M 465,295 L 475,285 L 480,295 L 472,320 L 464,315 Z",
    },
    {
      name: "Eurasia",
      d: "M 315,115 L 318,105 L 314,92 L 322,85 L 324,70 L 334,68 L 336,55 L 344,52 L 340,42 L 352,44 L 358,55 L 372,58 L 385,50 L 395,58 L 415,52 L 430,58 L 450,50 L 468,54 L 485,46 L 505,52 L 525,44 L 545,48 L 565,40 L 585,46 L 605,42 L 625,48 L 645,44 L 665,52 L 685,48 L 705,58 L 725,54 L 745,64 L 755,75 L 748,92 L 735,98 L 742,110 L 730,122 L 715,120 L 712,132 L 698,140 L 704,152 L 690,165 L 675,158 L 668,172 L 655,180 L 642,192 L 632,208 L 620,222 L 610,215 L 614,202 L 605,195 L 594,208 L 585,215 L 574,210 L 565,225 L 555,238 L 545,232 L 548,218 L 538,208 L 522,212 L 512,228 L 502,234 L 494,228 L 498,215 L 484,205 L 464,208 L 458,200 L 444,198 L 434,188 L 420,188 L 414,178 L 402,175 L 394,182 L 382,178 L 376,168 L 364,170 L 356,162 L 358,150 L 345,152 L 340,162 L 332,158 L 330,145 L 335,138 L 322,132 L 324,120 Z",
    },
    {
      name: "Japan",
      d: "M 724,120 L 732,115 L 736,128 L 726,145 L 720,140 Z",
    },
    {
      name: "United Kingdom",
      d: "M 314,102 L 320,95 L 324,105 L 318,112 Z",
    },
    {
      name: "Australia",
      d: "M 625,275 L 645,268 L 665,265 L 685,272 L 695,285 L 698,302 L 685,320 L 675,328 L 660,325 L 645,332 L 632,328 L 622,310 L 618,292 Z",
    },
    {
      name: "New Zealand",
      d: "M 715,335 L 722,325 L 728,332 L 722,348 L 716,352 Z",
    }
  ];

  // Cyber tactical marker coordinates
  const markers = [
    { x: 160, y: 110, label: "NA-HQ" },
    { x: 215, y: 260, label: "SA-SEC" },
    { x: 410, y: 210, label: "AF-NOD" },
    { x: 500, y: 120, label: "EU-SYS" },
    { x: 640, y: 140, label: "AS-CORE" },
    { x: 660, y: 300, label: "AU-BASE" },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center transition-opacity duration-75 overflow-hidden"
        style={{ opacity: opacity }}
      >
        <svg
          viewBox="0 0 800 400"
          className="w-[140vw] h-[140vh] max-w-none min-w-[1200px] min-h-[600px] mix-blend-screen scale-[1.1] transition-transform duration-500"
        >
          <defs>
            {/* Cyber Glow Filter */}
            <filter id="cyber-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Soft Shadow / Glow */}
            <filter id="soft-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Tactical Grid Pattern */}
            <pattern id="dense-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10B981" strokeWidth="0.5" strokeOpacity="0.15" />
              <circle cx="40" cy="40" r="1" fill="#10B981" fillOpacity="0.4" />
            </pattern>
          </defs>

          {/* Background Matrix Grid Pattern */}
          <rect width="800" height="400" fill="url(#dense-grid)" />

          {/* Coordinate labels in Grid Cells */}
          <g fill="#10B981" fontSize="4" fontFamily="monospace" opacity="0.25">
            <text x="45" y="48">A-01</text>
            <text x="145" y="48">A-02</text>
            <text x="245" y="48">A-03</text>
            <text x="345" y="48">A-04</text>
            <text x="445" y="48">A-05</text>
            <text x="545" y="48">A-06</text>
            <text x="645" y="48">A-07</text>

            <text x="45" y="148">B-01</text>
            <text x="145" y="148">B-02</text>
            <text x="245" y="148">B-03</text>
            <text x="345" y="148">B-04</text>
            <text x="445" y="148">B-05</text>
            <text x="545" y="148">B-06</text>
            <text x="645" y="148">B-07</text>

            <text x="45" y="248">C-01</text>
            <text x="145" y="248">C-02</text>
            <text x="245" y="248">C-03</text>
            <text x="345" y="248">C-04</text>
            <text x="445" y="248">C-05</text>
            <text x="545" y="248">C-06</text>
            <text x="645" y="248">C-07</text>
          </g>

          {/* Graticule Grid Lines (Lat / Long) */}
          <g stroke="#10B981" strokeWidth="0.75" strokeDasharray="3,6" opacity="0.3">
            {/* Longitude lines */}
            <line x1="100" y1="0" x2="100" y2="400" />
            <line x1="200" y1="0" x2="200" y2="400" />
            <line x1="300" y1="0" x2="300" y2="400" />
            <line x1="400" y1="0" x2="400" y2="400" />
            <line x1="500" y1="0" x2="500" y2="400" />
            <line x1="600" y1="0" x2="600" y2="400" />
            <line x1="700" y1="0" x2="700" y2="400" />
            {/* Latitude lines */}
            <line x1="0" y1="80" x2="800" y2="80" />
            <line x1="0" y1="160" x2="800" y2="160" />
            <line x1="0" y1="240" x2="800" y2="240" />
            <line x1="0" y1="320" x2="800" y2="320" />
          </g>

          {/* Outer Border / Frame */}
          <rect
            x="2"
            y="2"
            width="796"
            height="396"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            opacity="0.2"
          />

          {/* Glowing Continents (Deep Cyber Matrix Aesthetic) */}
          <g>
            {continents.map((c, idx) => (
              <path
                key={idx}
                d={c.d}
                fill="#10B981"
                fillOpacity="0.04"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeLinejoin="miter"
                filter="url(#soft-glow)"
                className="transition-all duration-300"
              />
            ))}
          </g>

          {/* Extra High Voltage Core Pulse (Dotted Continent Overlay) */}
          <g>
            {continents.map((c, idx) => (
              <path
                key={`dash-${idx}`}
                d={c.d}
                fill="none"
                stroke="#10B981"
                strokeWidth="1.2"
                strokeDasharray="2,4"
                opacity="0.6"
              />
            ))}
          </g>

          {/* Cyber Node Targets and Radar Sweeps */}
          <g>
            {markers.map((m, idx) => (
              <g key={idx} transform={`translate(${m.x}, ${m.y})`}>
                {/* Concentric radar pulses */}
                <circle
                  r="12"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="0.5"
                  opacity="0.3"
                  className="animate-ping"
                  style={{ animationDuration: "3s" }}
                />
                <circle
                  r="4"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1"
                  opacity="0.8"
                />
                <circle
                  r="1.5"
                  fill="#10B981"
                />
                {/* Micro tech labels */}
                <text
                  x="8"
                  y="3"
                  fill="#10B981"
                  fontFamily="monospace"
                  fontSize="6"
                  fontWeight="bold"
                  letterSpacing="1"
                  opacity="0.8"
                >
                  {m.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Full-screen high-contrast lightning burst flash overlay */}
      {opacity > 0 && (
        <div 
          className="fixed inset-0 pointer-events-none z-10 mix-blend-overlay transition-opacity duration-75"
          style={{ 
            backgroundColor: "white", 
            opacity: opacity * 0.45 
          }} 
        />
      )}
    </>
  );
}
