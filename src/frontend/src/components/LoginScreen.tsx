import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fa } from '../lib/fa';
import { LogIn } from 'lucide-react';

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4" dir="rtl">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <img
            src="/assets/generated/onboarding-illustration.dim_1600x900.png"
            alt="دستیار کسب‌وکار"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>
        
        <Card className="order-1 md:order-2 border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 mb-2">
              <img
                src="/assets/generated/app-logo.dim_512x512.png"
                alt="لوگو"
                className="w-full h-full object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold">{fa.appName}</CardTitle>
            <CardDescription className="text-base">
              دستیار هوشمند برای مدیریت کسب‌وکار کوچک شما
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm text-muted-foreground text-center">
              <p>✓ مدیریت صندوق کار و پیام‌ها</p>
              <p>✓ برنامه‌ریزی وظایف روزانه</p>
              <p>✓ برنامه‌ریزی محتوای کانال‌ها</p>
              <p>✓ یادداشت‌ها و دستورالعمل‌ها</p>
            </div>
            
            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="w-full text-lg h-12"
            >
              {isLoggingIn ? (
                <>
                  <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {fa.loggingIn}
                </>
              ) : (
                <>
                  <LogIn className="ml-2 h-5 w-5" />
                  {fa.login}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
