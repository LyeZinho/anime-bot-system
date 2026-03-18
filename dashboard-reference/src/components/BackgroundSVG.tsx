import React from 'react';
import { motion } from 'motion/react';

export default function BackgroundSVG() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-20">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a855f7" strokeWidth="1" />
          </pattern>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#f43f7a" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <motion.circle
          cx="10%"
          cy="20%"
          r="100"
          fill="none"
          stroke="#a855f7"
          strokeWidth="20"
          animate={{
            cx: ["10%", "15%", "10%"],
            cy: ["20%", "25%", "20%"],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.rect
          x="80%"
          y="70%"
          width="150"
          height="150"
          fill="none"
          stroke="#4d8eff"
          strokeWidth="15"
          animate={{
            rotate: 360,
            x: ["80%", "75%", "80%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <motion.path
          d="M 0 100 Q 250 50 500 100 T 1000 100"
          fill="none"
          stroke="#facc15"
          strokeWidth="5"
          animate={{
            d: [
              "M 0 100 Q 250 50 500 100 T 1000 100",
              "M 0 100 Q 250 150 500 100 T 1000 100",
              "M 0 100 Q 250 50 500 100 T 1000 100",
            ]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
