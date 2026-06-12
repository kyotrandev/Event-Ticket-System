import { toast } from 'sonner';
import type { AppNotification } from './types';

/** Must stay in sync with backend `type` values. */
export type NotificationType =
  // Customer
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_AUTO_REFUNDED'
  | 'BOOKING_EXPIRED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REFUNDED'
  | 'EVENT_CANCELLED'
  | 'WAITLIST_AVAILABLE'
  | 'WAITLIST_EXPIRED'
  | 'TICKET_CHECKED_IN'
  // Organizer
  | 'ORGANIZER_APPROVED'
  | 'ORGANIZER_REJECTED'
  | 'EVENT_PUBLISHED'
  | 'NEW_BOOKING_SALE'
  | 'CHECKIN_RECEIVED'
  // Staff
  | 'STAFF_EVENT_ASSIGNED'
  | 'STAFF_EVENT_REMOVED';

type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface NotificationMeta {
  /** Fallback if backend title is missing. */
  title: string;
  actionLabel: string;
  href: (n: AppNotification) => string | null;
  toastVariant: ToastVariant;
}

const META: Record<NotificationType, NotificationMeta> = {
  // —— Customer ——
  PAYMENT_SUCCESS: {
    title: 'Payment confirmed',
    actionLabel: 'View booking',
    href: (n) =>
      n.relatedEntityId ? `/my-bookings/${n.relatedEntityId}` : '/my-bookings',
    toastVariant: 'success',
  },
  PAYMENT_FAILED: {
    title: 'Payment failed',
    actionLabel: 'Try again',
    href: (n) =>
      n.relatedEntityId
        ? `/bookings/${n.relatedEntityId}/pay`
        : '/my-bookings',
    toastVariant: 'error',
  },
  PAYMENT_AUTO_REFUNDED: {
    title: 'Refund processed',
    actionLabel: 'View booking',
    href: (n) =>
      n.relatedEntityId ? `/my-bookings/${n.relatedEntityId}` : '/my-bookings',
    toastVariant: 'info',
  },
  BOOKING_EXPIRED: {
    title: 'Booking expired',
    actionLabel: 'View bookings',
    href: (n) =>
      n.relatedEntityId ? `/my-bookings/${n.relatedEntityId}` : '/my-bookings',
    toastVariant: 'warning',
  },
  BOOKING_CANCELLED: {
    title: 'Booking cancelled',
    actionLabel: 'View bookings',
    href: (n) =>
      n.relatedEntityId ? `/my-bookings/${n.relatedEntityId}` : '/my-bookings',
    toastVariant: 'info',
  },
  BOOKING_REFUNDED: {
    title: 'Booking refunded',
    actionLabel: 'View booking',
    href: (n) =>
      n.relatedEntityId ? `/my-bookings/${n.relatedEntityId}` : '/my-bookings',
    toastVariant: 'info',
  },
  EVENT_CANCELLED: {
    title: 'Event cancelled',
    actionLabel: 'View booking & refund',
    href: (n) =>
      n.relatedEntityId ? `/my-bookings/${n.relatedEntityId}` : '/my-bookings',
    toastVariant: 'warning',
  },
  WAITLIST_AVAILABLE: {
    title: 'Ticket available',
    actionLabel: 'Book now',
    href: (n) =>
      n.relatedEntityId ? `/events/${n.relatedEntityId}` : '/my-waitlist',
    toastVariant: 'info',
  },
  WAITLIST_EXPIRED: {
    title: 'Waitlist window expired',
    actionLabel: 'View waitlist',
    href: (n) =>
      n.relatedEntityId ? `/events/${n.relatedEntityId}` : '/my-waitlist',
    toastVariant: 'warning',
  },
  TICKET_CHECKED_IN: {
    title: 'Checked in',
    actionLabel: 'View ticket',
    href: (n) =>
      n.relatedEntityId ? `/my-tickets/${n.relatedEntityId}` : '/my-tickets',
    toastVariant: 'success',
  },

  // —— Organizer ——
  ORGANIZER_APPROVED: {
    title: 'Organizer account approved',
    actionLabel: 'Create an event',
    href: () => '/organizer/events',
    toastVariant: 'success',
  },
  ORGANIZER_REJECTED: {
    title: 'Organizer application declined',
    actionLabel: 'Learn more',
    href: () => '/register/organizer',
    toastVariant: 'error',
  },
  EVENT_PUBLISHED: {
    title: 'Event is live',
    actionLabel: 'Manage event',
    href: (n) =>
      n.relatedEntityId
        ? `/organizer/events/${n.relatedEntityId}`
        : '/organizer/events',
    toastVariant: 'success',
  },
  NEW_BOOKING_SALE: {
    title: 'New ticket sale',
    actionLabel: 'View booking',
    href: (n) =>
      n.relatedEntityId
        ? `/organizer/bookings/${n.relatedEntityId}`
        : '/organizer/events',
    toastVariant: 'success',
  },
  CHECKIN_RECEIVED: {
    title: 'Guest checked in',
    actionLabel: 'Check-in dashboard',
    href: (n) =>
      n.relatedEntityId
        ? `/organizer/events/${n.relatedEntityId}/checkin`
        : '/organizer/events',
    toastVariant: 'info',
  },

  // —— Staff ——
  STAFF_EVENT_ASSIGNED: {
    title: 'Assigned to event',
    actionLabel: 'Open check-in',
    href: (n) =>
      n.relatedEntityId
        ? `/staff/dashboard/${n.relatedEntityId}`
        : '/staff/dashboard',
    toastVariant: 'info',
  },
  STAFF_EVENT_REMOVED: {
    title: 'Removed from event',
    actionLabel: 'Staff dashboard',
    href: () => '/staff/dashboard',
    toastVariant: 'warning',
  },
};

const DEFAULT_META: NotificationMeta = {
  title: 'Notification',
  actionLabel: 'View details',
  href: () => null,
  toastVariant: 'default',
};

export function getNotificationMeta(
  notification: AppNotification,
): NotificationMeta {
  const type = notification.type as NotificationType;
  return META[type] ?? DEFAULT_META;
}

export function getNotificationHref(
  notification: AppNotification,
): string | null {
  return getNotificationMeta(notification).href(notification);
}

export function getNotificationActionLabel(
  notification: AppNotification,
): string {
  return getNotificationMeta(notification).actionLabel;
}

export function getNotificationDisplayTitle(
  notification: AppNotification,
): string {
  return notification.title || getNotificationMeta(notification).title;
}

function navigateToNotification(notification: AppNotification) {
  const href = getNotificationHref(notification);
  if (href) window.location.href = href;
}

export function showNotificationToast(notification: AppNotification) {
  const meta = getNotificationMeta(notification);
  const title = getNotificationDisplayTitle(notification);
  const description = notification.content;
  const actionLabel = meta.actionLabel;
  const onAction = () => navigateToNotification(notification);

  switch (meta.toastVariant) {
    case 'success':
      toast.success(title, {
        description,
        duration: 6000,
        action: { label: actionLabel, onClick: onAction },
      });
      break;
    case 'error':
      toast.error(title, {
        description,
        duration: 8000,
        action: { label: actionLabel, onClick: onAction },
      });
      break;
    case 'warning':
      toast.warning(title, {
        description,
        duration: 8000,
        action: { label: actionLabel, onClick: onAction },
      });
      break;
    case 'info':
      toast.info(title, {
        description,
        duration: 8000,
        action: { label: actionLabel, onClick: onAction },
      });
      break;
    default:
      toast(title, {
        description,
        duration: 6000,
        action: { label: actionLabel, onClick: onAction },
      });
  }

  window.dispatchEvent(
    new CustomEvent('new_notification', { detail: notification }),
  );
}
