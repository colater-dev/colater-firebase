import { Metadata } from 'next';
import { StartFromImageClient } from './start-from-image-client';

export const metadata: Metadata = {
    title: 'Start from Image',
    description: 'Create a brand identity starting from your own logo image',
};

export default function StartFromImagePage() {
    return <StartFromImageClient />;
}
