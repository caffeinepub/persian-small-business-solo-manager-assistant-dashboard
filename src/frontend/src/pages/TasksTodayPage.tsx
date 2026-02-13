import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetTasks, useDeleteTask, useUpdateTask } from '../hooks/useQueries';
import TaskFormDialog from '../components/tasks/TaskFormDialog';
import { fa } from '../lib/fa';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../backend';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function TasksTodayPage() {
  const { data: tasks = [], isLoading } = useGetTasks();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTask.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleToggleComplete = async (task: Task) => {
    await updateTask.mutateAsync({
      ...task,
      completed: !task.completed,
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTask(undefined);
  };

  const getPriorityBadge = (priority: bigint) => {
    if (priority > BigInt(2)) {
      return <Badge variant="destructive">{fa.high}</Badge>;
    } else if (priority > BigInt(1)) {
      return <Badge variant="secondary">{fa.medium}</Badge>;
    }
    return <Badge variant="outline">{fa.low}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{fa.tasksTitle}</h1>
          <p className="text-muted-foreground mt-1">{fa.tasksDescription}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          {fa.addTask}
        </Button>
      </div>

      {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <img
                src="/assets/generated/empty-state-illustration.dim_1200x800.png"
                alt="خالی"
                className="w-64 h-auto mx-auto mb-6 opacity-50"
              />
              <h3 className="text-lg font-semibold mb-2">{fa.emptyTasks}</h3>
              <p className="text-muted-foreground mb-4">{fa.emptyTasksDesc}</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                {fa.addTask}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {incompleteTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>وظایف فعال ({incompleteTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incompleteTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {completedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>انجام شده ({completedTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleComplete(task)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium line-through text-muted-foreground">{task.title}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmId(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <TaskFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        editingTask={editingTask}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات قابل بازگشت نیست. این وظیفه به طور دائم حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{fa.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
              {fa.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
