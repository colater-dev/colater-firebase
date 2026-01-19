'use client';

import { Brand, Logo } from '@/lib/types';
import { EditableText } from '../editable-text';
import Image from 'next/image';
import { BRAND_FONTS } from '@/config/brand-fonts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { isLightColor } from '@/lib/color-utils';

interface CoverSlideProps {
    content: {
        brandName: string;
        tagline: string;
        clientName?: string;
        backgroundColor?: string;
    };
    isEditing: boolean;
    onUpdate: (updates: any) => void;
    brand: Brand;
    logo?: Logo;
}

export function CoverSlide({ content, isEditing, onUpdate, brand, logo }: CoverSlideProps) {
    const font = BRAND_FONTS.find(f => f.name === (logo?.font || brand?.font)) || BRAND_FONTS[0];
    const bgColor = content.backgroundColor || brand.displaySettings?.invertLogo ? '#000000' : '#ffffff';
    const isDark = !isLightColor(bgColor);
    const textColor = isDark ? 'white' : 'black';

    // Ratios for logo scaling (similar to BrandIdentitySlide but cleaner)
    const settings = logo?.displaySettings;
    const balance = settings?.verticalLogoTextBalance ?? 50;
    const logoSize = 12 * (1.5 - (balance / 100));
    const fontSize = 6 * (0.5 + (balance / 100)) * (font.sizeMultiplier || 1.0);
    const contrast = settings?.logoContrast ?? 100;

    return (
        <div
            className="flex flex-col items-center justify-center h-full text-center relative overflow-hidden p-[8cqw] transition-colors duration-700"
            style={{ backgroundColor: bgColor }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 flex flex-col items-center w-full max-w-4xl"
            >
                {/* Logo and Name Lockup */}
                <div className="flex flex-col items-center">
                    {logo?.logoUrl && (
                        <div className="relative mb-[4cqw]" style={{ width: `${logoSize}cqw`, height: `${logoSize}cqw` }}>
                            <Image
                                src={logo.logoUrl}
                                alt="Logo"
                                fill
                                className="object-contain"
                                style={{
                                    filter: `contrast(${contrast}%)${isDark !== !!settings?.invertLogo ? ' invert(1)' : ''}`
                                }}
                            />
                        </div>
                    )}
                    <EditableText
                        value={content.brandName || brand.latestName}
                        onChange={(val) => onUpdate({ brandName: val })}
                        isEditing={isEditing}
                        className="font-black tracking-tighter leading-none mb-[2cqw]"
                        style={{
                            fontFamily: `var(${font.variable})`,
                            fontSize: `${fontSize}cqw`,
                            color: textColor,
                            textTransform: logo?.displaySettings?.textTransform || 'none'
                        }}
                    />
                </div>

                {/* Tagline */}
                <EditableText
                    value={content.tagline || brand.primaryTagline || "Your brand tagline"}
                    onChange={(val) => onUpdate({ tagline: val })}
                    isEditing={isEditing}
                    className="font-medium tracking-tight max-w-2xl opacity-80"
                    style={{ fontSize: '2.5cqw', color: textColor }}
                />

                {/* Client Name (Optional) */}
                <div className="pt-[4cqw]">
                    <EditableText
                        value={content.clientName || ""}
                        onChange={(val) => onUpdate({ clientName: val })}
                        isEditing={isEditing}
                        className="text-xs font-bold uppercase tracking-[0.3em] opacity-40"
                        placeholder="Created for [Client Name]"
                        style={{ color: textColor }}
                    />
                </div>
            </motion.div>

            {/* Corner Decorative Element */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-primary/10 m-8" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-primary/10 m-8" />
        </div>
    );
}
