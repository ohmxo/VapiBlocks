import { useEffect, useRef, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";

export type EventEntry =
  | { kind: 'transcript'; role: string; text: string; timestamp: string; isFinal: boolean }
  | { kind: 'tool'; name: string; params: Record<string, unknown>; timestamp: string };

const useVapi = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Legacy transcript array (kept for backward compat)
  const [conversation, setConversation] = useState<
    { role: string; text: string; timestamp: string; isFinal: boolean }[]
  >([]);

  // Unified event log: transcripts + tool calls
  const [events, setEvents] = useState<EventEntry[]>([]);

  const vapiRef = useRef<any>(null);

  const initializeVapi = useCallback(() => {
    if (!vapiRef.current) {
      const vapiInstance = new Vapi(publicKey);
      vapiRef.current = vapiInstance;

      vapiInstance.on('call-start', () => {
        setIsSessionActive(true);
      });

      vapiInstance.on('call-end', () => {
        setIsSessionActive(false);
        setConversation([]);
        setEvents([]);
      });

      vapiInstance.on('volume-level', (volume: number) => {
        setVolumeLevel(volume);
      });

      vapiInstance.on('message', (message: any) => {
        // ── Transcripts ──────────────────────────────────────────────
        if (message.type === 'transcript') {
          const timestamp = new Date().toLocaleTimeString();

          setConversation((prev) => {
            const updated = [...prev];
            if (message.transcriptType === 'final') {
              const idx = updated.findIndex(m => m.role === message.role && !m.isFinal);
              if (idx !== -1) {
                updated[idx] = { role: message.role, text: message.transcript, timestamp: updated[idx].timestamp, isFinal: true };
              } else {
                updated.push({ role: message.role, text: message.transcript, timestamp, isFinal: true });
              }
            } else {
              const idx = updated.findIndex(m => m.role === message.role && !m.isFinal);
              if (idx !== -1) {
                updated[idx] = { ...updated[idx], text: message.transcript };
              } else {
                updated.push({ role: message.role, text: message.transcript, timestamp, isFinal: false });
              }
            }
            return updated;
          });

          // Mirror to events
          setEvents((prev) => {
            const updated = [...prev];
            if (message.transcriptType === 'final') {
              const idx = updated.findLastIndex(
                e => e.kind === 'transcript' && e.role === message.role && !e.isFinal
              );
              if (idx !== -1) {
                updated[idx] = { kind: 'transcript', role: message.role, text: message.transcript, timestamp: (updated[idx] as any).timestamp, isFinal: true };
              } else {
                updated.push({ kind: 'transcript', role: message.role, text: message.transcript, timestamp, isFinal: true });
              }
            } else {
              const idx = updated.findLastIndex(
                e => e.kind === 'transcript' && e.role === message.role && !(e as any).isFinal
              );
              if (idx !== -1) {
                updated[idx] = { ...(updated[idx] as any), text: message.transcript };
              } else {
                updated.push({ kind: 'transcript', role: message.role, text: message.transcript, timestamp, isFinal: false });
              }
            }
            return updated;
          });
        }

        // ── Tool / function calls ─────────────────────────────────────
        if (message.type === 'function-call') {
          const { name, parameters } = message.functionCall ?? {};
          const timestamp = new Date().toLocaleTimeString();

          setEvents((prev) => [
            ...prev,
            { kind: 'tool', name: name ?? 'unknown', params: parameters ?? {}, timestamp },
          ]);

          // Original URL-routing side effect
          if (name === 'changeUrl') {
            const command = (parameters?.url ?? '').toLowerCase();
            if (command) window.location.href = command;
          }
        }
      });

      vapiInstance.on('error', (e: Error) => {
        console.error('Vapi error:', e);
      });
    }
  }, []);

  useEffect(() => {
    initializeVapi();
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, [initializeVapi]);

  const toggleCall = async () => {
    try {
      if (isSessionActive) {
        await vapiRef.current.stop();
      } else {
        await vapiRef.current.start(assistantId);
      }
    } catch (err) {
      console.error('Error toggling Vapi session:', err);
    }
  };

  const sendMessage = (role: string, content: string) => {
    if (vapiRef.current) {
      vapiRef.current.send({ type: 'add-message', message: { role, content } });
    }
  };

  const say = (message: string, endCallAfterSpoken = false) => {
    if (vapiRef.current) vapiRef.current.say(message, endCallAfterSpoken);
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      const next = !isMuted;
      vapiRef.current.setMuted(next);
      setIsMuted(next);
    }
  };

  return { volumeLevel, isSessionActive, conversation, events, toggleCall, sendMessage, say, toggleMute, isMuted };
};

export default useVapi;
