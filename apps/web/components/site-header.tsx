'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket } from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth-context';
import { RoleId } from '@/lib/types';
import { Button, buttonVariants } from '@/components/ui/button';

export function SiteHeader() {
  const { user, loading, logout, isRole } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-gray-900 bg-white shadow-sm">
      <div className="mx-auto flex h-[80px] max-w-[1400px] items-center justify-between px-6 sm:px-12">
        <Link href="/" className="flex items-center gap-3 group">
          <Ticket weight="fill" className="size-8 text-primary transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
          <span className="text-3xl font-heading tracking-tight text-gray-900 leading-none">EventTix</span>
        </Link>

        <nav className="flex items-center gap-2 font-mono text-sm tracking-tight text-gray-900">
          <Link
            href="/events"
            className={`${buttonVariants({ variant: 'ghost', size: 'sm' })} hover:text-primary transition-colors`}
          >
            Browse events
          </Link>

          {isRole(RoleId.Organizer) && (
            <Link
              href="/organizer/events"
              className={`${buttonVariants({ variant: 'ghost', size: 'sm' })} hover:text-primary transition-colors`}
            >
              My events
            </Link>
          )}
          {isRole(RoleId.Admin) && (
            <Link
              href="/admin/users"
              className={`${buttonVariants({ variant: 'ghost', size: 'sm' })} hover:text-primary transition-colors`}
            >
              Admin
            </Link>
          )}

          {loading ? null : user ? (
            <>
              <Link
                href="/my-tickets"
                className={`${buttonVariants({ variant: 'ghost', size: 'sm' })} hover:text-primary transition-colors`}
              >
                My tickets
              </Link>
              <span className="text-gray-500 hidden sm:inline ml-2 mr-4">
                {user.firstName ?? user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="font-mono border-2 border-gray-900 text-gray-900 hover:bg-gray-100">
                Log out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4 ml-4">
              <Link
                href="/login"
                className="font-mono hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4"
              >
                Log in
              </Link>
              <Link 
                href="/register" 
                className={`${buttonVariants({ size: 'sm' })} font-mono !bg-primary !text-white hover:bg-blue-600 border-2 border-transparent shadow-[4px_4px_0px_rgba(17,24,39,1)] transition-all active:translate-y-1 active:translate-x-1 active:shadow-none hover:shadow-[2px_2px_0px_rgba(17,24,39,1)] hover:translate-y-[2px] hover:translate-x-[2px]`}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
