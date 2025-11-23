import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from "@/components/ui/switch";
import {
    ArrowRight,
    ArrowDown,
    Activity,
    ArrowUp,
    Maximize,
    Sparkles,
} from 'lucide-react';

interface LogoControlsProps {
    logoLayout: 'horizontal' | 'vertical';
    setLogoLayout: (layout: 'horizontal' | 'vertical') => void;
    textTransform: 'none' | 'lowercase' | 'capitalize' | 'uppercase';
    setTextTransform: (transform: 'none' | 'lowercase' | 'capitalize' | 'uppercase') => void;
    animationType: 'fade' | 'slide' | 'scale' | 'blur' | null;
    triggerAnimation: (type: 'fade' | 'slide' | 'scale' | 'blur') => void;
    showBrandName: boolean;
    setShowBrandName: (show: boolean) => void;
    invertLogo: boolean;
    setInvertLogo: (invert: boolean) => void;
    logoTextGap: number;
    setLogoTextGap: (gap: number) => void;
    logoTextBalance: number;
    setLogoTextBalance: (balance: number) => void;
    logoBrightness: number;
    setLogoBrightness: (brightness: number) => void;
    logoContrast: number;
    setLogoContrast: (contrast: number) => void;
    logoSmoothness: number;
    setLogoSmoothness: (smoothness: number) => void;
}

export function LogoControls({
    logoLayout,
    setLogoLayout,
    textTransform,
    setTextTransform,
    animationType,
    triggerAnimation,
    showBrandName,
    setShowBrandName,
    invertLogo,
    setInvertLogo,
    logoTextGap,
    setLogoTextGap,
    logoTextBalance,
    setLogoTextBalance,
    logoBrightness,
    setLogoBrightness,
    logoContrast,
    setLogoContrast,
    logoSmoothness,
    setLogoSmoothness,
}: LogoControlsProps) {
    return (
        <div className="absolute top-4 right-4 flex flex-col gap-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-4 rounded-lg border shadow-sm z-30">
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Layout</Label>
                <div className="flex bg-muted rounded-md p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 ${logoLayout === 'horizontal' ? 'bg-[#f9f9f9] shadow-[0px_2px_6px_-2px_rgba(0,0,0,0.2),0px_0px_0px_1px_rgba(0,0,0,0.05),inset_0px_1px_2px_0px_#ffffff] text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => setLogoLayout('horizontal')}
                    >
                        <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 ${logoLayout === 'vertical' ? 'bg-[#f9f9f9] shadow-[0px_2px_6px_-2px_rgba(0,0,0,0.2),0px_0px_0px_1px_rgba(0,0,0,0.05),inset_0px_1px_2px_0px_#ffffff] text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => setLogoLayout('vertical')}
                    >
                        <ArrowDown className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Transform</Label>
                <div className="flex bg-muted rounded-md p-1 gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 px-1 text-[10px] ${textTransform === 'none' ? 'bg-[#f9f9f9] shadow-sm text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => setTextTransform('none')}
                        title="Original"
                    >
                        Original
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 px-1 text-[10px] ${textTransform === 'lowercase' ? 'bg-[#f9f9f9] shadow-sm text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => setTextTransform('lowercase')}
                        title="lowercase"
                    >
                        abc
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 px-1 text-[10px] ${textTransform === 'capitalize' ? 'bg-[#f9f9f9] shadow-sm text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => setTextTransform('capitalize')}
                        title="Capitalize"
                    >
                        Abc
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 px-1 text-[10px] ${textTransform === 'uppercase' ? 'bg-[#f9f9f9] shadow-sm text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => setTextTransform('uppercase')}
                        title="UPPERCASE"
                    >
                        ABC
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Reveal Animation</Label>
                <div className="flex bg-muted rounded-md p-1 gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 px-0 ${animationType === 'fade' ? 'bg-[#f9f9f9] shadow-sm text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => triggerAnimation('fade')}
                        title="Fade"
                    >
                        <Activity className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 px-0 ${animationType === 'slide' ? 'bg-[#f9f9f9] shadow-sm text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => triggerAnimation('slide')}
                        title="Slide Up"
                    >
                        <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 px-0 ${animationType === 'scale' ? 'bg-[#f9f9f9] shadow-sm text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => triggerAnimation('scale')}
                        title="Scale"
                    >
                        <Maximize className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 h-6 px-0 ${animationType === 'blur' ? 'bg-[#f9f9f9] shadow-sm text-black' : 'text-muted-foreground hover:bg-transparent'}`}
                        onClick={() => triggerAnimation('blur')}
                        title="Blur"
                    >
                        <Sparkles className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Show Name</Label>
                <Switch
                    checked={showBrandName}
                    onCheckedChange={setShowBrandName}
                    className="scale-75"
                />
            </div>
            <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Invert Logo</Label>
                <Switch
                    checked={invertLogo}
                    onCheckedChange={setInvertLogo}
                    className="scale-75"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Spacing</Label>
                <Slider
                    value={[logoTextGap]}
                    onValueChange={(value) => setLogoTextGap(value[0])}
                    min={-100}
                    max={200}
                    step={1}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Size Balance</Label>
                <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                    <span>Logo</span>
                    <span>Text</span>
                </div>
                <Slider
                    value={[logoTextBalance]}
                    onValueChange={(value) => setLogoTextBalance(value[0])}
                    min={0}
                    max={100}
                    step={1}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Brightness</Label>
                <Slider
                    value={[logoBrightness]}
                    onValueChange={(value) => setLogoBrightness(value[0])}
                    min={0}
                    max={200}
                    step={1}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Contrast</Label>
                <Slider
                    value={[logoContrast]}
                    onValueChange={(value) => setLogoContrast(value[0])}
                    min={0}
                    max={300}
                    step={1}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Smoothness</Label>
                <Slider
                    value={[logoSmoothness]}
                    onValueChange={(value) => setLogoSmoothness(value[0])}
                    min={0}
                    max={1.5}
                    step={0.1}
                />
            </div>
        </div>
    );
}
