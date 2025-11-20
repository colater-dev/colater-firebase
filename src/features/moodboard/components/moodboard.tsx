import { MoodboardCard } from "./moodboard-card";

export function Moodboard() {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Moodboard</h1>
                <p className="text-muted-foreground">Manage your visual styles and inspirations.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <MoodboardCard />
                {/* Future cards can go here */}
            </div>
        </div>
    );
}
