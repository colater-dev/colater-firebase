import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] text-center gap-4">
      <div className="text-6xl font-bold text-muted-foreground/30">404</div>
      <div>
        <h2 className="font-semibold text-lg">Page not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
