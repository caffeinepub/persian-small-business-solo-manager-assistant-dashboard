import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateFileMutation } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { fa } from '../../lib/fa';
import { Upload, FileText } from 'lucide-react';
import type { FileMetadata } from '../../backend';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FileUploadDialog({ open, onOpenChange }: FileUploadDialogProps) {
  const createFile = useCreateFileMutation();
  const { identity } = useInternetIdentity();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !identity) return;

    try {
      const fileBytes = await selectedFile.arrayBuffer();
      const metadata: FileMetadata = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        owner: identity.getPrincipal(),
        fileName: selectedFile.name,
        contentType: selectedFile.type || 'application/octet-stream',
        size: BigInt(selectedFile.size),
        uploadedAt: BigInt(Date.now() * 1000000),
        notes: notes || undefined,
        tags: [],
      };

      await createFile.mutateAsync(metadata);
      
      // Reset form
      setSelectedFile(null);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setNotes('');
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir="rtl" className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{fa.files.uploadDialogTitle}</DialogTitle>
          <DialogDescription>{fa.files.uploadDialogDesc}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'نامشخص'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    تغییر فایل
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    فایل را اینجا بکشید یا کلیک کنید
                  </p>
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label htmlFor="file-input" className="cursor-pointer">
                      انتخاب فایل
                    </label>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{fa.files.notes}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="یادداشت‌ها یا برچسب‌ها (اختیاری)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {fa.cancel}
            </Button>
            <Button type="submit" disabled={!selectedFile || createFile.isPending}>
              {createFile.isPending ? 'در حال آپلود...' : fa.files.upload}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
