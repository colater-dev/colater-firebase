import { Metadata } from 'next';
import { NewBrandClient } from './new-brand-client';

export const metadata: Metadata = {
  title: 'Create New Brand',
  description: 'Design a new brand identity with AI',
};

export default function NewBrandPage() {
  return <NewBrandClient />;
}
