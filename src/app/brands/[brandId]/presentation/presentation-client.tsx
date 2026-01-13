'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { createBrandService, createLogoService } from '@/services';
import type { Brand, Logo } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Loader2, Smartphone, Send, Maximize2, Type, Sparkles, Trash2, Palette } from 'lucide-react';
import { Menu } from '@/components/animate-ui/icons/menu';
import { useSidebar } from '@/components/layout/sidebar-context';
import Image from 'next/image';
import { BRAND_FONTS } from '@/config/brand-fonts';
import { getGeneratedStories, getPresentationData, getLogoJustification, getLogoSuggestionFal } from '@/app/actions';
import type { Justification } from '@/ai/flows/justify-logo';
import { shiftHue, darkenColor, isLightColor, lightenColor } from '@/lib/color-utils';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

// --- Sub-components for Slides ---

const BrandIdentitySlide = ({ brand, logo, aiData, palette = [], isColor = false, forceWhiteBg = false, overrideBalance, overrideGap, hueShift = 0 }: { brand: Brand; logo?: Logo; aiData?: any; palette?: string[]; isColor?: boolean; forceWhiteBg?: boolean; overrideBalance?: number; overrideGap?: number; hueShift?: number }) => {
    const font = BRAND_FONTS.find(f => f.name === (logo?.font || brand?.font)) || BRAND_FONTS[0];

    // Ratios from editor (LogoPreviewCard)
    const settings = logo?.displaySettings;
    const balance = overrideBalance ?? settings?.verticalLogoTextBalance ?? 50;
    const gap = overrideGap ?? settings?.verticalLogoTextGap ?? 50;
    const contrast = settings?.logoContrast ?? 100;

    // Scale factor to make it feel appropriate for a slide
    const scale = 1.8;
    const baseLogoSize = 14 * scale;
    const baseFontSize = 4 * scale;

    const logoSize = baseLogoSize * (1.5 - (balance / 100));
    const fontSize = baseFontSize * (0.5 + (balance / 100)) * (font.sizeMultiplier || 1.0);
    const logoGap = gap * 0.08 * scale;

    const bgColor = (forceWhiteBg || !isColor) ? 'white' : (palette[0] || 'white');
    const isDarkBg = !isLightColor(bgColor);
    const textColor = isDarkBg ? 'white' : 'black';
    const logoUrl = isColor
        ? (logo?.colorLogoUrl || (logo?.colorVersions && logo.colorVersions[0]?.colorLogoUrl) || logo?.logoUrl)
        : logo?.logoUrl;

    // Determine if we should invert the logo for the background
    const invertLogoSetting = !!logo?.displaySettings?.invertLogo;
    const shouldInvert = isColor ? false : (isDarkBg !== invertLogoSetting);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center relative overflow-hidden transition-colors duration-[1.5s]" style={{ backgroundColor: bgColor, paddingTop: '3cqw', paddingBottom: '9cqw', paddingLeft: '6cqw', paddingRight: '6cqw' }}>
            {logoUrl && (
                <div className="relative z-0" style={{ width: `${logoSize}cqw`, height: `${logoSize}cqw`, marginBottom: `${logoGap}cqw` }}>
                    <Image
                        src={logoUrl}
                        alt="Logo"
                        fill
                        className="object-contain"
                        style={{
                            filter: `contrast(${contrast}%)${shouldInvert ? ' invert(1)' : ''}${isColor && hueShift !== 0 ? ` hue-rotate(${hueShift}deg)` : ''}`
                        }}
                    />
                </div>
            )}
            <div className="flex flex-col items-center relative z-10">
                <h1
                    className="font-black tracking-tighter"
                    style={{
                        fontFamily: `var(${font.variable})`,
                        textTransform: logo?.displaySettings?.textTransform === 'none' ? 'none' : logo?.displaySettings?.textTransform === 'capitalize' ? 'capitalize' : logo?.displaySettings?.textTransform || 'none',
                        fontSize: `${fontSize}cqw`,
                        lineHeight: '0.9',
                        color: textColor
                    }}
                >
                    {brand?.latestName || 'Your Brand'}
                </h1>
            </div>
        </div>
    );
};

const IconOnlySlide = ({ brand, logo }: { brand: Brand; logo?: Logo }) => {
    const settings = logo?.displaySettings;
    const contrast = settings?.logoContrast ?? 100;
    const logoUrl = logo?.logoUrl;

    // Determine if we should invert the logo
    const invertLogoSetting = !!logo?.displaySettings?.invertLogo;
    const shouldInvert = invertLogoSetting;

    return (
        <div className="flex items-center justify-center h-full relative overflow-hidden bg-white" style={{ padding: '6cqw' }}>
            {logoUrl && (
                <div className="relative z-0" style={{ width: '37.5cqw', height: '37.5cqw' }}>
                    <Image
                        src={logoUrl}
                        alt="Logo Icon"
                        fill
                        className="object-contain"
                        style={{
                            filter: `contrast(${contrast}%)${shouldInvert ? ' invert(1)' : ''}`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

const BrandIdeaSlide = ({ aiData, palette }: { aiData?: any; palette: string[] }) => (
    <div className="flex flex-col items-start justify-center h-full w-full relative overflow-hidden" style={{ padding: '8cqw' }}>
        {/* Minimal abstract background derived from primary color */}
        <div className="absolute opacity-10 rounded-full blur-[10cqw]" style={{ backgroundColor: palette[0], width: '30cqw', height: '30cqw', top: '-10cqw', right: '-10cqw' }} />
        <div className="absolute opacity-5 rounded-full blur-[8cqw]" style={{ backgroundColor: palette[1] || palette[0], width: '25cqw', height: '25cqw', bottom: '-10cqw', left: '-10cqw' }} />

        <div className="relative z-10 w-full" style={{ gap: '3cqw', display: 'flex', flexDirection: 'column' }}>
            <h2 className="font-black tracking-tight text-balance" style={{ fontSize: '6cqw', lineHeight: '1.1' }}>
                {aiData?.brandStatement || "A bold statement of intent and purpose."}
            </h2>
            <div className="border-l-4 border-primary/20 pl-[3cqw]" style={{ maxWidth: '60%' }}>
                <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '2.2cqw' }}>
                    {aiData?.supportingLine || "Innovation driven by a commitment to excellence and user-centric design."}
                </p>
            </div>
        </div>
    </div>
);

const VisualIntentSlide = ({ aiData, palette }: { aiData?: any; palette: string[] }) => (
    <div className="flex flex-col items-center justify-center h-full w-full" style={{ padding: '6cqw', gap: '5cqw' }}>
        <h2 className="font-mono uppercase tracking-[0.3em] text-muted-foreground" style={{ fontSize: '1.2cqw' }}>Visual Intent</h2>
        <div className="grid grid-cols-4 w-full" style={{ gap: '4cqw' }}>
            {(aiData?.visualIntentPhrases || ["modular", "precise", "contemporary", "resilient"]).map((phrase: string, i: number) => (
                <div key={phrase} className="flex flex-col items-center text-center" style={{ gap: '2cqw' }}>
                    <div className="rounded-full" style={{ backgroundColor: palette[i % palette.length], opacity: 0.1 + (i * 0.1), width: '8cqw', height: '8cqw' }} />
                    <span className="font-bold tracking-tight capitalize" style={{ fontSize: '1.8cqw' }}>{phrase}</span>
                </div>
            ))}
        </div>
    </div>
);

const LogoGridSlide = ({ logo, palette, brand }: { logo?: Logo; palette: string[]; brand: Brand }) => {
    const colorLogoUrl = logo?.colorLogoUrl || (logo?.colorVersions && logo.colorVersions[0]?.colorLogoUrl);
    const monochromeLogoUrl = logo?.logoUrl;
    const invertLogoSetting = !!logo?.displaySettings?.invertLogo;
    const contrast = logo?.displaySettings?.logoContrast ?? 100;

    const gridItems = [
        { bg: 'white', logo: colorLogoUrl || monochromeLogoUrl, isColor: !!colorLogoUrl },
        { bg: palette[0] || '#000000', logo: colorLogoUrl || monochromeLogoUrl, isColor: !!colorLogoUrl },
        { bg: 'white', logo: monochromeLogoUrl, isColor: false },
        { bg: 'black', logo: monochromeLogoUrl, isColor: false },
    ];

    return (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full bg-gray-100 gap-px">
            {gridItems.map((item, i) => {
                const isDarkBg = !isLightColor(item.bg);
                // logic: invert if (isDark XOR invertLogoSetting)
                // but if it's already a colorized logo, we generally don't want to invert it 
                // unless it's strictly a mask. Reve's color logos are full color.
                const shouldInvert = item.isColor ? false : (isDarkBg !== invertLogoSetting);

                return (
                    <div key={i} className="flex items-center justify-center p-[6cqw]" style={{ backgroundColor: item.bg }}>
                        <div className="relative w-full h-full max-w-[80%] max-h-[80%]">
                            <Image
                                src={item.logo || ''}
                                alt={`Grid Logo ${i}`}
                                fill
                                className="object-contain"
                                style={{ filter: `contrast(${contrast}%)${shouldInvert ? ' invert(1)' : ''}` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const LogoSystemSlide = ({ brand, logo }: { brand: Brand; logo?: Logo }) => {
    const font = BRAND_FONTS.find(f => f.name === brand?.font) || BRAND_FONTS[0];
    const crop = logo?.cropDetails;

    return (
        <div className="h-full flex flex-col justify-center items-center" style={{ padding: '6cqw', gap: '4cqw' }}>
            <h2 className="font-mono uppercase tracking-[0.3em] text-muted-foreground" style={{ fontSize: '1.2cqw' }}>Logo System</h2>

            <div className="grid grid-cols-3 w-full" style={{ gap: '4cqw' }}>
                {/* Primary Lockup */}
                <div className="flex flex-col items-center bg-gray-50 border border-gray-100" style={{ padding: '3cqw', gap: '2cqw', borderRadius: '2cqw' }}>
                    <div className="relative" style={{ width: '12cqw', height: '12cqw' }}>
                        <Image
                            src={logo?.logoUrl || ''}
                            alt="Logo"
                            fill
                            className="object-contain"
                            style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%)${logo?.displaySettings?.invertLogo ? ' invert(1)' : ''}` }}
                        />
                    </div>
                    <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: `var(${font.variable})`, textTransform: logo?.displaySettings?.textTransform || 'none', fontSize: '2cqw' }}>
                        {brand.latestName}
                    </span>
                </div>

                {/* Cropped Mark */}
                <div className="flex flex-col items-center" style={{ gap: '2cqw' }}>
                    <div className="relative bg-black overflow-hidden flex items-center justify-center" style={{ width: '12cqw', height: '12cqw', borderRadius: '2cqw', padding: '1cqw' }}>
                        <div className="relative w-full h-full">
                            <Image
                                src={logo?.logoUrl || ''}
                                alt="Cropped"
                                fill
                                className="object-cover"
                                style={{
                                    filter: 'invert(1)',
                                    transform: crop ? `scale(${100 / crop.width * 0.8})` : 'scale(1.5)',
                                    objectPosition: crop ? `${(crop.x + crop.width / 2) * 100}% ${(crop.y + crop.height / 2) * 100}%` : 'center'
                                }}
                            />
                        </div>
                    </div>
                    <span className="font-mono uppercase tracking-widest text-muted-foreground" style={{ fontSize: '1cqw' }}>The Mark</span>
                </div>

                {/* Inverted Variant */}
                <div className="flex flex-col items-center bg-black text-white" style={{ padding: '3cqw', gap: '2cqw', borderRadius: '2cqw' }}>
                    <div className="relative" style={{ width: '12cqw', height: '12cqw' }}>
                        <Image
                            src={logo?.logoUrl || ''}
                            alt="Logo Inverted"
                            fill
                            className="object-contain"
                            style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%) brightness(0) invert(1)` }}
                        />
                    </div>
                    <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" style={{ fontFamily: `var(${font.variable})`, textTransform: logo?.displaySettings?.textTransform || 'none', fontSize: '2cqw' }}>
                        {brand.latestName}
                    </span>
                </div>
            </div>
        </div>
    );
};

const TypographySlide = ({ brand }: { brand: Brand }) => {
    const font = BRAND_FONTS.find(f => f.name === brand?.font) || BRAND_FONTS[0];

    return (
        <div className="h-full flex flex-col justify-center" style={{ padding: '6cqw', gap: '4cqw' }}>
            <h2 className="font-mono uppercase tracking-[0.3em] text-center text-muted-foreground" style={{ fontSize: '1.2cqw' }}>Typography</h2>

            <div className="w-full grid grid-cols-2 items-center" style={{ gap: '6cqw' }}>
                <div style={{ gap: '3cqw', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ gap: '1cqw', display: 'flex', flexDirection: 'column' }}>
                        <h3 className="font-mono uppercase tracking-widest text-primary/60" style={{ fontSize: '1cqw' }}>Selected Typeface</h3>
                        <p className="font-black tracking-tighter" style={{ fontFamily: `var(${font.variable})`, fontSize: '6cqw' }}>
                            {font.name}
                        </p>
                    </div>

                    <div style={{ gap: '1.5cqw', display: 'flex', flexDirection: 'column' }}>
                        <p className="text-muted-foreground leading-relaxed" style={{ fontSize: '1.6cqw' }}>
                            {font.name} was selected for its {font.name.includes('Mono') ? 'precise, technical' : 'clean, modern'} aesthetic, balancing readability with distinct personality.
                        </p>

                        <div className="flex flex-wrap" style={{ gap: '1cqw' }}>
                            {['Regular', 'Medium', 'Bold', 'Black'].map(weight => (
                                <div key={weight} className="rounded-full border border-gray-100 font-medium" style={{ padding: '0.5cqw 1.5cqw', fontSize: '1.1cqw' }}>
                                    {weight}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[3cqw] flex flex-col items-center justify-center aspect-square" style={{ padding: '4cqw', gap: '2cqw' }}>
                    <div className="font-black leading-none" style={{ fontFamily: `var(${font.variable})`, fontSize: '10cqw' }}>
                        Aa
                    </div>
                    <div className="w-full h-px bg-gray-200" />
                    <div className="grid grid-cols-6 font-bold opacity-20" style={{ fontFamily: `var(${font.variable})`, gap: '1cqw', fontSize: '2cqw' }}>
                        {['A', 'B', 'C', 'D', 'E', 'F'].map(l => <span key={l}>{l}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DesignRationaleSlide = ({ logo, justification }: { logo?: Logo; justification?: Justification }) => {
    return (
        <div className="h-full flex flex-col justify-center" style={{ padding: '6cqw', gap: '4cqw' }}>
            <h2 className="font-mono uppercase tracking-[0.3em] text-center text-muted-foreground" style={{ fontSize: '1.2cqw' }}>Design Rationale</h2>

            <div className="grid grid-cols-[1fr_40cqw] items-center w-full" style={{ gap: '6cqw' }}>
                {/* Logo with Annotations */}
                <div className="relative aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center" style={{ padding: '4cqw', borderRadius: '3cqw' }}>
                    <div className="relative w-full h-full">
                        <Image
                            src={logo?.logoUrl || ''}
                            alt="Logo Rationale"
                            fill
                            className="object-contain"
                            style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%)${logo?.displaySettings?.invertLogo ? ' invert(1)' : ''}` }}
                        />

                        {/* Annotation Points */}
                        {justification?.points.map((point, i) => (
                            <motion.div
                                key={point.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.8 + (i * 0.2), type: 'spring' }}
                                className="absolute flex items-center justify-center"
                                style={{
                                    left: `${point.x}%`,
                                    top: `${point.y}%`,
                                    width: '2.5cqw',
                                    height: '2.5cqw',
                                    marginLeft: '-1.25cqw',
                                    marginTop: '-1.25cqw'
                                }}
                            >
                                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20" />
                                <div className="w-full h-full bg-primary rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold" style={{ fontSize: '1cqw' }}>
                                    {i + 1}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Justification Text */}
                <div style={{ gap: '4cqw', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ gap: '1cqw', display: 'flex', flexDirection: 'column' }}>
                        <h3 className="font-mono uppercase tracking-widest text-primary/60" style={{ fontSize: '1cqw' }}>Strategic Fit</h3>
                        <p className="font-bold leading-tight" style={{ fontSize: '2.5cqw' }}>
                            {justification?.overallSummary || "Strategic alignment through visual metaphors."}
                        </p>
                    </div>

                    <div style={{ gap: '3cqw', display: 'flex', flexDirection: 'column' }}>
                        {justification?.points.map((point, i) => (
                            <motion.div
                                key={point.id}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1 + (i * 0.3) }}
                                className="flex"
                                style={{ gap: '2cqw' }}
                            >
                                <span className="font-black text-primary/10 italic leading-none" style={{ fontSize: '4cqw' }}>{i + 1}</span>
                                <p className="font-medium text-muted-foreground border-l-2 border-primary/10" style={{ fontSize: '1.4cqw', paddingLeft: '2cqw', paddingTop: '0.2cqw', paddingBottom: '0.2cqw' }}>
                                    {point.comment}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ColorWorldSlide = ({ palette, colorNames }: { palette: string[]; colorNames: string[] }) => (
    <div className="h-full w-full flex overflow-hidden">
        {palette.map((color, i) => {
            const isDark = !isLightColor(color);
            return (
                <div
                    key={i}
                    className="flex-1 flex flex-col justify-between"
                    style={{ backgroundColor: color, padding: '4cqw' }}
                >
                    <div className="flex flex-col" style={{ gap: '0.5cqw' }}>
                        <h3
                            className="font-black tracking-tight"
                            style={{
                                fontSize: '3cqw',
                                color: isDark ? 'white' : 'black',
                                lineHeight: '1.1'
                            }}
                        >
                            {colorNames[i] || `Brand Color ${i + 1}`}
                        </h3>
                        <p
                            className="font-mono uppercase opacity-50"
                            style={{
                                fontSize: '1cqw',
                                color: isDark ? 'white' : 'black'
                            }}
                        >
                            {color}
                        </p>
                    </div>
                </div>
            );
        })}
    </div>
);

const DesignSystemSnapshotSlide = ({ logo, palette }: { logo?: Logo; palette: string[] }) => (
    <div className="h-full grid grid-cols-3 gap-px bg-gray-50" style={{ padding: '4cqw' }}>
        {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-square bg-white relative overflow-hidden flex items-center justify-center group" style={{ padding: '2cqw' }}>
                {i % 3 === 0 ? (
                    <div className="w-full h-full" style={{ backgroundColor: palette[i % palette.length], opacity: 0.05 }} />
                ) : i % 3 === 1 ? (
                    <div className="relative w-1/2 h-1/2 opacity-20 transition-transform group-hover:scale-110">
                        <Image
                            src={logo?.logoUrl || ''}
                            alt="System Mark"
                            fill
                            className="object-contain"
                            style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%) brightness(0)` }}
                        />
                    </div>
                ) : (
                    <div className="rounded-full" style={{ backgroundColor: palette[i % palette.length], width: '0.8cqw', height: '0.8cqw' }} />
                )}
            </div>
        ))}
    </div>
);

const BrandInActionSlide = ({ logo, brand }: { logo?: Logo; brand: Brand }) => {
    const font = BRAND_FONTS.find(f => f.name === brand?.font) || BRAND_FONTS[0];
    const primaryColor = logo?.palette?.[0] || '#000000';

    return (
        <div className="h-full grid grid-cols-2" style={{ padding: '3cqw', gap: '2cqw' }}>
            {/* Website Hero Mockup */}
            <div className="col-span-2 aspect-[32/12] bg-gray-50 overflow-hidden border relative" style={{ borderRadius: '2cqw' }}>
                <div className="absolute flex items-center" style={{ top: '2cqw', left: '2cqw', gap: '1cqw' }}>
                    <div className="relative" style={{ width: '2cqw', height: '2cqw' }}>
                        <Image
                            src={logo?.logoUrl || ''}
                            alt="Nav Logo"
                            fill
                            className="object-contain"
                            style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%)${logo?.displaySettings?.invertLogo ? '' : ' invert(1)'}` }}
                        />
                    </div>
                    <span className="font-bold uppercase tracking-widest" style={{ fontSize: '0.8cqw' }}>{brand.latestName}</span>
                </div>
                <div className="h-full flex flex-col justify-center" style={{ paddingLeft: '4cqw', maxWidth: '60%', gap: '1.5cqw' }}>
                    <h3 className="font-black leading-tight" style={{ fontFamily: `var(${font.variable})`, fontSize: '3.5cqw' }}>The future is yours to build.</h3>
                    <div className="rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor, height: '3cqw', width: '12cqw', fontSize: '1cqw' }}>Get Started</div>
                </div>
            </div>

            {/* Social Tile */}
            <div className="aspect-square bg-black flex flex-col justify-between" style={{ borderRadius: '2cqw', padding: '3cqw' }}>
                <div className="relative" style={{ width: '5cqw', height: '5cqw' }}>
                    <Image
                        src={logo?.logoUrl || ''}
                        alt="Social Logo"
                        fill
                        className="object-contain"
                        style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%)${logo?.displaySettings?.invertLogo ? ' invert(0)' : ' invert(1)'}` }}
                    />
                </div>
                <p className="font-bold text-white leading-tight" style={{ fontSize: '3cqw' }}>Authenticity in every pixel.</p>
            </div>

            {/* Product UI */}
            <div className="aspect-square bg-white border flex flex-col" style={{ borderRadius: '2cqw', padding: '3cqw', gap: '2cqw' }}>
                <div className="flex items-center" style={{ gap: '1cqw' }}>
                    <div className="rounded-full bg-gray-100" style={{ width: '3cqw', height: '3cqw' }} />
                    <div className="flex-1" style={{ gap: '0.5cqw', display: 'flex', flexDirection: 'column' }}>
                        <div className="h-[0.5cqw] w-1/2 bg-gray-100 rounded" />
                        <div className="h-[0.5cqw] w-1/3 bg-gray-50 rounded" />
                    </div>
                </div>
                <div className="flex-1 border border-dashed border-gray-200 flex items-center justify-center" style={{ borderRadius: '1.5cqw' }}>
                    <div style={{ width: '6cqw', height: '6cqw', position: 'relative', opacity: 0.1 }}>
                        <Image src={logo?.logoUrl || ''} alt="Product UI" fill className="object-contain" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const BrandTakeawaySlide = ({ aiData, brand, logo }: { aiData?: any; brand: Brand; logo?: Logo }) => {
    const font = BRAND_FONTS.find(f => f.name === brand?.font) || BRAND_FONTS[0];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: '6cqw', gap: '4cqw' }}>
            <div className="relative opacity-20" style={{ width: '10cqw', height: '10cqw' }}>
                <Image
                    src={logo?.logoUrl || ''}
                    alt="Final Mark"
                    fill
                    className="object-contain"
                    style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%)${logo?.displaySettings?.invertLogo ? '' : ' invert(1)'}` }}
                />
            </div>
            <h2 className="font-black tracking-tighter" style={{ fontFamily: `var(${font.variable})`, fontSize: '6cqw', lineHeight: '1.1', maxWidth: '80%' }}>
                {aiData?.closingStatement || "Building a legacy of excellence."}
            </h2>
            <div className="bg-primary" style={{ width: '6cqw', height: '0.4cqw' }} />
        </div>
    );
};

// --- Main Presentation Component ---

export function PresentationClient() {
    const { brandId } = useParams() as { brandId: string };
    const router = useRouter();
    const { isOpen, toggleOpen } = useSidebar();
    const firestore = useFirestore();
    const brandService = useMemo(() => createBrandService(firestore), [firestore]);
    const logoService = useMemo(() => createLogoService(firestore), [firestore]);
    const { user } = useUser();

    const brandRef = useMemoFirebase(
        () => user ? brandService.getBrandDoc(user.uid, brandId) : null,
        [user, brandService, brandId]
    );

    const { data: brand, isLoading: isBrandLoading } = useDoc<Brand>(brandRef);

    const logosQuery = useMemoFirebase(
        () => user ? logoService.getLogosQuery(user.uid, brandId) : null,
        [user, logoService, brandId]
    );
    const { data: logos, isLoading: isLogosLoading } = useCollection<Logo>(logosQuery);

    const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
    const [activeSlideId, setActiveSlideId] = useState<string>('icon');
    const [isSizingMode, setIsSizingMode] = useState(false);
    const [tempSizing, setTempSizing] = useState({ balance: 50, gap: 50 });
    const [chatMessage, setChatMessage] = useState<string | null>(null);
    const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
    const [selectedColorVersionIndex, setSelectedColorVersionIndex] = useState(0);
    const [hueShift, setHueShift] = useState(0);
    const [isEditingColors, setIsEditingColors] = useState(false);
    const hueShiftSaveTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateTime = useRef(0);
    const [aiData, setAiData] = useState<any>(null);
    const [justification, setJustification] = useState<Justification | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const primaryLogo = useMemo(() => {
        if (!logos?.length) return undefined;
        if (selectedLogoId) {
            return logos.find(l => l.id === selectedLogoId) || logos[0];
        }
        return logos[0];
    }, [logos, selectedLogoId]);

    const palette = primaryLogo?.colorVersions?.[selectedColorVersionIndex]?.palette || primaryLogo?.palette || ['#000000', '#ffffff', '#cccccc'];
    const shiftedPalette = palette.map(color => shiftHue(color, hueShift));
    const colorNames = primaryLogo?.colorVersions?.[selectedColorVersionIndex]?.colorNames || primaryLogo?.colorNames || palette.map((_, i) => `Brand Color ${i + 1}`);

    // Debounced hue shift save to Firebase
    const saveHueShiftToFirebase = useCallback(async (shift: number) => {
        if (!user || !primaryLogo || !brandId) return;

        try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${primaryLogo.id}`);

            // Save hue shift to a new field in the logo
            await updateDoc(logoRef, {
                hueShift: shift
            });
        } catch (error) {
            console.error('Error saving hue shift:', error);
        }
    }, [user, primaryLogo, brandId, firestore]);

    // Handle hue shift change with debouncing
    const handleHueShiftChange = useCallback((value: number) => {
        setHueShift(value);

        // Clear existing timeout
        if (hueShiftSaveTimeout.current) {
            clearTimeout(hueShiftSaveTimeout.current);
        }

        // Set new timeout to save after 500ms
        hueShiftSaveTimeout.current = setTimeout(() => {
            saveHueShiftToFirebase(value);
        }, 500);
    }, [saveHueShiftToFirebase]);

    // Throttled sizing update to prevent lag
    const handleSizingMove = useCallback((x: number, y: number) => {
        const now = Date.now();
        if (now - lastUpdateTime.current > 16) { // ~60fps throttle
            lastUpdateTime.current = now;
            setTempSizing({
                balance: Math.round(x * 100), // 0-100 range
                gap: Math.round(-100 + y * 300) // -100 to 200 range
            });
        }
    }, []);

    useEffect(() => {
        if (logos?.length && !selectedLogoId) {
            setSelectedLogoId(logos[0].id);
        }
    }, [logos, selectedLogoId]);

    useEffect(() => {
        const fetchAiData = async () => {
            if (!brand || !primaryLogo || !user) return;

            // Check if we already have cached data
            if (primaryLogo.presentationData && primaryLogo.justification) {
                setAiData(primaryLogo.presentationData);
                setJustification(primaryLogo.justification);
                return;
            }

            setIsAiLoading(true);
            try {
                const [presentationResult, justificationResult] = await Promise.all([
                    !primaryLogo.presentationData ? getPresentationData({
                        name: brand.latestName,
                        elevatorPitch: brand.latestElevatorPitch,
                        concept: primaryLogo.concept || brand.latestConcept || '',
                        prompt: primaryLogo.prompt,
                        critiqueSummary: primaryLogo.critique?.overallSummary,
                        critiquePoints: primaryLogo.critique?.points.map(p => p.comment)
                    }) : Promise.resolve({ success: true, data: primaryLogo.presentationData }),
                    !primaryLogo.justification ? getLogoJustification({
                        logoUrl: primaryLogo.logoUrl,
                        brandName: brand.latestName,
                        elevatorPitch: brand.latestElevatorPitch,
                        audience: brand.latestAudience,
                        desirableCues: brand.latestDesirableCues,
                        undesirableCues: brand.latestUndesirableCues
                    }) : Promise.resolve({ success: true, data: primaryLogo.justification })
                ]);

                let updatedAiData = primaryLogo.presentationData;
                let updatedJustification = primaryLogo.justification;

                if (presentationResult.success && presentationResult.data) {
                    updatedAiData = presentationResult.data;
                    setAiData(updatedAiData);
                }

                if (justificationResult.success && justificationResult.data) {
                    updatedJustification = justificationResult.data;
                    setJustification(updatedJustification);
                }

                // Cache the results back to Firestore
                if (user && (presentationResult.success || justificationResult.success)) {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${primaryLogo.id}`);
                    await updateDoc(logoRef, {
                        presentationData: updatedAiData,
                        justification: updatedJustification
                    });
                }
            } catch (error) {
                console.error("Error fetching/caching AI data:", error);
            } finally {
                setIsAiLoading(false);
            }
        };

        fetchAiData();
    }, [brand, primaryLogo, user, firestore, brandId]);

    // Auto-colorize if missing
    useEffect(() => {
        const autoColorize = async () => {
            if (!brand || !primaryLogo || !user || isAiLoading) return;

            const hasColor = primaryLogo.colorLogoUrl || (primaryLogo.colorVersions && primaryLogo.colorVersions.length > 0);
            if (hasColor) return;

            console.log("Auto-colorizing logo...");
            try {
                const { getColorizedLogo } = await import('@/app/actions');
                const result = await getColorizedLogo({
                    logoUrl: primaryLogo.logoUrl,
                    name: brand.latestName,
                    elevatorPitch: brand.latestElevatorPitch,
                    audience: brand.latestAudience,
                    desirableCues: brand.latestDesirableCues,
                    undesirableCues: brand.latestUndesirableCues
                });

                if (result.success && result.data) {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${primaryLogo.id}`);

                    await updateDoc(logoRef, {
                        colorLogoUrl: result.data.colorLogoUrl,
                        palette: result.data.palette,
                        colorNames: result.data.colorNames,
                        colorVersions: [{
                            colorLogoUrl: result.data.colorLogoUrl,
                            palette: result.data.palette,
                            colorNames: result.data.colorNames
                        }]
                    });
                }
            } catch (error) {
                console.error("Error auto-colorizing logo:", error);
            }
        };

        autoColorize();
    }, [brand, primaryLogo, user, firestore, brandId, isAiLoading]);

    const slides = useMemo(() => {
        if (!brand) return [];
        return [
            { id: 'icon', name: 'Icon', actions: ['Generate New Logo', 'Reject this logo'], component: <IconOnlySlide brand={brand} logo={primaryLogo} /> },
            { id: 'cover', name: 'Logo', actions: ['Sizing', 'Font'], component: <BrandIdentitySlide brand={brand} logo={primaryLogo} aiData={aiData} /> },
            { id: 'identity-color-white', name: 'Color Logo', actions: ['Generate More', 'Edit Colors'], component: <BrandIdentitySlide brand={brand} logo={primaryLogo} aiData={aiData} palette={shiftedPalette} isColor={true} forceWhiteBg={true} hueShift={hueShift} /> },
            { id: 'colors', name: 'Color Palette', actions: ['Shuffle Names', 'Update Palette'], component: <ColorWorldSlide palette={shiftedPalette} colorNames={colorNames} /> },
            { id: 'identity-grid', name: 'Logotype Grid', actions: ['Download All', 'Share'], component: <LogoGridSlide brand={brand} logo={primaryLogo} palette={shiftedPalette} /> },
            { id: 'idea', name: 'Brand Idea', actions: ['Rewrite', 'Shorten'], component: <BrandIdeaSlide aiData={aiData} palette={palette} /> },
            { id: 'intent', name: 'Visual Intent', actions: ['Refresh Phrases'], component: <VisualIntentSlide aiData={aiData} palette={palette} /> },
            { id: 'system', name: 'Logo System', actions: ['Save Assets'], component: <LogoSystemSlide brand={brand} logo={primaryLogo} /> },
            { id: 'typography', name: 'Typography', actions: ['Change Font'], component: <TypographySlide brand={brand} /> },
            { id: 'rationale', name: 'Design Rationale', actions: ['Refine Narrative'], component: <DesignRationaleSlide logo={primaryLogo} justification={justification || undefined} /> },
            { id: 'snapshot', name: 'Design System', actions: ['Refresh'], component: <DesignSystemSnapshotSlide logo={primaryLogo} palette={palette} /> },
            { id: 'action', name: 'In Action', actions: ['New Mockup'], component: <BrandInActionSlide logo={primaryLogo} brand={brand} /> },
            { id: 'takeaway', name: 'Takeaway', actions: ['Update Closing'], component: <BrandTakeawaySlide aiData={aiData} brand={brand} logo={primaryLogo} /> },
        ] as const;
    }, [brand, primaryLogo, aiData, palette, colorNames, justification, shiftedPalette]);

    // Handle ESC key for sizing mode and color editing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isSizingMode) {
                    setIsSizingMode(false);
                    setChatMessage(null);
                } else if (isEditingColors) {
                    setIsEditingColors(false);
                    setHueShift(0); // Reset hue shift
                    setChatMessage(null);
                } else {
                    router.back();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router, isSizingMode, isEditingColors]);

    // Intersection Observer for Slide Tracking
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

                if (visible) {
                    const slideId = visible.target.getAttribute('data-slide-id');
                    if (slideId) setActiveSlideId(slideId);
                }
            },
            {
                threshold: [0, 0.1, 0.5],
                rootMargin: '-15% 0px -70% 0px', // Focus on the top area
            }
        );

        const slideElements = document.querySelectorAll('[data-slide-id]');
        slideElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [slides]);

    return (
        <div className="fixed inset-0 bg-white z-[100] overflow-y-auto overflow-x-hidden">
            {/* Header / Controls */}
            <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-[110] bg-white/80 backdrop-blur-md border-b">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="hover:opacity-80 transition-opacity"
                        aria-label="Go back"
                    >
                        <Image
                            src="/colater-logo.svg"
                            alt="Colater"
                            width={100}
                            height={32}
                            className="h-8 w-auto"
                            priority
                        />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                            {brand?.latestName || 'Loading...'} Identity
                        </span>
                        <span className="text-[8px] font-mono text-muted-foreground/60 uppercase">
                            Presentation Mode
                        </span>
                    </div>

                </div>
                <div className="flex items-center gap-1">
                    {isAiLoading && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            <span className="text-[10px] font-mono text-primary animate-pulse">Refining Narrative...</span>
                        </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Vertical Stack of Slides */}
            <div className="pt-4 md:pt-8 pb-16 flex flex-col items-center gap-4 md:gap-8 px-4 md:px-8 bg-gray-50/50 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full flex flex-col items-center gap-4 md:gap-8"
                >
                    {slides.map((slide) => (
                        <div
                            key={slide.id}
                            data-slide-id={slide.id}
                            className={cn(
                                "w-full max-w-[160vh] aspect-video bg-white shadow-xl relative overflow-hidden transition-all duration-500",
                                activeSlideId === slide.id ? "ring-4 ring-black shadow-2xl" : "ring-1 ring-black/5",
                                isSizingMode && slide.id === 'cover' ? "cursor-nwse-resize" : ""
                            )}
                            style={{ containerType: 'size' }}
                            onMouseMove={(e) => {
                                if (isSizingMode && slide.id === 'cover') {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = (e.clientX - rect.left) / rect.width;
                                    const y = (e.clientY - rect.top) / rect.height;
                                    handleSizingMove(x, y);
                                }
                            }}
                            onClick={async () => {
                                if (isSizingMode && slide.id === 'cover' && user && primaryLogo) {
                                    // Exit sizing mode immediately to stop mouse tracking
                                    setIsSizingMode(false);
                                    setChatMessage(null);

                                    const { doc, updateDoc } = await import('firebase/firestore');
                                    const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${primaryLogo.id}`);

                                    // Only update changed properties
                                    const updates: Record<string, number> = {};
                                    const originalBalance = primaryLogo.displaySettings?.verticalLogoTextBalance ?? 50;
                                    const originalGap = primaryLogo.displaySettings?.verticalLogoTextGap ?? 50;

                                    if (tempSizing.balance !== originalBalance) {
                                        updates['displaySettings.verticalLogoTextBalance'] = tempSizing.balance;
                                    }
                                    if (tempSizing.gap !== originalGap) {
                                        updates['displaySettings.verticalLogoTextGap'] = tempSizing.gap;
                                    }

                                    if (Object.keys(updates).length > 0) {
                                        await updateDoc(logoRef, updates);
                                    }
                                }
                            }}
                        >
                            {/* Apply sizing overrides at render time, not memo time */}
                            {slide.id === 'cover' && isSizingMode
                                ? <BrandIdentitySlide
                                    brand={brand!}
                                    logo={primaryLogo}
                                    aiData={aiData}
                                    overrideBalance={tempSizing.balance}
                                    overrideGap={tempSizing.gap}
                                />
                                : slide.component
                            }


                            {/* Slide Label */}
                            <div className="absolute bottom-[4cqw] left-[4cqw] z-[20] flex items-center gap-[1.5cqw] pointer-events-none">
                                <div className="h-[0.1cqw] w-[2cqw] bg-current opacity-20" />
                                <span
                                    className="font-mono uppercase tracking-[0.3em] opacity-40 text-[1cqw]"
                                    style={{
                                        color: slide.id === 'colors'
                                            ? (isLightColor(palette[0]) ? 'black' : 'white')
                                            : 'black'
                                    }}
                                >
                                    {slide.name}
                                </span>
                            </div>

                            {/* Sizing Mode Overlay */}
                            {slide.id === 'cover' && isSizingMode && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none z-10"
                                />
                            )}

                            {/* Color Editing Overlay */}
                            {slide.id === 'identity-color-white' && isEditingColors && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none z-10"
                                />
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>
            {/* Floating Input */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[400px] px-4 z-[120] flex flex-col items-center gap-4">
                {/* Chat Message */}
                {chatMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="w-full bg-black text-white px-4 py-3 rounded-2xl shadow-2xl text-sm relative"
                    >
                        <button
                            onClick={() => setChatMessage(null)}
                            className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                        <p className="pr-6">{chatMessage}</p>
                    </motion.div>
                )}

                {/* Contextual Actions */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar">
                    {/* Show inline hue shift slider when editing colors */}
                    {isEditingColors && activeSlideId === 'identity-color-white' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-lg"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 whitespace-nowrap">Hue Shift</span>
                            <Slider
                                value={[hueShift]}
                                onValueChange={(value) => handleHueShiftChange(value[0])}
                                min={-180}
                                max={180}
                                step={1}
                                className="w-[200px]"
                            />
                            <span className="text-xs font-mono font-bold text-black min-w-[40px] text-right">{hueShift}°</span>
                            <button
                                onClick={() => {
                                    setIsEditingColors(false);
                                    setChatMessage(null);
                                }}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </motion.div>
                    ) : (
                        slides.find(s => s.id === activeSlideId)?.actions.map((action: string) => {
                            // Determine icon for each action
                            let icon = null;
                            if (action === 'Sizing') icon = <Maximize2 className="h-3 w-3" />;
                            if (action === 'Font') icon = <Type className="h-3 w-3" />;
                            if (action === 'Generate New Logo') icon = <Sparkles className="h-3 w-3" />;
                            if (action === 'Reject this logo') icon = <Trash2 className="h-3 w-3" />;
                            if (action === 'Edit Colors') icon = <Palette className="h-3 w-3" />;

                            return (
                                <motion.button
                                    key={`${activeSlideId}-${action}`}
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    onClick={async () => {
                                        if (action === 'Sizing' && activeSlideId === 'cover') {
                                            setIsSizingMode(true);
                                            setTempSizing({
                                                balance: primaryLogo?.displaySettings?.verticalLogoTextBalance ?? 50,
                                                gap: primaryLogo?.displaySettings?.verticalLogoTextGap ?? 50
                                            });
                                            setChatMessage('Move your mouse: X controls size balance, Y controls spacing. Click to save, ESC to cancel.');
                                        } else if (action === 'Font' && activeSlideId === 'cover' && user && primaryLogo) {
                                            // Get current font index
                                            const currentFont = primaryLogo.font || brand?.font || BRAND_FONTS[0].name;
                                            const currentIndex = BRAND_FONTS.findIndex(f => f.name === currentFont);

                                            // Pick a random different font
                                            let newIndex;
                                            do {
                                                newIndex = Math.floor(Math.random() * BRAND_FONTS.length);
                                            } while (newIndex === currentIndex && BRAND_FONTS.length > 1);

                                            const newFont = BRAND_FONTS[newIndex].name;

                                            // Save to Firebase
                                            const { doc, updateDoc } = await import('firebase/firestore');
                                            const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${primaryLogo.id}`);
                                            await updateDoc(logoRef, {
                                                font: newFont
                                            });
                                        } else if (action === 'Generate New Logo' && activeSlideId === 'icon' && user && brand) {
                                            setIsGeneratingLogo(true);
                                            setChatMessage('Generating a new logo variation...');
                                            try {
                                                const result = await getLogoSuggestionFal(
                                                    brand.latestName || '',
                                                    brand.latestElevatorPitch || '',
                                                    brand.latestAudience || '',
                                                    brand.latestDesirableCues || '',
                                                    brand.latestUndesirableCues || '',
                                                    primaryLogo?.concept || brand.latestConcept
                                                );
                                                if (result.success) {
                                                    setChatMessage('New logo generated! Check your logo list.');
                                                    setTimeout(() => setChatMessage(null), 3000);
                                                } else {
                                                    setChatMessage('Failed to generate logo. Please try again.');
                                                    setTimeout(() => setChatMessage(null), 3000);
                                                }
                                            } catch (error) {
                                                console.error('Logo generation error:', error);
                                                setChatMessage('Error generating logo.');
                                                setTimeout(() => setChatMessage(null), 3000);
                                            } finally {
                                                setIsGeneratingLogo(false);
                                            }
                                        } else if (action === 'Reject this logo' && activeSlideId === 'icon' && user && primaryLogo) {
                                            try {
                                                setChatMessage('Rejecting logo...');
                                                const { doc, updateDoc } = await import('firebase/firestore');
                                                const logoRef = doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${primaryLogo.id}`);
                                                await updateDoc(logoRef, {
                                                    isDeleted: true
                                                });

                                                // Find remaining logos (excluding the one we just deleted)
                                                const remainingLogos = logos?.filter(l => l.id !== primaryLogo.id && !l.isDeleted) || [];

                                                if (remainingLogos.length === 0) {
                                                    // No logos left, go back to dashboard
                                                    setChatMessage('Logo rejected. Returning to dashboard...');
                                                    setTimeout(() => {
                                                        router.push(`/brands/${brandId}`);
                                                    }, 1000);
                                                } else {
                                                    // Switch to the next available logo
                                                    setSelectedLogoId(remainingLogos[0].id);
                                                    setChatMessage('Logo rejected. Switched to next logo.');
                                                    setTimeout(() => setChatMessage(null), 2000);
                                                }
                                            } catch (error) {
                                                console.error('Error deleting logo:', error);
                                                setChatMessage('Error rejecting logo.');
                                                setTimeout(() => setChatMessage(null), 3000);
                                            }
                                        } else if (action === 'Edit Colors' && activeSlideId === 'identity-color-white') {
                                            setIsEditingColors(true);
                                            setChatMessage('Adjust hue to shift colors. Click X to close.');
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-black shadow-lg hover:bg-black hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
                                >
                                    {icon}
                                    {action}
                                </motion.button>
                            )
                        })
                    )}
                </div>

                {/* Logo Selector */}
                {logos && logos.filter(l => !l.isDeleted).length > 1 && (activeSlideId === 'icon' || activeSlideId === 'cover') && (
                    <div className="flex items-center gap-2 pb-2">
                        <AnimatePresence mode="popLayout">
                            {logos.filter(l => !l.isDeleted).map((logo, idx) => (
                                <motion.button
                                    key={logo.id}
                                    layout
                                    initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.8,
                                        filter: 'blur(8px)',
                                        transition: { duration: 0.4 }
                                    }}
                                    onClick={() => setSelectedLogoId(logo.id)}
                                    className={`relative h-10 w-10 rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 ${selectedLogoId === logo.id
                                        ? 'ring-4 ring-black shadow-lg'
                                        : 'ring-1 ring-gray-200 opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    <Image
                                        src={logo.logoUrl}
                                        alt={`Logo ${idx + 1}`}
                                        fill
                                        className="object-contain p-1.5"
                                    />
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Color Version Picker */}
                {primaryLogo?.colorVersions && primaryLogo.colorVersions.length > 1 && activeSlideId === 'identity-color-white' && (
                    <div className="flex items-center gap-2 pb-2">
                        {primaryLogo.colorVersions.map((version, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedColorVersionIndex(idx)}
                                className={`relative h-10 w-10 rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 ${selectedColorVersionIndex === idx
                                    ? 'ring-4 ring-black shadow-lg'
                                    : 'ring-1 ring-gray-200 opacity-50 hover:opacity-100'
                                    }`}
                                style={{ backgroundColor: version.palette[0] || '#ffffff' }}
                            >
                                <Image
                                    src={version.colorLogoUrl}
                                    alt={`Color version ${idx + 1}`}
                                    fill
                                    className="object-contain p-1.5"
                                />
                            </button>
                        ))}
                    </div>
                )
                }

                <div className="flex flex-col items-center w-full">
                    {activeSlideId && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={activeSlideId}
                            className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-[-8px] z-[121] shadow-sm whitespace-nowrap"
                        >
                            {slides.find(s => s.id === activeSlideId)?.name}
                        </motion.div>
                    )}
                    <div className="relative group w-full">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-4 py-3">
                            <input
                                type="text"
                                placeholder="Give feedback on what you're seeing..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground/50"
                            />
                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-primary">
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};
