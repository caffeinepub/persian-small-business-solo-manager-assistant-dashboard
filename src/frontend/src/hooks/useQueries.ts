import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  WorkInboxItem,
  Task,
  ContentPlan,
  ChannelProfile,
  Note,
  ExportData,
} from '../backend';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Work Inbox
export function useGetWorkInboxItems() {
  const { actor, isFetching } = useActor();

  return useQuery<WorkInboxItem[]>({
    queryKey: ['workInboxItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkInboxItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddWorkInboxItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: WorkInboxItem) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWorkInboxItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workInboxItems'] });
    },
  });
}

export function useUpdateWorkInboxItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: WorkInboxItem) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWorkInboxItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workInboxItems'] });
    },
  });
}

export function useDeleteWorkInboxItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWorkInboxItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workInboxItems'] });
    },
  });
}

// Tasks
export function useGetTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTodayTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['todayTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodayTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] });
    },
  });
}

// Content Plans
export function useGetContentPlans() {
  const { actor, isFetching } = useActor();

  return useQuery<ContentPlan[]>({
    queryKey: ['contentPlans'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContentPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddContentPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: ContentPlan) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addContentPlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPlans'] });
    },
  });
}

export function useUpdateContentPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: ContentPlan) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateContentPlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPlans'] });
    },
  });
}

export function useDeleteContentPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteContentPlan(planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPlans'] });
    },
  });
}

// Channel Profiles
export function useGetChannelProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<ChannelProfile[]>({
    queryKey: ['channelProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChannelProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddChannelProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ChannelProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addChannelProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelProfiles'] });
    },
  });
}

export function useUpdateChannelProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ChannelProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateChannelProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelProfiles'] });
    },
  });
}

export function useDeleteChannelProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteChannelProfile(profileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelProfiles'] });
    },
  });
}

// Notes
export function useGetNotes() {
  const { actor, isFetching } = useActor();

  return useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Note) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNote(note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Note) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNote(note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Import/Export
export function useExportUserData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportUserData();
    },
  });
}

export function useImportUserData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExportData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.importUserData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
