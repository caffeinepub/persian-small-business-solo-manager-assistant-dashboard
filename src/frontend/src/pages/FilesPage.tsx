import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useFileMetadataList, useDeleteFileMutation, useDownloadFileMutation } from '../hooks/useQueries';
import FileUploadDialog from '../components/files/FileUploadDialog';
import FileMetadataEditDialog from '../components/files/FileMetadataEditDialog';
import { fa } from '../lib/fa';
import { Plus, Search, Download, Pencil, Trash2, FileText } from 'lucide-react';
import type { FileMetadata } from '../backend';

export default function FilesPage() {
  const { data: fileMetadata = [], isLoading } = useFileMetadataList();
  const deleteFile = useDeleteFileMutation();
  const downloadFile = useDownloadFileMutation();
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileMetadata | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredFiles = fileMetadata.filter((file) =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (file: FileMetadata) => {
    setEditingFile(file);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteFile.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleDownload = async (file: FileMetadata) => {
    await downloadFile.mutateAsync(file);
  };

  const formatFileSize = (bytes: bigint): string => {
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('fa-IR');
  };

  if (isLoading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{fa.files.title}</h1>
          <p className="text-muted-foreground mt-1">{fa.files.description}</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          {fa.files.upload}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={fa.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <img
                src="/assets/generated/empty-state-illustration.dim_1200x800.png"
                alt="خالی"
                className="w-64 h-auto mx-auto mb-6 opacity-50"
              />
              <h3 className="text-lg font-semibold mb-2">{fa.files.emptyState}</h3>
              <p className="text-muted-foreground mb-4">{fa.files.emptyStateDesc}</p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                {fa.files.upload}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{fa.files.fileName}</TableHead>
                    <TableHead>{fa.files.contentType}</TableHead>
                    <TableHead>{fa.files.size}</TableHead>
                    <TableHead>{fa.files.uploadDate}</TableHead>
                    <TableHead className="text-left">{fa.files.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {file.fileName}
                        </div>
                      </TableCell>
                      <TableCell>{file.contentType}</TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-start">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(file)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(file.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <FileUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />

      <FileMetadataEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fileMetadata={editingFile}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>{fa.files.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {fa.files.deleteConfirmDesc}
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
