'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { ticketApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Ticket } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

function getLocation(loc: string | undefined) {
  if (!loc) return 'Unknown Location';
  try {
    const parsed = JSON.parse(loc);
    return parsed.address || loc;
  } catch {
    return loc;
  }
}

function statusVariant(
  s: Ticket['status'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (s === 'issued') return 'default';
  if (s === 'used') return 'secondary';
  return 'destructive';
}

function QrImage({ code }: { code: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const fetched = useRef(false);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    ticketApi
      .getQrBlob(code)
      .then((url) => { blobRef.current = url; setSrc(url); })
      .catch(() => setErr(true));
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, [code]);

  if (err) return <p className="text-muted-foreground text-xs">QR unavailable</p>;
  if (!src) return <div className="size-24 animate-pulse rounded bg-muted" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="QR code" className="size-24 rounded" />;
}

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/login'); return; }

    ticketApi
      .findMine()
      .then(setTickets)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const eventName = t.bookingItem?.ticketType?.event?.name?.toLowerCase() || '';
        const code = t.code.toLowerCase();
        if (!eventName.includes(q) && !code.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, searchQuery, statusFilter]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="size-12 rounded-full bg-muted" />
          <p className="text-muted-foreground font-medium">Loading your tickets…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <TicketIcon className="size-8 text-primary" />
          My Tickets
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">Manage and view your purchased event tickets.</p>
      </div>

      {tickets.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-muted/30 p-4 rounded-3xl border border-border/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input 
              placeholder="Search by event name or ticket code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 !h-14 rounded-2xl border-2 border-b-4 border-border focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:bg-muted/50 transition-colors text-lg bg-background"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 !h-14 rounded-2xl border-2 border-b-4 border-border shadow-sm bg-background px-4 hover:bg-muted/50 transition-colors focus:ring-2 focus:ring-primary text-lg font-medium">
              <SelectValue placeholder="All Status">
                {statusFilter === 'issued' ? 'Issued' :
                 statusFilter === 'used' ? 'Used' :
                 statusFilter === 'cancelled' ? 'Cancelled' :
                 'All Status'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-20 px-4 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
          <div className="bg-white size-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
            <TicketIcon className="size-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">No tickets yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">You haven't purchased any tickets yet. Browse upcoming events to get started.</p>
          <Link href="/events" className={buttonVariants({ className: "rounded-2xl !h-12 px-8 font-bold text-base" })}>
            Browse events
          </Link>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-medium text-lg">No tickets match your search.</p>
          <button 
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            className="mt-4 text-primary font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTickets.map((t) => (
            <Link key={t.id} href={`/my-tickets/${t.code}`} className="block group">
              <Card className="overflow-hidden border-2 border-b-4 border-border rounded-3xl shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md bg-card">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Left: Info */}
                    <div className="flex-1 p-6 sm:p-8 space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 pr-4">
                          <h3 className="font-extrabold text-2xl leading-tight text-foreground group-hover:text-primary transition-colors">
                            {t.bookingItem?.ticketType?.event?.name || 'Unknown Event'}
                          </h3>
                          <p className="text-muted-foreground font-medium mt-2 flex items-center gap-1.5">
                            <MapPin className="size-4 shrink-0" />
                            <span className="line-clamp-1">{getLocation(t.bookingItem?.ticketType?.event?.location)}</span>
                          </p>
                        </div>
                        <Badge variant={statusVariant(t.status)} className="px-3 py-1.5 text-xs font-extrabold rounded-xl tracking-wider shrink-0 uppercase">
                          {t.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-4 rounded-2xl border border-border/50">
                        <div>
                          <p className="text-muted-foreground mb-1 text-[11px] uppercase tracking-widest font-bold">Event Date</p>
                          <p className="font-semibold text-foreground">
                            {t.bookingItem?.ticketType?.event?.startTime
                              ? new Date(t.bookingItem.ticketType.event.startTime).toLocaleString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                                })
                              : 'TBA'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-[11px] uppercase tracking-widest font-bold">Ticket Type</p>
                          <p className="font-semibold text-foreground">{t.bookingItem?.ticketType?.name || 'Standard'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: QR Code & ID */}
                    <div className="w-full sm:w-64 bg-muted/20 border-t sm:border-t-0 sm:border-l border-border border-dashed p-6 flex flex-col items-center justify-center shrink-0">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border mb-4 group-hover:scale-105 transition-transform duration-300">
                        <QrImage code={t.code} />
                      </div>
                      <p className="font-mono text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-wider mb-0.5 opacity-70">Ticket Code</span>
                        <span>#{t.code.split('-')[0].toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
