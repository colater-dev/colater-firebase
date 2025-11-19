'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';

interface ContentCardProps {
    children: ReactNode;
    className?: string;
}

export function ContentCard({ children, className }: ContentCardProps) {
    const { isOpen } = useSidebar();

    return (
        <div
            className={cn(
                'h-[calc(100vh-72px)] pt-[72px] px-2 pb-2 bg-[#f9f9f9] transition-all duration-300',
                isOpen ? 'pl-[242px]' : 'pl-2'
            )}
        >
            <div
                className={cn(
                    'bg-white rounded-xl shadow-[0px_0px_8px_-4px_rgba(0,0,0,0.25),0px_0px_0px_1px_rgba(0,0,0,0.02)] p-8 mx-auto h-full overflow-auto',
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}
