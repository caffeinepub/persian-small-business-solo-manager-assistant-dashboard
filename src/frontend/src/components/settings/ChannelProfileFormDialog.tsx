import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddChannelProfile, useUpdateChannelProfile } from '../../hooks/useQueries';
import { fa } from '../../lib/fa';
import { ChannelType, type ChannelProfile } from '../../backend';

interface ChannelProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProfile?: ChannelProfile;
}

export default function ChannelProfileFormDialog({ open, onOpenChange, editingProfile }: ChannelProfileFormDialogProps) {
  const addProfile = useAddChannelProfile();
  const updateProfile = useUpdateChannelProfile();

  const [name, setName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.website);
  const [urlOrHandle, setUrlOrHandle] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingProfile) {
      setName(editingProfile.name);
      setChannelType(editingProfile.channelType);
      setUrlOrHandle(editingProfile.urlOrHandle);
      setNotes(editingProfile.notes || '');
    } else {
      setName('');
      setChannelType(ChannelType.website);
      setUrlOrHandle('');
      setNotes('');
    }
  }, [editingProfile, open]);

  const handleSubmit = async () => {
    const profile: ChannelProfile = {
      id: editingProfile?.id || `channel-${Date.now()}`,
      name,
      channelType: channelType,
      urlOrHandle,
      notes: notes || undefined,
    };

    if (editingProfile) {
      await updateProfile.mutateAsync(profile);
    } else {
      await addProfile.mutateAsync(profile);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editingProfile ? fa.editChannel : fa.addChannel}</DialogTitle>
          <DialogDescription>
            {editingProfile ? 'ویرایش اطلاعات کانال' : 'افزودن یک کانال جدید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{fa.channelName}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام کانال..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channelType">{fa.channelType}</Label>
            <Select value={channelType} onValueChange={(value) => setChannelType(value as ChannelType)}>
              <SelectTrigger id="channelType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ChannelType.website}>{fa.website}</SelectItem>
                <SelectItem value={ChannelType.instagram}>{fa.instagram}</SelectItem>
                <SelectItem value={ChannelType.telegram}>{fa.telegram}</SelectItem>
                <SelectItem value={ChannelType.whatsapp}>{fa.whatsapp}</SelectItem>
                <SelectItem value={ChannelType.phone}>{fa.phone}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="urlOrHandle">{fa.urlOrHandle}</Label>
            <Input
              id="urlOrHandle"
              value={urlOrHandle}
              onChange={(e) => setUrlOrHandle(e.target.value)}
              placeholder="آدرس یا نام کاربری..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{fa.channelNotes}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="یادداشت‌ها (اختیاری)..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {fa.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !urlOrHandle.trim() || addProfile.isPending || updateProfile.isPending}>
            {addProfile.isPending || updateProfile.isPending ? 'در حال ذخیره...' : fa.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
