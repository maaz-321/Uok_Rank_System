import { Box, Flex, Grid } from "@chakra-ui/react";
import { motion } from "motion/react";

/**
 * Motion (Framer Motion) wrappers around Chakra primitives so that both
 * libraries can be combined without losing Chakra style props.
 */
export const MotionBox = motion.create(Box);
export const MotionFlex = motion.create(Flex);
export const MotionGrid = motion.create(Grid);

export const EASE = [0.22, 1, 0.36, 1];

export function PageTransition({ children, ...props }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      {...props}
    >
      {children}
    </MotionBox>
  );
}

export function Stagger({ children, ...props }) {
  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      {...props}
    >
      {children}
    </MotionBox>
  );
}

export function StaggerItem({ children, ...props }) {
  return (
    <MotionBox
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
      }}
      {...props}
    >
      {children}
    </MotionBox>
  );
}
