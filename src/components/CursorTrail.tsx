import { useEffect, useState, useRef } from 'react';

export default function CursorTrail() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const ringRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check if mobile/touch device
    const checkDevice = () => {
      const mobile = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      // Expand cursor on buttons, anchors, interactive tabs, etc.
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('interactive-node') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    // Spring interpolation loop for smooth trailing ring
    let animationFrameId: number;
    const updateRing = () => {
      if (ringRef.current) {
        const ring = ringRef.current;
        const targetX = mouseRef.current.x;
        const targetY = mouseRef.current.y;

        // Linear interpolation / spring factor
        const ease = 0.16; 
        ringPosRef.current.x += (targetX - ringPosRef.current.x) * ease;
        ringPosRef.current.y += (targetY - ringPosRef.current.y) * ease;

        ring.style.transform = `translate3d(${ringPosRef.current.x - 18}px, ${ringPosRef.current.y - 18}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(updateRing);
    };

    animationFrameId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, isVisible]);

  if (isMobile || !isVisible) return null;

  return (
    <>
      {/* 1. Core Pointer Dot */}
      <div
        id="cursor-dot"
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#10B981] rounded-full pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) ${isHovered ? 'scale(1.5)' : 'scale(1)'}`,
        }}
      />
      {/* 2. Spring-damped outer tracking ring */}
      <div
        ref={ringRef}
        id="cursor-ring"
        className={`fixed top-0 left-0 w-9 h-9 border rounded-full pointer-events-none z-50 transition-all duration-200 ease-out ${
          isHovered 
            ? 'border-[#10B981] bg-[#10B981]/10 scale-125' 
            : 'border-[#10B981]/25 bg-transparent'
        }`}
        style={{
          transform: `translate3d(${ringPosRef.current.x - 18}px, ${ringPosRef.current.y - 18}px, 0)`,
        }}
      />
    </>
  );
}
