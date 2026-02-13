import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useExportUserData, useImportUserData } from '../../hooks/useQueries';
import { fa } from '../../lib/fa';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { ExportData } from '../../backend';

export default function ImportExportSection() {
  const exportData = useExportUserData();
  const importData = useImportUserData();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportData.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(fa.exportSuccess);
    } catch (error) {
      toast.error('خطا در خروجی گرفتن داده‌ها');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportConfirm(true);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const data: ExportData = JSON.parse(text);
      await importData.mutateAsync(data);
      toast.success(fa.importSuccess);
      setShowImportConfirm(false);
      setImportFile(null);
    } catch (error) {
      toast.error('خطا در وارد کردن داده‌ها');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleExport} disabled={exportData.isPending} variant="outline">
          <Download className="ml-2 h-4 w-4" />
          {exportData.isPending ? 'در حال خروجی...' : fa.exportData}
        </Button>
        
        <div>
          <Input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="import-file"
          />
          <Button asChild variant="outline">
            <label htmlFor="import-file" className="cursor-pointer">
              <Upload className="ml-2 h-4 w-4" />
              {fa.importData}
            </label>
          </Button>
        </div>
      </div>

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>{fa.confirmImport}</AlertDialogTitle>
            <AlertDialogDescription>{fa.confirmImportDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImportFile(null)}>{fa.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} disabled={importData.isPending}>
              {importData.isPending ? 'در حال وارد کردن...' : fa.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
