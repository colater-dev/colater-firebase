'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WelcomeHero } from "@/features/onboarding/components/welcome-hero";
import { WelcomePreviewCarousel } from "@/features/onboarding/components/welcome-preview-carousel";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";

export default function WelcomeClient() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden">
            <div className="w-full max-w-6xl space-y-12">
                {/* Hero Section */}
                <WelcomeHero />

                {/* Preview Carousel */}
                <WelcomePreviewCarousel />

                {/* Social Proof & CTA */}
                <div className="flex flex-col items-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium"
                    >
                        <Users className="w-4 h-4 text-primary" />
                        <span>Join 1,000+ creators building their brands on Colater</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                    >
                        <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all">
                            <Link href="/onboarding/steps/name" className="flex items-center gap-2">
                                Create Your Brand
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
