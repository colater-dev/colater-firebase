'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { createBrandService, createLogoService } from '@/services';
import type { Brand, Logo } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Loader2, Smartphone, Send } from 'lucide-react';
import Image from 'next/image';
import { BRAND_FONTS } from '@/config/brand-fonts';
import { getGeneratedStories } from '@/app/actions';
import { shiftHue, darkenColor, isLightColor, lightenColor } from '@/lib/color-utils';

// --- Sub-components for Slides ---

const CoverSlide = ({ brand, logo }: { brand: Brand; logo?: Logo }) => {
    const font = BRAND_FONTS.find(f => f.name === brand.font) || BRAND_FONTS[0];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-8">
            {logo?.logoUrl && (
                <div className="relative w-64 h-64 mb-4">
                    <Image
                        src={logo.logoUrl}
                        alt="Logo"
                        fill
                        className="object-contain"
                        style={{ filter: `contrast(${logo.displaySettings?.logoContrast || 100}%)${logo.displaySettings?.invertLogo ? ' invert(1)' : ''}` }}
                    />
                </div>
            )}
            <h1
                className="text-7xl font-bold"
                style={{ fontFamily: `var(${font.variable})`, textTransform: logo?.displaySettings?.textTransform || 'none' }}
            >
                {brand.latestName}
            </h1>
            <p className="text-2xl text-muted-foreground max-w-2xl">
                {brand.latestElevatorPitch}
            </p>
        </div>
    );
};

const ConceptSlide = ({ concept }: { concept: string }) => (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto p-12 space-y-8">
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">The Vision</h2>
        <p className="text-3xl font-serif italic text-center leading-relaxed">
            "{concept}"
        </p>
    </div>
);

const ShowcaseSlide = ({ brand, logos }: { brand: Brand; logos: Logo[] }) => {
    const font = BRAND_FONTS.find(f => f.name === brand.font) || BRAND_FONTS[0];

    return (
        <div className="p-12 h-full flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-12 text-center">Brand Identity Explorations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {logos.slice(0, 6).map((logo, i) => (
                    <div key={logo.id} className="flex flex-col items-center space-y-4">
                        <div className="relative w-40 h-40 bg-gray-50 rounded-xl border flex items-center justify-center p-4">
                            <Image
                                src={logo.logoUrl}
                                alt={`Logo ${i}`}
                                fill
                                className="object-contain p-4"
                                style={{ filter: `contrast(${logo.displaySettings?.logoContrast || 100}%)${logo.displaySettings?.invertLogo ? ' invert(1)' : ''}` }}
                            />
                        </div>
                        <span
                            className="text-xl font-bold"
                            style={{ fontFamily: `var(${font.variable})`, textTransform: logo.displaySettings?.textTransform || 'none' }}
                        >
                            {brand.latestName}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PaletteSlide = ({ palette }: { palette: string[] }) => (
    <div className="p-12 h-full flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-12 text-center">Core Color System</h2>
        <div className="grid grid-cols-5 w-full max-w-4xl h-80 rounded-2xl overflow-hidden shadow-2xl">
            {palette.slice(0, 5).map((color, i) => (
                <div
                    key={i}
                    className="flex flex-col items-center justify-end p-8 text-white relative transition-transform hover:scale-105"
                    style={{ backgroundColor: color }}
                >
                    <div className="absolute inset-x-0 bottom-0 p-8 space-y-2">
                        <span className={`font-mono text-sm ${isLightColor(color) ? 'text-black/60' : 'text-white/60'}`}>{color.toUpperCase()}</span>
                        <div className={`h-1.5 w-full rounded-full ${isLightColor(color) ? 'bg-black/10' : 'bg-white/20'}`} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const MockupSlide = ({ brand, logo }: { brand: Brand; logo?: Logo }) => {
    const font = BRAND_FONTS.find(f => f.name === brand.font) || BRAND_FONTS[0];
    const primaryColor = logo?.palette?.[0] || '#000000';

    return (
        <div className="p-12 h-full flex flex-col items-center justify-center space-y-12">
            <h2 className="text-2xl font-bold">Physical & Digital Touchpoints</h2>

            <div className="flex flex-wrap justify-center gap-16 items-center">
                {/* Business Card Front */}
                <div className="w-[400px] aspect-[1.75/1] bg-white shadow-2xl rounded-sm p-10 flex flex-col justify-between border">
                    {logo?.logoUrl && (
                        <div className="relative w-16 h-16">
                            <Image
                                src={logo.logoUrl}
                                alt="Logo"
                                fill
                                className="object-contain object-left"
                                style={{ filter: `contrast(${logo.displaySettings?.logoContrast || 100}%)${logo.displaySettings?.invertLogo ? ' invert(1)' : ''}` }}
                            />
                        </div>
                    )}
                    <div className="text-right">
                        <p className="font-bold text-lg" style={{ fontFamily: `var(${font.variable})` }}>{brand.latestName} Team</p>
                        <p className="text-sm text-muted-foreground">Founder & CEO</p>
                        <p className="text-sm text-muted-foreground mt-4">hello@{brand.latestName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</p>
                    </div>
                </div>

                {/* Business Card Back */}
                <div
                    className="w-[400px] aspect-[1.75/1] shadow-2xl rounded-sm p-10 flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                >
                    {logo?.logoUrl && (
                        <div className="relative w-24 h-24">
                            <Image
                                src={logo.logoUrl}
                                alt="Logo"
                                fill
                                className="object-contain"
                                style={{ filter: `contrast(${logo.displaySettings?.logoContrast || 100}%) brightness(0) invert(1)` }}
                            />
                        </div>
                    )}
                </div>

                {/* App Icon */}
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-32 h-32 rounded-[22%] shadow-xl flex items-center justify-center p-6 border-4 border-white"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {logo?.logoUrl && (
                            <div className="relative w-full h-full">
                                <Image
                                    src={logo.logoUrl}
                                    alt="Icon"
                                    fill
                                    className="object-contain"
                                    style={{ filter: `contrast(${logo.displaySettings?.logoContrast || 100}%) brightness(0) invert(1)` }}
                                />
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Digital Icon</span>
                </div>
            </div>
        </div>
    );
};

const SocialSlide = ({ brand, logo }: { brand: Brand; logo?: Logo }) => {
    const [stories, setStories] = useState<{ headline: string; body: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            const result = await getGeneratedStories({
                name: brand.latestName,
                elevatorPitch: brand.latestElevatorPitch
            });
            if (result.success && result.data) {
                setStories(result.data);
            }
            setIsLoading(false);
        };
        fetchStories();
    }, [brand]);

    // Use brand primary color for gradient if available
    const primaryColor = logo?.palette?.[0] || '#6366f1';

    return (
        <div className="p-12 h-full flex flex-col items-center justify-center space-y-8">
            <h2 className="text-2xl font-bold text-center">Social Media Activation</h2>

            <div className="flex gap-12 overflow-x-auto pb-12 pt-8 max-w-full px-12 no-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[500px] w-full">
                        <Loader2 className="animate-spin h-12 w-12 text-primary" />
                    </div>
                ) : (
                    stories.map((story, i) => (
                        <div key={i} className="flex-shrink-0 relative w-[320px] h-[570px] bg-black rounded-[3rem] border-[12px] border-[#1a1a1a] shadow-2xl overflow-hidden group">
                            {/* Phone Camera Dot */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] rounded-full z-20" />

                            {/* Story Content */}
                            <div
                                className="relative h-full w-full p-8 flex flex-col justify-between overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${darkenColor(primaryColor, 0.4)} 100%)` }}
                            >
                                {/* Decorative element */}
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    {logo?.logoUrl && (
                                        <div className="h-10 w-10 relative mb-8">
                                            <Image src={logo.logoUrl} alt="Logo" fill className="object-contain brightness-0 invert" />
                                        </div>
                                    )}
                                    <motion.h3
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                        className="text-4xl font-black text-white leading-[1.1] mb-6"
                                    >
                                        {story.headline}
                                    </motion.h3>
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="text-white/80 text-lg font-medium leading-relaxed"
                                    >
                                        {story.body}
                                    </motion.p>
                                    <div className="h-12 w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center px-5 justify-between transition-all hover:bg-white/20">
                                        <span className="text-xs text-white font-black uppercase tracking-widest">Discover {brand.latestName}</span>
                                        <ChevronRight className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- Main Presentation Component ---

export function PresentationClient() {
    const { brandId } = useParams() as { brandId: string };
    const router = useRouter();
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

    const [currentSlide, setCurrentSlide] = useState(0);

    const primaryLogo = logos?.[0];
    const palette = primaryLogo?.palette || ['#000000', '#ffffff', '#cccccc'];

    const slides = useMemo(() => {
        if (!brand) return [];
        const s = [
            { id: 'cover', component: <CoverSlide brand={brand} logo={primaryLogo} /> },
            { id: 'concept', component: <ConceptSlide concept={brand.latestConcept || 'A modern approach to design.'} /> },
        ];

        if (logos && logos.length > 0) {
            s.push({ id: 'showcase', component: <ShowcaseSlide brand={brand} logos={logos} /> });
        }

        s.push({ id: 'palette', component: <PaletteSlide palette={palette} /> });
        s.push({ id: 'mockup', component: <MockupSlide brand={brand} logo={primaryLogo} /> });
        s.push({ id: 'social', component: <SocialSlide brand={brand} logo={primaryLogo} /> });

        return s;
    }, [brand, logos, primaryLogo, palette]);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 0, slides.length - 1) === 0 ? 0 : prev - 1);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') router.back();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slides.length]);

    if (isBrandLoading || isLogosLoading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
                <Loader2 className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    if (!brand) return <div>Brand not found</div>;

    return (
        <div className="fixed inset-0 bg-white flex flex-col z-[100] overflow-hidden">
            {/* Header / Controls */}
            <div className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-8 z-50">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground">
                        {currentSlide + 1} / {slides.length}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground border-l pl-4">
                        {brand.latestName} Identity
                    </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Slide Content */}
            <div className="flex-grow relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full w-full"
                    >
                        {slides[currentSlide]?.component}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Bars */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="rounded-full h-12 w-12 border-2"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="rounded-full h-12 w-12 border-2"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                <motion.div
                    className="h-full bg-primary"
                    initial={false}
                    animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
            </div>
        </div>
    );
}
