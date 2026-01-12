import { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Manage your brand identities and logo generations',
    openGraph: {
        title: 'Dashboard | Colater',
        description: 'Manage your brand identities and logo generations',
        images: ['https://colater.ai/og-image.png'],
    },
    twitter: {
        title: 'Dashboard | Colater',
        description: 'Manage your brand identities and logo generations',
        images: ['https://colater.ai/og-image.png'],
    },
};

export default function Dashboard() {
    return <DashboardClient />;
}
