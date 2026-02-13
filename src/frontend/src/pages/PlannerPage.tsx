import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetContentPlans, useDeleteContentPlan } from '../hooks/useQueries';
import ContentPlanFormDialog from '../components/planner/ContentPlanFormDialog';
import { fa } from '../lib/fa';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Variant_published_planned_draft, type ContentPlan } from '../backend';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function PlannerPage() {
  const { data: contentPlans = [], isLoading } = useGetContentPlans();
  const deletePlan = useDeleteContentPlan();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ContentPlan | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const upcomingPlans = contentPlans.filter((plan) => plan.status !== Variant_published_planned_draft.published);
  
  const groupedByChannel = contentPlans.reduce((acc, plan) => {
    const channel = plan.channel;
    if (!acc[channel]) acc[channel] = [];
    acc[channel].push(plan);
    return acc;
  }, {} as Record<string, ContentPlan[]>);

  const handleEdit = (plan: ContentPlan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deletePlan.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPlan(undefined);
  };

  const getStatusBadge = (status: ContentPlan['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      draft: 'outline',
      planned: 'secondary',
      published: 'default',
    };
    const labels: Record<string, string> = {
      draft: fa.draft,
      planned: fa.planned,
      published: fa.published,
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
          <h1 className="text-3xl font-bold">{fa.plannerTitle}</h1>
          <p className="text-muted-foreground mt-1">{fa.plannerDescription}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          {fa.addContentPlan}
        </Button>
      </div>

      {contentPlans.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <img
                src="/assets/generated/empty-state-illustration.dim_1200x800.png"
                alt="خالی"
                className="w-64 h-auto mx-auto mb-6 opacity-50"
              />
              <h3 className="text-lg font-semibold mb-2">{fa.emptyPlanner}</h3>
              <p className="text-muted-foreground mb-4">{fa.emptyPlannerDesc}</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                {fa.addContentPlan}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" dir="rtl">
          <TabsList>
            <TabsTrigger value="upcoming">{fa.viewUpcoming}</TabsTrigger>
            <TabsTrigger value="channel">{fa.viewByChannel}</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>برنامه‌های آینده ({upcomingPlans.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingPlans.map((plan) => (
                    <div key={plan.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{plan.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {fa[plan.channel as keyof typeof fa] || plan.channel}
                          </Badge>
                          {getStatusBadge(plan.status)}
                          <Badge variant="secondary">
                            {fa[plan.contentType as keyof typeof fa] || plan.contentType}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(plan.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channel" className="space-y-4">
            {Object.entries(groupedByChannel).map(([channel, plans]) => (
              <Card key={channel}>
                <CardHeader>
                  <CardTitle>
                    {fa[channel as keyof typeof fa] || channel} ({plans.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div key={plan.id} className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{plan.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(plan.status)}
                            <Badge variant="secondary">
                              {fa[plan.contentType as keyof typeof fa] || plan.contentType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmId(plan.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}

      <ContentPlanFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        editingPlan={editingPlan}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات قابل بازگشت نیست. این برنامه به طور دائم حذف خواهد شد.
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
