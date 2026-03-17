import React, { useState, useEffect, useMemo } from 'react';
import AbstractBall from '@/components/examples/abstract-ball';
import ConfigSheet from '@/components/examples/config-drawer';
import useVapi from '@/hooks/use-vapi';
import { Button } from '@/components/ui/button';
import { MicIcon, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type GlobController = Pick<ReturnType<typeof useVapi>, 'volumeLevel' | 'isSessionActive' | 'toggleCall'>;

type GlobSceneProps = {
  controller: GlobController;
  className?: string;
  showConfig?: boolean;
  showCallToggle?: boolean;
};

const baseConfig = {
  perlinTime: 10.0,
  perlinDNoise: 0.4,
  chromaRGBr: 2.8,
  chromaRGBg: 3.2,
  chromaRGBb: 4.8,
  chromaRGBn: 0,
  chromaRGBm: 1.0,
  sphereWireframe: false,
  spherePoints: false,
  spherePsize: 1.0,
  cameraSpeedY: 0.0,
  cameraSpeedX: 0.0,
  cameraZoom: 184,
  cameraGuide: false,
  perlinMorph: 3.5,
};

const GlobScene: React.FC<GlobSceneProps> = ({
  controller,
  className,
  showConfig = false,
  showCallToggle = true,
}) => {
  const { volumeLevel, isSessionActive, toggleCall } = controller;
  const [smoothedLevel, setSmoothedLevel] = useState(0);
  const [config, setConfig] = useState(baseConfig);

  useEffect(() => {
    let frameId = 0;
    const target = isSessionActive ? Math.min(Math.max(volumeLevel, 0), 1) : 0;

    const step = () => {
      setSmoothedLevel((current) => {
        const next = current + (target - current) * 0.2;
        if (Math.abs(target - next) < 0.002) return target;
        frameId = requestAnimationFrame(step);
        return next;
      });
    };

    step();
    return () => cancelAnimationFrame(frameId);
  }, [isSessionActive, volumeLevel]);

  const dynamicConfig = useMemo(() => {
    if (showConfig) return config;

    if (!isSessionActive) {
      return {
        ...baseConfig,
        perlinTime: 4.5,
        perlinMorph: 1.4,
        perlinDNoise: 0.15,
        cameraZoom: 188,
        cameraSpeedY: 0.02,
      };
    }

    return {
      ...baseConfig,
      perlinTime: 16 + smoothedLevel * 72,
      perlinMorph: 4 + smoothedLevel * 18,
      perlinDNoise: 0.25 + smoothedLevel * 1.7,
      cameraZoom: 182 - smoothedLevel * 14,
      cameraSpeedY: 0.04 + smoothedLevel * 0.12,
      chromaRGBr: 2.6 + smoothedLevel * 1.2,
      chromaRGBg: 3.1 + smoothedLevel * 1.1,
      chromaRGBb: 4.7 + smoothedLevel * 1.4,
      chromaRGBn: smoothedLevel * 2.2,
      chromaRGBm: 1 + smoothedLevel * 0.35,
    };
  }, [showConfig, config, isSessionActive, smoothedLevel]);

  return (
    <div className={cn('flex flex-col gap-5 w-full', className)}>
      {showConfig && <ConfigSheet config={config} setConfig={setConfig} />}
      <AbstractBall {...dynamicConfig} />
      {showCallToggle && (
        <div className="flex justify-center">
          <Button onClick={toggleCall} className="px-6 py-3 text-sm font-semibold tracking-wide">
            {isSessionActive ? <PhoneOff size={18} /> : <MicIcon size={18} />}
            <span className="ml-2">{isSessionActive ? 'Disconnect' : 'Speak'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

const Glob: React.FC<{ className?: string }> = ({ className }) => {
  const controller = useVapi();

  return <GlobScene controller={controller} className={className} />;
};

export { GlobScene };
export default Glob;
