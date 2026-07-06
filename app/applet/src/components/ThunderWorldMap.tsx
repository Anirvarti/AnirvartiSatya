import { useEffect, useState } from "react";

export default function ThunderWorldMap() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let timeoutId: number;

    const triggerThunder = () => {
      // Thunder consists of a few rapid flashes
      const flashes = Math.floor(Math.random() * 3) + 1; // 1 to 3 flashes
      
      let flashCount = 0;
      
      const flash = () => {
        // High opacity for flash
        setOpacity(Math.random() * 0.4 + 0.2); // 0.2 to 0.6
        
        setTimeout(() => {
          // Dim down
          setOpacity(Math.random() * 0.1);
          
          if (flashCount < flashes) {
            flashCount++;
            setTimeout(flash, Math.random() * 100 + 50); // Next flash fast
          } else {
            // End of thunder sequence
            setOpacity(0);
            scheduleNextThunder();
          }
        }, Math.random() * 100 + 50); // Flash duration
      };

      flash();
    };

    const scheduleNextThunder = () => {
      // Thunder happens every 5 to 15 seconds
      const nextTime = Math.random() * 10000 + 5000;
      timeoutId = window.setTimeout(triggerThunder, nextTime);
    };

    scheduleNextThunder();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-75 flex items-center justify-center opacity-0 mix-blend-screen"
        style={{ 
          opacity: opacity,
          backgroundImage: "url('/world-map.svg')",
          backgroundSize: "80%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "invert(60%) sepia(80%) saturate(300%) hue-rotate(120deg) brightness(150%) contrast(150%) blur(0.5px)"
        }}
      />
      {opacity > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay transition-opacity duration-75"
          style={{ 
            backgroundColor: "white", 
            opacity: opacity * 0.5 
          }} 
        />
      )}
    </>
  );
}
