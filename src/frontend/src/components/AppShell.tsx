import { type ReactNode, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { fa } from '../lib/fa';
import { LayoutDashboard, Inbox, CheckSquare, Calendar, StickyNote, Settings, User, LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import InstallBanner from './pwa/InstallBanner';
import RemindersListener from './reminders/RemindersListener';
import { registerServiceWorker } from '../pwa/registerServiceWorker';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: fa.dashboard, icon: LayoutDashboard },
  { path: '/work-inbox', label: fa.workInbox, icon: Inbox },
  { path: '/tasks', label: fa.tasksToday, icon: CheckSquare },
  { path: '/planner', label: fa.planner, icon: Calendar },
  { path: '/notes', label: fa.notes, icon: StickyNote },
  { path: '/settings', label: fa.settings, icon: Settings },
];

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Reminders listener (non-visual) */}
      <RemindersListener />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <div className="flex flex-col gap-2 p-4">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">{fa.appName}</h2>
                  </div>
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/" className="flex items-center gap-3">
              <img src="/assets/generated/app-logo.dim_512x512.png" alt="لوگو" className="h-8 w-8" />
              <h1 className="text-xl font-bold hidden sm:block">{fa.appName}</h1>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userProfile?.name || fa.welcome}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{userProfile?.name || fa.welcome}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="ml-2 h-4 w-4" />
                {fa.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col gap-2 border-l p-4 min-h-[calc(100vh-4rem)]">
          <NavLinks />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Install Banner */}
          <div className="mb-4">
            <InstallBanner />
          </div>
          
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            {fa.builtWith} ❤️ {fa.using}{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
