import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // Types
  type ChannelType = { #website; #instagram; #telegram; #whatsapp; #phone };
  type ContentType = { #post; #story; #reel; #article };
  type WorkItemStatus = { #new; #inProgress; #completed };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    createdAt : Time.Time;
  };

  public type WorkInboxItem = {
    id : Text;
    source : ChannelType;
    description : Text;
    status : WorkItemStatus;
    createdAt : Time.Time;
    dueDate : ?Time.Time;
  };

  public type Task = {
    id : Text;
    title : Text;
    dueDate : ?Time.Time;
    priority : Nat;
    completed : Bool;
  };

  public type ContentPlan = {
    id : Text;
    title : Text;
    channel : ChannelType;
    contentType : ContentType;
    scheduledDate : ?Time.Time;
    status : { #planned; #draft; #published };
  };

  public type ChannelProfile = {
    id : Text;
    name : Text;
    channelType : ChannelType;
    urlOrHandle : Text;
    notes : ?Text;
  };

  public type Note = {
    id : Text;
    title : Text;
    content : Text;
    createdAt : Time.Time;
    lastUpdated : ?Time.Time;
  };

  // File specific types
  public type FileMetadata = {
    id : Text;
    owner : Principal;
    fileName : Text;
    contentType : Text;
    size : Nat;
    uploadedAt : Time.Time;
    notes : ?Text;
    tags : [Text];
  };

  public type ExportData = {
    workItems : [WorkInboxItem];
    tasks : [Task];
    contentPlans : [ContentPlan];
    channels : [ChannelProfile];
    notes : [Note];
    fileMetadata : [FileMetadata];
  };

  // Persistent storage using core maps (one per user)
  let userProfiles = Map.empty<Principal, UserProfile>();
  let workInboxStorage = Map.empty<Principal, [WorkInboxItem]>();
  let taskStorage = Map.empty<Principal, [Task]>();
  let contentPlanStorage = Map.empty<Principal, [ContentPlan]>();
  let channelProfileStorage = Map.empty<Principal, [ChannelProfile]>();
  let noteStorage = Map.empty<Principal, [Note]>();

  // Per-user FileMetadata storage
  let fileMetadataStorage = Map.empty<Principal, Map.Map<Text, FileMetadata>>();

  // Helper function to check permissions
  func checkPermission(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  // File Metadata Management
  public shared ({ caller }) func createFileMetadata(metadata : FileMetadata) : async () {
    checkPermission(caller);

    if (metadata.owner != caller) {
      Runtime.trap("Unauthorized: Cannot create metadata for another user");
    };

    let userMetadata = switch (fileMetadataStorage.get(caller)) {
      case (null) { Map.empty<Text, FileMetadata>() };
      case (?existing) { existing };
    };
    userMetadata.add(metadata.id, metadata);
    fileMetadataStorage.add(caller, userMetadata);
  };

  public query ({ caller }) func getFileMetadata(id : Text) : async ?FileMetadata {
    checkPermission(caller);

    switch (fileMetadataStorage.get(caller)) {
      case (null) { null };
      case (?userMetadata) {
        switch (userMetadata.get(id)) {
          case (null) { null };
          case (?metadata) {
            if (metadata.owner != caller) {
              Runtime.trap("Unauthorized: Cannot access another user's metadata");
            };
            ?metadata;
          };
        };
      };
    };
  };

  public query ({ caller }) func listFileMetadata() : async [FileMetadata] {
    checkPermission(caller);

    switch (fileMetadataStorage.get(caller)) {
      case (null) { [] };
      case (?userMetadata) {
        userMetadata.values().toArray();
      };
    };
  };

  public shared ({ caller }) func updateFileMetadata(id : Text, metadata : FileMetadata) : async () {
    checkPermission(caller);

    if (metadata.owner != caller) {
      Runtime.trap("Unauthorized: Cannot update metadata for another user");
    };

    let userMetadata = switch (fileMetadataStorage.get(caller)) {
      case (null) { Map.empty<Text, FileMetadata>() };
      case (?existing) { existing };
    };

    switch (userMetadata.get(id)) {
      case (null) { Runtime.trap("Metadata not found") };
      case (?existingMetadata) {
        if (existingMetadata.owner != caller) {
          Runtime.trap("Unauthorized: Cannot update another user's metadata");
        };
      };
    };

    userMetadata.add(id, metadata);
    fileMetadataStorage.add(caller, userMetadata);
  };

  public shared ({ caller }) func deleteFileMetadata(id : Text) : async () {
    checkPermission(caller);

    let userMetadata = switch (fileMetadataStorage.get(caller)) {
      case (null) { Map.empty<Text, FileMetadata>() };
      case (?existing) { existing };
    };

    switch (userMetadata.get(id)) {
      case (null) { Runtime.trap("Metadata not found") };
      case (?metadata) {
        if (metadata.owner != caller) {
          Runtime.trap("Unauthorized: Cannot delete another user's metadata");
        };
      };
    };

    userMetadata.remove(id);
    fileMetadataStorage.add(caller, userMetadata);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Export functionality
  public query ({ caller }) func exportUserData() : async ExportData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can export data");
    };

    let workItems = switch (workInboxStorage.get(caller)) {
      case (null) { Array.empty<WorkInboxItem>() };
      case (?items) { items };
    };

    let tasks = switch (taskStorage.get(caller)) {
      case (null) { Array.empty<Task>() };
      case (?items) { items };
    };

    let contentPlans = switch (contentPlanStorage.get(caller)) {
      case (null) { Array.empty<ContentPlan>() };
      case (?items) { items };
    };

    let channels = switch (channelProfileStorage.get(caller)) {
      case (null) { Array.empty<ChannelProfile>() };
      case (?items) { items };
    };

    let notes = switch (noteStorage.get(caller)) {
      case (null) { Array.empty<Note>() };
      case (?items) { items };
    };

    let fileMetadata = switch (fileMetadataStorage.get(caller)) {
      case (null) { Array.empty<FileMetadata>() };
      case (?userMetadata) { userMetadata.values().toArray() };
    };

    {
      workItems;
      tasks;
      contentPlans;
      channels;
      notes;
      fileMetadata;
    };
  };

  // Import functionality
  public shared ({ caller }) func importUserData(data : ExportData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can import data");
    };

    for (metadata in data.fileMetadata.vals()) {
      if (metadata.owner != caller) {
        Runtime.trap("Unauthorized: Cannot import metadata belonging to other users");
      };
    };

    workInboxStorage.add(caller, data.workItems);
    taskStorage.add(caller, data.tasks);
    contentPlanStorage.add(caller, data.contentPlans);
    channelProfileStorage.add(caller, data.channels);
    noteStorage.add(caller, data.notes);

    let userMetadata = Map.empty<Text, FileMetadata>();
    for (metadata in data.fileMetadata.vals()) {
      userMetadata.add(metadata.id, metadata);
    };
    fileMetadataStorage.add(caller, userMetadata);
  };

  // Work Inbox CRUD
  public shared ({ caller }) func addWorkInboxItem(item : WorkInboxItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add work inbox items");
    };

    let items = switch (workInboxStorage.get(caller)) {
      case (null) { Array.empty<WorkInboxItem>() };
      case (?existingItems) { existingItems };
    };
    workInboxStorage.add(caller, items.concat([item]));
  };

  public shared ({ caller }) func updateWorkInboxItem(updatedItem : WorkInboxItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update work inbox items");
    };

    let items = switch (workInboxStorage.get(caller)) {
      case (null) { Runtime.trap("No items found") };
      case (?existingItems) { existingItems };
    };

    let updatedItems = items.map(func(item) { if (item.id == updatedItem.id) { updatedItem } else { item } });
    workInboxStorage.add(caller, updatedItems);
  };

  public shared ({ caller }) func deleteWorkInboxItem(itemId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete work inbox items");
    };

    let items = switch (workInboxStorage.get(caller)) {
      case (null) { Runtime.trap("No items found") };
      case (?existingItems) { existingItems };
    };

    let filteredItems = items.filter(func(item) { item.id != itemId });
    workInboxStorage.add(caller, filteredItems);
  };

  public query ({ caller }) func getWorkInboxItems() : async [WorkInboxItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view work inbox items");
    };

    switch (workInboxStorage.get(caller)) {
      case (null) { Array.empty<WorkInboxItem>() };
      case (?items) { items };
    };
  };

  // Task CRUD
  public shared ({ caller }) func addTask(task : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };

    let tasks = switch (taskStorage.get(caller)) {
      case (null) { Array.empty<Task>() };
      case (?existingTasks) { existingTasks };
    };
    taskStorage.add(caller, tasks.concat([task]));
  };

  public shared ({ caller }) func updateTask(updatedTask : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    let tasks = switch (taskStorage.get(caller)) {
      case (null) { Runtime.trap("No tasks found") };
      case (?existingTasks) { existingTasks };
    };

    let updatedTasks = tasks.map(func(task) { if (task.id == updatedTask.id) { updatedTask } else { task } });
    taskStorage.add(caller, updatedTasks);
  };

  public shared ({ caller }) func deleteTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    let tasks = switch (taskStorage.get(caller)) {
      case (null) { Runtime.trap("No tasks found") };
      case (?existingTasks) { existingTasks };
    };

    let filteredTasks = tasks.filter(func(task) { task.id != taskId });
    taskStorage.add(caller, filteredTasks);
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    switch (taskStorage.get(caller)) {
      case (null) { Array.empty<Task>() };
      case (?tasks) { tasks };
    };
  };

  // Content Plan CRUD
  public shared ({ caller }) func addContentPlan(plan : ContentPlan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add content plans");
    };

    let plans = switch (contentPlanStorage.get(caller)) {
      case (null) { Array.empty<ContentPlan>() };
      case (?existingPlans) { existingPlans };
    };
    contentPlanStorage.add(caller, plans.concat([plan]));
  };

  public shared ({ caller }) func updateContentPlan(updatedPlan : ContentPlan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update content plans");
    };

    let plans = switch (contentPlanStorage.get(caller)) {
      case (null) { Runtime.trap("No plans found") };
      case (?existingPlans) { existingPlans };
    };

    let updatedPlans = plans.map(func(plan) { if (plan.id == updatedPlan.id) { updatedPlan } else { plan } });
    contentPlanStorage.add(caller, updatedPlans);
  };

  public shared ({ caller }) func deleteContentPlan(planId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete content plans");
    };

    let plans = switch (contentPlanStorage.get(caller)) {
      case (null) { Runtime.trap("No plans found") };
      case (?existingPlans) { existingPlans };
    };

    let filteredPlans = plans.filter(func(plan) { plan.id != planId });
    contentPlanStorage.add(caller, filteredPlans);
  };

  public query ({ caller }) func getContentPlans() : async [ContentPlan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view content plans");
    };

    switch (contentPlanStorage.get(caller)) {
      case (null) { Array.empty<ContentPlan>() };
      case (?plans) { plans };
    };
  };

  // Channel Profile CRUD
  public shared ({ caller }) func addChannelProfile(profile : ChannelProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add channel profiles");
    };

    let profiles = switch (channelProfileStorage.get(caller)) {
      case (null) { Array.empty<ChannelProfile>() };
      case (?existingProfiles) { existingProfiles };
    };
    channelProfileStorage.add(caller, profiles.concat([profile]));
  };

  public shared ({ caller }) func updateChannelProfile(updatedProfile : ChannelProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update channel profiles");
    };

    let profiles = switch (channelProfileStorage.get(caller)) {
      case (null) { Runtime.trap("No profiles found") };
      case (?existingProfiles) { existingProfiles };
    };

    let updatedProfiles = profiles.map(func(profile) { if (profile.id == updatedProfile.id) { updatedProfile } else { profile } });
    channelProfileStorage.add(caller, updatedProfiles);
  };

  public shared ({ caller }) func deleteChannelProfile(profileId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete channel profiles");
    };

    let profiles = switch (channelProfileStorage.get(caller)) {
      case (null) { Runtime.trap("No profiles found") };
      case (?existingProfiles) { existingProfiles };
    };

    let filteredProfiles = profiles.filter(func(profile) { profile.id != profileId });
    channelProfileStorage.add(caller, filteredProfiles);
  };

  public query ({ caller }) func getChannelProfiles() : async [ChannelProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view channel profiles");
    };

    switch (channelProfileStorage.get(caller)) {
      case (null) { Array.empty<ChannelProfile>() };
      case (?profiles) { profiles };
    };
  };

  // Note CRUD
  public shared ({ caller }) func addNote(note : Note) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add notes");
    };

    let notes = switch (noteStorage.get(caller)) {
      case (null) { Array.empty<Note>() };
      case (?existingNotes) { existingNotes };
    };
    noteStorage.add(caller, notes.concat([note]));
  };

  public shared ({ caller }) func updateNote(updatedNote : Note) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notes");
    };

    let notes = switch (noteStorage.get(caller)) {
      case (null) { Runtime.trap("No notes found") };
      case (?existingNotes) { existingNotes };
    };

    let updatedNotes = notes.map(func(note) { if (note.id == updatedNote.id) { updatedNote } else { note } });
    noteStorage.add(caller, updatedNotes);
  };

  public shared ({ caller }) func deleteNote(noteId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete notes");
    };

    let notes = switch (noteStorage.get(caller)) {
      case (null) { Runtime.trap("No notes found") };
      case (?existingNotes) { existingNotes };
    };

    let filteredNotes = notes.filter(func(note) { note.id != noteId });
    noteStorage.add(caller, filteredNotes);
  };

  public query ({ caller }) func getNotes() : async [Note] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notes");
    };

    switch (noteStorage.get(caller)) {
      case (null) { Array.empty<Note>() };
      case (?notes) { notes };
    };
  };

  // Today view functions
  public query ({ caller }) func getTodayTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view today's tasks");
    };

    switch (taskStorage.get(caller)) {
      case (null) { Array.empty<Task>() };
      case (?tasks) {
        let today = Time.now();
        tasks.filter(
          func(task) {
            switch (task.dueDate) {
              case (null) { false };
              case (?due) {
                // Simple same-day check, in practice should compare date part only
                due == today;
              };
            };
          }
        );
      };
    };
  };
};
