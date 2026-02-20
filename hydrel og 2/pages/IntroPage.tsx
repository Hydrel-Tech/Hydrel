import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const IntroPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/'); // Redirect to the main page after animation
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <motion.h1
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-white text-4xl md:text-6xl font-bold tracking-[0.2em] text-center px-6 uppercase"
      >
        WELCOME TO HYDREL ARCHITECTURES
      </motion.h1>
    </div>
  );
};

export default IntroPage;
