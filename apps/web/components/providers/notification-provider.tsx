'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getWsBaseUrl, tokenStore } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { showNotificationToast } from '@/lib/notification-config';
import type { AppNotification } from '@/lib/types';
import { toast } from 'sonner';

interface NotificationContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(NotificationContext);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = tokenStore.get();
    if (!user || !token) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const newSocket = io(getWsBaseUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Notification socket connect error:', err.message);
      setIsConnected(false);
    });

    newSocket.on('notification', (notification: AppNotification) => {
      showNotificationToast(notification);
    });

    newSocket.on(
      'CHECKIN_UPDATE',
      (data: { attendeeName: string; ticketCode: string }) => {
        toast('New check-in', {
          description: `${data.attendeeName} scanned ticket ${data.ticketCode}`,
        });
        window.dispatchEvent(
          new CustomEvent('checkin_update', { detail: data }),
        );
      },
    );

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{ socket, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
}
