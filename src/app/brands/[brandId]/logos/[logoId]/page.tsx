'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Logo, Brand } from '@/lib/types';

export default function LogoPage() {
    const { brandId, logoId } = useParams();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    // Get current user
    const { user } = useUser();

    // Try public path first for shareable URLs
    const publicLogoRef = doc(firestore, `brands/${brandId}/logos/${logoId}`);
    const { data: publicLogo, isLoading: publicLoading } = useDoc<Logo>(publicLogoRef);

    // Fallback to user path if not found publicly and user is authenticated
    const userLogoRef = user && !publicLogo && !publicLoading
        ? doc(firestore, `users/${user.uid}/brands/${brandId}/logoGenerations/${logoId}`)
        : null;
    const { data: userLogo, isLoading: userLoading } = useDoc<Logo>(userLogoRef);

    // Use whichever logo was found
    const logo = publicLogo || userLogo;
    const logoLoading = publicLoading || userLoading;

    // Fetch brand info - try public first
    const publicBrandRef = doc(firestore, `brands/${brandId}`);
    const { data: publicBrand, isLoading: publicBrandLoading } = useDoc<Brand>(publicBrandRef);

    // Fallback to user path
    const userBrandRef = user && !publicBrand && !publicBrandLoading
        ? doc(firestore, `users/${user.uid}/brands/${brandId}`)
        : null;
    const { data: userBrand, isLoading: userBrandLoading } = useDoc<Brand>(userBrandRef);

    const brand = publicBrand || userBrand;
    const brandLoading = publicBrandLoading || userBrandLoading;

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast({
                title: 'Link copied!',
                description: 'Share this link with anyone to show them this logo.',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Failed to copy',
                description: 'Please copy the URL manually from your browser.',
            });
        }
    };


    if (logoLoading || brandLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading logo...</p>
                </div>
            </div>
        );
    }

    if (!logo || !brand) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Logo not found</h1>
                    <p className="text-muted-foreground mb-4">This logo may have been deleted or you don't have access to it.</p>
                    <Link href="/dashboard">
                        <Button>Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href={`/brands/${brandId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Brand
                        </Button>
                    </Link>
                    <Button onClick={handleShare} variant="outline">
                        {copied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Brand Info */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2">{brand.latestName}</h1>
                        {brand.latestElevatorPitch && (
                            <p className="text-muted-foreground">{brand.latestElevatorPitch}</p>
                        )}
                    </div>

                    {/* Logo Display */}
                    <Card className="p-12 mb-8">
                        <div className="relative w-full aspect-square max-w-2xl mx-auto">
                            <Image
                                src={logo.logoUrl}
                                alt={`${brand.latestName} logo`}
                                fill
                                className="object-contain"
                                unoptimized={logo.logoUrl.startsWith('data:')}
                                priority
                            />
                        </div>
                    </Card>

                    {/* Color Versions */}
                    {logo.colorVersions && logo.colorVersions.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Color Versions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {logo.colorVersions.map((version, index) => (
                                    <Card key={index} className="p-8">
                                        <div className="relative w-full aspect-square mb-4">
                                            <Image
                                                src={version.colorLogoUrl}
                                                alt={`${brand.latestName} color logo ${index + 1}`}
                                                fill
                                                className="object-contain"
                                                unoptimized={version.colorLogoUrl.startsWith('data:')}
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            {version.palette.map((color, colorIndex) => (
                                                <div
                                                    key={colorIndex}
                                                    className="w-8 h-8 rounded-full border-2 border-border"
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Critique */}
                    {logo.critique && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Design Critique</h2>
                            <Card className="p-6">
                                <p className="text-muted-foreground mb-4">{logo.critique.overallSummary}</p>
                                <div className="space-y-2">
                                    {logo.critique.points.map((point, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg ${point.sentiment === 'positive' ? 'bg-green-50' : 'bg-red-50'
                                                }`}
                                        >
                                            <p className="text-sm">{point.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
