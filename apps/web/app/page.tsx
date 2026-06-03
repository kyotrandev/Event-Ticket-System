import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
  return (
    <section className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Find your next event.
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-lg">
        Discover concerts, conferences and workshops — book tickets in seconds
        and get a QR pass straight to your inbox.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/events" className={buttonVariants({ size: 'lg' })}>
          Browse events
        </Link>
        <Link
          href="/register"
          className={buttonVariants({ size: 'lg', variant: 'outline' })}
        >
          Become an organizer
        </Link>
      </div>
    </section>
  );
}
