"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MicOff, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useVapi from '@/hooks/use-vapi';

const AudioVisualizer: React.FC<{ volumeRef: React.MutableRefObject<number>; isSessionActive: boolean }> = ({ volumeRef, isSessionActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isSessionActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Reset canvas size on setup
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationFrameId: number;
    let dataArray = new Uint8Array(128).fill(128); // Initial flat line

    const draw = () => {
      if (!isSessionActive) return;
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);

      const targetVolume = Math.min(Math.max(volumeRef.current, 0), 1);
      
      // Update our array simulating audio intensity
      for (let i = 0; i < dataArray.length; i++) {
        // Shift a bit randomly around 128 based on current volume level
        const variability = (Math.random() - 0.5);
        dataArray[i] = 128 + targetVolume * variability * 200; // Amplify movement
      }

      const sliceWidth = (width / (dataArray.length - 1)) * 2;
      const centerY = height / 2;

      context.lineWidth = 2;
      context.strokeStyle = '#9E9E9E';
      context.beginPath();

      let prevX = 0;
      let prevY = centerY;

      context.moveTo(prevX, prevY);

      for (let i = 0; i < dataArray.length; i++) {
        const avgValue = (dataArray[i] + dataArray[Math.max(0, i - 1)]) / 2;
        const v = avgValue / 255.0;
        const y = centerY + (v - 0.5) * height;
        const x = i * sliceWidth;

        context.bezierCurveTo((prevX + x) / 2, prevY, (prevX + x) / 2, y, x, y);

        prevX = x;
        prevY = y;
      }

      context.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSessionActive, volumeRef]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: isSessionActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    />
  );
};

const MinimalComponent: React.FC = () => {
  const { volumeLevel, isSessionActive, toggleCall } = useVapi();
  const [showVisualizer, setShowVisualizer] = useState(false);
  const volumeRef = useRef(0);

  // keep ref up to date to avoid re-rendering AudioVisualizer
  useEffect(() => {
    volumeRef.current = volumeLevel;
  }, [volumeLevel]);

  const handleToggleCall = () => {
    toggleCall();
    setShowVisualizer(!isSessionActive);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[30vh]">
      <div className="flex items-center justify-center">
        <motion.button
          key="callButton"
          onClick={handleToggleCall}
          className="p-2 rounded-xl bg-secondary"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          initial={{ x: 0 }}
          animate={{ x: showVisualizer ? -10 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 10, position: 'relative' }}
        >
          {isSessionActive ? <MicOff size={20} /> : <Mic size={20} />}
        </motion.button>
        <AnimatePresence>
          {showVisualizer && (
            <motion.div
              className="rounded-4xl"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginLeft: '10px', height: '50px' }}
            >
              <AudioVisualizer volumeRef={volumeRef} isSessionActive={isSessionActive} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MinimalComponent;
