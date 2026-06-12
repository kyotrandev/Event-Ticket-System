'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover } from '@base-ui/react/popover';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { notificationApi } from '@/lib/api';
import {
  getNotificationActionLabel,
  getNotificationDisplayTitle,
  getNotificationHref,
} from '@/lib/notification-config';
import type { AppNotification } from '@/lib/types';

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const page = await notificationApi.findMine();
      const notifs = page.data ?? [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    void fetchNotifications();
  }, [user, fetchNotifications]);

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const notification = (e as CustomEvent<AppNotification>).detail;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener('new_notification', handleNewNotification);
    return () =>
      window.removeEventListener('new_notification', handleNewNotification);
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    const href = getNotificationHref(notif);
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
      } catch {
        // navigation still works if mark-read fails
      }
    }
    setIsOpen(false);
    if (href) router.push(href);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black">
        <Bell className="w-5 h-5 text-neutral-600" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
            />
          )}
        </AnimatePresence>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={8} className="z-50">
          <Popover.Popup className="w-80 sm:w-96 rounded-2xl bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] p-4 focus:outline-none origin-top-right">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg tracking-tight">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-neutral-500 hover:text-black font-medium transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  You have no notifications yet.
                </div>
              ) : (
                notifications.map((notif, i) => {
                  const href = getNotificationHref(notif);
                  const clickable = Boolean(href);

                  return (
                    <motion.button
                      key={notif.id || i}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      disabled={!clickable}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl transition-colors',
                        notif.isRead ? 'bg-transparent' : 'bg-neutral-50',
                        clickable &&
                          'hover:bg-neutral-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                        !clickable && 'cursor-default',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-semibold truncate">
                              {getNotificationDisplayTitle(notif)}
                            </h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                            {notif.content}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-neutral-400">
                            <span>{formatRelativeTime(notif.createdAt)}</span>
                            {clickable && (
                              <span className="inline-flex items-center gap-0.5 font-medium text-primary">
                                {getNotificationActionLabel(notif)}
                                <ChevronRight className="size-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
