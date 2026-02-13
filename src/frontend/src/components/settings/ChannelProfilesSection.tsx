import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetChannelProfiles, useDeleteChannelProfile } from '../../hooks/useQueries';
import ChannelProfileFormDialog from './ChannelProfileFormDialog';
import { fa } from '../../lib/fa';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { ChannelProfile } from '../../backend';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ChannelProfilesSection() {
  const { data: channelProfiles = [] } = useGetChannelProfiles();
  const deleteProfile = useDeleteChannelProfile();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ChannelProfile | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (profile: ChannelProfile) => {
    setEditingProfile(profile);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteProfile.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProfile(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {channelProfiles.length} کانال ثبت شده
        </p>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="ml-2 h-4 w-4" />
          {fa.addChannel}
        </Button>
      </div>

      {channelProfiles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>هنوز کانالی اضافه نشده است</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">{fa.channelName}</TableHead>
                <TableHead className="text-right">{fa.channelType}</TableHead>
                <TableHead className="text-right">{fa.urlOrHandle}</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {fa[profile.channelType as keyof typeof fa] || profile.channelType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{profile.urlOrHandle}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(profile)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmId(profile.id)}
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

      <ChannelProfileFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        editingProfile={editingProfile}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات قابل بازگشت نیست. این کانال به طور دائم حذف خواهد شد.
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
