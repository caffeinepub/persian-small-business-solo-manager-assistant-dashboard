import { useEffect, useRef } from 'react';
import { useNotifications } from '../notifications/useNotifications';
import { toast } from 'sonner';
import type { Task, WorkInboxItem } from '../backend';
import { WorkItemStatus } from '../backend';

interface ReminderState {
  shownReminders: Set<string>;
  lastCheck: number;
}

const REMINDER_STORAGE_KEY = 'reminder-state';
const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

function loadReminderState(): ReminderState {
  try {
    const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        shownReminders: new Set(parsed.shownReminders || []),
        lastCheck: parsed.lastCheck || 0,
      };
    }
  } catch (error) {
    console.error('Error loading reminder state:', error);
  }
  return { shownReminders: new Set(), lastCheck: 0 };
}

function saveReminderState(state: ReminderState) {
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify({
      shownReminders: Array.from(state.shownReminders),
      lastCheck: state.lastCheck,
    }));
  } catch (error) {
    console.error('Error saving reminder state:', error);
  }
}

export function useReminders(tasks: Task[] | undefined, workItems: WorkInboxItem[] | undefined) {
  const { permission, sendNotification } = useNotifications();
  const stateRef = useRef<ReminderState>(loadReminderState());

  useEffect(() => {
    const now = Date.now();
    const state = stateRef.current;

    // Only check if enough time has passed
    if (now - state.lastCheck < CHECK_INTERVAL) {
      return;
    }

    state.lastCheck = now;

    // Check for overdue tasks
    if (tasks && tasks.length > 0) {
      const overdueTasks = tasks.filter(task => {
        if (task.completed || !task.dueDate) return false;
        const dueTime = Number(task.dueDate) / 1_000_000; // Convert nanoseconds to milliseconds
        return dueTime < now;
      });

      overdueTasks.forEach(task => {
        const reminderId = `task-overdue-${task.id}`;
        if (!state.shownReminders.has(reminderId)) {
          state.shownReminders.add(reminderId);
          
          const message = `وظیفه عقب‌افتاده: ${task.title}`;
          
          if (permission === 'granted') {
            sendNotification('یادآوری وظیفه', {
              body: message,
              tag: reminderId,
            });
          } else {
            toast.warning(message, {
              duration: 10000,
            });
          }
        }
      });
    }

    // Check for new work inbox items
    if (workItems && workItems.length > 0) {
      const newItems = workItems.filter(item => item.status === WorkItemStatus.new_);
      
      if (newItems.length > 0) {
        const reminderId = `work-new-${newItems.length}`;
        if (!state.shownReminders.has(reminderId)) {
          state.shownReminders.add(reminderId);
          
          const message = `${newItems.length} مورد جدید در صندوق کار`;
          
          if (permission === 'granted') {
            sendNotification('صندوق کار', {
              body: message,
              tag: reminderId,
            });
          } else {
            toast.info(message, {
              duration: 8000,
            });
          }
        }
      }
    }

    saveReminderState(state);
  }, [tasks, workItems, permission, sendNotification]);

  // Clear old reminders periodically (keep only last 100)
  useEffect(() => {
    const interval = setInterval(() => {
      const state = stateRef.current;
      if (state.shownReminders.size > 100) {
        const reminders = Array.from(state.shownReminders);
        state.shownReminders = new Set(reminders.slice(-100));
        saveReminderState(state);
      }
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);
}
