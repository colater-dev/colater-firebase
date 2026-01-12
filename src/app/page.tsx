
import { Metadata } from 'next';
import { HomeClient } from './home-client';

export const metadata: Metadata = {
  title: 'Design Your Brand Identity in Seconds',
  description: 'AI-powered logo generation, vector exports, and instant mockups. The all-in-one tool for modern brands.',
};

export default function Home() {
  return <HomeClient />;
}
