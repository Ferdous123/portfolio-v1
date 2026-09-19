"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      // framer-hidden: CSS failsafe in globals.css reveals this after 3 s
      // (html.js-ready .framer-hidden { opacity:1 !important }) when JS files fail to load.
      className={`framer-hidden${className ? ` ${className}` : ""}`}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
