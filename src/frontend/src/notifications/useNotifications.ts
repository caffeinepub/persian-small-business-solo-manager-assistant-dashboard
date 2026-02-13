import { useState, useEffect } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions): Notification | null => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/assets/generated/pwa-icon.dim_192x192.png',
        badge: '/assets/generated/pwa-icon.dim_192x192.png',
        dir: 'rtl',
        lang: 'fa',
        ...options,
      });

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  };

  const sendTestNotification = () => {
    return sendNotification('دستیار کسب‌وکار', {
      body: 'اعلان‌ها با موفقیت فعال شدند! شما اکنون یادآوری‌های مهم را دریافت خواهید کرد.',
      tag: 'test-notification',
    });
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    sendTestNotification,
  };
}
