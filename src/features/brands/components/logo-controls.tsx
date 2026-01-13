import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from "@/components/ui/switch";
import {
    Activity,
    ArrowUp,
    Maximize,
    Sparkles,
    Download,
    Type,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BRAND_FONTS } from '@/config/brand-fonts';

interface LogoControlsProps {
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
    logoContrast: number;
    setLogoContrast: (contrast: number) => void;
    selectedFont: string;
    onFontChange: (font: string) => void;
    onDownload?: () => void;
    onDownloadSvg?: () => void;
}

export const LogoControls = memo(function LogoControls({
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
    logoContrast,
    setLogoContrast,
    selectedFont,
    onFontChange,
    onDownload,
    onDownloadSvg,
}: LogoControlsProps) {
    return (
        <div className="absolute top-4 right-4 flex flex-col gap-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-4 rounded-lg border shadow-sm z-30 max-h-[450px] overflow-y-auto exclude-from-download">
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
                <Label className="text-xs text-muted-foreground">Contrast</Label>
                <Slider
                    value={[logoContrast]}
                    onValueChange={(value) => setLogoContrast(value[0])}
                    min={100}
                    max={300}
                    step={1}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Type className="w-3 h-3" />
                    Brand Font
                </Label>
                <Select
                    value={selectedFont}
                    onValueChange={onFontChange}
                >
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                        {BRAND_FONTS.map((font) => (
                            <SelectItem
                                key={font.name}
                                value={font.name}
                                className="text-xs"
                            >
                                <span style={{ fontFamily: `var(${font.variable})` }}>{font.name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {onDownload && (
                <div className="pt-2 border-t flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={onDownload}
                    >
                        <Download className="w-3 h-3 mr-2" />
                        PNG
                    </Button>
                    {onDownloadSvg && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8"
                            onClick={onDownloadSvg}
                        >
                            <Download className="w-3 h-3 mr-2" />
                            SVG
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
});
