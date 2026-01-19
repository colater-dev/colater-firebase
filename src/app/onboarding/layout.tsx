'use client';

import { FirebaseClientProvider } from "@/firebase";
import { Toaster } from "@/components/ui/toaster";

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <FirebaseClientProvider>
            <div className="min-h-screen bg-background flex flex-col">
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
                <Toaster />
            </div>
        </FirebaseClientProvider>
    );
}
