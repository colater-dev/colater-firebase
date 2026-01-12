import { Metadata } from 'next';
import { StartFromImageClient } from './start-from-image-client';

export const metadata: Metadata = {
    title: 'Start from Image',
    description: 'Create a professional brand identity starting from your own logo image',
    openGraph: {
        title: 'Start from Image | Colater',
        description: 'Create a professional brand identity starting from your own logo image',
        images: ['https://colater.ai/og-image.png'],
    },
    twitter: {
        title: 'Start from Image | Colater',
        description: 'Create a professional brand identity starting from your own logo image',
        images: ['https://colater.ai/og-image.png'],
    },
};

export default function StartFromImagePage() {
    return <StartFromImageClient />;
}
