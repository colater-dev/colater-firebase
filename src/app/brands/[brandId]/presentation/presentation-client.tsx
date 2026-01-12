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
import { getGeneratedStories, getPresentationData } from '@/app/actions';
import { shiftHue, darkenColor, isLightColor, lightenColor } from '@/lib/color-utils';

// --- Sub-components for Slides ---

const BrandCoverSlide = ({ brand, logo, aiData }: { brand: Brand; logo?: Logo; aiData?: any }) => {
    const font = BRAND_FONTS.find(f => f.name === brand.font) || BRAND_FONTS[0];
    const primaryColor = logo?.palette?.[0] || '#000000';
    const bgColor = isLightColor(primaryColor) ? primaryColor : lightenColor(primaryColor, 0.9);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-12" style={{ backgroundColor: bgColor }}>
            {logo?.logoUrl && (
                <div className="relative w-72 h-72">
                    <Image
                        src={logo.logoUrl}
                        alt="Logo"
                        fill
                        className="object-contain"
                        style={{ filter: `contrast(${logo.displaySettings?.logoContrast || 100}%)${logo.displaySettings?.invertLogo ? ' invert(1)' : ''}` }}
                    />
                </div>
            )}
            <div className="space-y-4">
                <h1
                    className="text-8xl font-black tracking-tighter"
                    style={{ fontFamily: `var(${font.variable})`, textTransform: logo?.displaySettings?.textTransform || 'none' }}
                >
                    {brand.latestName}
                </h1>
                <p className="text-2xl font-medium text-black/60 italic">
                    {aiData?.tagline || 'Simplicity redefined.'}
                </p>
            </div>
            <div className="absolute top-12 left-12 h-16 w-1 bg-black/10" />
        </div>
    );
};

const BrandIdeaSlide = ({ aiData, palette }: { aiData?: any; palette: string[] }) => (
    <div className="flex flex-col items-start justify-center h-full max-w-5xl mx-auto p-24 space-y-12 relative overflow-hidden">
        {/* Minimal abstract background derived from primary color */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: palette[0], opacity: 0.1 }} />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: palette[1] || palette[0], opacity: 0.05 }} />

        <div className="space-y-8 relative z-10">
            <h2 className="text-7xl font-black leading-[1.1] tracking-tight text-balance">
                {aiData?.brandStatement || "A bold statement of intent and purpose."}
            </h2>
            <p className="text-3xl text-muted-foreground leading-relaxed max-w-2xl border-l-4 pl-8 border-primary/20">
                {aiData?.supportingLine || "Innovation driven by a commitment to excellence and user-centric design."}
            </p>
        </div>
    </div>
);

const VisualIntentSlide = ({ aiData, palette }: { aiData?: any; palette: string[] }) => (
    <div className="flex flex-col items-center justify-center h-full p-24 space-y-16">
        <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-muted-foreground">Visual Intent</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full">
            {(aiData?.visualIntentPhrases || ["modular", "precise", "contemporary", "resilient"]).map((phrase: string, i: number) => (
                <div key={phrase} className="flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-full" style={{ backgroundColor: palette[i % palette.length], opacity: 0.1 + (i * 0.1) }} />
                    <span className="text-2xl font-bold tracking-tight capitalize">{phrase}</span>
                </div>
            ))}
        </div>
    </div>
);

const LogoSystemSlide = ({ brand, logo }: { brand: Brand; logo?: Logo }) => {
    const font = BRAND_FONTS.find(f => f.name === brand.font) || BRAND_FONTS[0];
    const crop = logo?.cropDetails;

    return (
        <div className="p-24 h-full flex flex-col justify-center space-y-20">
            <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-center text-muted-foreground mb-8">Logo System</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-24 items-center">
                {/* Primary Lockup */}
                <div className="flex flex-col items-center space-y-8 p-12 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="relative w-40 h-40">
                        <Image
                            src={logo?.logoUrl || ''}
                            alt="Logo"
                            fill
                            className="object-contain"
                            style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%)${logo?.displaySettings?.invertLogo ? ' invert(1)' : ''}` }}
                        />
                    </div>
                    <span className="text-2xl font-bold" style={{ fontFamily: `var(${font.variable})`, textTransform: logo?.displaySettings?.textTransform || 'none' }}>
                        {brand.latestName}
                    </span>
                </div>

                {/* Cropped Mark */}
                <div className="flex flex-col items-center space-y-8">
                    <div className="relative w-40 h-40 bg-black rounded-3xl overflow-hidden flex items-center justify-center p-4">
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
                    <span className="text-sm font-mono uppercase tracking-widest text-muted-foreground">The Mark</span>
                </div>

                {/* Inverted Variant */}
                <div className="flex flex-col items-center space-y-8 p-12 bg-black text-white rounded-3xl">
                    <div className="relative w-40 h-40">
                        <Image
                            src={logo?.logoUrl || ''}
                            alt="Logo Inverted"
                            fill
                            className="object-contain"
                            style={{ filter: `contrast(${logo?.displaySettings?.logoContrast || 100}%) brightness(0) invert(1)` }}
                        />
                    </div>
                    <span className="text-2xl font-bold" style={{ fontFamily: `var(${font.variable})`, textTransform: logo?.displaySettings?.textTransform || 'none' }}>
                        {brand.latestName}
                    </span>
                </div>
            </div>
        </div>
    );
};

const ColorWorldSlide = ({ palette, aiData }: { palette: string[]; aiData?: any }) => (
    <div className="p-24 h-full flex flex-col justify-center items-center space-y-16">
        <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-center text-muted-foreground">Color Philosophy</h2>
        <div className="grid grid-cols-2 w-full max-w-5xl gap-1">
            <div className="aspect-square bg-white border border-gray-100 p-12 flex flex-col justify-end">
                <p className="text-2xl font-bold leading-tight">
                    {aiData?.colorPhilosophy || "A palette that balances tradition with future-facing neutrality."}
                </p>
            </div>
            <div className="grid grid-cols-2 grid-rows-2">
                {palette.slice(0, 4).map((color, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center text-xs font-mono" style={{ backgroundColor: color, color: isLightColor(color) ? 'black' : 'white' }}>
                        {color.toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const DesignSystemSnapshotSlide = ({ logo, palette }: { logo?: Logo; palette: string[] }) => (
    <div className="p-24 h-full grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => (
            <div key={i} className="aspect-square border border-gray-100 relative overflow-hidden flex items-center justify-center p-8 group">
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
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: palette[i % palette.length] }} />
                )}
            </div>
        ))}
    </div>
);

const BrandInActionSlide = ({ logo, brand }: { logo?: Logo; brand: Brand }) => {
    const font = BRAND_FONTS.find(f => f.name === brand.font) || BRAND_FONTS[0];
    const primaryColor = logo?.palette?.[0] || '#000000';

    return (
        <div className="p-24 h-full grid grid-cols-2 gap-8">
            {/* Website Hero Mockup */}
            <div className="col-span-2 aspect-[21/9] bg-gray-50 rounded-3xl overflow-hidden border relative">
                <div className="absolute top-8 left-8 flex items-center gap-4">
                    <div className="relative w-8 h-8">
                        <Image src={logo?.logoUrl || ''} alt="Nav Logo" fill className="object-contain" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest">{brand.latestName}</span>
                </div>
                <div className="h-full flex flex-col justify-center px-16 max-w-2xl space-y-6">
                    <h3 className="text-5xl font-black leading-tight" style={{ fontFamily: `var(${font.variable})` }}>The future is yours to build.</h3>
                    <div className="h-12 w-48 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: primaryColor }}>Get Started</div>
                </div>
            </div>

            {/* Social Tile */}
            <div className="aspect-square bg-black rounded-3xl p-12 flex flex-col justify-between">
                <div className="relative w-16 h-16">
                    <Image src={logo?.logoUrl || ''} alt="Social Logo" fill className="object-contain invert" />
                </div>
                <p className="text-4xl font-bold text-white leading-tight">Authenticity in every pixel.</p>
            </div>

            {/* Product UI */}
            <div className="aspect-square bg-white rounded-3xl border p-12 flex flex-col space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                        <div className="h-2 w-24 bg-gray-100 rounded" />
                        <div className="h-2 w-16 bg-gray-50 rounded" />
                    </div>
                </div>
                <div className="flex-1 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center">
                    <Image src={logo?.logoUrl || ''} alt="Product UI" width={64} height={64} className="opacity-10" />
                </div>
            </div>
        </div>
    );
};

const BrandTakeawaySlide = ({ aiData, brand, logo }: { aiData?: any; brand: Brand; logo?: Logo }) => {
    const font = BRAND_FONTS.find(f => f.name === brand.font) || BRAND_FONTS[0];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-24 space-y-16">
            <div className="relative w-32 h-32 opacity-20">
                <Image src={logo?.logoUrl || ''} alt="Final Mark" fill className="object-contain" />
            </div>
            <h2 className="text-6xl font-black max-w-4xl leading-[1.1] tracking-tighter" style={{ fontFamily: `var(${font.variable})` }}>
                {aiData?.closingStatement || "Building a legacy of excellence."}
            </h2>
            <div className="w-16 h-1 bg-primary" />
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
    const [aiData, setAiData] = useState<any>(null);
    const [isAiLoading, setIsAiLoading] = useState(true);

    const primaryLogo = logos?.[0];
    const palette = primaryLogo?.palette || ['#000000', '#ffffff', '#cccccc'];

    useEffect(() => {
        const fetchAiData = async () => {
            if (!brand || !primaryLogo) return;

            const result = await getPresentationData({
                name: brand.latestName,
                elevatorPitch: brand.latestElevatorPitch,
                concept: primaryLogo.concept || brand.latestConcept || '',
                prompt: primaryLogo.prompt,
                critiqueSummary: primaryLogo.critique?.overallSummary,
                critiquePoints: primaryLogo.critique?.points.map(p => p.comment)
            });

            if (result.success && result.data) {
                setAiData(result.data);
            }
            setIsAiLoading(false);
        };

        fetchAiData();
    }, [brand, primaryLogo]);

    const slides = useMemo(() => {
        if (!brand || isAiLoading) return [];
        return [
            { id: 'cover', component: <BrandCoverSlide brand={brand} logo={primaryLogo} aiData={aiData} /> },
            { id: 'idea', component: <BrandIdeaSlide aiData={aiData} palette={palette} /> },
            { id: 'intent', component: <VisualIntentSlide aiData={aiData} palette={palette} /> },
            { id: 'system', component: <LogoSystemSlide brand={brand} logo={primaryLogo} /> },
            { id: 'colors', component: <ColorWorldSlide palette={palette} aiData={aiData} /> },
            { id: 'snapshot', component: <DesignSystemSnapshotSlide logo={primaryLogo} palette={palette} /> },
            { id: 'action', component: <BrandInActionSlide logo={primaryLogo} brand={brand} /> },
            { id: 'takeaway', component: <BrandTakeawaySlide aiData={aiData} brand={brand} logo={primaryLogo} /> },
        ];
    }, [brand, primaryLogo, aiData, palette, isAiLoading]);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(0, prev - 1));

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

    if (isBrandLoading || isLogosLoading || isAiLoading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="animate-spin h-12 w-12 text-primary" />
                    <p className="text-sm font-mono text-muted-foreground animate-pulse">Generating your brand presentation...</p>
                </div>
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
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
                    className="rounded-full h-12 w-12 border-2 hover:bg-black hover:text-white transition-colors"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="rounded-full h-12 w-12 border-2 hover:bg-black hover:text-white transition-colors"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                <motion.div
                    className="h-full bg-black"
                    initial={false}
                    animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
            </div>
        </div>
    );
}
