'use client';

import { Brand, Logo } from '@/lib/types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BRAND_FONTS } from '@/config/brand-fonts';
import { isLightColor } from '@/lib/color-utils';

interface ApplicationsSlideProps {
    brand: Brand;
    logo?: Logo;
    palette: string[];
}

export function ApplicationsSlide({ brand, logo, palette }: ApplicationsSlideProps) {
    const font = BRAND_FONTS.find(f => f.name === (logo?.font || brand?.font)) || BRAND_FONTS[0];
    const primaryColor = palette[0] || '#6366F1';
    const settings = logo?.displaySettings;
    const invertLogoSetting = !!settings?.invertLogo;
    const isLightPrimaryColor = isLightColor(primaryColor);

    return (
        <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100/50 flex flex-col p-[5cqw] gap-[3cqw]">
            <div className="text-center space-y-2">
                <h2 className="font-mono uppercase tracking-[0.4em] text-muted-foreground/60" style={{ fontSize: '1cqw' }}>
                    Brand In Action
                </h2>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary/20 to-transparent mx-auto" />
            </div>

            <div className="flex-1 grid grid-cols-2 grid-rows-[1.3fr_1fr] gap-[2.5cqw]">
                {/* Website Hero Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="col-span-2 bg-white rounded-[2cqw] shadow-2xl border border-gray-200/50 overflow-hidden relative group"
                >
                    {/* Browser Chrome */}
                    <div className="absolute top-0 left-0 w-full h-[3cqw] bg-gradient-to-b from-gray-100 to-gray-50 flex items-center px-[2cqw] gap-2 border-b border-gray-200/50">
                        <div className="flex gap-1.5">
                            <div className="w-[0.8cqw] h-[0.8cqw] rounded-full bg-red-400/80" />
                            <div className="w-[0.8cqw] h-[0.8cqw] rounded-full bg-yellow-400/80" />
                            <div className="w-[0.8cqw] h-[0.8cqw] rounded-full bg-green-400/80" />
                        </div>
                        <div className="ml-4 flex-1 h-[1.8cqw] bg-white rounded-md border border-gray-200/50 flex items-center px-3">
                            <span className="font-mono text-[0.6cqw] text-muted-foreground">
                                {brand.latestName.toLowerCase().replace(/\s/g, '')}.com
                            </span>
                        </div>
                    </div>

                    <div className="h-full flex items-center pt-[5cqw] pb-[3cqw] px-[5cqw] gap-[5cqw]">
                        <div className="flex-1 space-y-[2cqw]">
                            {/* Navigation */}
                            <div className="flex items-center gap-3">
                                {logo?.logoUrl && (
                                    <div className="relative w-[2.5cqw] h-[2.5cqw]">
                                        <Image
                                            src={logo.logoUrl}
                                            alt="Nav Logo"
                                            fill
                                            className="object-contain"
                                            style={{ filter: invertLogoSetting ? 'invert(1)' : '' }}
                                        />
                                    </div>
                                )}
                                <span className="font-bold tracking-tight uppercase" style={{ fontSize: '1.2cqw' }}>
                                    {brand.latestName}
                                </span>
                            </div>

                            {/* Hero Text */}
                            <h3
                                className="font-black leading-[1.05] tracking-tight"
                                style={{ fontFamily: `var(${font.variable})`, fontSize: '3.8cqw' }}
                            >
                                {brand.primaryTagline || 'Building the future, together.'}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed max-w-md" style={{ fontSize: '1.3cqw' }}>
                                {brand.latestElevatorPitch.slice(0, 100)}...
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex gap-[1.5cqw] pt-[1cqw]">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="px-[2cqw] py-[1cqw] rounded-full flex items-center justify-center font-bold shadow-lg"
                                    style={{
                                        backgroundColor: primaryColor,
                                        color: isLightPrimaryColor ? '#000' : '#fff',
                                        fontSize: '1cqw'
                                    }}
                                >
                                    Get Started
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="px-[2cqw] py-[1cqw] rounded-full flex items-center justify-center font-bold border-2 bg-white"
                                    style={{ borderColor: primaryColor, color: primaryColor, fontSize: '1cqw' }}
                                >
                                    Learn More
                                </motion.div>
                            </div>
                        </div>

                        {/* Hero Image Placeholder */}
                        <div className="flex-1 h-[80%] bg-gradient-to-br from-gray-100 to-gray-50 rounded-[2cqw] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                            <div className="relative w-[40%] aspect-square opacity-[0.08] grayscale">
                                {logo?.logoUrl && <Image src={logo.logoUrl} alt="Hero" fill className="object-contain" />}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Business Card Layout */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-gradient-to-br from-gray-900 to-black rounded-[2cqw] shadow-2xl p-[5cqw] flex flex-col justify-between relative overflow-hidden group"
                >
                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

                    <div className="relative z-10 space-y-[1cqw]">
                        <div className="relative w-[10cqw] h-[10cqw]">
                            {logo?.logoUrl ? (
                                <Image
                                    src={logo.logoUrl}
                                    alt="Card Logo"
                                    fill
                                    className="object-contain transition-transform group-hover:scale-105 duration-300"
                                    style={{ filter: 'invert(1) brightness(1.1)' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="font-mono text-white/20 text-[1.5cqw]">Logo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-[0.8cqw] relative z-10">
                        <p className="text-white font-bold uppercase tracking-[0.25em]" style={{ fontSize: '1.1cqw' }}>
                            {brand.latestName}
                        </p>
                        <p className="text-gray-400 font-mono" style={{ fontSize: '0.9cqw' }}>
                            {brand.latestName.toLowerCase().replace(/\s/g, '')}.com
                        </p>
                        <div className="pt-[1cqw] space-y-[0.4cqw]">
                            <p className="text-gray-500 font-mono text-[0.7cqw]">hello@{brand.latestName.toLowerCase().replace(/\s/g, '')}.com</p>
                        </div>
                    </div>

                    {/* Corner accent */}
                    <div
                        className="absolute top-4 right-4 w-12 h-12 rounded-full opacity-10 blur-2xl"
                        style={{ backgroundColor: primaryColor }}
                    />
                </motion.div>

                {/* Social Post Mockup */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-[2cqw] shadow-2xl overflow-hidden border border-gray-200/50 flex flex-col group"
                >
                    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50/50 p-[4cqw] flex items-center justify-center relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, ${primaryColor} 1px, transparent 0)`,
                            backgroundSize: '30px 30px'
                        }} />

                        <div
                            className="relative p-[3cqw] rounded-[2cqw] shadow-2xl w-[60%] aspect-square flex items-center justify-center transition-transform group-hover:scale-105 duration-300"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {logo?.logoUrl ? (
                                <Image
                                    src={logo.logoUrl}
                                    alt="Social"
                                    fill
                                    className="object-contain p-[2cqw]"
                                    style={{ filter: isLightPrimaryColor ? '' : 'invert(1) brightness(1.1)' }}
                                />
                            ) : (
                                <span className="font-mono text-white/20 text-[1.5cqw]">Logo</span>
                            )}
                        </div>
                    </div>

                    {/* Social Footer */}
                    <div className="p-[2cqw] border-t border-gray-100 flex items-center gap-[1.5cqw]">
                        <div
                            className="w-[3cqw] h-[3cqw] rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: primaryColor, fontSize: '1.2cqw' }}
                        >
                            {brand.latestName.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-[0.5cqw]">
                            <div className="h-[0.8cqw] w-[40%] bg-gray-100 rounded-full" />
                            <div className="h-[0.6cqw] w-[30%] bg-gray-50 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
