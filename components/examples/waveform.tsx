"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MicIcon, PhoneOff, Podcast } from "lucide-react";
import { Button } from "@/components/ui/button";
import useVapi from "@/hooks/use-vapi";
import { cn } from "@/lib/utils";

const BAR_COUNT = 48;
const BAR_SEEDS_STATIC = Array.from({ length: BAR_COUNT }, () => 0.5);

const Waveform: React.FC = () => {
  const { volumeLevel, isSessionActive, toggleCall } = useVapi();
  const smoothedRef = useRef<number[]>(Array(BAR_COUNT).fill(0));
  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0));
  const frameRef = useRef<number>(0);
  const randomWeights = useRef<number[]>(
    Array.from({ length: BAR_COUNT }, () => 0.4 + Math.random() * 0.6)
  );

  useEffect(() => {
    const tick = () => {
      const now = Date.now() / 1000;
      smoothedRef.current = smoothedRef.current.map((current, i) => {
        let target: number;
        if (isSessionActive) {
          target = volumeLevel * randomWeights.current[i];
        } else {
          const angle = (i / BAR_COUNT) * Math.PI * 2;
          target = 0.04 + Math.abs(Math.sin(now * 0.6 + angle)) * 0.07;
        }
        // Asymmetric: snap up, drift down
        const lerpFactor = current < target ? 0.28 : 0.07;
        return current + (target - current) * lerpFactor;
      });
      setBars([...smoothedRef.current]);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [volumeLevel, isSessionActive]);

  useEffect(() => {
    if (isSessionActive) {
      randomWeights.current = Array.from({ length: BAR_COUNT }, () => 0.4 + Math.random() * 0.6);
    }
  }, [isSessionActive]);

  const CENTER = 150;
  const INNER_R = 44;
  const MAX_OUTER = 95;

  return (
    <div className="border border-white/10 text-center justify-items-center p-6 rounded-2xl bg-black/30 backdrop-blur-sm">
      <div
        className="flex items-center justify-center relative"
        style={{ width: 300, height: 300 }}
      >
        <svg
          width={300}
          height={300}
          viewBox="0 0 300 300"
          className="absolute inset-0"
        >
          <defs>
            <filter id="wfGlow">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={INNER_R}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1.5"
            fill="none"
          />

          {bars.map((level, i) => {
            const angle = (i / BAR_COUNT) * 2 * Math.PI - Math.PI / 2;
            const outerR = INNER_R + level * MAX_OUTER;
            const x1 = CENTER + Math.cos(angle) * INNER_R;
            const y1 = CENTER + Math.sin(angle) * INNER_R;
            const x2 = CENTER + Math.cos(angle) * outerR;
            const y2 = CENTER + Math.sin(angle) * outerR;
            const opacity = isSessionActive ? 0.45 + level * 0.55 : 0.2 + level * 0.35;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={isSessionActive ? 2 : 1.4}
                strokeLinecap="round"
                opacity={opacity}
                filter={isSessionActive && level > 0.55 ? "url(#wfGlow)" : undefined}
              />
            );
          })}
        </svg>

        {/* Center icon */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full border border-white/15 bg-black/60 cursor-pointer"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={
            isSessionActive
              ? { boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.3)", "0 0 0px rgba(255,255,255,0)"] }
              : {}
          }
          transition={isSessionActive ? { duration: 2, repeat: Infinity } : {}}
          onClick={toggleCall}
        >
          <AnimatePresence mode="wait">
            {isSessionActive ? (
              <motion.div
                key="active"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Podcast size={22} className="text-white/80" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MicIcon size={22} className="text-white/50" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Button
        onClick={toggleCall}
        variant="outline"
        className={cn(
          "mt-2 gap-2 text-xs font-semibold tracking-wide transition-colors",
          isSessionActive
            ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
            : "border-white/10 text-white/50 hover:bg-white/5"
        )}
      >
        {isSessionActive ? (
          <><PhoneOff size={14} /> End Call</>
        ) : (
          <><MicIcon size={14} /> Start Call</>
        )}
      </Button>
    </div>
  );
};

export default Waveform;
