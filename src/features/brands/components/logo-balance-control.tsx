'use client';

import { useState } from 'react';
import { useLogoBalance } from '@/hooks/use-logo-balance';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, RotateCcw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface LogoBalanceControlProps {
    logoUrl?: string;
    brandName: string;
    font: string;
    currentBalance?: number;
    onBalanceChange: (balance: number) => void;
    className?: string;
}

export function LogoBalanceControl({
    logoUrl,
    brandName,
    font,
    currentBalance = 50,
    onBalanceChange,
    className,
}: LogoBalanceControlProps) {
    const [isManualMode, setIsManualMode] = useState(false);
    const [manualValue, setManualValue] = useState(currentBalance);

    const {
        displaySettings: autoBalance,
        balance,
        isAnalyzing,
        error,
        reanalyze,
    } = useLogoBalance(logoUrl, brandName, font);

    const effectiveBalance = isManualMode ? manualValue : (autoBalance?.verticalLogoTextBalance ?? currentBalance);

    const handleAutoBalance = () => {
        if (autoBalance) {
            setIsManualMode(false);
            onBalanceChange(autoBalance.verticalLogoTextBalance);
        }
    };

    const handleManualChange = (value: number[]) => {
        const newValue = value[0];
        setManualValue(newValue);
        setIsManualMode(true);
        onBalanceChange(newValue);
    };

    const handleReset = () => {
        setIsManualMode(false);
        if (autoBalance) {
            onBalanceChange(autoBalance.verticalLogoTextBalance);
            setManualValue(autoBalance.verticalLogoTextBalance);
        }
    };

    const confidenceColor = balance?.confidence
        ? balance.confidence > 0.8
            ? 'text-green-600'
            : balance.confidence > 0.6
                ? 'text-yellow-600'
                : 'text-orange-600'
        : 'text-gray-400';

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                            Logo & Text Balance
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p className="text-sm">
                                            Automatically calculates the optimal size ratio between your logo icon
                                            and brand name text based on visual weight analysis.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {isManualMode
                                ? 'Manual adjustment active'
                                : isAnalyzing
                                    ? 'Analyzing visual balance...'
                                    : autoBalance
                                        ? 'Auto-balanced for optimal appearance'
                                        : 'Use slider to adjust manually'}
                        </CardDescription>
                    </div>

                    {!isAnalyzing && autoBalance && (
                        <Badge variant="outline" className={cn('text-xs', confidenceColor)}>
                            {Math.round((balance?.confidence || 0) * 100)}% confidence
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Auto Balance Button */}
                {!isAnalyzing && logoUrl && (
                    <div className="flex gap-2">
                        <Button
                            variant={isManualMode ? 'outline' : 'default'}
                            size="sm"
                            onClick={handleAutoBalance}
                            disabled={!autoBalance}
                            className="flex-1 gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Auto Balance
                        </Button>
                        {isManualMode && autoBalance && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </Button>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {isAnalyzing && (
                    <div className="flex items-center justify-center py-4 gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing logo and text...
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-md flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">Analysis failed</p>
                            <p className="text-xs opacity-80 mt-1">{error.message}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={reanalyze}
                                className="h-7 px-2 mt-2"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Balance Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Logo Larger</span>
                        <span className="font-mono font-bold text-foreground">
                            {Math.round(effectiveBalance)}
                        </span>
                        <span>Text Larger</span>
                    </div>

                    <Slider
                        value={[effectiveBalance]}
                        onValueChange={handleManualChange}
                        min={10}
                        max={90}
                        step={1}
                        className="w-full"
                    />

                    {/* Visual Preview Indicators */}
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                            <div
                                className="w-3 h-3 bg-primary rounded-sm"
                                style={{ transform: `scale(${1.5 - effectiveBalance / 100})` }}
                            />
                            <span className="text-muted-foreground">Icon</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Text</span>
                            <div
                                className="h-2 bg-primary rounded-sm"
                                style={{
                                    width: `${12 * (0.5 + effectiveBalance / 100)}px`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Analysis Details */}
                {!isAnalyzing && balance && (
                    <div className="pt-3 border-t space-y-2">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Analysis:</span>{' '}
                            {balance.reasoning}
                        </p>

                        {balance.confidence < 0.7 && (
                            <p className="text-xs text-orange-600">
                                <span className="font-medium">Note:</span> Confidence is moderate.
                                Manual adjustment may improve results.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
