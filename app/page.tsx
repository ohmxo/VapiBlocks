"use client";
import { Shine } from "@/components/examples/shine";
import Logos from "@/components/logos";
import { ArrowRight, MicIcon, PhoneOff, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SparklesText from "@/components/ui/sparkle-text";
import { useEffect, useState } from "react";
import useVapi from "@/hooks/use-vapi";
import Transcriber from "@/components/examples/transcriber";
import AudioReactiveStage from "@/components/examples/audio-reactive-stage";


export default function Home() {
  return (
    
    <div className="flex flex-col gap-4 container justify-center items-center">
      <Shine>
      <HeroLanding />
      </Shine>
      <Hero/>
      <Logos />
      <hr/>
    </div>
  );
}

function HeroLanding() {
  const [stars, setStars] = useState(null);

  useEffect(() => {
    const getRepoStars = async () => {
      try {
        const res = await fetch("https://api.github.com/repos/cameronking4/VapiBlocks", {
          cache: "no-store",
        });
        const data = await res.json();
        setStars(data.stargazers_count);
      } catch (error) {
        console.error("Failed to fetch repo stars:", error);
      }
    };

    getRepoStars();
  }, []);

  return (
    <section className="space-y-6 pb-12 pt-16 lg:py-18">
      <div className="container flex max-w-[64rem] flex-col items-center gap-5 text-center">
        <Link
          href="https://github.com/cameronking4"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "animate-fade-up opacity-0")}
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
          target="_blank"
        >
          <span className="mr-3">🎉</span> Welcome to the Future of DriveThru!{" "}
        </Link>
        <h1 className="text-balance font-urban text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[66px]">
          Effortlessly add {" "}
          <span className="text-gradient_indigo-purple font-extrabold">
            Voice AI {""}
          </span> 
          into your Web Apps with
          {/* {" "}
          <span className="text-gradient_indigo-purple font-extrabold">
            Web Apps{" "}
          </span>with{" "} */}
          <SparklesText text={"pre-built UI Components"}/>
        </h1>
        <div
          className="flex justify-center space-x-2 md:space-x-4 mt-2"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <Link
            href="/docs/changelog"
            prefetch={true}
            className={cn(buttonVariants({ size: "lg"}), "gap-2")}
          >
            <span>Browse Components</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="https://github.com/cameronking4/VapiBlocks"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-5 space-x-2")}
          >
            <Star className="size-4" />
            {stars !== null && (
              <span className="group-hover:text-yellow-400 transition-all duration-300 ease-in-out mr-2">
                {stars}{" "} {stars !== null && (stars === 1 ? "star " : "stars ")}{" "} on GitHub
              </span>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const { toggleCall, isSessionActive, volumeLevel, conversation } = useVapi();
  return (
    <section className="relative w-full py-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col items-center gap-3 text-center">
          <button
            onClick={toggleCall}
            className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-2xl shadow-violet-900/30 transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            {isSessionActive ? <PhoneOff className="h-4 w-4" /> : <MicIcon className="h-4 w-4" />}
            <span className="text-[11px]">{isSessionActive ? "Disconnect" : "Talk to Vapi"}</span>
          </button>
          <p className="max-w-2xl text-sm text-white/75">
            Live audio feedback, smarter transcripts, and responsive visuals that react to every word you speak.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_auto]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
              <span>Transcription</span>
              <span>{isSessionActive ? "Listening" : "Idle"}</span>
            </div>
            <Transcriber conversation={conversation} className="min-h-[380px]" />
          </div>

          <div className="hidden lg:block">
            <AudioReactiveStage volumeLevel={volumeLevel} isSessionActive={isSessionActive} />
          </div>
          <div className="lg:hidden">
            <AudioReactiveStage volumeLevel={volumeLevel} isSessionActive={isSessionActive} />
          </div>
        </div>
      </div>
    </section>
  );
}
