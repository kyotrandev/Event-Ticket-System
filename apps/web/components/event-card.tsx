import Link from 'next/link';
import { CalendarBlank, MapPin } from '@phosphor-icons/react';
import type { EventModel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function EventCard({ event }: { event: EventModel }) {
  let displayLocation = event.location;
  try {
    const parsed = JSON.parse(event.location);
    if (parsed.address) {
      displayLocation = parsed.address;
    }
  } catch {
    // Ignore, keep raw string
  }

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card className="h-full overflow-hidden rounded-none border-2 border-gray-900 bg-white transition-all duration-300 shadow-[4px_4px_0px_rgba(17,24,39,1)] hover:shadow-[6px_6px_0px_rgba(17,24,39,1)] hover:-translate-y-1 hover:-translate-x-1 active:translate-y-1 active:translate-x-1 active:shadow-none flex flex-col">
        
        {/* Banner Section */}
        <div className="bg-gray-100 aspect-[4/3] w-full overflow-hidden relative border-b-2 border-gray-900">
          {event.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.bannerUrl}
              alt={event.name}
              className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-blue-50 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #3B82F6 25%, transparent 25%, transparent 75%, #3B82F6 75%, #3B82F6)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold relative z-10 bg-white px-2 py-1 border-2 border-gray-900">No Image</span>
            </div>
          )}
          
          {/* Status Badge */}
          {event.status === 'ongoing' && (
            <div className="absolute top-4 right-4 border-2 border-gray-900 bg-success text-white font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 shadow-[2px_2px_0px_rgba(17,24,39,1)]">
              Live
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardHeader className="p-6 flex-1 bg-white">
          <div className="mb-4 inline-block border-2 border-gray-900 bg-gray-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-900">
            {event.category}
          </div>
          <CardTitle className="line-clamp-2 font-heading text-2xl leading-tight text-gray-900 group-hover:text-primary transition-colors">
            {event.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 mt-auto bg-white">
          <div className="border-t-2 border-gray-100 pt-4 font-mono text-xs text-gray-600 space-y-3">
            <p className="flex items-start gap-3">
              <CalendarBlank weight="bold" className="size-4 shrink-0 text-gray-900 mt-0.5" />
              <span className="font-medium text-gray-800">{formatDateTime(event.startTime)}</span>
            </p>
            <p className="flex items-start gap-3">
              <MapPin weight="bold" className="size-4 shrink-0 text-gray-900 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed">{displayLocation}</span>
            </p>
          </div>
        </CardContent>

      </Card>
    </Link>
  );
}
