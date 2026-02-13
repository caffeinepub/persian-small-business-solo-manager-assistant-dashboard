import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePwaInstallPrompt } from '../../pwa/usePwaInstallPrompt';
import { Download, X, CheckCircle } from 'lucide-react';
import { fa } from '../../lib/fa';

export default function InstallBanner() {
  const { showPrompt, isInstalled, promptInstall, dismissPrompt } = usePwaInstallPrompt();

  if (isInstalled) {
    return (
      <Card className="p-3 bg-success/10 border-success/20">
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
          <span className="font-medium text-success">{fa.appInstalled}</span>
        </div>
      </Card>
    );
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{fa.installApp}</h3>
          <p className="text-xs text-muted-foreground mb-3">{fa.installAppDesc}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={promptInstall}>
              {fa.install}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismissPrompt}>
              {fa.later}
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 flex-shrink-0"
          onClick={dismissPrompt}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
