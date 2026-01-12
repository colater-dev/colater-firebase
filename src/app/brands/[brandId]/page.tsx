import { Metadata } from 'next';
import { BrandDetailClient } from './brand-detail-client';

type Props = {
  params: Promise<{ brandId: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const brandId = (await params).brandId;

  // For now, since we don't have server-side Firestore setup for private brands easily,
  // we'll return a placeholder that includes the ID. 
  // Once made public, this could be updated to fetch the real name.
  return {
    title: 'Brand Identity',
    description: 'Design and manage your brand identity',
  };
}

export default function BrandPage() {
  return <BrandDetailClient />;
}
