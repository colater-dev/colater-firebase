interface PaletteDotsProps {
    palette: string[];
    highlightIndex?: number;
}

export function PaletteDots({ palette, highlightIndex }: PaletteDotsProps) {
    return (
        <div className="absolute top-2 left-2 flex gap-1 z-10">
            {palette.map((color, index) => (
                <div
                    key={`palette-dot-${index}`}
                    className="w-3 h-3 rounded-full border"
                    style={{
                        backgroundColor: color,
                        borderColor: index === highlightIndex ? 'white' : 'transparent',
                        borderWidth: index === highlightIndex ? '2px' : '1px'
                    }}
                    title={color}
                />
            ))}
        </div>
    );
}
