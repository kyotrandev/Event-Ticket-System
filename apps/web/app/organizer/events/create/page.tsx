'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { organizerApi, fileApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationPicker } from '@/components/LocationPicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, MapPin, Image as ImageIcon, FileText } from 'lucide-react';

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Please select at least one category'),
  tags: z.array(z.string()).optional(),
  startTime: z.string().min(1, 'Start time is required').refine((val) => new Date(val) > new Date(), {
    message: 'Start time must be in the future',
  }),
  endTime: z.string().min(1, 'End time is required'),
  maxTicketsPerOrder: z.coerce.number().min(1).max(10),
  cancellationWindowHours: z.coerce.number().min(0),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      category: '',
      tags: [],
      startTime: '',
      endTime: '',
      maxTicketsPerOrder: 5,
      cancellationWindowHours: 24,
    },
  });

  const locationValue = watch('location');
  const tagsValue = watch('tags') || [];
  const [tagInput, setTagInput] = useState('');

  const SUGGESTED_TAGS = ['Music', 'Film & Cinema', 'Food & Drink', 'Technology & AI', 'Business', 'Arts & Culture', 'Sports', 'Education', 'Networking'];

  const toggleTag = (tag: string) => {
    const newTags = tagsValue.includes(tag) ? tagsValue.filter(t => t !== tag) : [...tagsValue, tag];
    setValue('tags', newTags);
    setValue('category', newTags[0] || '', { shouldValidate: true });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tagsValue.includes(val)) {
        const newTags = [...tagsValue, val];
        setValue('tags', newTags);
        setValue('category', newTags[0] || '', { shouldValidate: true });
      }
      setTagInput('');
    }
  };

  async function onSubmit(data: EventFormValues) {
    setLoading(true);
    setError(null);
    try {
      let uploadedBannerUrl: string | undefined = undefined;
      if (bannerFile) {
        const uploadRes = await fileApi.upload(bannerFile);
        uploadedBannerUrl = uploadRes.file.path;
      }

      const payload = {
        ...data,
        ...(uploadedBannerUrl ? { bannerUrl: uploadedBannerUrl } : {}),
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      };
      
      await organizerApi.createEvent(payload);
      router.push('/organizer/events');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/organizer/events" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to Events
        </Link>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Create new event</h1>
        <p className="text-muted-foreground font-medium text-lg">Set up your event details, location, and ticketing rules.</p>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-destructive/50 bg-destructive/10 text-destructive p-4 text-sm font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 pb-20">
        
        {/* Basic Info */}
        <Card className="rounded-3xl border-2 border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b-2 border-border pb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Basic details</CardTitle>
            </div>
            <CardDescription className="font-medium">The essential information about your event.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Event Name</Label>
                <Input id="name" {...register('name')} className="h-12 rounded-2xl text-lg font-bold" placeholder="e.g. Saigon Street Food Festival" />
                {errors.name && <p className="text-sm text-destructive font-bold">{errors.name.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[120px] w-full rounded-2xl border-2 border-gray-900 shadow-[4px_4px_0px_rgba(17,24,39,1)] bg-white px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:translate-y-[4px] focus-visible:translate-x-[4px] focus-visible:shadow-none disabled:cursor-not-allowed disabled:opacity-50 resize-y md:text-sm"
                  placeholder="Tell people what makes this event special..."
                  {...register('description')}
                />
              </div>

              <div className="space-y-4 md:col-span-2 pt-4 border-t-2 border-border border-dashed">
                <div className="space-y-1">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categories & Tags</Label>
                  <p className="text-xs text-muted-foreground font-medium">Select predefined categories or type your own. The first one will be your primary category.</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map(tag => {
                    const isSelected = tagsValue.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-[2px_2px_0px_rgba(17,24,39,1)]'
                            : 'bg-white border-border text-muted-foreground hover:border-gray-900 hover:text-foreground hover:shadow-[2px_2px_0px_rgba(17,24,39,1)]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-2 rounded-2xl border-2 border-border focus-within:border-gray-900 focus-within:shadow-[4px_4px_0px_rgba(17,24,39,1)] transition-all">
                  {tagsValue.filter(t => !SUGGESTED_TAGS.includes(t)).map(tag => (
                    <div key={tag} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      {tag}
                      <button type="button" onClick={() => toggleTag(tag)} className="opacity-70 hover:opacity-100 hover:text-red-400 transition-colors">
                        &times;
                      </button>
                    </div>
                  ))}
                  <Input 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a custom tag & press Enter..."
                    className="h-10 min-w-[250px] flex-1 border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:translate-x-0 focus-visible:translate-y-0 px-2"
                  />
                </div>
                {errors.category && <p className="text-sm text-destructive font-bold">{errors.category.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Map */}
        <Card className="rounded-3xl border-2 border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b-2 border-border pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <CardTitle>Location</CardTitle>
            </div>
            <CardDescription className="font-medium">Where is it happening?</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <LocationPicker 
                value={locationValue} 
                onChange={(val) => setValue('location', val, { shouldValidate: true })} 
              />
              {errors.location && <p className="text-sm text-destructive font-bold">{errors.location.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="rounded-3xl border-2 border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b-2 border-border pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle>Date and Time</CardTitle>
            </div>
            <CardDescription className="font-medium">When does the event start and end?</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Start Time</Label>
                <Input id="startTime" type="datetime-local" {...register('startTime')} className="h-12 rounded-2xl font-medium" />
                {errors.startTime && <p className="text-sm text-destructive font-bold">{errors.startTime.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">End Time</Label>
                <Input id="endTime" type="datetime-local" {...register('endTime')} className="h-12 rounded-2xl font-medium" />
                {errors.endTime && <p className="text-sm text-destructive font-bold">{errors.endTime.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticketing Rules & Media */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <Card className="rounded-3xl border-2 border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b-2 border-border pb-4">
              <CardTitle>Ticketing rules</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxTickets" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Max Tickets / Order</Label>
                <Input id="maxTickets" type="number" {...register('maxTicketsPerOrder')} className="h-12 rounded-2xl font-medium" />
                {errors.maxTicketsPerOrder && <p className="text-sm text-destructive font-bold">{errors.maxTicketsPerOrder.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancelWindow" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cancel Window (Hours)</Label>
                <Input id="cancelWindow" type="number" {...register('cancellationWindowHours')} className="h-12 rounded-2xl font-medium" />
                {errors.cancellationWindowHours && <p className="text-sm text-destructive font-bold">{errors.cancellationWindowHours.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b-2 border-border pb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <CardTitle>Banner Image</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="banner" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Upload Image</Label>
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="h-12 rounded-2xl font-medium file:bg-transparent file:text-foreground file:font-bold file:border-0 file:mr-4 pt-2.5 cursor-pointer"
                />
                {bannerFile && (
                  <div className="mt-4 rounded-2xl overflow-hidden border-2 border-border w-full relative aspect-video shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(bannerFile)}
                      alt="Banner preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-4 z-10 pt-4">
          <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-lg font-extrabold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(88,204,2,0.3)] transition-all">
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
