import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateFileMutation } from '../../hooks/useQueries';
import { fa } from '../../lib/fa';
import type { FileMetadata } from '../../backend';

interface FileMetadataEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileMetadata?: FileMetadata;
}

export default function FileMetadataEditDialog({ open, onOpenChange, fileMetadata }: FileMetadataEditDialogProps) {
  const updateFile = useUpdateFileMutation();
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (fileMetadata) {
      setFileName(fileMetadata.fileName);
      setNotes(fileMetadata.notes || '');
    }
  }, [fileMetadata]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileMetadata || !fileName.trim()) return;

    const updatedMetadata: FileMetadata = {
      ...fileMetadata,
      fileName: fileName.trim(),
      notes: notes.trim() || undefined,
    };

    await updateFile.mutateAsync({ id: fileMetadata.id, metadata: updatedMetadata });
    onOpenChange(false);
  };

  const handleClose = () => {
    setFileName('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir="rtl" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{fa.files.editDialogTitle}</DialogTitle>
          <DialogDescription>{fa.files.editDialogDesc}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">{fa.files.fileName}</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="نام فایل"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{fa.files.notes}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="یادداشت‌ها (اختیاری)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {fa.cancel}
            </Button>
            <Button type="submit" disabled={!fileName.trim() || updateFile.isPending}>
              {updateFile.isPending ? 'در حال ذخیره...' : fa.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
