import { useCallback, useEffect, useState } from 'react';

export function usePushNotifications() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => isSupported ? Notification.permission : 'unsupported');

  useEffect(() => {
    if (isSupported) setPermission(Notification.permission);
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) throw new Error('Notifications are not supported by this browser');
    setPermission(await Notification.requestPermission());
  }, [isSupported]);

  const canNotify = isSupported && permission === 'granted';
  return { permission, isSupported, isSubscribed: canNotify, requestPermission, canNotify };
}
