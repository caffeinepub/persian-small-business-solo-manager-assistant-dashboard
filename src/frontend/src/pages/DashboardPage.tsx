import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetWorkInboxItems, useGetTasks, useGetContentPlans, useGetNotes, useGetCallerUserProfile } from '../hooks/useQueries';
import { fa } from '../lib/fa';
import { ArrowLeft, Inbox, CheckSquare, Calendar, StickyNote } from 'lucide-react';
import { WorkItemStatus, Variant_published_planned_draft } from '../backend';

export default function DashboardPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: workItems = [] } = useGetWorkInboxItems();
  const { data: tasks = [] } = useGetTasks();
  const { data: contentPlans = [] } = useGetContentPlans();
  const { data: notes = [] } = useGetNotes();

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.workInbox}</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newWorkItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{fa.new}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.tasks}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incompleteTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">فعال</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.planner}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingPlans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{fa.upcoming}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{fa.notes}</CardTitle>
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">ذخیره شده</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{fa.todaysTasks}</CardTitle>
              <Link to="/tasks">
                <Button variant="ghost" size="sm">
                  {fa.viewAll}
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {incompleteTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{fa.noItems}</p>
            ) : (
              <div className="space-y-3">
                {incompleteTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={task.priority > BigInt(2) ? 'destructive' : 'secondary'} className="text-xs">
                          {task.priority > BigInt(2) ? fa.high : task.priority > BigInt(1) ? fa.medium : fa.low}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{fa.recentInbox}</CardTitle>
              <Link to="/work-inbox">
                <Button variant="ghost" size="sm">
                  {fa.viewAll}
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {newWorkItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{fa.noItems}</p>
            ) : (
              <div className="space-y-3">
                {newWorkItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {fa[item.source as keyof typeof fa] || item.source}
                        </Badge>
                      </div>
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
