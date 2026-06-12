'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { EventModel, Paginated } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE = 12;

const PREDEFINED_CATEGORIES = [
  'Music',
  'Technology',
  'Arts',
  'Sports',
  'Food & Drink',
  'Business',
  'Health & Wellness',
  'Comedy',
];

function CategoryMultiSelect({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedArray = selected ? selected.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggleCategory = (cat: string) => {
    if (selectedArray.includes(cat)) {
      onChange(selectedArray.filter(c => c !== cat).join(','));
    } else {
      onChange([...selectedArray, cat].join(','));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.category-multi-select')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative category-multi-select w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-14 w-full items-center justify-between rounded-2xl border-2 border-b-4 border-border bg-background px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:bg-muted/50 transition-colors"
      >
        <span className={selectedArray.length === 0 ? "text-muted-foreground" : "text-foreground truncate font-medium"}>
          {selectedArray.length === 0 
            ? "Any Category" 
            : `Categories (${selectedArray.length})`}
        </span>
        <svg className="h-5 w-5 text-muted-foreground shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full md:w-64 z-50 rounded-xl border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95">
          <div className="max-h-60 overflow-y-auto pr-1">
            {PREDEFINED_CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center gap-3 px-2 py-2.5 hover:bg-muted/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedArray.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="size-5 rounded border-border text-primary focus:ring-primary accent-primary"
                />
                <span className="text-base font-medium">{cat}</span>
              </label>
            ))}
          </div>
          {selectedArray.length > 0 && (
            <div className="pt-2 mt-2 border-t px-2">
              <button 
                type="button" 
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full text-center text-sm font-semibold text-primary py-2 hover:bg-primary/10 rounded-md transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventModel[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Committed filters that actually drive the query (form state is separate).
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState({ keyword: '', category: '', dateFrom: '', dateTo: '', status: '' });

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
            dateFrom: search.dateFrom ? new Date(search.dateFrom).toISOString() : undefined,
            dateTo: search.dateTo ? new Date(search.dateTo).toISOString() : undefined,
            status: search.status || undefined,
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
        if (cancelled) return;
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  // Auto-search (debounced) when typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      setSearch({ keyword, category, dateFrom, dateTo, status });
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword, category, dateFrom, dateTo, status]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch({ keyword, category, dateFrom, dateTo, status });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          Browse Events
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Find exactly what you&apos;re looking for, fast!
        </p>
      </div>

      <form
        onSubmit={onSearch}
        className="mb-12 flex flex-col gap-4 p-6 bg-muted/50 rounded-3xl"
      >
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Input
            placeholder="Search by name or description…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="!h-14 text-lg rounded-2xl border-2 border-b-4 border-border focus-visible:ring-2 focus-visible:ring-primary shadow-sm flex-1 w-full px-4 hover:bg-muted/50 transition-colors bg-background"
          />
          <Button type="submit" size="lg" className="h-14 text-lg rounded-2xl px-8 shadow-sm w-full sm:w-auto">
            <Search className="size-5 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
          <CategoryMultiSelect selected={category} onChange={setCategory} />
          
          <Select value={status || "all"} onValueChange={(val) => setStatus(val === "all" ? "" : val)}>
            <SelectTrigger className="!h-14 w-full text-lg rounded-2xl border-2 border-b-4 border-border shadow-sm bg-background px-4 py-2 hover:bg-muted/50 transition-colors focus:ring-2 focus:ring-primary focus:outline-none">
              <SelectValue placeholder="Any Status">
                {status === "published" ? "Upcoming" :
                 status === "ongoing" ? "Live Now" :
                 status === "ended" ? "Ended" :
                 status === "cancelled" ? "Cancelled" :
                 "Any Status"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="published">Upcoming</SelectItem>
              <SelectItem value="ongoing">Live Now</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            className="!h-14 w-full text-lg rounded-2xl border-2 border-b-4 border-border focus-visible:ring-2 focus-visible:ring-primary shadow-sm px-4 hover:bg-muted/50 transition-colors bg-background"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="Events starting on or after this date"
          />
          <Input
            type="date"
            className="!h-14 w-full text-lg rounded-2xl border-2 border-b-4 border-border focus-visible:ring-2 focus-visible:ring-primary shadow-sm px-4 hover:bg-muted/50 transition-colors bg-background"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="Events ending on or before this date"
          />
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-12"></div>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-danger/10 text-danger font-bold text-lg text-center border-2 border-danger/20">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-2xl font-bold text-foreground mb-2">Oops! No results found.</p>
          <p className="text-muted-foreground font-medium text-lg">Try adjusting your search to find more magic.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <div key={event.id} className="animate-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (page > 1 || hasNextPage) && (
        <div className="mt-16 flex items-center justify-center gap-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-32 rounded-full"
          >
            Previous
          </Button>
          <span className="font-bold text-lg text-muted-foreground">
            Page {page}
          </span>
          <Button
            variant="outline"
            disabled={!hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="w-32 rounded-full"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
