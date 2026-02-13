import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { fa } from '../lib/fa';
import type { UserProfile } from '../backend';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSave = async () => {
    if (!name.trim()) return;

    const profile: UserProfile = {
      name: name.trim(),
      email: undefined,
      createdAt: BigInt(Date.now() * 1000000),
    };

    await saveProfile.mutateAsync(profile);
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{fa.profileSetup}</DialogTitle>
          <DialogDescription>{fa.profileSetupDesc}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{fa.yourName}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={fa.enterYourName}
              className="text-right"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!name.trim() || saveProfile.isPending}>
            {saveProfile.isPending ? 'در حال ذخیره...' : fa.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
