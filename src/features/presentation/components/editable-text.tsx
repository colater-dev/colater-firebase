'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
    value: string;
    onChange: (newValue: string) => void;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    isEditing?: boolean;
    style?: React.CSSProperties;
}

export function EditableText({
    value,
    onChange,
    className,
    placeholder = "Type here...",
    multiline = false,
    isEditing = false,
    style
}: EditableTextProps) {
    const [localValue, setLocalValue] = useState(value);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleInput = () => {
        if (contentRef.current) {
            setLocalValue(contentRef.current.innerText);
        }
    };

    const handleBlur = () => {
        if (localValue !== value) {
            onChange(localValue);
        }
    };

    if (!isEditing) {
        return (
            <div className={cn(className, "cursor-default text-balance")} style={style}>
                {value || placeholder}
            </div>
        );
    }

    return (
        <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={handleBlur}
            className={cn(
                className,
                "outline-none focus:ring-2 focus:ring-primary/20 rounded-sm transition-all cursor-text text-balance",
                multiline ? "min-h-[1.5em]" : "whitespace-nowrap",
                !value && "before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:pointer-events-none"
            )}
            style={style}
            data-placeholder={placeholder}
        >
            {value}
        </div>
    );
}
