
import { Metadata } from 'next';
import { LandingPageClient } from './landing-page-client';

export const metadata: Metadata = {
  title: 'Design Your Brand Identity in Seconds',
  description: 'AI-powered logo generation, vector exports, and instant mockups. The all-in-one tool for modern brands.',
  openGraph: {
    title: 'Design Your Brand Identity in Seconds | Colater',
    description: 'AI-powered logo generation, vector exports, and instant mockups. The all-in-one tool for modern brands.',
    images: ['https://colater.ai/og-image.png'],
  },
  twitter: {
    title: 'Design Your Brand Identity in Seconds | Colater',
    description: 'AI-powered logo generation, vector exports, and instant mockups. The all-in-one tool for modern brands.',
    images: ['https://colater.ai/og-image.png'],
  },
};

export default function Home() {
  return <LandingPageClient />;
}
