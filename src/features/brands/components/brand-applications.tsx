import Image from 'next/image';
import { Wifi, Battery, Signal } from 'lucide-react';
import { isLightColor } from '@/lib/color-utils';

interface BrandApplicationsProps {
    logoUrl: string;
    brandName: string;
    tagline: string;
    primaryColor: string;
    fontVariable?: string;
    palette?: string[];
    logoScale?: number;
    contrast?: number;
    invert?: boolean;
    smoothness?: number;
    brightness?: number;
}

export function BrandApplications({
    logoUrl,
    brandName,
    tagline,
    primaryColor,
    fontVariable = 'sans-serif',
    palette = [],
    logoScale = 1,
    contrast = 1.2,
    invert = false,
    smoothness = 0,
    brightness = 1,
}: BrandApplicationsProps) {

    // Determine background style (gradient or solid)
    const hasGradient = palette.length >= 2;
    const backgroundStyle = hasGradient
        ? { background: `linear-gradient(135deg, ${palette[palette.length - 1]} 0%, ${palette[palette.length - 2]} 100%)` }
        : { backgroundColor: primaryColor };

    // Determine logo blend mode/filter based on background brightness
    // Using the first color of the gradient (or primary color) as a proxy for brightness
    const bgForContrast = hasGradient ? palette[palette.length - 1] : primaryColor;
    const isBgLight = isLightColor(bgForContrast);

    const logoStyle = {
        filter: isBgLight
            ? `blur(${smoothness}px) brightness(${brightness}) contrast(${contrast})`
            : `blur(${smoothness}px) brightness(${brightness}) contrast(${contrast}) invert(1)`,
        mixBlendMode: isBgLight ? 'multiply' as const : 'screen' as const,
        transform: `scale(${logoScale})`,
        transition: 'transform 0.2s ease-out'
    };

    return (
        <div className="w-full max-w-4xl mt-12 mb-12">
            <h3 className="text-lg font-semibold mb-6 text-left px-4">Brand Applications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">

                {/* 1. Business Card Front */}
                <div className="flex flex-col">
                    <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center p-0 border border-gray-100">
                        <div className="relative w-full aspect-[3.5/2] shadow-xl bg-white p-8 flex flex-row justify-between">
                            <div className="w-16 h-16 relative">
                                <Image
                                    src={logoUrl}
                                    alt="Logo"
                                    fill
                                    className="object-contain object-left"
                                    style={{
                                        transform: `scale(${logoScale})`,
                                        filter: `blur(${smoothness}px) brightness(${brightness}) contrast(${contrast}) ${invert ? 'invert(1)' : ''}`,
                                        transition: 'transform 0.2s ease-out'
                                    }}
                                    unoptimized={logoUrl.startsWith('data:')}
                                />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: `var(${fontVariable})` }}>John Doe</p>
                                <p className="text-xs text-gray-500 mt-0.5">Founder</p>
                                <p className="text-xs text-gray-400 mt-4">john@{brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">Business Card (Front)</p>
                </div>

                {/* 2. Business Card Back */}
                <div className="flex flex-col">
                    <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center p-0 border border-gray-100">
                        <div
                            className="relative w-full aspect-[3.5/2] shadow-xl flex items-center justify-center p-6"
                            style={backgroundStyle}
                        >
                            <div className="w-24 h-24 relative">
                                <Image
                                    src={logoUrl}
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                    style={logoStyle}
                                    unoptimized={logoUrl.startsWith('data:')}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">Business Card (Back)</p>
                </div>

                {/* 3. App Icon (Digital/Small Scale) */}
                <div className="flex flex-col">
                    <div className="relative w-full aspect-square bg-gray-100/50 flex items-center justify-center overflow-hidden backdrop-blur-sm border border-gray-100">
                        {/* Phone Wallpaper Effect */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor} 0%, #ffffff 100%)`
                            }}
                        />

                        {/* App Icon */}
                        <div
                            className="w-1/2 aspect-square rounded-[22%] shadow-2xl relative overflow-hidden flex items-center justify-center"
                            style={backgroundStyle}
                        >
                            <div className="w-full h-full relative p-4">
                                <Image
                                    src={logoUrl}
                                    alt="App Icon"
                                    fill
                                    className="object-contain"
                                    style={logoStyle}
                                    unoptimized={logoUrl.startsWith('data:')}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">App Icon</p>
                </div>

                {/* 4. Social Profile (Brand Voice) */}
                <div className="flex flex-col">
                    <div className="relative w-full aspect-[3/4] md:aspect-square bg-white overflow-hidden shadow-sm flex flex-col max-h-full">
                        {/* Status Bar */}
                        <div className="h-6 bg-white border-b border-gray-50 flex items-center justify-between px-3">
                            <span className="text-[10px] font-medium text-gray-900">9:41</span>
                            <div className="flex gap-1 items-center text-gray-900">
                                <Signal className="w-3 h-3" />
                                <Wifi className="w-3 h-3" />
                                <Battery className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Header Banner */}
                        <div
                            className="h-24 w-full relative"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${logoUrl})`, backgroundSize: '50px', backgroundRepeat: 'space', filter: 'grayscale(1) invert(1)' }}></div>
                        </div>

                        {/* Profile Content */}
                        <div className="px-4 pb-4 relative flex-1">
                            {/* Avatar */}
                            <div
                                className="w-16 h-16 rounded-full absolute -top-8 left-4 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden"
                                style={backgroundStyle}
                            >
                                <div className="w-full h-full relative p-2">
                                    <Image
                                        src={logoUrl}
                                        alt="Avatar"
                                        fill
                                        className="object-contain"
                                        style={logoStyle}
                                        unoptimized={logoUrl.startsWith('data:')}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-3 mb-3">
                                <div className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold">
                                    Follow
                                </div>
                            </div>

                            {/* Info */}
                            <div className="mt-2">
                                <h4 className="font-bold text-gray-900 text-sm" style={{ fontFamily: `var(${fontVariable})` }}>{brandName}</h4>
                                <p className="text-xs text-gray-500">@{brandName.toLowerCase().replace(/\s+/g, '')}</p>
                                <p className="text-xs text-gray-700 mt-2 leading-relaxed line-clamp-3">
                                    {tagline}
                                </p>
                                <div className="flex gap-3 mt-3">
                                    <div className="flex gap-1 text-xs">
                                        <span className="font-bold text-gray-900">1.2k</span>
                                        <span className="text-gray-500">Following</span>
                                    </div>
                                    <div className="flex gap-1 text-xs">
                                        <span className="font-bold text-gray-900">8.5k</span>
                                        <span className="text-gray-500">Followers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">Social Profile</p>
                </div>

            </div>


        </div>
    );
}
