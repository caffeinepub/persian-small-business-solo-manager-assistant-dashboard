import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';
import { useAddChannelProfile, useAddTask, useAddNote } from '../hooks/useQueries';
import { fa } from '../lib/fa';
import { ChannelType, type ChannelProfile, type Task, type Note } from '../backend';
import { ArrowRight } from 'lucide-react';

export default function OnboardingWizardPage() {
  const navigate = useNavigate();
  const addChannel = useAddChannelProfile();
  const addTask = useAddTask();
  const addNote = useAddNote();

  const [step, setStep] = useState(1);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.website);
  const [urlOrHandle, setUrlOrHandle] = useState('');

  const handleAddChannel = async () => {
    if (!channelName.trim() || !urlOrHandle.trim()) return;

    const profile: ChannelProfile = {
      id: `channel-${Date.now()}`,
      name: channelName,
      channelType: channelType,
      urlOrHandle,
      notes: undefined,
    };

    await addChannel.mutateAsync(profile);
    setStep(3);
  };

  const handleCreateExamples = async () => {
    const exampleTask: Task = {
      id: `task-${Date.now()}`,
      title: 'پاسخ به پیام‌های امروز (نمونه)',
      priority: BigInt(2),
      completed: false,
      dueDate: undefined,
    };

    const exampleNote: Note = {
      id: `note-${Date.now()}`,
      title: 'پاسخ استاندارد (نمونه)',
      content: 'سلام، ممنون از پیام شما. به زودی پاسخ خواهیم داد.',
      createdAt: BigInt(Date.now() * 1000000),
      lastUpdated: undefined,
    };

    await addTask.mutateAsync(exampleTask);
    await addNote.mutateAsync(exampleNote);
    
    navigate({ to: '/' });
  };

  const handleSkip = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img
            src="/assets/generated/app-logo.dim_512x512.png"
            alt="لوگو"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">{fa.onboardingWelcome}</h1>
          <p className="text-muted-foreground">{fa.onboardingDesc}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>خوش آمدید!</CardTitle>
              <CardDescription>بیایید با راه‌اندازی اولین کانال شما شروع کنیم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <img
                src="/assets/generated/onboarding-illustration.dim_1600x900.png"
                alt="راهنما"
                className="w-full h-auto rounded-lg"
              />
              <div className="flex gap-4">
                <Button onClick={() => setStep(2)} className="flex-1">
                  {fa.nextStep}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
                <Button onClick={handleSkip} variant="outline">
                  {fa.skipOnboarding}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{fa.addFirstChannel}</CardTitle>
              <CardDescription>اطلاعات اولین کانال یا وب‌سایت خود را وارد کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channelName">{fa.channelName}</Label>
                <Input
                  id="channelName"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="مثلاً: وب‌سایت اصلی"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channelType">{fa.channelType}</Label>
                <Select value={channelType} onValueChange={(value) => setChannelType(value as ChannelType)}>
                  <SelectTrigger id="channelType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ChannelType.website}>{fa.website}</SelectItem>
                    <SelectItem value={ChannelType.instagram}>{fa.instagram}</SelectItem>
                    <SelectItem value={ChannelType.telegram}>{fa.telegram}</SelectItem>
                    <SelectItem value={ChannelType.whatsapp}>{fa.whatsapp}</SelectItem>
                    <SelectItem value={ChannelType.phone}>{fa.phone}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urlOrHandle">{fa.urlOrHandle}</Label>
                <Input
                  id="urlOrHandle"
                  value={urlOrHandle}
                  onChange={(e) => setUrlOrHandle(e.target.value)}
                  placeholder="آدرس یا نام کاربری..."
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={handleAddChannel} disabled={!channelName.trim() || !urlOrHandle.trim() || addChannel.isPending} className="flex-1">
                  {addChannel.isPending ? 'در حال ذخیره...' : fa.nextStep}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
                <Button onClick={handleSkip} variant="outline">
                  {fa.skipOnboarding}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>ایجاد نمونه‌ها</CardTitle>
              <CardDescription>می‌خواهید چند نمونه وظیفه و یادداشت ایجاد کنیم؟</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm">
                <p>✓ یک وظیفه نمونه برای شروع</p>
                <p>✓ یک یادداشت نمونه برای پاسخ‌های استاندارد</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleCreateExamples} disabled={addTask.isPending || addNote.isPending} className="flex-1">
                  {addTask.isPending || addNote.isPending ? 'در حال ایجاد...' : fa.finish}
                </Button>
                <Button onClick={handleSkip} variant="outline">
                  {fa.skipOnboarding}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
