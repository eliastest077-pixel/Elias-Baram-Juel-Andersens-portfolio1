import React, { useEffect, useState, useRef, useCallback } from "react";
import { medievalAudio } from "../audio/medievalAudio";

interface WaxStampItem {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  createdAt: number;
}

export default function WaxStampOverlay() {
  const [stamps, setStamps] = useState<WaxStampItem[]>([]);
  
  // Track cursor position & idle state
  const cursorPosRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  const idleTimerRef = useRef<number | null>(null);
  const intervalTimerRef = useRef<number | null>(null);

  // Function to create and place a new wax stamp
  const placeStamp = useCallback((x: number, y: number) => {
    // Only place if coordinates are within viewport
    if (x < 10 || x > window.innerWidth - 10 || y < 10 || y > window.innerHeight - 10) {
      return;
    }

    const newStamp: WaxStampItem = {
      id: `wax_stamp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      x: x + (Math.random() * 4 - 2), // Subtle organic human jitter
      y: y + (Math.random() * 4 - 2),
      rotation: Math.floor(Math.random() * 26 - 13), // -13deg to +13deg natural hand tilt
      scale: 0.94 + Math.random() * 0.12, // 0.94 to 1.06
      createdAt: Date.now(),
    };

    setStamps((prev) => [...prev, newStamp]);

    // Play tactile warm wax stamp sound
    medievalAudio.playPageTurn("stamp");

    // Remove this stamp after exactly 5 seconds
    window.setTimeout(() => {
      setStamps((prev) => prev.filter((s) => s.id !== newStamp.id));
    }, 5000);
  }, []);

  // Handle pointer activity (resets the 1-second idle timer)
  const handlePointerActivity = useCallback((x: number, y: number) => {
    cursorPosRef.current = { x, y, active: true };

    // Clear existing idle timer and interval
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }

    // Set 1-second idle timer
    idleTimerRef.current = window.setTimeout(() => {
      if (cursorPosRef.current.active) {
        placeStamp(cursorPosRef.current.x, cursorPosRef.current.y);

        // Every 1 second standing still, place another wax stamp
        intervalTimerRef.current = window.setInterval(() => {
          if (cursorPosRef.current.active) {
            placeStamp(cursorPosRef.current.x, cursorPosRef.current.y);
          }
        }, 1000);
      }
    }, 1000);
  }, [placeStamp]);

  const handlePointerLeave = useCallback(() => {
    cursorPosRef.current.active = false;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // 1. Listen for pointer events on the parent window
    const onWindowPointerMove = (e: PointerEvent) => {
      handlePointerActivity(e.clientX, e.clientY);
    };

    const onWindowPointerLeave = () => {
      handlePointerLeave();
    };

    // 2. Listen for cursor events forwarded from inside the 3D book showcase iframe
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "CURSOR_MOVE") {
        const x = typeof e.data.x === "number" ? e.data.x : e.data.clientX;
        const y = typeof e.data.y === "number" ? e.data.y : e.data.clientY;
        if (typeof x === "number" && typeof y === "number") {
          handlePointerActivity(x, y);
        }
      } else if (e.data && e.data.type === "CURSOR_LEAVE") {
        handlePointerLeave();
      }
    };

    window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
    window.addEventListener("pointerleave", onWindowPointerLeave);
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerleave", onWindowPointerLeave);
      window.removeEventListener("message", onMessage);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    };
  }, [handlePointerActivity, handlePointerLeave]);

  return (
    <div
      id="wax-stamps-canvas"
      className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes waxStampPress {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--rot)) scale(1.35);
            filter: drop-shadow(0 14px 22px rgba(40, 5, 5, 0.55));
          }
          45% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rot)) scale(0.93);
            filter: drop-shadow(0 2px 5px rgba(40, 5, 5, 0.6));
          }
          75% {
            transform: translate(-50%, -50%) rotate(var(--rot)) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rot)) scale(var(--sc));
            filter: drop-shadow(0 4px 12px rgba(35, 6, 6, 0.45));
          }
        }

        @keyframes waxStampFadeOut {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rot)) scale(var(--sc));
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--rot)) scale(calc(var(--sc) * 0.96));
            filter: blur(2px) drop-shadow(0 2px 6px rgba(35, 6, 6, 0));
          }
        }

        .wax-stamp-instance {
          position: absolute;
          width: 64px;
          height: 64px;
          user-select: none;
          pointer-events: none;
          will-change: transform, opacity;
          animation: 
            waxStampPress 320ms cubic-bezier(0.18, 0.89, 0.32, 1.15) forwards,
            waxStampFadeOut 800ms cubic-bezier(0.4, 0, 0.2, 1) 4200ms forwards;
        }

        .wax-stamp-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
      `}</style>

      {stamps.map((stamp) => (
        <div
          key={stamp.id}
          className="wax-stamp-instance"
          style={
            {
              left: `${stamp.x}px`,
              top: `${stamp.y}px`,
              "--rot": `${stamp.rotation}deg`,
              "--sc": stamp.scale,
            } as React.CSSProperties
          }
        >
          <img
            src="/wax-seal.png"
            alt=""
            className="wax-stamp-img"
            loading="eager"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}
