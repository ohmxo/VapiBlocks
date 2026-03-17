"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Preloader = () => {
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"rings" | "orb" | "label">("rings");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("orb"), 400);
    const t2 = setTimeout(() => setPhase("label"), 900);
    const t3 = setTimeout(() => setLoading(false), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: "blur(12px)",
            scale: 1.04,
            transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Ring + orb stack */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              {/* Expanding ripple rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-white/20"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.6], opacity: [0, 0.45, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.55,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Rotating dashed ring */}
              <motion.div
                className="absolute inset-2 rounded-full border border-dashed border-white/15"
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />

              {/* Center orb */}
              <motion.div
                className="relative z-10 h-10 w-10 rounded-full bg-white"
                initial={{ scale: 0, opacity: 0 }}
                animate={
                  phase === "rings"
                    ? { scale: 0, opacity: 0 }
                    : { scale: 1, opacity: 1, boxShadow: "0 0 40px rgba(255,255,255,0.7), 0 0 80px rgba(255,255,255,0.3)" }
                }
                transition={{ duration: 0.55, ease: [0.175, 0.885, 0.32, 1.275] }}
              />

              {/* Orb shimmer halo */}
              {phase !== "rings" && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle at center, rgba(255,255,255,0.12), transparent 68%)" }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>

            {/* Label */}
            <AnimatePresence>
              {phase === "label" && (
                <motion.div
                  initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col items-center gap-2"
                >
                  <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">
                    VapiBlocks
                  </p>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1 w-1 rounded-full bg-white/30"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
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
};
