import { memo } from 'react';
import { DownloadButton } from './download-button';

interface MockupPreviewProps {
    logoUrl: string | null;
    mockupImage: string;
    brandName: string;
    label: string;
    className?: string;
}

export const MockupPreview = memo(function MockupPreview({
    logoUrl,
    mockupImage,
    brandName,
    label,
    className
}: MockupPreviewProps) {
    const handleDownload = () => {
        if (!logoUrl) return;
        const link = document.createElement('a');
        link.download = `${brandName.replace(/\s+/g, '-').toLowerCase()}-${label.toLowerCase().replace(/\s+/g, '-')}.png`;
        // Note: This only downloads the logo URL, not the composed mockup. 
        // To download the mockup, we'd need to use html-to-image on the ref, similar to LogoShowcase.
        // For now, I'll just link the logoUrl as per StickerPreview (which actually downloads the stickerUrl).
        // Wait, StickerPreview downloads the stickerUrl which IS the image.
        // Here we are composing it.
        // If the user wants to download the MOCKUP, we need to capture the div.
        // But StickerPreview just downloads the stickerUrl.
        // Let's stick to the pattern. If I can't easily download the composed image without a ref and html-to-image in the parent or here, 
        // I might just disable download or try to implement it.
        // StickerPreview has `stickerUrl` which is a generated image.
        // Here we are just overlaying.
        // I'll leave the download button out for now or make it download the logo?
        // Actually, let's include the DownloadButton but maybe it needs to be handled by the parent if we want to download the composition.
        // Re-reading StickerPreview: it downloads `stickerUrl`.
        // Here we don't have a `mockupUrl`.
        // So I will NOT include a download button inside this component for now, 
        // OR I will accept an `onDownload` prop.
        link.href = logoUrl;
        link.click();
    };

    return (
        <div
            className={`relative aspect-square flex items-center justify-center group overflow-hidden ${className}`}
            style={{
                backgroundImage: `url('${mockupImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* 
            We can't easily download the composite image without html-to-image. 
            I'll omit the download button for this specific tile unless I implement the capture logic.
            Given the user just asked to "Add ... as a mockup tile", I'll focus on display first.
            */}

            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt={`${label} logo`}
                    className="object-contain absolute"
                    style={{
                        width: '12%',
                        height: '12%',
                        mixBlendMode: 'color-dodge',
                        transform: 'rotate(-8deg)',
                        opacity: 0.5,
                    }}
                />
            ) : (
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
            )}
            <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">{label}</p>
        </div>
    );
});
