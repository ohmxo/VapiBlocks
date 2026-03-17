"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, Wrench } from "lucide-react";
import CircleWaveform from "@/components/examples/circlewaveform";
import useVapi, { type EventEntry } from "@/hooks/use-vapi";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ── Transcript entry (Minimalist Floating Text) ──────────────
function EventRow({ entry, index }: { entry: EventEntry; index: number }) {
  const isUser = entry.kind === "transcript" && entry.role === "user";
  const isTool = entry.kind === "tool";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "flex w-full flex-col gap-1 py-1.5",
        isUser ? "items-end text-right" : "items-start text-left"
      )}
    >
      {isTool ? (
        /* Tool call — subtle sleek row */
        <div className="flex items-center gap-2 rounded-full px-2 py-0.5 text-[11px] font-medium text-amber-500/60 transition-colors hover:text-amber-400">
          <Wrench className="h-3 w-3" />
          <span>
            {entry.name}{" "}
            {Object.keys(entry.params).length > 0 && (
              <span className="opacity-50 font-normal">
                {JSON.stringify(entry.params).slice(0, 40)}
                {JSON.stringify(entry.params).length > 40 ? "…" : ""}
              </span>
            )}
          </span>
        </div>
      ) : (
        /* Clean transcript text */
        <div className="flex flex-col gap-0.5 max-w-[85%]">
          <span className={cn(
            "text-[10px] uppercase tracking-[0.2em] font-medium",
            isUser ? "text-white/30" : "text-emerald-400/50"
          )}>
            {isUser ? "You" : "Agent"}
          </span>
          <p className={cn(
            "text-[14px] leading-relaxed tracking-tight",
            isUser ? "text-white/60" : "text-white/90 font-medium",
            entry.kind === "transcript" && !entry.isFinal && "opacity-50 animate-pulse"
          )} style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
            {entry.kind === "transcript" ? entry.text : ""}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AppDemoPage() {
  const { conversation, events } = useVapi();
  const [showTranscript, setShowTranscript] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (showTranscript && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, showTranscript]);

  return (
    <main className="w-full min-h-screen bg-black text-white">
      <div className="flex min-h-screen w-full flex-col px-5 py-9 sm:px-9 lg:px-14">

        {/* Header */}
        <motion.header
          className="mb-7 flex items-center justify-between"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Link
            href="https://syonix.framer.website/#hero"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-medium text-white/55 transition-all duration-200 hover:bg-white/8 hover:text-white/85 hover:border-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back
          </Link>

          <div className="flex items-center gap-3">
            {/* Transcript toggle */}
            <motion.button
              onClick={() => setShowTranscript(v => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-200",
                showTranscript
                  ? "border-white/20 bg-white/8 text-white/80"
                  : "border-white/8 bg-transparent text-white/35 hover:border-white/15 hover:text-white/60"
              )}
              whileTap={{ scale: 0.96 }}
            >
              Transcript
              <motion.div
                animate={{ rotate: showTranscript ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-3 w-3" />
              </motion.div>
            </motion.button>

            <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/25">Demo</div>
          </div>
        </motion.header>

        {/* Content */}
        <section className="relative flex w-full flex-1 flex-col justify-center min-h-0">

          {/* Waveform — stays full size, no layout shifting */}
          <motion.div
            className="relative h-[clamp(500px,65vh,700px)] w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <CircleWaveform />
          </motion.div>

          {/* Transcript Floating Overlay */}
          <AnimatePresence>
            {showTranscript && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute bottom-6 left-0 right-0 z-20 pointer-events-none flex justify-center"
              >
                <div
                  ref={scrollRef}
                  className="pointer-events-auto flex w-full max-w-2xl max-h-[35vh] flex-col gap-4 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-16"
                  style={{
                    scrollbarWidth: "none",
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 25%, black 100%)",
                  }}
                >
                  <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-6 text-center text-[12px] text-white/25"
                      >
                        Start a call to see the transcript here.
                      </motion.p>
                    ) : (
                      events
                        .filter(e => e.kind === "tool" || (e.kind === "transcript" && e.isFinal))
                        .map((entry, i) => (
                          <EventRow
                            key={`${entry.kind}-${entry.timestamp}-${i}`}
                            entry={entry}
                            index={i}
                          />
                        ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
