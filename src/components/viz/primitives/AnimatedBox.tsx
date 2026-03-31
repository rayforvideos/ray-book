"use client";

import { motion, type Variants } from "framer-motion";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const presets = { fadeIn, scaleIn, slideLeft, slideRight };

interface AnimatedBoxProps {
  preset?: keyof typeof presets;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

export function AnimatedBox({
  preset = "fadeIn",
  delay = 0,
  className,
  children,
}: AnimatedBoxProps) {
  return (
    <motion.div
      variants={presets[preset]}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
