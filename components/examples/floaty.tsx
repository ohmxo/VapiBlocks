import { PhoneCallIcon, MicIcon, AudioLines } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useVapi from '@/hooks/use-vapi'; // Adjust the import path as needed

const FloatingCircle = ({ isActive, volumeLevel, handleClick }: { isActive: boolean, volumeLevel: number, handleClick: () => void }) => {
  const getIcon = () => {
    if (!isActive) {
      return <PhoneCallIcon className="text-secondary" />;
    } else if (isActive && volumeLevel > 0.05) {
      return <AudioLines className="text-secondary" />;
    } else {
      return <MicIcon className="text-secondary" />;
    }
  };

  const activityLevel = isActive ? Math.min(Math.max(volumeLevel, 0), 1) : 0;

  return (
    <div className="absolute bottom-5 right-5 z-50">
      <div className="relative flex items-center justify-center w-16 h-16">
        {isActive && (
          <>
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-foreground z-0 pointer-events-none"
              animate={{
                scale: 1 + activityLevel * 1.5,
                opacity: Math.max(0.1, activityLevel - 0.2),
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.15 }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-foreground z-0 pointer-events-none"
              animate={{
                scale: 1 + activityLevel * 2.5,
                opacity: Math.max(0.05, activityLevel - 0.5),
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            />
          </>
        )}
        <div 
          className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl cursor-pointer z-10 bg-foreground group"
          onClick={handleClick}
        >
          {getIcon()}
          {!isActive && (
            <div className="absolute w-[calc(100%+40px)] h-[calc(100%+40px)] rounded-full border-2 border-foreground/20 animate-ping group-hover:border-foreground/50 transition-colors pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};

const FloatyExample = () => {
  const [showCircle, setShowCircle] = useState(false);
  const { volumeLevel, isSessionActive, toggleCall } = useVapi();

  const handleButtonClick = () => {
    setShowCircle(!showCircle);
  };

  return (
    <div className="App flex flex-col items-center justify-center size-full p-12">
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 rounded-lg text-sm shadow-md focus:outline-none border hover:bg-secondary transition-colors duration-200 ease-in-out"
      >
        Toggle Floaty Assistant
      </button>
      {showCircle && <FloatingCircle isActive={isSessionActive} volumeLevel={volumeLevel} handleClick={toggleCall} />}
    </div>
  );
}

export default FloatyExample;
