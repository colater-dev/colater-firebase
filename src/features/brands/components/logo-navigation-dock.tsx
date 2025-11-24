'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { Logo } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoNavigationDockProps {
  logos: Logo[];
  currentLogoIndex: number;
  onLogoIndexChange: (index: number) => void;
}

export function LogoNavigationDock({
  logos,
  currentLogoIndex,
  onLogoIndexChange,
}: LogoNavigationDockProps) {
  if (!logos || logos.length <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentLogoIndex > 0) {
      onLogoIndexChange(currentLogoIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentLogoIndex < logos.length - 1) {
      onLogoIndexChange(currentLogoIndex + 1);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentLogoIndex === 0}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Logo Thumbnails */}
          <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 px-2">
              {logos.map((logo, index) => {
                const logoUrl = logo.colorLogoUrl || logo.logoUrl;
                const isActive = index === currentLogoIndex;

                return (
                  <button
                    key={logo.id || index}
                    onClick={() => onLogoIndexChange(index)}
                    className={`
                      relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                      ${isActive 
                        ? 'border-primary scale-110 shadow-lg' 
                        : 'border-transparent hover:border-muted-foreground/50 opacity-70 hover:opacity-100'
                      }
                    `}
                  >
                    <Image
                      src={logoUrl}
                      alt={`Logo ${index + 1}`}
                      fill
                      className="object-contain p-1"
                      unoptimized={logoUrl.startsWith('data:')}
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentLogoIndex === logos.length - 1}
            className="flex-shrink-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            Logo {currentLogoIndex + 1} of {logos.length}
          </p>
        </div>
      </div>
    </div>
  );
}

