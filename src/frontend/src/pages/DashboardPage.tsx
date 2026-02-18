import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetWorkInboxItems, useGetTasks, useGetContentPlans, useGetNotes, useGetCallerUserProfile, useFileMetadataList } from '../hooks/useQueries';
import { fa } from '../lib/fa';
import { ArrowLeft, Inbox, CheckSquare, Calendar, StickyNote, FileText } from 'lucide-react';
import { WorkItemStatus, Variant_published_planned_draft } from '../backend';
import { useNavigate } from '@tanstack/react-router';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: workItems = [] } = useGetWorkInboxItems();
  const { data: tasks = [] } = useGetTasks();
  const { data: contentPlans = [] } = useGetContentPlans();
  const { data: notes = [] } = useGetNotes();
  const { data: fileMetadata = [] } = useFileMetadataList();

  const newWorkItems = workItems.filter((item) => item.status === WorkItemStatus.new_);
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const upcomingPlans = contentPlans.filter((plan) => plan.status !== Variant_published_planned_draft.published).slice(0, 3);
  const pinnedNotes = notes.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {fa.dashboardWelcome}، {userProfile?.name}
        </h1>
        <p className="text-muted-foreground">{fa.quickOverview}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ to: '/work-inbox' })}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.workInbox}</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newWorkItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{fa.new}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ to: '/tasks' })}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.tasks}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incompleteTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">فعال</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ to: '/planner' })}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.planner}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPlans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{fa.upcoming}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ to: '/notes' })}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.notes}</CardTitle>
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">یادداشت</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ to: '/files' })}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.files.nav}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileMetadata.length}</div>
            <p className="text-xs text-muted-foreground mt-1">فایل</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{fa.recentInbox}</CardTitle>
              <CardDescription>آخرین موارد دریافتی</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/work-inbox">
                {fa.viewAll}
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {newWorkItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{fa.noItems}</p>
            ) : (
              <div className="space-y-3">
                {newWorkItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(Number(item.createdAt) / 1000000).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <Badge variant="secondary">{fa.new}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{fa.todaysTasks}</CardTitle>
              <CardDescription>وظایف امروز</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tasks">
                {fa.viewAll}
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {incompleteTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{fa.noItems}</p>
            ) : (
              <div className="space-y-3">
                {incompleteTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        اولویت: {Number(task.priority)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
