"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BAR_COUNT = 18;
const BAR_SEEDS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const t = i / (BAR_COUNT - 1);
  return 0.25 + 0.75 * Math.exp(-Math.pow((t - 0.5) * 3, 2));
});

type Props = {
  volumeLevel: number;
  isSessionActive: boolean;
  className?: string;
};

const AudioReactiveStage = ({ volumeLevel, isSessionActive, className }: Props) => {
  const smoothedRef = useRef<number>(0);
  const barRef = useRef<number[]>(BAR_SEEDS.map((s) => s * 0.08));
  const frameRef = useRef<number>(0);
  const [smoothed, setSmoothed] = useState(0);
  const [bars, setBars] = useState<number[]>(barRef.current);
  const barWeights = useRef<number[]>(
    Array.from({ length: BAR_COUNT }, () => 0.35 + Math.random() * 0.65)
  );

  useEffect(() => {
    const tick = () => {
      const now = Date.now() / 1000;
      const target = isSessionActive ? Math.min(Math.max(volumeLevel, 0), 1) : 0;

      // Asymmetric lerp for overall level
      const overallFactor = smoothedRef.current < target ? 0.25 : 0.07;
      smoothedRef.current += (target - smoothedRef.current) * overallFactor;
      setSmoothed(smoothedRef.current);

      barRef.current = barRef.current.map((current, i) => {
        let barTarget: number;
        if (isSessionActive) {
          barTarget = BAR_SEEDS[i] * 0.18 + smoothedRef.current * barWeights.current[i];
        } else {
          const idlePhase = (Math.sin(now * 0.7 + (i / BAR_COUNT) * Math.PI * 2) * 0.5 + 0.5);
          barTarget = BAR_SEEDS[i] * (0.06 + idlePhase * 0.07);
        }
        // Asymmetric: snap up fast, drift down slow
        const lerpFactor = current < barTarget ? 0.28 : 0.05;
        return current + (barTarget - current) * lerpFactor;
      });
      setBars([...barRef.current]);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [volumeLevel, isSessionActive]);

  useEffect(() => {
    if (isSessionActive) {
      barWeights.current = Array.from({ length: BAR_COUNT }, () => 0.35 + Math.random() * 0.65);
    }
  }, [isSessionActive]);

  const glowStrength = 0.18 + smoothed * 2.0;
  const signalPct = Math.round(smoothed * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border bg-[#030409]/90 p-5",
        isSessionActive
          ? "border-[#7FFF25]/55 shadow-[0_20px_70px_rgba(0,0,0,0.7)]"
          : "border-white/8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
        className
      )}
      style={{ transition: "border-color 0.5s, box-shadow 0.5s" }}
    >
      {/* BG gradient blobs */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 20%, rgba(127,255,37,0.25), transparent 52%)," +
            "radial-gradient(circle at 85% 15%, rgba(255,195,0,0.14), transparent 55%)",
          opacity: isSessionActive ? 0.75 : 0.18,
          transition: "opacity 0.6s",
        }}
      />

      {/* Inner glow border */}
      <motion.div
        className="pointer-events-none absolute inset-3 rounded-[22px] border border-[#f4b400]/25"
        style={{
          filter: `blur(${1.5 + glowStrength * 2}px)`,
          boxShadow: `0 0 ${45 + glowStrength * 18}px rgba(255,195,0,${0.15 + smoothed * 0.3})`,
        }}
        animate={{
          opacity: isSessionActive ? 1 : 0.1,
          scale: 1 + smoothed * 0.014,
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-white/55">
            Live Voice Pulse
          </p>
          <p className="text-sm text-white/50 mt-0.5">
            {isSessionActive ? "Responding to your voice." : "Waiting for voice input."}
          </p>
        </div>

        {/* Bars */}
        <div
          className="h-44 items-end gap-1.5 grid"
          style={{ gridTemplateColumns: `repeat(${BAR_COUNT}, 1fr)` }}
        >
          {bars.map((level, i) => {
            const minH = 10;
            const maxH = 135;
            const height = minH + level * (maxH - minH);
            const colorMix = 75 + BAR_SEEDS[i] * 65 + smoothed * 35;
            const glow = isSessionActive && level > 0.3
              ? `0 6px 20px rgba(0,255,115,${0.18 + level * 0.5})`
              : "none";

            return (
              <div
                key={i}
                className="w-full rounded-[12px]"
                style={{
                  height: `${height}px`,
                  alignSelf: "end",
                  background: isSessionActive
                    ? `linear-gradient(180deg, rgba(255,195,0,0.92), rgba(127,255,37,0.86) ${colorMix}%, rgba(0,0,0,0.12))`
                    : "rgba(255,255,255,0.06)",
                  boxShadow: glow,
                  opacity: isSessionActive ? 0.88 + level * 0.12 : 0.25,
                  transition: "none",
                }}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-white/45">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: isSessionActive ? "#7FFF25" : "rgba(255,255,255,0.15)",
                boxShadow: isSessionActive ? "0 0 6px #7FFF25" : "none",
                transition: "all 0.4s",
              }}
            />
            <span>{isSessionActive ? "Live" : "Idle"}</span>
          </div>
          <span>
            Signal &nbsp;<span className="font-semibold text-white/60">{signalPct}%</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioReactiveStage;
