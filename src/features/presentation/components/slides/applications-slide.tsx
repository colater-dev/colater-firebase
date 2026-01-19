'use client';

import { Brand, Logo } from '@/lib/types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BRAND_FONTS } from '@/config/brand-fonts';

interface ApplicationsSlideProps {
    brand: Brand;
    logo?: Logo;
    palette: string[];
}

export function ApplicationsSlide({ brand, logo, palette }: ApplicationsSlideProps) {
    const font = BRAND_FONTS.find(f => f.name === (logo?.font || brand?.font)) || BRAND_FONTS[0];
    const primaryColor = palette[0] || '#000000';
    const settings = logo?.displaySettings;
    const invertLogoSetting = !!settings?.invertLogo;

    return (
        <div className="h-full w-full bg-gray-50 flex flex-col p-[4cqw] gap-[2cqw]">
            <h2 className="font-mono uppercase tracking-[0.4em] text-center text-muted-foreground mb-4" style={{ fontSize: '1.2cqw' }}>Applications</h2>

            <div className="flex-1 grid grid-cols-2 grid-rows-[1.2fr_1fr] gap-[2cqw]">
                {/* Website Hero Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-2 bg-white rounded-[3cqw] shadow-lg border border-gray-100 overflow-hidden relative"
                >
                    <div className="absolute top-0 left-0 w-full h-8 bg-gray-50 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-200" />
                        </div>
                    </div>

                    <div className="h-full flex items-center p-[6cqw] gap-[6cqw]">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-2">
                                {logo?.logoUrl && (
                                    <div className="relative w-8 h-8">
                                        <Image src={logo.logoUrl} alt="Nav" fill className="object-contain" style={{ filter: invertLogoSetting ? 'invert(1)' : '' }} />
                                    </div>
                                )}
                                <span className="font-bold tracking-tight text-sm uppercase">{brand.latestName}</span>
                            </div>
                            <h3 className="font-black leading-[1.1]" style={{ fontFamily: `var(${font.variable})`, fontSize: '3.5cqw' }}>
                                Designing the future, today.
                            </h3>
                            <div className="flex gap-4">
                                <div className="h-10 px-6 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: primaryColor }}>Explore Brand</div>
                                <div className="h-10 px-6 rounded-full flex items-center justify-center text-foreground font-bold text-xs border border-gray-200">Contact Us</div>
                            </div>
                        </div>

                        <div className="flex-1 h-full bg-gray-50/50 rounded-[2cqw] border-2 border-dashed border-gray-100 flex items-center justify-center">
                            <div className="relative w-1/3 aspect-square opacity-10">
                                {logo?.logoUrl && <Image src={logo.logoUrl} alt="Placeholder" fill className="object-contain" />}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Business Card Layout */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black rounded-[3cqw] shadow-xl p-[4cqw] flex flex-col justify-between"
                >
                    <div className="relative w-[8cqw] h-[8cqw]">
                        {logo?.logoUrl && (
                            <Image
                                src={logo.logoUrl}
                                alt="Business Card Logo"
                                fill
                                className="object-contain"
                                style={{ filter: 'invert(1)' }}
                            />
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-white font-bold uppercase tracking-[0.2em] text-[0.8cqw]">{brand.latestName}</p>
                        <p className="text-gray-500 font-mono text-[0.7cqw]">www.{brand.latestName.toLowerCase().replace(/\s/g, '')}.com</p>
                    </div>
                </motion.div>

                {/* Social Post Mockup */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[3cqw] shadow-xl overflow-hidden border border-gray-100 flex flex-col"
                >
                    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-[4cqw] flex items-center justify-center">
                        <div className="bg-white p-4 rounded-3xl shadow-2xl relative w-1/2 aspect-square flex items-center justify-center">
                            {logo?.logoUrl && (
                                <Image
                                    src={logo.logoUrl}
                                    alt="Social Mark"
                                    fill
                                    className="object-contain p-6"
                                    style={{ filter: invertLogoSetting ? 'invert(1)' : '' }}
                                />
                            )}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-1">
                            <div className="h-2 w-1/3 bg-gray-100 rounded" />
                            <div className="h-1.5 w-1/4 bg-gray-50 rounded" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
