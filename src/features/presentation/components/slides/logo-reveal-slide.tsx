'use client';

import { Brand, Logo } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoRevealSlideProps {
    brand: Brand;
    logo?: Logo;
    palette?: string[];
}

export function LogoRevealSlide({ brand, logo, palette }: LogoRevealSlideProps) {
    const settings = logo?.displaySettings;
    const contrast = settings?.logoContrast ?? 100;
    const invertLogoSetting = !!settings?.invertLogo;
    const accentColor = palette?.[0] || '#6366F1';

    return (
        <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `linear-gradient(${accentColor} 1px, transparent 1px), linear-gradient(90deg, ${accentColor} 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.02)_100%)]" />

            {/* Logo Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-[60cqw] h-[60cqw] flex items-center justify-center"
            >
                {/* Decorative frame */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute inset-0 rounded-3xl border-2 border-dashed opacity-5"
                    style={{ borderColor: accentColor }}
                />

                {/* Logo */}
                <div className="relative w-[50cqw] h-[50cqw]">
                    {logo?.logoUrl ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={logo.logoUrl}
                                alt="Brand Mark"
                                fill
                                className="object-contain drop-shadow-2xl"
                                style={{
                                    filter: `contrast(${contrast}%) ${invertLogoSetting ? 'invert(1)' : ''}`
                                }}
                            />
                        </motion.div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="font-mono text-muted-foreground/20 text-[3cqw]">Logo</span>
                        </div>
                    )}
                </div>

                {/* Subtle glow effect */}
                <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-5"
                    style={{ backgroundColor: accentColor }}
                />
            </motion.div>

            {/* Corner Labels */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute top-12 right-12 flex flex-col items-end opacity-25 font-mono"
            >
                <span className="uppercase tracking-[0.3em] text-[0.9cqw] font-bold">Primary Mark</span>
                <span className="text-[0.7cqw] mt-1" style={{ color: accentColor }}>Version 1.0</span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-12 left-12 flex flex-col items-start opacity-25 font-mono"
            >
                <span className="uppercase tracking-[0.3em] text-[0.9cqw] font-bold">{brand.latestName}</span>
                <span className="text-[0.7cqw] mt-1">ID: {brand.id.slice(0, 8).toUpperCase()}</span>
            </motion.div>

            {/* Decorative corner accents */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 rounded-tl-2xl"
                style={{ borderColor: `${accentColor}15` }}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 rounded-br-2xl"
                style={{ borderColor: `${accentColor}15` }}
            />
        </div>
    );
}
