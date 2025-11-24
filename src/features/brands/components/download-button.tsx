import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
    onClick: () => void;
    className?: string;
    title?: string;
}

export function DownloadButton({ onClick, className = "w-8 h-8 bg-black/20 hover:bg-black/40 text-white", title = "Download PNG" }: DownloadButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            title={title}
        >
            <Download className="w-4 h-4" />
        </Button>
    );
}
