import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddContentPlan, useUpdateContentPlan, useGetChannelProfiles } from '../../hooks/useQueries';
import { fa } from '../../lib/fa';
import { ChannelType, ContentType, Variant_published_planned_draft, type ContentPlan } from '../../backend';

interface ContentPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan?: ContentPlan;
}

export default function ContentPlanFormDialog({ open, onOpenChange, editingPlan }: ContentPlanFormDialogProps) {
  const { data: channelProfiles = [] } = useGetChannelProfiles();
  const addPlan = useAddContentPlan();
  const updatePlan = useUpdateContentPlan();

  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<ChannelType>(ChannelType.website);
  const [contentType, setContentType] = useState<ContentType>(ContentType.post);
  const [status, setStatus] = useState<Variant_published_planned_draft>(Variant_published_planned_draft.planned);

  useEffect(() => {
    if (editingPlan) {
      setTitle(editingPlan.title);
      setChannel(editingPlan.channel);
      setContentType(editingPlan.contentType);
      setStatus(editingPlan.status);
    } else {
      setTitle('');
      setChannel(ChannelType.website);
      setContentType(ContentType.post);
      setStatus(Variant_published_planned_draft.planned);
    }
  }, [editingPlan, open]);

  const handleSubmit = async () => {
    const plan: ContentPlan = {
      id: editingPlan?.id || `plan-${Date.now()}`,
      title,
      channel: channel,
      contentType: contentType,
      status: status,
      scheduledDate: undefined,
    };

    if (editingPlan) {
      await updatePlan.mutateAsync(plan);
    } else {
      await addPlan.mutateAsync(plan);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editingPlan ? fa.editContentPlan : fa.addContentPlan}</DialogTitle>
          <DialogDescription>
            {editingPlan ? 'ویرایش اطلاعات برنامه محتوا' : 'افزودن یک برنامه محتوای جدید'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{fa.contentTitle}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان محتوا..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel">{fa.channel}</Label>
            <Select value={channel} onValueChange={(value) => setChannel(value as ChannelType)}>
              <SelectTrigger id="channel">
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
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentType">{fa.contentType}</Label>
            <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
              <SelectTrigger id="contentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ContentType.post}>{fa.post}</SelectItem>
                <SelectItem value={ContentType.story}>{fa.story}</SelectItem>
                <SelectItem value={ContentType.reel}>{fa.reel}</SelectItem>
                <SelectItem value={ContentType.article}>{fa.article}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{fa.status}</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Variant_published_planned_draft)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Variant_published_planned_draft.draft}>{fa.draft}</SelectItem>
                <SelectItem value={Variant_published_planned_draft.planned}>{fa.planned}</SelectItem>
                <SelectItem value={Variant_published_planned_draft.published}>{fa.published}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {fa.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || addPlan.isPending || updatePlan.isPending}>
            {addPlan.isPending || updatePlan.isPending ? 'در حال ذخیره...' : fa.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
