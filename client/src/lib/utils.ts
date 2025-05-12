import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TaskLabel, Task, TaskStatus, Subject } from "./types";
import { formatDistanceToNow, isPast, isToday, isTomorrow, format, addMinutes } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to determine task status
export function getTaskStatus(task: Task): TaskStatus {
  if (task.completed) return "completed";
  
  const deadline = new Date(task.deadline);
  if (isPast(deadline) && !isToday(deadline)) return "overdue";
  
  // For now, we'll consider all incomplete tasks as "not_started"
  // In a real app, you might track when a task was started
  return "not_started";
}

// Generate task labels based on task properties
export function generateTaskLabels(task: Task): TaskLabel[] {
  const labels: TaskLabel[] = [];
  const deadline = new Date(task.deadline);
  
  // Priority label
  if (task.priority === "high") {
    labels.push({ text: "High Priority", color: "red" });
  } else if (task.priority === "medium") {
    labels.push({ text: "Medium Priority", color: "yellow" });
  } else if (task.priority === "low") {
    labels.push({ text: "Low Priority", color: "green" });
  }
  
  // Deadline label
  if (isToday(deadline)) {
    labels.push({ text: "Due Today", color: "blue" });
  } else if (isTomorrow(deadline)) {
    labels.push({ text: "Due Tomorrow", color: "blue" });
  } else if (isPast(deadline)) {
    labels.push({ text: "Overdue", color: "red" });
  }
  
  // Time estimate label
  if (task.timeEstimate <= 30) {
    labels.push({ text: "Quick Task", color: "gray" });
  } else if (task.timeEstimate >= 180) {
    labels.push({ text: "Long Project", color: "purple" });
  }
  
  return labels;
}

// Format time estimate for display
export function formatTimeEstimate(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} min`;
    }
  }
}

// Format deadline for display
export function formatDeadline(date: Date): string {
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  } else if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, 'h:mm a')}`;
  } else {
    return formatDistanceToNow(date, { addSuffix: true });
  }
}

// Get color classes for priority
export function getPriorityColorClass(priority: string): string {
  switch (priority) {
    case "high":
      return "border-red-500 dark:border-red-700";
    case "medium":
      return "border-yellow-500 dark:border-yellow-700";
    case "low":
      return "border-green-500 dark:border-green-700";
    default:
      return "border-gray-200 dark:border-gray-700";
  }
}

// Get badge color variant for priority
export function getPriorityVariant(priority: string): "destructive" | "warning" | "success" {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "destructive";
  }
}

// Get badge color variant for status
export function getStatusVariant(status: TaskStatus): "default" | "warning" | "success" | "destructive" {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "warning";
    case "not_started":
      return "default";
    case "overdue":
      return "destructive";
    default:
      return "default";
  }
}

// Get status label text
export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "not_started":
      return "Not Started";
    case "overdue":
      return "Overdue";
    default:
      return "Unknown";
  }
}

// Convert time (24-hour format) to formatted string (e.g., "10:00 AM")
export function formatTime(time: number): string {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${formattedHours}:${formattedMinutes} ${period}`;
}

// Get task type icon class
export function getTaskTypeIcon(type: string): string {
  switch (type) {
    case "assignment":
      return "ri-file-list-line";
    case "project":
      return "ri-folder-line";
    case "exam":
      return "ri-exam-line";
    case "study":
      return "ri-book-open-line";
    default:
      return "ri-task-line";
  }
}

// Find subject info for a task
export function getSubjectInfo(task: Task, subjects: Subject[]): { name: string, color: string } {
  if (!task.subjectId) {
    return { name: "No Subject", color: "#718096" }; // Default gray
  }
  
  const subject = subjects.find(s => s.id === task.subjectId);
  
  if (!subject) {
    return { name: "Unknown Subject", color: "#718096" }; // Default gray
  }
  
  return { name: subject.name, color: subject.color };
}
