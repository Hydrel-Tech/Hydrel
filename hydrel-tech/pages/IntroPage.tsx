import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(from, { replace: true }); // Redirect to the intended page or main page
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, from]);

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
