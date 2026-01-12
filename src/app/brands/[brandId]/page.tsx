import { Metadata } from 'next';
import { BrandDetailClient } from './brand-detail-client';

type Props = {
  params: Promise<{ brandId: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const brandId = (await params).brandId;

  return {
    title: 'Brand Identity',
    description: 'Design and manage your brand identity',
    openGraph: {
      title: 'Brand Identity | Colater',
      description: 'Design and manage your brand identity',
      images: ['https://colater.ai/og-image.png'],
    },
    twitter: {
      title: 'Brand Identity | Colater',
      description: 'Design and manage your brand identity',
      images: ['https://colater.ai/og-image.png'],
    },
  };
}

export default function BrandPage() {
  return <BrandDetailClient />;
}
