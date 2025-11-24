import { DownloadButton } from './download-button';

interface StickerPreviewProps {
    stickerUrl: string;
    brandName: string;
    label: string;
    isColor?: boolean;
}

export function StickerPreview({ stickerUrl, brandName, label, isColor = false }: StickerPreviewProps) {
    const handleDownload = () => {
        const link = document.createElement('a');
        const filename = isColor ? 'color-sticker' : 'sticker';
        link.download = `${brandName.replace(/\s+/g, '-').toLowerCase()}-${filename}.png`;
        link.href = stickerUrl;
        link.click();
    };

    return (
        <div
            className="relative aspect-square flex items-center justify-center group"
            style={{
                backgroundImage: "url('/laptop-keyboard-mockup.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DownloadButton onClick={handleDownload} />
            </div>
            <img
                src={stickerUrl}
                alt={`${label} logo`}
                className="object-contain"
                style={{
                    maxWidth: isColor ? '50%' : '45%',
                    maxHeight: isColor ? '50%' : '45%',
                    filter: isColor
                        ? 'drop-shadow(0 5px 3px rgba(0,0,0,0.8))'
                        : 'invert(1) drop-shadow(rgba(0, 0, 0, 0.3) -1.5px 2px .5px)',
                    transform: `rotate(${isColor ? '15' : '-12'}deg)`,
                    opacity: 0.8
                }}
            />
            <p className="absolute bottom-2 left-0 right-0 text-xs text-center text-gray-400">{label}</p>
        </div>
    );
}
