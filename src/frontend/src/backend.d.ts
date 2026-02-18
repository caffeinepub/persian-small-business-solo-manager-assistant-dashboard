import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExportData {
    tasks: Array<Task>;
    channels: Array<ChannelProfile>;
    workItems: Array<WorkInboxItem>;
    fileMetadata: Array<FileMetadata>;
    notes: Array<Note>;
    contentPlans: Array<ContentPlan>;
}
export type Time = bigint;
export interface FileMetadata {
    id: string;
    contentType: string;
    owner: Principal;
    size: bigint;
    tags: Array<string>;
    fileName: string;
    notes?: string;
    uploadedAt: Time;
}
export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Time;
    priority: bigint;
}
export interface ContentPlan {
    id: string;
    status: Variant_published_planned_draft;
    title: string;
    contentType: ContentType;
    scheduledDate?: Time;
    channel: ChannelType;
}
export interface ChannelProfile {
    id: string;
    channelType: ChannelType;
    name: string;
    urlOrHandle: string;
    notes?: string;
}
export interface WorkInboxItem {
    id: string;
    status: WorkItemStatus;
    source: ChannelType;
    createdAt: Time;
    dueDate?: Time;
    description: string;
}
export interface UserProfile {
    name: string;
    createdAt: Time;
    email?: string;
}
export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Time;
    lastUpdated?: Time;
}
export enum ChannelType {
    instagram = "instagram",
    whatsapp = "whatsapp",
    website = "website",
    phone = "phone",
    telegram = "telegram"
}
export enum ContentType {
    post = "post",
    reel = "reel",
    article = "article",
    story = "story"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_published_planned_draft {
    published = "published",
    planned = "planned",
    draft = "draft"
}
export enum WorkItemStatus {
    new_ = "new",
    completed = "completed",
    inProgress = "inProgress"
}
export interface backendInterface {
    addChannelProfile(profile: ChannelProfile): Promise<void>;
    addContentPlan(plan: ContentPlan): Promise<void>;
    addNote(note: Note): Promise<void>;
    addTask(task: Task): Promise<void>;
    addWorkInboxItem(item: WorkInboxItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createFileMetadata(metadata: FileMetadata): Promise<void>;
    deleteChannelProfile(profileId: string): Promise<void>;
    deleteContentPlan(planId: string): Promise<void>;
    deleteFileMetadata(id: string): Promise<void>;
    deleteNote(noteId: string): Promise<void>;
    deleteTask(taskId: string): Promise<void>;
    deleteWorkInboxItem(itemId: string): Promise<void>;
    exportUserData(): Promise<ExportData>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannelProfiles(): Promise<Array<ChannelProfile>>;
    getContentPlans(): Promise<Array<ContentPlan>>;
    getFileMetadata(id: string): Promise<FileMetadata | null>;
    getNotes(): Promise<Array<Note>>;
    getTasks(): Promise<Array<Task>>;
    getTodayTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkInboxItems(): Promise<Array<WorkInboxItem>>;
    importUserData(data: ExportData): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listFileMetadata(): Promise<Array<FileMetadata>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateChannelProfile(updatedProfile: ChannelProfile): Promise<void>;
    updateContentPlan(updatedPlan: ContentPlan): Promise<void>;
    updateFileMetadata(id: string, metadata: FileMetadata): Promise<void>;
    updateNote(updatedNote: Note): Promise<void>;
    updateTask(updatedTask: Task): Promise<void>;
    updateWorkInboxItem(updatedItem: WorkInboxItem): Promise<void>;
}
