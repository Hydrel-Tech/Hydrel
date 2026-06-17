import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LetterGlitch from '../src/components/react-bits/LetterGlitch';

interface Props {
  onClose: () => void;
}

const DashboardIntroOverlay: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-dismiss after 3 seconds to allow slower animations to complete
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-cyan-400"
    >
      <div className="absolute inset-0">
        <LetterGlitch glitchSpeed={50} centerVignette={true} outerVignette={false} glitchColors={['#2b4539', '#61dca3', '#61b3dc']} />
      </div>
      <div className="text-7xl font-bold flex flex-col items-center relative z-10 pointer-events-none drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
        <motion.span
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="block text-white"
        >
          WE
        </motion.span>
        <motion.span
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="block text-white"
        >
          ARE
        </motion.span>
        <motion.span
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.0 }}
          className="block text-white"
        >
          HERE
        </motion.span>
      </div>
    </motion.div>
  );
};

export default DashboardIntroOverlay;
