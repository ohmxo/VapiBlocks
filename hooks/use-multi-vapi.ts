import Vapi from "@vapi-ai/web";
import { useCallback, useEffect, useRef, useState } from "react";

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";

const useMultVapi = () => {
	const [volumeLevel, setVolumeLevel] = useState(0);
	const [isSessionActive, setIsSessionActive] = useState(false);
	const [conversation, setConversation] = useState<
		{ role: string; text: string }[]
	>([]);
	const vapiRef = useRef<any>(null);

	const initializeVapi = useCallback(() => {
		if (!vapiRef.current) {
			const vapiInstance = new Vapi(publicKey);
			vapiRef.current = vapiInstance;

			vapiInstance.on("call-start", () => {
				setIsSessionActive(true);
			});

			vapiInstance.on("call-end", () => {
				setIsSessionActive(false);
				setConversation([]); // Reset conversation on call end
			});

			vapiInstance.on("volume-level", (volume: number) => {
				setVolumeLevel(volume);
			});

			vapiInstance.on("message", (message: any) => {
				if (
					message.type === "transcript" &&
					message.transcriptType === "final"
				) {
					setConversation((prev) => [
						...prev,
						{ role: message.role, text: message.transcript },
					]);
				}
			});

			vapiInstance.on("error", (e: Error) => {
				console.error("Vapi error:", e);
			});
		}
	}, []);

	useEffect(() => {
		initializeVapi();

		// Cleanup function to end call and dispose Vapi instance
		return () => {
			if (vapiRef.current) {
				vapiRef.current.stop();
				vapiRef.current = null;
			}
		};
	}, [initializeVapi]);

	const toggleCall = (assistantId: string) => {
		if (vapiRef.current) {
			if (isSessionActive) {
				vapiRef.current.stop();
			} else {
				vapiRef.current.start(assistantId);
			}
		}
	};

	return { volumeLevel, isSessionActive, conversation, toggleCall };
};

export default useMultVapi;
