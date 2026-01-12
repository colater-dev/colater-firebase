'use client';

import { useState } from 'react';
import { FirebaseClientProvider } from "@/firebase";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { AppHeader, AppSidebar } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <FirebaseClientProvider>
            <SidebarProvider isOpen={isSidebarOpen}>
                <AppHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
                <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                {children}
                <Toaster />
            </SidebarProvider>
        </FirebaseClientProvider>
    );
}
