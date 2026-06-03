'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { EventModel, Paginated } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 12;

export default function EventsPage() {
  const [events, setEvents] = useState<EventModel[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Committed filters that actually drive the query (form state is separate).
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState({ keyword: '', category: '' });

  // Refetch whenever page or committed filters change. State updates live in
  // the async closure, off the effect body.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await api.get<Paginated<EventModel>>(
          '/events',
          {
            page,
            limit: PAGE_SIZE,
            keyword: search.keyword || undefined,
            category: search.category || undefined,
          },
          false,
        );
        if (cancelled) return;
        setError(null);
        setEvents(res.data);
        setHasNextPage(res.hasNextPage);
      } catch {
        if (!cancelled) setError('Could not load events. Is the API running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch({ keyword, category });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Browse events</h1>

      <form
        onSubmit={onSearch}
        className="mb-8 flex flex-col gap-3 sm:flex-row"
      >
        <Input
          placeholder="Search by name or description…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Input
          placeholder="Category"
          className="sm:max-w-[200px]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Button type="submit">
          <Search className="size-4" />
          Search
        </Button>
      </form>

      {loading ? (
        <p className="text-muted-foreground">Loading events…</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-muted-foreground">
          No events found. Try a different search.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!loading && !error && (page > 1 || hasNextPage) && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">Page {page}</span>
          <Button
            variant="outline"
            disabled={!hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
