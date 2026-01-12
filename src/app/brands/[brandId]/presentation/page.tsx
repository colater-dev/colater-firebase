import { Metadata } from 'next';
import { PresentationClient } from './presentation-client';

export const metadata: Metadata = {
    title: 'Brand Presentation | Colater',
    description: 'View your brand presentation',
};

export default function PresentationPage() {
    return <PresentationClient />;
}
