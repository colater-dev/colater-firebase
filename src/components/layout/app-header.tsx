'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUser, useAuth } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { Menu } from '@/components/animate-ui/icons/menu';

function getInitials(name: string | null | undefined): string {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

interface AppHeaderProps {
    onMenuClick: () => void;
    isSidebarOpen: boolean;
}

export function AppHeader({ onMenuClick, isSidebarOpen }: AppHeaderProps) {
    const { user } = useUser();
    const auth = useAuth();

    const handleSignOut = () => {
        auth.signOut();
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-6">
            {/* Logo with menu icon */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu animate={isSidebarOpen} className="h-5 w-5 text-black" />
                </button>
                <Image
                    src="/colater.png"
                    alt="Colater"
                    width={120}
                    height={36}
                    className="h-8 w-auto"
                    priority
                />
            </div>

            {/* User info on the right */}
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-4 hover:opacity-80 transition-opacity focus:outline-none">
                            <span className="text-sm font-semibold text-black">
                                {user.displayName || 'User'}
                            </span>
                            <Avatar className="h-8 w-8 cursor-pointer">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {getInitials(user.displayName)}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </header>
    );
}
