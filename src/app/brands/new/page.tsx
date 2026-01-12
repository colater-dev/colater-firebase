import { Metadata } from 'next';
import { NewBrandClient } from './new-brand-client';

export const metadata: Metadata = {
  title: 'Create New Brand',
  description: 'Design a new brand identity with AI',
  openGraph: {
    title: 'Create New Brand | Colater',
    description: 'Design a new brand identity with AI',
    images: ['https://colater.ai/og-image.png'],
  },
  twitter: {
    title: 'Create New Brand | Colater',
    description: 'Design a new brand identity with AI',
    images: ['https://colater.ai/og-image.png'],
  },
};

export default function NewBrandPage() {
  return <NewBrandClient />;
}
