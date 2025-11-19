'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PillInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PillInput({
  value,
  onChange,
  placeholder = 'Type and press Enter...',
  className,
  disabled = false,
}: PillInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last pill when backspace is pressed on empty input
      onChange(value.slice(0, -1));
    }
  };

  const removePill = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[42px] items-center',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {value.map((pill, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="pl-3 pr-1 py-1 flex items-center gap-1 text-sm"
        >
          <span>{pill}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => removePill(index)}
              className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
              aria-label={`Remove ${pill}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      {!disabled && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
        />
      )}
    </div>
  );
}
