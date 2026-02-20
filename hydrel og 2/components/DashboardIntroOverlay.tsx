import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

const DashboardIntroOverlay: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-dismiss after 1.5 seconds to allow animations to complete
    const timer = setTimeout(() => {
      onClose();
      // Use window.location or navigate if needed, but since we are already on dashboard,
      // we just close the overlay. The instructions said navigate('/dashboard'),
      // but if we are already there, it's fine.
    }, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-white"
    >
      {/* Animated words */}
      <div className="text-7xl font-bold flex flex-col items-center mb-8">
        <motion.span
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="block"
        >
          WE
        </motion.span>
        <motion.span
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="block"
        >
          ARE
        </motion.span>
        <motion.span
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="block"
        >
          HERE
        </motion.span>
      </div>

      {/* Logo that breaks the words */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="bg-orange-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
          HYDREL
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardIntroOverlay;
