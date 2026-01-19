'use client';

import { motion } from 'framer-motion';

export function WelcomeHero() {
    return (
        <div className="space-y-6 max-w-3xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                    Your professional brand identity in <span className="text-primary italic">5 minutes</span>
                </h1>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl md:text-2xl text-muted-foreground font-medium"
            >
                AI-powered logos, color palettes, and brand guidelines. No design skills required.
            </motion.p>
        </div>
    );
}
