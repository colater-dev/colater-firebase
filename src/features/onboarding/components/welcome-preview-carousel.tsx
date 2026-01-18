'use client';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const EXAMPLE_BRANDS = [
    {
        name: "TechFlow",
        pitch: "Project management for creative teams",
        color: "#6366f1",
        logo: "🌊",
    },
    {
        name: "Café Luna",
        pitch: "Late-night coffee and community",
        color: "#f59e0b",
        logo: "🌙",
    },
    {
        name: "FitLife",
        pitch: "Personalized fitness coaching",
        color: "#10b981",
        logo: "💪",
    },
];

export function WelcomePreviewCarousel() {
    return (
        <div className="w-full max-w-4xl mx-auto py-12">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {EXAMPLE_BRANDS.map((brand, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
                                    <CardContent className="p-0">
                                        <div
                                            className="h-32 flex items-center justify-center text-4xl"
                                            style={{ backgroundColor: `${brand.color}15`, color: brand.color }}
                                        >
                                            {brand.logo}
                                        </div>
                                        <div className="p-4 space-y-1">
                                            <h3 className="font-bold text-lg">{brand.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {brand.pitch}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="hidden md:block">
                    <CarouselPrevious />
                    <CarouselNext />
                </div>
            </Carousel>
        </div>
    );
}
