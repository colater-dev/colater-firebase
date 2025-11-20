import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MoodboardCardProps {
    className?: string;
    onClick?: () => void;
}

export function MoodboardCard({ className, onClick }: MoodboardCardProps) {
    return (
        <div className={cn("flex w-full max-w-[600px] overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md", className)}>
            {/* Left Illustration Side */}
            <div className="relative w-[200px] shrink-0 bg-gray-50 p-6 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-50">
                    <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-gray-300">
                        {/* Abstract bezier curves to match the design vibe */}
                        <path d="M-20 180 C 40 100, 120 100, 180 20" strokeWidth="1" />
                        <path d="M20 220 C 80 140, 160 140, 220 60" strokeWidth="1" />
                        <circle cx="100" cy="100" r="2" className="fill-gray-300" />
                        <rect x="40" y="160" width="4" height="4" className="stroke-gray-300" />
                        <rect x="160" y="40" width="4" height="4" className="stroke-gray-300" />
                        {/* Connecting line */}
                        <path d="M42 162 L162 42" strokeWidth="0.5" strokeDasharray="4 4" />
                    </svg>
                </div>
                {/* Main curve element */}
                <svg width="140" height="80" viewBox="0 0 140 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                    <path d="M10 70 Q 70 10, 130 70" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
                    <rect x="8" y="68" width="4" height="4" fill="white" stroke="#9CA3AF" />
                    <rect x="128" y="68" width="4" height="4" fill="white" stroke="#9CA3AF" />
                    <circle cx="70" cy="40" r="3" fill="white" stroke="#9CA3AF" strokeWidth="1.5" />
                    <line x1="12" y1="70" x2="128" y2="70" stroke="#E5E7EB" strokeWidth="1" />
                </svg>
            </div>

            {/* Right Content Side */}
            <div className="flex flex-1 flex-col justify-center p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Build custom style</h3>
                <p className="mb-6 text-sm text-gray-500 leading-relaxed">
                    Curate your own moodboard, build your own custom image generator
                </p>
                <div>
                    <Button
                        onClick={onClick}
                        className="bg-[#333333] text-white hover:bg-black rounded-lg px-6 h-9 text-sm font-medium"
                    >
                        Start now
                    </Button>
                </div>
            </div>
        </div>
    );
}
