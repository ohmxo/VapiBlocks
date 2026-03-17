"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, PhoneOff } from "lucide-react";
import useVapi from "@/hooks/use-vapi";
import { cn } from "@/lib/utils";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi);

const BAR_COUNT = 20;
const BED_SEEDS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const t = i / (BAR_COUNT - 1);
  return 0.18 + 0.82 * Math.exp(-Math.pow((t - 0.5) * 3.5, 2));
});

const RADIUS = 58;
const CIRC = 2 * Math.PI * RADIUS;

const CircleWaveform = () => {
  const { volumeLevel, isSessionActive, toggleCall } = useVapi();
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusText, setStatusText] = useState("Tap to connect");

  // DOM refs — we animate these directly, bypassing React re-renders entirely
  const arcRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const percentRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  // Mutable state for the animation loop (never causes re-renders)
  const smoothRef = useRef(0);
  const barsRef = useRef<number[]>(BED_SEEDS.map(s => s * 0.1));
  const weightsRef = useRef<number[]>(
    Array.from({ length: BAR_COUNT }, () => 0.15 + Math.random() * 0.42)
  );

  // Capture volatile props in refs so the rAF closure doesn't go stale
  const volRef = useRef(volumeLevel);
  const activeRef = useRef(isSessionActive);
  volRef.current = volumeLevel;
  activeRef.current = isSessionActive;

  useEffect(() => {
    if (isSessionActive) {
      setIsConnecting(false);
      weightsRef.current = Array.from({ length: BAR_COUNT }, () => 0.15 + Math.random() * 0.42);
    }
    setStatusText(
      isSessionActive ? "Listening" : "Tap to connect"
    );
  }, [isSessionActive]);

  // Main animation loop — all DOM writes, zero setState
  useEffect(() => {
    const tick = () => {
      const now = Date.now() / 1000;
      const active = activeRef.current;
      const vol = volRef.current;

      // Smooth overall level — moderate attack, slow decay
      const volTarget = active ? clamp(vol) : 0;
      const upFast = smoothRef.current < volTarget;
      smoothRef.current += (volTarget - smoothRef.current) * (upFast ? 0.28 : 0.055);
      const smooth = smoothRef.current;

      // ── Ring arc ───────────────────────────────────────────────────
      if (arcRef.current) {
        const progress = active
          ? 0.10 + smooth * 0.62           // 10% idle → ~72% at full volume
          : 0.09 + Math.sin(now * 0.6) * 0.025 + 0.02; // gentle idle breathe

        const offset = CIRC * (1 - Math.max(0.02, progress));
        const strokeW = active ? 7.5 + smooth * 4 : 6.5;

        arcRef.current.style.strokeDashoffset = String(offset);
        arcRef.current.style.strokeWidth = String(strokeW);
        arcRef.current.style.stroke = active
          ? `rgba(255,255,255,${0.55 + smooth * 0.4})`
          : "#232f3a";
        arcRef.current.style.filter = active
          ? `drop-shadow(0 0 ${2 + smooth * 10}px rgba(255,255,255,${0.2 + smooth * 0.5}))`
          : "none";

        if (percentRef.current) {
          percentRef.current.textContent = `${Math.round(progress * 100)}%`;
        }
      }

      // ── Ambient glow blob ─────────────────────────────────────────
      if (glowRef.current) {
        glowRef.current.style.opacity = String(active ? 0.45 + smooth * 0.55 : 0.12);
        glowRef.current.style.transform = `scale(${1 + smooth * 0.18})`;
      }

      // ── Bottom bars ───────────────────────────────────────────────
      barsRef.current = barsRef.current.map((cur, i) => {
        let target: number;
        if (active) {
          target = BED_SEEDS[i] * 0.06 + smooth * weightsRef.current[i] * 0.8;
        } else {
          const wave = Math.sin(now * 0.65 + (i / BAR_COUNT) * Math.PI * 2) * 0.5 + 0.5;
          target = BED_SEEDS[i] * (0.04 + wave * 0.05);
        }
        return cur + (target - cur) * (cur < target ? 0.22 : 0.05);
      });

      barsRef.current.forEach((level, i) => {
        const el = barRefs.current[i];
        if (!el) return;
        const h = 3 + level * (active ? 28 : 7);
        el.style.height = `${h}px`;
        el.style.opacity = active ? String(0.35 + level * 0.55) : "0.17";
        el.style.background = active
          ? `rgba(255,255,255,${0.4 + level * 0.5})`
          : "rgba(255,255,255,0.15)";
        el.style.boxShadow =
          active && level > 0.45
            ? `0 0 5px rgba(255,255,255,${0.08 + level * 0.22})`
            : "none";
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Never recreate — we read live values via refs

  const handleToggle = async () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (!isSessionActive) {
      setIsConnecting(true);
      setStatusText("Connecting");
      timeoutRef.current = window.setTimeout(() => {
        setIsConnecting(false);
      }, 7000);
    } else {
      setIsConnecting(false);
    }
    await toggleCall();
  };

  // Update status text reactively (not every frame)
  useEffect(() => {
    if (!isSessionActive) return;
    const id = setInterval(() => {
      setStatusText(smoothRef.current > 0.06 ? "Speaking" : "Listening");
    }, 300);
    return () => clearInterval(id);
  }, [isSessionActive]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-between select-none">
      {/* Header label row */}
      <div className="mb-4 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/35">
        <span>Voice Ring</span>
        <span ref={percentRef}>12%</span>
      </div>

      {/* Ring zone */}
      <div className="relative flex aspect-square h-[58%] min-h-[260px] max-h-[440px] w-auto items-center justify-center">

        {/* Ambient glow */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute h-[90%] w-[90%] rounded-full"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.1), transparent 62%)",
            filter: "blur(22px)",
            transition: "transform 0.15s ease",
          }}
        />

        {/* Outer deco ring — slow rotate */}
        <motion.div
          className="pointer-events-none absolute h-[91%] w-[91%] rounded-full border border-dashed border-white/6"
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner deco ring */}
        <div className="pointer-events-none absolute h-[76%] w-[76%] rounded-full border border-white/6" />

        {/* SVG — arc driven by direct DOM writes */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 160">
          {/* Track */}
          <circle
            cx="80" cy="80" r={RADIUS}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="7"
            fill="none"
          />
          {/* Live arc — all styles set imperatively */}
          <circle
            ref={arcRef}
            cx="80" cy="80" r={RADIUS}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * 0.88}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        </svg>

        {/* Center button */}
        <button
          onClick={handleToggle}
          disabled={isConnecting}
          className={cn(
            "relative z-10 inline-flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
            isSessionActive
              ? "border-white/18 bg-white/6 text-white hover:bg-white/12"
              : "border-white/8 bg-black text-white/70 hover:bg-white/5"
          )}
        >
          <AnimatePresence mode="wait">
            {isConnecting ? (
              <motion.span key="spin" className="relative flex h-5 w-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="absolute inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white/75" />
              </motion.span>
            ) : isSessionActive ? (
              <motion.div key="off" initial={{ scale: 0.65, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.65, opacity: 0, rotate: 10 }} transition={{ duration: 0.18, ease: "easeOut" }}>
                <PhoneOff className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div key="mic" initial={{ scale: 0.65, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.65, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Mic className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">{isSessionActive ? "End call" : "Start call"}</span>
        </button>
      </div>

      {/* Bottom bars + status */}
      <div className="w-full max-w-[620px] px-3">
        {/* Bar strip */}
        <div className="mb-3 flex h-12 items-end justify-center gap-[3.5px]">
          {BED_SEEDS.map((_, i) => (
            <div
              key={i}
              ref={el => { barRefs.current[i] = el; }}
              style={{
                width: 7,
                height: 4,
                borderRadius: 99,
                background: "rgba(255,255,255,0.18)",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Status pill */}
        <div className="flex h-5 justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={statusText}
              initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -5, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="inline-block text-[11px] uppercase tracking-[0.26em] text-white/38"
            >
              {statusText}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CircleWaveform;
