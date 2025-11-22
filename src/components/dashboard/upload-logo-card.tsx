'use client';

import Link from 'next/link';
import { Upload } from 'lucide-react';

export function UploadLogoCard() {
    return (
        <Link
            href="/start-from-image"
            className="group flex flex-col justify-end h-[200px] w-full bg-white rounded-lg shadow-[0px_2px_8px_-2px_rgba(0,0,0,0.15),0px_0px_0px_1px_rgba(0,0,0,0.05)] hover:shadow-[0px_4px_12px_-2px_rgba(0,0,0,0.2),0px_0px_0px_1px_rgba(0,0,0,0.08)] p-4 transition-all"
        >
            <div className="flex-1 flex items-center justify-center">
                <div className="w-16 h-16 text-gray-200 group-hover:text-gray-300 transition-colors">
                    <Upload className="w-full h-full stroke-[1]" />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-sm leading-none text-black">Start From Your Logo</h3>
                <p className="font-medium text-sm leading-[1.5] text-black/60">
                    Upload an existing logo instead of generating one
                </p>
            </div>
        </Link>
    );
}
