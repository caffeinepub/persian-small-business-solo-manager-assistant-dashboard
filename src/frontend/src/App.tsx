import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AuthGate from './components/AuthGate';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import WorkInboxPage from './pages/WorkInboxPage';
import TasksTodayPage from './pages/TasksTodayPage';
import PlannerPage from './pages/PlannerPage';
import NotesPage from './pages/NotesPage';
import FilesPage from './pages/FilesPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingWizardPage from './pages/OnboardingWizardPage';

const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGate>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const workInboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/work-inbox',
  component: WorkInboxPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksTodayPage,
});

const plannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/planner',
  component: PlannerPage,
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notes',
  component: NotesPage,
});

const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files',
  component: FilesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingWizardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  workInboxRoute,
  tasksRoute,
  plannerRoute,
  notesRoute,
  filesRoute,
  settingsRoute,
  onboardingRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
