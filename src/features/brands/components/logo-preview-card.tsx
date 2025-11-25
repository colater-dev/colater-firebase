import { useRef, memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LogoControls } from './logo-controls';
import { CritiquePoint } from './critique-point';
import { BRAND_FONTS } from '@/config/brand-fonts';
import type { Logo } from '@/lib/types';

interface LogoPreviewCardProps {
    logo: Logo;
    croppedLogoUrl: string | null;
    brandName: string;
    selectedBrandFont: string;
    showCritique: boolean;
    expandedPointId: string | null;
    setExpandedPointId: (id: string | null) => void;
    readOnly?: boolean;

    // Display Settings
    layout: 'horizontal' | 'vertical';
    textTransform: 'none' | 'lowercase' | 'capitalize' | 'uppercase';
    setTextTransform: (transform: 'none' | 'lowercase' | 'capitalize' | 'uppercase') => void;
    showBrandName: boolean;
    setShowBrandName: (show: boolean) => void;
    invertLogo: boolean;
    setInvertLogo: (invert: boolean) => void;
    logoTextGap: number;
    setLogoTextGap: (gap: number) => void;
    logoTextBalance: number;
    setLogoTextBalance: (balance: number) => void;
    logoContrast: number;
    setLogoContrast: (contrast: number) => void;

    // Animation
    animationType: 'fade' | 'slide' | 'scale' | 'blur' | null;
    triggerAnimation: (type: 'fade' | 'slide' | 'scale' | 'blur') => void;
    animationKey: number;

    onDownload: (ref: React.RefObject<HTMLDivElement>) => void;
    onDownloadSvg?: () => void;
    shouldInvertLogo: (backgroundType: 'light' | 'dark') => boolean;
}

export const LogoPreviewCard = memo(function LogoPreviewCard({
    logo,
    croppedLogoUrl,
    brandName,
    selectedBrandFont,
    showCritique,
    expandedPointId,
    setExpandedPointId,
    readOnly,
    layout,
    textTransform,
    setTextTransform,
    showBrandName,
    setShowBrandName,
    invertLogo,
    setInvertLogo,
    logoTextGap,
    setLogoTextGap,
    logoTextBalance,
    setLogoTextBalance,
    logoContrast,
    setLogoContrast,
    animationType,
    triggerAnimation,
    animationKey,
    onDownload,
    onDownloadSvg,
    shouldInvertLogo
}: LogoPreviewCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const logoImageRef = useRef<HTMLImageElement | null>(null);

    const animationVariants = {
        fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
        slide: { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } },
        scale: { hidden: { scale: 0.5, opacity: 0 }, visible: { scale: 1, opacity: 1 } },
        blur: { hidden: { filter: 'blur(10px)', opacity: 0 }, visible: { filter: 'blur(0px)', opacity: 1 } },
    };

    return (
        <div
            ref={containerRef}
            className={`relative bg-white flex ${layout === 'horizontal' ? 'flex-row' : 'flex-col'} items-center justify-center py-12 group h-[480px] ${readOnly ? 'cursor-pointer' : ''} md:scale-100 scale-[0.8] border border-gray-100 rounded-lg`}
            onClick={() => {
                if (readOnly) {
                    triggerAnimation('scale');
                }
            }}
        >
            {!readOnly && (
                <LogoControls
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
                    logoContrast={logoContrast}
                    setLogoContrast={setLogoContrast}
                    onDownload={() => onDownload(containerRef)}
                    onDownloadSvg={onDownloadSvg}
                />
            )}

            <motion.div
                key={`logo-${animationKey}`}
                initial={false}
                animate={croppedLogoUrl ? "visible" : "loading"}
                variants={{
                    loading: { scale: 1.1, filter: 'blur(8px)', opacity: 0.8 },
                    visible: {
                        scale: 1,
                        filter: 'blur(0px)',
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: "easeOut" }
                    },
                    hidden: animationType ? animationVariants[animationType].hidden : {}
                }}
                className="relative z-0"
                style={{
                    width: `${128 * (1.5 - (logoTextBalance / 100))}px`,
                    height: `${128 * (1.5 - (logoTextBalance / 100))}px`,
                    marginRight: layout === 'horizontal' ? `${logoTextGap}px` : 0,
                    marginBottom: layout === 'vertical' ? `${logoTextGap}px` : 0
                }}
            >
                <Image
                    ref={(el) => {
                        if (el) logoImageRef.current = el as HTMLImageElement;
                    }}
                    src={croppedLogoUrl || logo.logoUrl}
                    alt="Logo on white background"
                    fill
                    className="object-contain"
                    unoptimized={(croppedLogoUrl || logo.logoUrl).startsWith('data:')}
                    style={{
                        filter: `contrast(${logoContrast}%)${shouldInvertLogo('light') ? ' invert(1)' : ''}`
                    }}
                />
            </motion.div>

            {showBrandName && (
                <motion.div
                    key={`text-${animationKey}`}
                    initial="hidden"
                    animate="visible"
                    className={`relative z-10 ${layout === 'vertical' ? 'text-center' : 'text-left'}`}
                >
                    <h3
                        className="font-bold text-gray-900 leading-none"
                        style={{
                            fontFamily: `var(${BRAND_FONTS.find(f => f.name === selectedBrandFont)?.variable || 'sans-serif'})`,
                            fontSize: `${36 * (0.5 + (logoTextBalance / 100)) * (BRAND_FONTS.find(f => f.name === selectedBrandFont)?.sizeMultiplier || 1.0)}px`,
                            textTransform: textTransform === 'none' ? 'none' : textTransform === 'capitalize' ? 'capitalize' : textTransform
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

            {/* Critique Points Overlay */}
            {showCritique && logo?.critique?.points && (
                <div className="absolute inset-0 z-20 pointer-events-none exclude-from-download">
                    {logo.critique.points.map((point, index) => (
                        <div key={index} className="pointer-events-auto">
                            <CritiquePoint
                                point={point}
                                isExpanded={expandedPointId === `${logo.id}-${index}`}
                                onToggle={(e) => {
                                    e.stopPropagation();
                                    setExpandedPointId(
                                        expandedPointId === `${logo.id}-${index}`
                                            ? null
                                            : `${logo.id}-${index}`
                                    );
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
            <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400 exclude-from-download">
                {readOnly ? '► Tap to Animate' : (layout === 'horizontal' ? 'Horizontal Logo' : 'Vertical Logo')}
            </p>
        </div>
    );
});
