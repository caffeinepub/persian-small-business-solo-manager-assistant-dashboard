import { useEffect } from 'react';
import { useGetTasks, useGetWorkInboxItems } from '../../hooks/useQueries';
import { useReminders } from '../../reminders/useReminders';

export default function RemindersListener() {
  const { data: tasks } = useGetTasks();
  const { data: workItems } = useGetWorkInboxItems();

  useReminders(tasks, workItems);

  return null;
}
