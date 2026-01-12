import { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
    title: 'My Brands',
    description: 'Manage your brand identities and logo generations',
};

export default function Dashboard() {
    return <DashboardClient />;
}
