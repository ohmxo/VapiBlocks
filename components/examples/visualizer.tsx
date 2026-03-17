"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useVapi from "@/hooks/use-vapi";
import { MicIcon, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

const BAR_COUNT = 48;
const IDLE_SEEDS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const phase = (i / BAR_COUNT) * Math.PI * 2;
  return 0.15 + Math.abs(Math.sin(phase)) * 0.35;
});

const Visualizer: React.FC = () => {
  const { volumeLevel, isSessionActive, toggleCall } = useVapi();
  const barsRef = useRef<number[]>(IDLE_SEEDS.map((s) => s * 20));
  const [smoothedBars, setSmoothedBars] = useState<number[]>(barsRef.current);
  const frameRef = useRef<number>(0);
  const randomSeeds = useRef<number[]>(
    Array.from({ length: BAR_COUNT }, () => Math.random())
  );

  useEffect(() => {
    const tick = () => {
      const now = Date.now() / 1000;
      const next = barsRef.current.map((current, i) => {
        let target: number;
        if (isSessionActive) {
          const randomFactor = 0.3 + randomSeeds.current[i] * 0.7;
          const centerBias = 1 - Math.abs((i - BAR_COUNT / 2) / (BAR_COUNT / 2)) * 0.4;
          target = volumeLevel * 180 * randomFactor * centerBias;
        } else {
          const phase = (i / BAR_COUNT) * Math.PI * 2;
          const breathe = Math.sin(now * 0.8 + phase);
          target = 4 + IDLE_SEEDS[i] * 16 + breathe * 4;
        }
        // Asymmetric lerp: snap up fast, drift down slow
        const lerpFactor = current < target ? 0.32 : 0.08;
        return current + (target - current) * lerpFactor;
      });
      barsRef.current = next;
      setSmoothedBars([...next]);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [volumeLevel, isSessionActive]);

  useEffect(() => {
    if (isSessionActive) {
      randomSeeds.current = Array.from({ length: BAR_COUNT }, () => Math.random());
    }
  }, [isSessionActive]);

  const BAR_WIDTH = (1000 - (BAR_COUNT - 1) * 4) / BAR_COUNT;

  return (
    <div className="flex flex-col items-center justify-center gap-5 p-6 rounded-2xl">
      <div className="relative w-full" style={{ minHeight: 140 }}>
        <svg
          width="100%"
          viewBox="0 0 1000 160"
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
            <linearGradient id="barGradientIdle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {smoothedBars.map((height, index) => {
            const clampedH = Math.max(2, height);
            const x = index * (BAR_WIDTH + 4);
            const y = 80 - clampedH / 2;
            const radius = Math.min(BAR_WIDTH / 2, 4);
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={clampedH}
                rx={radius}
                ry={radius}
                fill={isSessionActive ? "url(#barGradientActive)" : "url(#barGradientIdle)"}
                filter={isSessionActive && height > 80 ? "url(#glow)" : undefined}
              />
            );
          })}
        </svg>
      </div>

      <motion.button
        onClick={toggleCall}
        className={cn(
          "relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isSessionActive
            ? "bg-red-500/90 border-red-400 text-white hover:bg-red-500 focus-visible:ring-red-400"
            : "bg-white/8 border-white/20 text-white hover:bg-white/15 focus-visible:ring-white/30"
        )}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        animate={
          isSessionActive && volumeLevel < 0.02
            ? { boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 18px rgba(255,255,255,0.4)", "0 0 0px rgba(255,255,255,0)"] }
            : {}
        }
        transition={
          isSessionActive && volumeLevel < 0.02
            ? { duration: 1.6, repeat: Infinity }
            : {}
        }
      >
        <AnimatePresence mode="wait">
          {isSessionActive ? (
            <motion.div
              key="phone-off"
              initial={{ opacity: 0, rotate: -15, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 15, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <PhoneOff size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="mic-icon"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <MicIcon size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence mode="wait">
        <motion.p
          key={isSessionActive ? "active" : "idle"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] uppercase tracking-[0.2em] text-white/40"
        >
          {isSessionActive ? "Live" : "Tap to speak"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default Visualizer;
