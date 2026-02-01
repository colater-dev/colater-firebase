import { Metadata } from 'next';
import CreditsClient from './credits-client';

export const metadata: Metadata = {
  title: 'Credits',
  description: 'Buy credits to power your AI brand generation',
};

export default function CreditsPage() {
  return <CreditsClient />;
}
