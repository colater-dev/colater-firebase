'use client';

import { motion } from 'framer-motion';

interface AnimatedMenuIconProps {
    isOpen?: boolean;
    className?: string;
}

export function AnimatedMenuIcon({ isOpen = false, className = '' }: AnimatedMenuIconProps) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <motion.path
                d="M3 12h18"
                initial={false}
                animate={{
                    d: isOpen ? "M6 18L18 6" : "M3 12h18"
                }}
                transition={{ duration: 0.3 }}
            />
            <motion.path
                d="M3 6h18"
                initial={false}
                animate={{
                    opacity: isOpen ? 0 : 1
                }}
                transition={{ duration: 0.2 }}
            />
            <motion.path
                d="M3 18h18"
                initial={false}
                animate={{
                    d: isOpen ? "M6 6L18 18" : "M3 18h18"
                }}
                transition={{ duration: 0.3 }}
            />
        </svg>
    );
}
