'use client';

import { createContext, useContext, ReactNode } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    toggleOpen: () => void;
}

const SidebarContext = createContext<SidebarContextType>({ isOpen: false, toggleOpen: () => { } });

export function SidebarProvider({ children, isOpen, onToggle }: { children: ReactNode; isOpen: boolean, onToggle: () => void }) {
    return (
        <SidebarContext.Provider value={{ isOpen, toggleOpen: onToggle }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
