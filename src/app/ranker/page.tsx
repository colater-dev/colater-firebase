import { RankerClient } from './ranker-client';

export const metadata = {
    title: 'Logo Ranker | Colater',
    description: 'Rate and review your generated logos to improve AI prompts.',
};

export default function RankerPage() {
    return <RankerClient />;
}
