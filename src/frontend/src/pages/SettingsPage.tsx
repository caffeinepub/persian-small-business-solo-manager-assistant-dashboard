import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ChannelProfilesSection from '../components/settings/ChannelProfilesSection';
import ImportExportSection from '../components/settings/ImportExportSection';
import NotificationsSection from '../components/settings/NotificationsSection';
import { fa } from '../lib/fa';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{fa.settingsTitle}</h1>
        <p className="text-muted-foreground mt-1">مدیریت تنظیمات و اطلاعات کسب‌وکار</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{fa.notifications}</CardTitle>
          <CardDescription>{fa.notificationsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationsSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{fa.websiteAndChannels}</CardTitle>
          <CardDescription>{fa.websiteAndChannelsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChannelProfilesSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{fa.importExport}</CardTitle>
          <CardDescription>{fa.importExportDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ImportExportSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>راهنمای اولیه</CardTitle>
          <CardDescription>بازگشت به راهنمای شروع و تنظیمات اولیه</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate({ to: '/onboarding' })}>
            <BookOpen className="ml-2 h-4 w-4" />
            {fa.revisitOnboarding}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
