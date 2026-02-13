import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddTask, useUpdateTask } from '../../hooks/useQueries';
import { fa } from '../../lib/fa';
import type { Task } from '../../backend';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task;
}

export default function TaskFormDialog({ open, onOpenChange, editingTask }: TaskFormDialogProps) {
  const addTask = useAddTask();
  const updateTask = useUpdateTask();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<string>('1');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setPriority(editingTask.priority.toString());
    } else {
      setTitle('');
      setPriority('1');
    }
  }, [editingTask, open]);

  const handleSubmit = async () => {
    const task: Task = {
      id: editingTask?.id || `task-${Date.now()}`,
      title,
      priority: BigInt(priority),
      completed: editingTask?.completed || false,
      dueDate: undefined,
    };

    if (editingTask) {
      await updateTask.mutateAsync(task);
    } else {
      await addTask.mutateAsync(task);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editingTask ? fa.editTask : fa.addTask}</DialogTitle>
          <DialogDescription>
            {editingTask ? 'ویرایش اطلاعات وظیفه' : 'افزودن یک وظیفه جدید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{fa.taskTitle}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان وظیفه..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">{fa.priority}</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{fa.low}</SelectItem>
                <SelectItem value="2">{fa.medium}</SelectItem>
                <SelectItem value="3">{fa.high}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {fa.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || addTask.isPending || updateTask.isPending}>
            {addTask.isPending || updateTask.isPending ? 'در حال ذخیره...' : fa.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
