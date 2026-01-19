'use client';

import { Brand, Logo } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoRevealSlideProps {
    brand: Brand;
    logo?: Logo;
}

export function LogoRevealSlide({ brand, logo }: LogoRevealSlideProps) {
    const settings = logo?.displaySettings;
    const contrast = settings?.logoContrast ?? 100;
    const invertLogoSetting = !!settings?.invertLogo;

    return (
        <div className="flex items-center justify-center h-full w-full bg-white relative overflow-hidden p-[10cqw]">
            {/* Subtle background textures could go here */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full h-full max-w-[50cqw] max-h-[50cqw]"
            >
                {logo?.logoUrl && (
                    <Image
                        src={logo.logoUrl}
                        alt="Brand Mark"
                        fill
                        className="object-contain"
                        style={{
                            filter: `contrast(${contrast}%) ${invertLogoSetting ? 'invert(1)' : ''}`
                        }}
                    />
                )}
            </motion.div>

            {/* Corner Labels (Optional/Stylistic) */}
            <div className="absolute top-10 right-10 flex flex-col items-end opacity-20 font-mono text-[1cqw]">
                <span className="uppercase tracking-widest">Master Mark</span>
                <span>V.1.0</span>
            </div>

            <div className="absolute bottom-10 left-10 flex flex-col items-start opacity-20 font-mono text-[1cqw]">
                <span className="uppercase tracking-widest">{brand.id.slice(0, 8)}</span>
                <span>Vector Certified</span>
            </div>
        </div>
    );
}
