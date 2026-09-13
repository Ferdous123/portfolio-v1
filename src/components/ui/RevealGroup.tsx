"use client";

import { motion, type Variants } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
  stagger?: number;
};

export const RevealGroup = forwardRef<HTMLDivElement | HTMLUListElement, RevealGroupProps>(
  function RevealGroup({ children, className, as = "div", stagger = 0.08 }, ref) {
    const Component = as === "ul" ? motion.ul : motion.div;
    return (
      <Component
        ref={ref as never}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
      >
        {children}
      </Component>
    );
  },
);

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function RevealItem({ children, className, as = "div" }: RevealItemProps) {
  const Component = as === "li" ? motion.li : motion.div;
  return (
    <Component
      className={className}
      variants={itemVariants}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </Component>
  );
}
