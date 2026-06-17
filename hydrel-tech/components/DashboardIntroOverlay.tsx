import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
      {/* Animated words */}
      <div className="text-7xl font-bold flex flex-col items-center">
        <motion.span
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="block"
        >
          WE
        </motion.span>
        <motion.span
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="block"
        >
          ARE
        </motion.span>
        <motion.span
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.0 }}
          className="block"
        >
          HERE
        </motion.span>
      </div>
    </motion.div>
  );
};

export default DashboardIntroOverlay;
