'use client';

import { createContext, useContext, ReactNode } from 'react';

interface SidebarContextType {
    isOpen: boolean;
}

const SidebarContext = createContext<SidebarContextType>({ isOpen: false });

export function SidebarProvider({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
    return (
        <SidebarContext.Provider value={{ isOpen }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
