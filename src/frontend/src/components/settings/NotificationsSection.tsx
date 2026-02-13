import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotifications } from '../../notifications/useNotifications';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';
import { fa } from '../../lib/fa';
import { toast } from 'sonner';

export default function NotificationsSection() {
  const { permission, isSupported, requestPermission, sendTestNotification } = useNotifications();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      toast.success(fa.notificationPermissionGranted);
    } else if (result === 'denied') {
      toast.error(fa.notificationPermissionDenied);
    }
  };

  const handleTestNotification = () => {
    const notification = sendTestNotification();
    if (notification) {
      toast.success(fa.testNotificationSent);
    } else {
      toast.error(fa.notificationError);
    }
  };

  if (!isSupported) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{fa.notificationsNotSupported}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {permission === 'granted' ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : permission === 'denied' ? (
            <BellOff className="h-5 w-5 text-destructive" />
          ) : (
            <Bell className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">{fa.notificationStatus}</p>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted' && fa.notificationEnabled}
              {permission === 'denied' && fa.notificationBlocked}
              {permission === 'default' && fa.notificationNotRequested}
            </p>
          </div>
        </div>
      </div>

      {permission === 'denied' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fa.notificationBlockedHelp}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        {permission !== 'granted' && (
          <Button onClick={handleRequestPermission} disabled={permission === 'denied'}>
            <Bell className="ml-2 h-4 w-4" />
            {fa.enableNotifications}
          </Button>
        )}
        
        {permission === 'granted' && (
          <Button onClick={handleTestNotification} variant="outline">
            <Bell className="ml-2 h-4 w-4" />
            {fa.sendTestNotification}
          </Button>
        )}
      </div>
    </div>
  );
}
