'use client';

import { motion } from 'framer-motion';
import { Sparkles, Target, Palette } from 'lucide-react';
import { ReactNode } from 'react';

interface WelcomeHeroProps {
    ctaButton?: ReactNode;
}

export function WelcomeHero({ ctaButton }: WelcomeHeroProps) {
    return (
        <div className="space-y-8 max-w-4xl mx-auto text-center">
            {/* Main Headline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
                    Clarify your brand.
                    <br />
                    <span className="text-primary">Generate on-brand assets.</span>
                </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl mx-auto"
            >
                Agentic AI that helps you define your positioning, create professional visual assets,
                and maintain brand consistency across every touchpoint.
            </motion.p>

            {/* CTA Button */}
            {ctaButton && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                    className="pt-2"
                >
                    {ctaButton}
                </motion.div>
            )}

            {/* Value Props */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8"
            >
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-all">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Clarify Your Position</h3>
                    <p className="text-sm text-muted-foreground text-center">
                        Define your brand strategy, target audience, and unique value proposition with AI guidance.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-all">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Generate Visual Assets</h3>
                    <p className="text-sm text-muted-foreground text-center">
                        Create logos, color palettes, presentations, and mockups that reflect your brand identity.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 transition-all">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Palette className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Stay Consistent</h3>
                    <p className="text-sm text-muted-foreground text-center">
                        Maintain brand consistency across web, apps, and all customer touchpoints automatically.
                    </p>
                </div>
            </motion.div>

            {/* Additional Context */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-4"
            >
                <p className="text-base text-muted-foreground/80 max-w-2xl mx-auto">
                    Look professional from day one. Attract investors and customers with a cohesive brand
                    that communicates trust and expertise.
                </p>
            </motion.div>
        </div>
    );
}
