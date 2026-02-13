import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddWorkInboxItem, useUpdateWorkInboxItem, useGetChannelProfiles } from '../../hooks/useQueries';
import { fa } from '../../lib/fa';
import { WorkItemStatus, ChannelType, type WorkInboxItem } from '../../backend';

interface WorkInboxItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: WorkInboxItem;
}

export default function WorkInboxItemFormDialog({ open, onOpenChange, editingItem }: WorkInboxItemFormDialogProps) {
  const { data: channelProfiles = [] } = useGetChannelProfiles();
  const addItem = useAddWorkInboxItem();
  const updateItem = useUpdateWorkInboxItem();

  const [description, setDescription] = useState('');
  const [source, setSource] = useState<ChannelType>(ChannelType.website);
  const [status, setStatus] = useState<WorkItemStatus>(WorkItemStatus.new_);

  useEffect(() => {
    if (editingItem) {
      setDescription(editingItem.description);
      setSource(editingItem.source);
      setStatus(editingItem.status);
    } else {
      setDescription('');
      setSource(ChannelType.website);
      setStatus(WorkItemStatus.new_);
    }
  }, [editingItem, open]);

  const handleSubmit = async () => {
    const item: WorkInboxItem = {
      id: editingItem?.id || `work-${Date.now()}`,
      description,
      source: source,
      status: status,
      createdAt: editingItem?.createdAt || BigInt(Date.now() * 1000000),
      dueDate: undefined,
    };

    if (editingItem) {
      await updateItem.mutateAsync(item);
    } else {
      await addItem.mutateAsync(item);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editingItem ? fa.editWorkItem : fa.addWorkItem}</DialogTitle>
          <DialogDescription>
            {editingItem ? 'ویرایش اطلاعات مورد کاری' : 'افزودن یک مورد کاری جدید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">{fa.summary}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات مورد کاری..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">{fa.source}</Label>
            <Select value={source} onValueChange={(value) => setSource(value as ChannelType)}>
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channelProfiles.length > 0 ? (
                  channelProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.channelType}>
                      {profile.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value={ChannelType.website}>{fa.website}</SelectItem>
                    <SelectItem value={ChannelType.instagram}>{fa.instagram}</SelectItem>
                    <SelectItem value={ChannelType.telegram}>{fa.telegram}</SelectItem>
                    <SelectItem value={ChannelType.whatsapp}>{fa.whatsapp}</SelectItem>
                    <SelectItem value={ChannelType.phone}>{fa.phone}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{fa.status}</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as WorkItemStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WorkItemStatus.new_}>{fa.new}</SelectItem>
                <SelectItem value={WorkItemStatus.inProgress}>{fa.inProgress}</SelectItem>
                <SelectItem value={WorkItemStatus.completed}>{fa.completed}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {fa.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!description.trim() || addItem.isPending || updateItem.isPending}>
            {addItem.isPending || updateItem.isPending ? 'در حال ذخیره...' : fa.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
