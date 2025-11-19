'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export function CreateProjectCard() {
    return (
        <Link
            href="/brands/new"
            className="group flex flex-col justify-end h-[200px] w-full bg-white rounded-lg shadow-[0px_2px_8px_-2px_rgba(0,0,0,0.15),0px_0px_0px_1px_rgba(0,0,0,0.05)] p-4 transition-all hover:shadow-md"
        >
            <div className="flex-1 flex items-center justify-center">
                <div className="w-16 h-16 text-gray-200 group-hover:text-gray-300 transition-colors">
                    <PlusCircle className="w-full h-full stroke-[1]" />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-sm leading-none text-black">Start a new project</h3>
                <p className="font-medium text-sm leading-[1.5] text-black/60">
                    Create your own unique style for you brand
                </p>
            </div>
        </Link>
    );
}
