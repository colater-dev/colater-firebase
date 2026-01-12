import { Metadata } from 'next';
import { PresentationClient } from './presentation-client';

export const metadata: Metadata = {
    title: 'Brand Presentation',
    description: 'View your professional brand identity presentation',
    openGraph: {
        title: 'Brand Presentation | Colater',
        description: 'View your professional brand identity presentation',
        images: ['https://colater.ai/og-image.png'],
    },
    twitter: {
        title: 'Brand Presentation | Colater',
        description: 'View your professional brand identity presentation',
        images: ['https://colater.ai/og-image.png'],
    },
};

export default function PresentationPage() {
    return <PresentationClient />;
}
