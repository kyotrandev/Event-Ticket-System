'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { motion } from 'motion/react';
import { ArrowRight, Ticket, CalendarBlank, MapPin } from '@phosphor-icons/react';

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: [0.23, 1, 0.32, 1], duration: 0.6 } },
  };

  return (
    <div className="min-h-[100dvh] bg-surface relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-12 pt-24 pb-24 md:pt-32 lg:pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <motion.div 
            className="lg:col-span-7 flex flex-col gap-10"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="inline-flex">
              <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold border-2 border-primary px-3 py-1 bg-blue-50">
                Ticket Protocol v2.0
              </span>
            </motion.div>

            <motion.h1 variants={item} className="text-6xl md:text-7xl lg:text-[84px] font-heading tracking-tight leading-[0.95] text-gray-900">
              Curated <br/>
              <span className="text-secondary italic">Experiences,</span><br/>
              Delivered.
            </motion.h1>
            
            <motion.p variants={item} className="font-mono text-sm md:text-base text-gray-600 max-w-[45ch] leading-relaxed">
              The high-contrast ticketing platform for modern events. Seamlessly manage inventory, check-in guests, and drop tickets with zero friction.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-6 mt-4">
              <Link 
                href="/events" 
                className={`${buttonVariants({ size: 'lg' })} !bg-primary !text-white font-mono uppercase text-sm tracking-wide h-14 px-8 border-2 border-transparent shadow-[6px_6px_0px_rgba(17,24,39,1)] transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none hover:shadow-[3px_3px_0px_rgba(17,24,39,1)] hover:translate-y-[3px] hover:translate-x-[3px] flex items-center justify-center gap-3 group`}
              >
                Browse Events
                <ArrowRight weight="bold" className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/register"
                className={`${buttonVariants({ size: 'lg', variant: 'outline' })} bg-white text-gray-900 font-mono uppercase text-sm tracking-wide h-14 px-8 border-2 !border-gray-900 shadow-[6px_6px_0px_rgba(17,24,39,0.1)] transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none hover:shadow-[3px_3px_0px_rgba(17,24,39,0.1)] hover:translate-y-[3px] hover:translate-x-[3px] flex items-center justify-center`}
              >
                Become an Organizer
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Abstract Art / Bento Composition */}
          <motion.div 
            className="lg:col-span-5 relative mt-8 lg:mt-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: [0.23, 1, 0.32, 1], duration: 1, delay: 0.2 }}
          >
            <div className="relative aspect-[4/5] w-full max-w-[500px] mx-auto group">
              {/* Decorative shapes behind */}
              <div className="absolute top-4 -right-4 w-full h-full bg-secondary border-2 border-gray-900 shadow-[8px_8px_0px_rgba(17,24,39,1)]" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-warning rounded-full border-2 border-gray-900 shadow-[4px_4px_0px_rgba(17,24,39,1)] z-20 group-hover:-translate-y-4 group-hover:translate-x-4 transition-transform duration-700 ease-out" />
              
              {/* Main Card */}
              <div className="relative z-10 w-full h-full bg-white border-2 border-gray-900 p-8 flex flex-col justify-between overflow-hidden group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500 ease-out">
                {/* Diagonal stripes overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #111827 25%, transparent 25%, transparent 75%, #111827 75%, #111827), repeating-linear-gradient(45deg, #111827 25%, #ffffff 25%, #ffffff 75%, #111827 75%, #111827)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />

                <div className="relative z-10">
                  <div className="font-mono text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest border-b-2 border-gray-200 pb-2">Upcoming</div>
                  <h3 className="font-heading text-4xl text-gray-900 leading-tight">Art + Tech <br/>Symposium 2026</h3>
                </div>

                <div className="relative z-10 bg-gray-50 border-2 border-gray-900 p-4 font-mono text-sm space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
                    <span className="text-gray-500 flex items-center gap-2"><CalendarBlank weight="bold" /> Date</span>
                    <span className="font-bold text-gray-900">Oct 24, 2026</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-2"><MapPin weight="bold" /> Venue</span>
                    <span className="font-bold text-gray-900">The Gallery</span>
                  </div>
                </div>

                {/* Decorative sticker */}
                <div className="absolute top-8 right-8 w-16 h-16 bg-danger rounded-full border-2 border-gray-900 flex items-center justify-center text-white font-mono font-bold text-xs -rotate-12 shadow-[2px_2px_0px_rgba(17,24,39,1)]">
                  SOLD OUT
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
