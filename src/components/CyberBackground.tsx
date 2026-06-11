import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function CyberBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-[#040407] to-[#010102]"></div>

      {/* Cyber Grid with Slow Drifting Translation - premium subtle tracking lines */}
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', '64px 64px'],
        }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: 'linear',
        }}
        className="absolute inset-0 opacity-[0.24]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(250, 204, 21, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250, 204, 21, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Giant Slow Floating Biometric/Telemetry Glowing Orbs - upgraded to be beautifully ambient and light-shaded */}
      <motion.div
        animate={{
          x: [-120, 120, -120],
          y: [-80, 140, -80],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[5%] left-[2%] w-[60vw] h-[60vw] rounded-full bg-[#FACC15] opacity-[0.055] blur-[140px] mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [140, -140, 140],
          y: [120, -120, 120],
          scale: [0.9, 1.35, 1, 0.9],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[3%] right-[2%] w-[55vw] h-[55vw] rounded-full bg-yellow-500 opacity-[0.045] blur-[160px] mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [-100, 100, -100],
          y: [140, -140, 140],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[25%] right-[15%] w-[40vw] h-[40vw] rounded-full bg-amber-400 opacity-[0.035] blur-[150px] mix-blend-screen"
      />

      {/* Slow floating tech particles/data streams - reduced opacity and subtle, low-intensity glow */}
      <div className="absolute inset-0 opacity-[0.45]">
        {Array.from({ length: 28 }).map((_, i) => {
          // Deterministic values to prevent hydration flickering
          const startX = (i * 7) % 100;
          const startY = (i * 13) % 100;
          const size = ((i * 3.5) % 4) + 1.8; // 1.8px to 5.8px elegant circles
          const delay = (i * 0.5) % 6;
          const duration = 12 + ((i * 4) % 18); // 12s to 30s for rich rhythm

          return (
            <motion.div
              key={i}
              initial={{
                x: `${startX}vw`,
                y: `${startY + 15}vh`,
                opacity: 0.05,
              }}
              animate={{
                y: [`${startY + 25}vh`, `${startY - 45}vh`],
                opacity: [0, 0.45, 0.45, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: 'easeInOut',
              }}
              className="absolute bg-gradient-to-t from-[#FACC15] via-yellow-400 to-amber-300 rounded-full"
              style={{
                width: size,
                height: size,
                boxShadow: '0 0 5px rgba(250,204,21,0.22)',
              }}
            />
          );
        })}
      </div>

      {/* Sweeping scanner line - ultra subtle sci-fi telemetry visibility */}
      <motion.div
        animate={{
          y: ['-100%', '200%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: 'linear',
        }}
        className="absolute inset-x-0 h-[10vh] bg-gradient-to-b from-transparent via-[#FACC15]/2.5 to-transparent pointer-events-none"
      />
    </div>
  );
}
