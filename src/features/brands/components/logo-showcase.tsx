import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { BRAND_FONTS } from '@/config/brand-fonts';
import { shiftHue, darkenColor, isLightColor } from '@/lib/color-utils';
import type { Logo } from '@/lib/types';
import { LogoControls } from './logo-controls';
import { CritiquePoint } from './critique-point';

interface LogoShowcaseProps {
    currentLogo: Logo;
    brandName: string;
    selectedBrandFont: string;
    showCritique: boolean;
    expandedPointId: string | null;
    setExpandedPointId: (id: string | null) => void;
    hueShifts: Record<number, number>;
    setHueShifts: React.Dispatch<React.SetStateAction<Record<number, number>>>;
    cardModes: Record<string, number>;
    cycleCardMode: (key: string, defaultInvert: boolean) => void;
    getCardMode: (key: string, defaultInvert: boolean) => number;
    getModeStyles: (mode: number) => React.CSSProperties;
    onColorizeLogo: () => void;
    isColorizing: boolean;
    isGeneratingLogo: boolean;
    // Control Props
    logoLayout: 'horizontal' | 'vertical';
    setLogoLayout: (layout: 'horizontal' | 'vertical') => void;
    textTransform: 'none' | 'lowercase' | 'capitalize' | 'uppercase';
    setTextTransform: (transform: 'none' | 'lowercase' | 'capitalize' | 'uppercase') => void;
    animationType: 'fade' | 'slide' | 'scale' | 'blur' | null;
    triggerAnimation: (type: 'fade' | 'slide' | 'scale' | 'blur') => void;
    animationKey: number;
    showBrandName: boolean;
    setShowBrandName: (show: boolean) => void;
    invertLogo: boolean;
    setInvertLogo: (invert: boolean) => void;
    logoTextGap: number;
    setLogoTextGap: (gap: number) => void;
    logoTextBalance: number;
    setLogoTextBalance: (balance: number) => void;
    logoBrightness: number;
    setLogoBrightness: (brightness: number) => void;
    logoContrast: number;
    setLogoContrast: (contrast: number) => void;
    readOnly?: boolean;
}

export function LogoShowcase({
    currentLogo,
    brandName,
    selectedBrandFont,
    showCritique,
    expandedPointId,
    setExpandedPointId,
    hueShifts,
    setHueShifts,
    cardModes,
    cycleCardMode,
    getCardMode,
    getModeStyles,
    onColorizeLogo,
    isColorizing,
    isGeneratingLogo,
    logoLayout,
    setLogoLayout,
    textTransform,
    setTextTransform,
    animationType,
    triggerAnimation,
    animationKey,
    showBrandName,
    setShowBrandName,
    invertLogo,
    setInvertLogo,
    logoTextGap,
    setLogoTextGap,
    logoTextBalance,
    setLogoTextBalance,
    logoBrightness,
    setLogoBrightness,
    logoContrast,
    setLogoContrast,
    readOnly = false,
}: LogoShowcaseProps) {
    const animationVariants = {
        fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
        slide: { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } },
        scale: { hidden: { scale: 0.5, opacity: 0 }, visible: { scale: 1, opacity: 1 } },
        blur: { hidden: { filter: 'blur(10px)', opacity: 0 }, visible: { filter: 'blur(0px)', opacity: 1 } },
    };

    return (
        <div className="w-full max-w-4xl mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {/* Original on White - Spans full width */}
                <div className={`col-span-1 md:col-span-2 lg:col-span-3 relative bg-white flex ${logoLayout === 'horizontal' ? 'flex-row' : 'flex-col'} items-center justify-center py-12 group h-[480px]`}>
                    {!readOnly && (
                        <LogoControls
                            logoLayout={logoLayout}
                            setLogoLayout={setLogoLayout}
                            textTransform={textTransform}
                            setTextTransform={setTextTransform}
                            animationType={animationType}
                            triggerAnimation={triggerAnimation}
                            showBrandName={showBrandName}
                            setShowBrandName={setShowBrandName}
                            invertLogo={invertLogo}
                            setInvertLogo={setInvertLogo}
                            logoTextGap={logoTextGap}
                            setLogoTextGap={setLogoTextGap}
                            logoTextBalance={logoTextBalance}
                            setLogoTextBalance={setLogoTextBalance}
                            logoBrightness={logoBrightness}
                            setLogoBrightness={setLogoBrightness}
                            logoContrast={logoContrast}
                            setLogoContrast={setLogoContrast}
                        />
                    )}

                    <motion.div
                        key={`logo-${animationKey}`}
                        initial={animationType ? "hidden" : "visible"}
                        animate="visible"
                        variants={animationType ? animationVariants[animationType] : undefined}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative z-0"
                        style={{
                            width: `${128 * (1.5 - (logoTextBalance / 100))}px`,
                            height: `${128 * (1.5 - (logoTextBalance / 100))}px`,
                            marginRight: logoLayout === 'horizontal' ? `${logoTextGap}px` : 0,
                            marginBottom: logoLayout === 'vertical' ? `${logoTextGap}px` : 0
                        }}
                    >
                        <Image
                            src={currentLogo.logoUrl}
                            alt="Logo on white background"
                            fill
                            className="object-contain"
                            unoptimized={currentLogo.logoUrl.startsWith('data:')}
                            style={{
                                filter: `brightness(${logoBrightness}%) contrast(${logoContrast}%)${invertLogo ? ' invert(1)' : ''}`
                            }}
                        />
                    </motion.div>

                    {showBrandName && (
                        <motion.div
                            key={`text-${animationKey}`}
                            initial="hidden"
                            animate="visible"
                            className={`relative z-10 ${logoLayout === 'vertical' ? 'text-center' : 'text-left'}`}
                        >
                            <h3
                                className="font-bold text-gray-900 leading-none"
                                style={{
                                    fontFamily: `var(${BRAND_FONTS.find(f => f.name === selectedBrandFont)?.variable || 'sans-serif'})`,
                                    fontSize: `${36 * (0.5 + (logoTextBalance / 100))}px`,
                                    textTransform: textTransform === 'none' ? 'none' : textTransform
                                }}
                            >
                                {brandName.split('').map((char, index) => (
                                    <motion.span
                                        key={`${animationKey}-char-${index}`}
                                        variants={animationType ? {
                                            hidden: animationVariants[animationType].hidden,
                                            visible: animationVariants[animationType].visible
                                        } : undefined}
                                        transition={{
                                            duration: 0.3,
                                            ease: "easeOut",
                                            delay: animationType ? 0.5 + (index * 0.03) : 0
                                        }}
                                        style={{ display: 'inline-block' }}
                                    >
                                        {char === ' ' ? '\u00A0' : char}
                                    </motion.span>
                                ))}
                            </h3>
                        </motion.div>
                    )}

                    {/* Critique Points Overlay - Card 1 */}
                    {showCritique && currentLogo?.critique?.points && (
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            {currentLogo.critique.points.map((point, index) => (
                                <div key={index} className="pointer-events-auto">
                                    <CritiquePoint
                                        point={point}
                                        isExpanded={expandedPointId === `${currentLogo.id}-${index}`}
                                        onToggle={(e) => {
                                            e.stopPropagation();
                                            setExpandedPointId(
                                                expandedPointId === `${currentLogo.id}-${index}`
                                                    ? null
                                                    : `${currentLogo.id}-${index}`
                                            );
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">On White</p>
                </div>

                {/* On Gray (Darker, 50% opacity) - MOVED TO 2ND POSITION */}
                <div className="relative aspect-square bg-gray-600 flex items-center justify-center group">
                    <Image
                        src={currentLogo.logoUrl}
                        alt="Logo on gray background"
                        width={200}
                        height={200}
                        className="object-contain w-full h-full opacity-50"
                        unoptimized={currentLogo.logoUrl.startsWith('data:')}
                    />
                    {/* Critique Points Overlay - Card 2 */}
                    {showCritique && currentLogo?.critique?.points && (
                        <div className="absolute bottom-8 right-2 flex flex-col gap-2 items-end z-20">
                            {currentLogo.critique.points
                                .filter((_, idx) => idx % 3 === 1)
                                .map((point) => (
                                    <CritiquePoint
                                        key={point.id}
                                        point={point}
                                        isExpanded={expandedPointId === point.id}
                                        onToggle={(e) => {
                                            e.stopPropagation();
                                            setExpandedPointId(expandedPointId === point.id ? null : point.id);
                                        }}
                                        isStatic={true}
                                    />
                                ))}
                        </div>
                    )}
                    <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">On Gray</p>
                </div>

                {/* Inverted on Black */}
                <div className="relative aspect-square bg-black flex items-center justify-center group">
                    <Image
                        src={currentLogo.logoUrl}
                        alt="Inverted logo on black background"
                        width={200}
                        height={200}
                        className="object-contain w-full h-full"
                        unoptimized={currentLogo.logoUrl.startsWith('data:')}
                        style={{ filter: 'invert(1)' }}
                    />
                    {/* Critique Points Overlay - Card 3 */}
                    {showCritique && currentLogo?.critique?.points && (
                        <div className="absolute bottom-8 right-2 flex flex-col gap-2 items-end z-20">
                            {currentLogo.critique.points
                                .filter((_, idx) => idx % 3 === 2)
                                .map((point) => (
                                    <CritiquePoint
                                        key={point.id}
                                        point={point}
                                        isExpanded={expandedPointId === point.id}
                                        onToggle={(e) => {
                                            e.stopPropagation();
                                            setExpandedPointId(expandedPointId === point.id ? null : point.id);
                                        }}
                                        isStatic={true}
                                    />
                                ))}
                        </div>
                    )}
                    <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">Inverted on Black</p>
                </div>

                {/* On Brand Color (Darkened) - Show all palette colors from all color versions with hue shift */}
                {(() => {
                    // Support new colorVersions structure and legacy fields
                    const colorVersions = currentLogo.colorVersions || [];

                    // Migrate legacy fields if needed
                    if (colorVersions.length === 0 && currentLogo.colorLogoUrl) {
                        colorVersions.push({ colorLogoUrl: currentLogo.colorLogoUrl, palette: currentLogo.palette || [] });
                    }

                    // Flatten all colors from all versions with their hue shifts
                    const allBrandColors: Array<{ color: string; versionIndex: number; colorIndex: number; palette: string[] }> = [];
                    colorVersions.forEach((colorVersion, versionIndex) => {
                        const currentHueShift = hueShifts[versionIndex] || 0;
                        const shiftedPalette = colorVersion.palette.map(color => shiftHue(color, currentHueShift));

                        shiftedPalette.forEach((color, colorIndex) => {
                            allBrandColors.push({
                                color,
                                versionIndex,
                                colorIndex,
                                palette: shiftedPalette
                            });
                        });
                    });

                    if (allBrandColors.length > 0) {
                        return allBrandColors.map((brandColor, index) => {
                            const darkenedColor = darkenColor(brandColor.color, 0.2);
                            const shouldInvert = isLightColor(darkenedColor);
                            const cardKey = `brand-color-v${brandColor.versionIndex}-c${brandColor.colorIndex}`;
                            const mode = getCardMode(cardKey, shouldInvert);
                            const styles = getModeStyles(mode);

                            return (
                                <div
                                    key={cardKey}
                                    className="relative aspect-square flex items-center justify-center group"
                                    style={{ backgroundColor: darkenedColor }}
                                >
                                    {/* Small palette display at top */}
                                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                                        {brandColor.palette.map((paletteColor, paletteIndex) => (
                                            <div
                                                key={`palette-dot-${paletteIndex}`}
                                                className="w-3 h-3 rounded-full border"
                                                style={{
                                                    backgroundColor: paletteColor,
                                                    borderColor: paletteIndex === brandColor.colorIndex ? 'white' : 'transparent',
                                                    borderWidth: paletteIndex === brandColor.colorIndex ? '2px' : '1px'
                                                }}
                                                title={paletteColor}
                                            />
                                        ))}
                                    </div>

                                    {/* Toggle Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 w-8 h-8 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cycleCardMode(cardKey, shouldInvert);
                                        }}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>

                                    <Image
                                        src={currentLogo.logoUrl}
                                        alt={`Logo on brand color ${index + 1}`}
                                        width={200}
                                        height={200}
                                        className="object-contain w-full h-full"
                                        unoptimized={currentLogo.logoUrl.startsWith('data:')}
                                        style={styles}
                                    />
                                    <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">
                                        On Brand Color
                                    </p>
                                </div>
                            );
                        });
                    } else {
                        return null;
                    }
                })()}

                {/* Color Logo Versions - Show all versions with individual hue sliders */}
                {(() => {
                    // Support new colorVersions structure and legacy fields
                    const colorVersions = currentLogo.colorVersions || [];

                    // Migrate legacy fields if needed
                    if (colorVersions.length === 0 && currentLogo.colorLogoUrl) {
                        colorVersions.push({ colorLogoUrl: currentLogo.colorLogoUrl, palette: currentLogo.palette || [] });
                    }

                    if (colorVersions.length > 0) {
                        return colorVersions.map((colorVersion, versionIndex) => {
                            const currentHueShift = hueShifts[versionIndex] || 0;
                            const shiftedPalette = colorVersion.palette.map(color => shiftHue(color, currentHueShift));

                            return (
                                <div key={`color-version-${versionIndex}`} className="relative aspect-square bg-white flex flex-col items-center justify-center">
                                    {/* Color logo with hue shift */}
                                    <div className="flex-1 w-full flex items-center justify-center relative">
                                        <Image
                                            src={colorVersion.colorLogoUrl}
                                            alt={`Color logo version ${versionIndex + 1}`}
                                            width={200}
                                            height={200}
                                            className="object-contain w-full h-full"
                                            unoptimized={colorVersion.colorLogoUrl.startsWith('data:')}
                                            style={{
                                                filter: `hue-rotate(${currentHueShift}deg)`
                                            }}
                                        />

                                        {/* Small palette display at top */}
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            {shiftedPalette.map((paletteColor, paletteIndex) => (
                                                <div
                                                    key={`palette-dot-${paletteIndex}`}
                                                    className="w-3 h-3 rounded-full border"
                                                    style={{
                                                        backgroundColor: paletteColor,
                                                        borderColor: 'white',
                                                        borderWidth: '1px'
                                                    }}
                                                    title={paletteColor}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hue slider at bottom */}
                                    <div className="w-full px-3 pb-3 pt-1">
                                        <Slider
                                            defaultValue={[0]}
                                            max={360}
                                            step={1}
                                            className="w-full"
                                            value={[currentHueShift]}
                                            onValueChange={(value) => {
                                                setHueShifts(prev => ({ ...prev, [versionIndex]: value[0] }));
                                            }}
                                        />
                                    </div>

                                    <p className="absolute bottom-12 left-0 right-0 text-xs text-center text-gray-400">
                                        Color Version {colorVersions.length > 1 ? versionIndex + 1 : ''}
                                    </p>
                                </div>
                            );
                        });
                    } else {
                        return (
                            <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                                <Button
                                    onClick={onColorizeLogo}
                                    disabled={isColorizing || isGeneratingLogo}
                                    variant="outline"
                                >
                                    {isColorizing ? (
                                        'Colorizing...'
                                    ) : (
                                        'Generate Color Version'
                                    )}
                                </Button>
                            </div>
                        );
                    }
                })()}
            </div>
        </div>
    );
}
