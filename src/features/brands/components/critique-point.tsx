import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { CritiquePoint as CritiquePointType } from '@/lib/types';

interface CritiquePointProps {
    point: CritiquePointType;
    isExpanded: boolean;
    onToggle: (e: React.MouseEvent) => void;
    isStatic?: boolean;
}

export function CritiquePoint({
    point,
    isExpanded,
    onToggle,
    isStatic = false
}: CritiquePointProps) {
    return (
        <div
            className={`
        ${isStatic ? 'relative' : 'absolute'} 
        cursor-pointer z-20
      `}
            style={!isStatic ? {
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)',
            } : undefined}
            onClick={onToggle}
        >
            <div
                className={`
          flex items-center shadow-lg transition-all duration-300 ease-out
          ${isExpanded
                        ? 'bg-background border border-input px-3 py-2 min-w-[200px]'
                        : `border-2 w-8 h-8 justify-center ${point.sentiment === 'positive' ? 'bg-green-500/90 border-green-600' : 'bg-red-500/90 border-red-600'}`
                    }
        `}
                style={{
                    borderRadius: '30px 30px 2px 30px',
                }}
            >
                {!isExpanded && (
                    point.sentiment === 'positive' ? (
                        <ThumbsUp className="w-4 h-4 text-white flex-shrink-0" />
                    ) : (
                        <ThumbsDown className="w-4 h-4 text-white flex-shrink-0" />
                    )
                )}
                {isExpanded && (
                    <span className="text-sm text-foreground text-left leading-relaxed">
                        {point.comment}
                    </span>
                )}
            </div>
        </div>
    );
}
