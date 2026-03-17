"use client";

import Link from "next/link";
import { ArrowLeft, Mic, PhoneOff } from "lucide-react";
import useVapi from "@/hooks/use-vapi";
import { GlobScene } from "@/components/examples/glob";
import AudioReactiveStage from "@/components/examples/audio-reactive-stage";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// State-driven BlurFade — triggers after `show` becomes true, not by wall-clock delay
function BlurFade({
  children,
  delay = 0,
  show,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  show: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={
        show
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 18, filter: "blur(10px)" }
      }
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function DemoPage() {
  const controller = useVapi();
  const { toggleCall, isSessionActive, volumeLevel } = controller;

  // Gate: show content once preloader finishes (2.4s)
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Preloader — inline here so we can properly sequence it */}
      <InlinePreloader onDone={() => setReady(true)} />

      <main className="relative min-h-screen bg-black text-[#eaeaea] selection:bg-white/20 overflow-hidden">
        {/* Ambient radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.022),_transparent_65%)]" />

        {/* Active session glow */}
        <AnimatePresence>
          {isSessionActive && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at center, rgba(127,255,88,0.045), transparent 70%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            />
          )}
        </AnimatePresence>

        <div className="relative mx-auto flex min-h-screen w-full flex-col items-center justify-center px-6 py-16 sm:px-12">

          {/* Back button */}
          <BlurFade show={ready} delay={0} className="absolute top-8 left-8 sm:top-12 sm:left-12">
            <Link
              href="https://syonix.framer.website"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/35 transition-all duration-200 hover:text-white/75"
            >
              <ArrowLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back</span>
            </Link>
          </BlurFade>

          {/* DEMO label */}
          <BlurFade show={ready} delay={0.08} className="absolute top-8 right-8 sm:top-12 sm:right-12">
            <span className="text-[11px] uppercase tracking-[0.3em] text-white/22">Demo</span>
          </BlurFade>

          {/* Main content */}
          <div className="flex flex-col items-center justify-center w-full max-w-lg gap-8">

            {/* Globe */}
            <BlurFade show={ready} delay={0.12} className="relative w-full">
              <div className="relative w-full h-[340px] sm:h-[460px] flex items-center justify-center">
                <GlobScene
                  controller={controller}
                  className="w-full h-full"
                  showConfig={false}
                  showCallToggle={false}
                />
              </div>
            </BlurFade>

            {/* Call button */}
            <BlurFade show={ready} delay={0.22}>
              <motion.button
                onClick={toggleCall}
                className={`group relative flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full border transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                  isSessionActive
                    ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/25"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
              >
                <AnimatePresence mode="wait">
                  {isSessionActive ? (
                    <motion.div key="off" initial={{ scale: 0.6, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0, rotate: 20 }} transition={{ duration: 0.22 }}>
                      <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.div>
                  ) : (
                    <motion.div key="mic" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.22 }}>
                      <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${isSessionActive ? "bg-red-500" : "bg-white"}`} />
              </motion.button>
            </BlurFade>

            {/* Audio visualizer */}
            <BlurFade show={ready} delay={0.3} className="w-full max-w-[220px]">
              <AudioReactiveStage
                volumeLevel={volumeLevel}
                isSessionActive={isSessionActive}
                className="w-full opacity-60"
              />
            </BlurFade>

            {/* Status label */}
            <BlurFade show={ready} delay={0.36}>
              <div className="text-[10px] uppercase tracking-[0.4em] font-medium text-white/25 text-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isSessionActive ? "active" : "idle"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="inline-block"
                  >
                    {isSessionActive ? "AI Agent Active" : "Click to connect"}
                  </motion.span>
                </AnimatePresence>
              </div>
            </BlurFade>
          </div>
        </div>
      </main>
    </>
  );
}

// Self-contained preloader — calls onDone exactly once when exit completes
function InlinePreloader({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState<"rings" | "orb" | "label">("rings");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("orb"), 380);
    const t2 = setTimeout(() => setPhase("label"), 880);
    const t3 = setTimeout(() => {
      setShow(false);
      onDone();
    }, 2350);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: "blur(14px)",
            scale: 1.05,
            transition: { duration: 0.85, ease: [0.4, 0, 0.2, 1] },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <div className="flex flex-col items-center gap-9">
            {/* Ring stack */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              {/* Expanding ripple rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-white/18"
                  initial={{ scale: 0.55, opacity: 0 }}
                  animate={{ scale: [0.55, 1.8], opacity: [0, 0.5, 0] }}
                  transition={{
                    duration: 1.9,
                    repeat: Infinity,
                    delay: i * 0.58,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Rotating dashed ring */}
              <motion.div
                className="absolute inset-1 rounded-full border border-dashed border-white/12"
                animate={{ rotate: 360 }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
              />

              {/* Center orb */}
              <motion.div
                className="relative z-10 h-10 w-10 rounded-full bg-white"
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  phase === "rings"
                    ? { scale: 0, opacity: 0 }
                    : {
                        scale: 1,
                        opacity: 1,
                        boxShadow: [
                          "0 0 20px rgba(255,255,255,0.4), 0 0 50px rgba(255,255,255,0.15)",
                          "0 0 40px rgba(255,255,255,0.7), 0 0 90px rgba(255,255,255,0.3)",
                          "0 0 20px rgba(255,255,255,0.4), 0 0 50px rgba(255,255,255,0.15)",
                        ],
                      }
                }
                transition={
                  phase === "rings"
                    ? { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }
                    : { scale: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }, boxShadow: { duration: 2, repeat: Infinity } }
                }
              />
            </div>

            {/* Label + dots */}
            <AnimatePresence>
              {phase === "label" && (
                <motion.div
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="flex flex-col items-center gap-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.45em] text-white/45">VapiBlocks</p>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1 w-1 rounded-full bg-white/30"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.28 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
