// components/ui/CustomCursor.js (verify – no functional changes, ensure passive events)
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const move = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move, { passive: true });
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"]');
      setIsHovering(!!target);
    };
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] mix-blend-difference"
      animate={{ x: position.x - 12, y: position.y - 12, scale: isHovering ? 1.5 : 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)' }}
    />
  );
}