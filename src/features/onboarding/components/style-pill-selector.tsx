'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StylePillSelectorProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    maxSelection?: number;
    variant?: 'default' | 'destructive';
}

export function StylePillSelector({
    options,
    selected,
    onChange,
    maxSelection = 5,
    variant = 'default',
}: StylePillSelectorProps) {
    const toggleStyle = (style: string) => {
        if (selected.includes(style)) {
            onChange(selected.filter(s => s !== style));
        } else if (selected.length < maxSelection) {
            onChange([...selected, style]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {options.map((style, index) => {
                const isSelected = selected.includes(style);
                const isDisabled = !isSelected && selected.length >= maxSelection;

                return (
                    <motion.div
                        key={style}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Badge
                            variant={isSelected ? (variant === 'destructive' ? 'destructive' : 'default') : 'outline'}
                            className={cn(
                                'cursor-pointer transition-all hover:scale-105 py-2 px-4 rounded-full text-sm font-semibold border-2',
                                isSelected && variant === 'default' && 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20',
                                isSelected && variant === 'destructive' && 'bg-destructive text-destructive-foreground border-destructive shadow-md shadow-destructive/20',
                                !isSelected && 'bg-background hover:bg-muted border-muted-foreground/20',
                                isDisabled && 'opacity-40 cursor-not-allowed hover:scale-100 grayscale'
                            )}
                            onClick={() => !isDisabled && toggleStyle(style)}
                        >
                            {style}
                        </Badge>
                    </motion.div>
                );
            })}
        </div>
    );
}
