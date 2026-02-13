import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetWorkInboxItems, useDeleteWorkInboxItem } from '../hooks/useQueries';
import WorkInboxItemFormDialog from '../components/work-inbox/WorkInboxItemFormDialog';
import { fa } from '../lib/fa';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { WorkItemStatus, ChannelType, type WorkInboxItem } from '../backend';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function WorkInboxPage() {
  const { data: workItems = [], isLoading } = useGetWorkInboxItems();
  const deleteItem = useDeleteWorkInboxItem();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkInboxItem | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredItems = workItems.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || item.source === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const handleEdit = (item: WorkInboxItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(undefined);
  };

  const getStatusBadge = (status: WorkInboxItem['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      new_: 'default',
      inProgress: 'secondary',
      completed: 'outline',
    };
    const labels: Record<string, string> = {
      new_: fa.new,
      inProgress: fa.inProgress,
      completed: fa.completed,
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-12">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{fa.workInboxTitle}</h1>
          <p className="text-muted-foreground mt-1">{fa.workInboxDescription}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          {fa.addWorkItem}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={fa.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={fa.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value={WorkItemStatus.new_}>{fa.new}</SelectItem>
                <SelectItem value={WorkItemStatus.inProgress}>{fa.inProgress}</SelectItem>
                <SelectItem value={WorkItemStatus.completed}>{fa.completed}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={fa.channel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value={ChannelType.website}>{fa.website}</SelectItem>
                <SelectItem value={ChannelType.instagram}>{fa.instagram}</SelectItem>
                <SelectItem value={ChannelType.telegram}>{fa.telegram}</SelectItem>
                <SelectItem value={ChannelType.whatsapp}>{fa.whatsapp}</SelectItem>
                <SelectItem value={ChannelType.phone}>{fa.phone}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <img
                src="/assets/generated/empty-state-illustration.dim_1200x800.png"
                alt="خالی"
                className="w-64 h-auto mx-auto mb-6 opacity-50"
              />
              <h3 className="text-lg font-semibold mb-2">{fa.emptyWorkInbox}</h3>
              <p className="text-muted-foreground mb-4">{fa.emptyWorkInboxDesc}</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                {fa.addWorkItem}
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{fa.summary}</TableHead>
                    <TableHead className="text-right">{fa.source}</TableHead>
                    <TableHead className="text-right">{fa.status}</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {fa[item.source as keyof typeof fa] || item.source}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmId(item.id)}
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

      <WorkInboxItemFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        editingItem={editingItem}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات قابل بازگشت نیست. این مورد به طور دائم حذف خواهد شد.
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
