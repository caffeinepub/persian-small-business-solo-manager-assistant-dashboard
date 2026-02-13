import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddNote, useUpdateNote } from '../../hooks/useQueries';
import { fa } from '../../lib/fa';
import type { Note } from '../../backend';

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: Note;
}

export default function NoteFormDialog({ open, onOpenChange, editingNote }: NoteFormDialogProps) {
  const addNote = useAddNote();
  const updateNote = useUpdateNote();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [editingNote, open]);

  const handleSubmit = async () => {
    const note: Note = {
      id: editingNote?.id || `note-${Date.now()}`,
      title,
      content,
      createdAt: editingNote?.createdAt || BigInt(Date.now() * 1000000),
      lastUpdated: BigInt(Date.now() * 1000000),
    };

    if (editingNote) {
      await updateNote.mutateAsync(note);
    } else {
      await addNote.mutateAsync(note);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editingNote ? fa.editNote : fa.addNote}</DialogTitle>
          <DialogDescription>
            {editingNote ? 'ویرایش اطلاعات یادداشت' : 'افزودن یک یادداشت جدید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{fa.noteTitle}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان یادداشت..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">{fa.noteContent}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="محتوای یادداشت..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {fa.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || addNote.isPending || updateNote.isPending}>
            {addNote.isPending || updateNote.isPending ? 'در حال ذخیره...' : fa.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
