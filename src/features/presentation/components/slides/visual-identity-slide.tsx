'use client';

import { Brand, Logo } from '@/lib/types';
import Image from 'next/image';
import { isLightColor } from '@/lib/color-utils';

interface VisualIdentitySlideProps {
    brand: Brand;
    logo?: Logo;
    palette: string[];
}

export function VisualIdentitySlide({ brand, logo, palette }: VisualIdentitySlideProps) {
    const colorLogoUrl = logo?.colorLogoUrl || (logo?.colorVersions && logo.colorVersions[0]?.colorLogoUrl) || logo?.logoUrl;
    const monochromeLogoUrl = logo?.logoUrl;
    const invertLogoSetting = !!logo?.displaySettings?.invertLogo;
    const contrast = logo?.displaySettings?.logoContrast ?? 100;
    const brandColor = palette[0] || '#000000';

    const items = [
        {
            bg: 'white',
            logo: colorLogoUrl,
            label: 'Primary Color',
            invert: false
        },
        {
            bg: brandColor,
            logo: monochromeLogoUrl,
            label: 'On Brand Color',
            invert: !isLightColor(brandColor) !== invertLogoSetting
        },
        {
            bg: 'black',
            logo: monochromeLogoUrl,
            label: 'On Dark',
            invert: !invertLogoSetting
        },
        {
            bg: '#f8f9fa',
            logo: logo?.logoUrl,
            label: 'The Mark',
            isIcon: true,
            invert: invertLogoSetting
        },
    ];

    return (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full bg-gray-200">
            {items.map((item, i) => (
                <div
                    key={i}
                    className="flex flex-col items-center justify-center relative p-[6cqw] group border-px border-gray-100/10"
                    style={{ backgroundColor: item.bg }}
                >
                    <div className={item.isIcon ? "w-[40%] h-[40%]" : "w-[65%] h-[65%]" + " relative"}>
                        {item.logo && (
                            <Image
                                src={item.logo}
                                alt={item.label}
                                fill
                                className="object-contain transition-transform group-hover:scale-105"
                                style={{ filter: `contrast(${contrast}%)${item.invert ? ' invert(1)' : ''}` }}
                            />
                        )}
                    </div>
                    <span
                        className="absolute bottom-6 left-6 font-mono text-[0.8cqw] uppercase tracking-widest opacity-30"
                        style={{ color: isLightColor(item.bg) ? 'black' : 'white' }}
                    >
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
