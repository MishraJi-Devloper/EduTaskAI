import { NavItem } from "./types";

// Navigation items
export const NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: "ri-dashboard-line"
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: "ri-list-check-2"
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: "ri-calendar-line"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: "ri-bar-chart-line"
  }
];

// Subject colors
export const SUBJECT_COLORS = [
  "#4338ca", // indigo-700 (blue)
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#22c55e", // green-500
  "#f97316", // orange-500
  "#06b6d4", // cyan-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#64748b", // slate-500
  "#0ea5e9", // sky-500
];

// Task types
export const TASK_TYPES = [
  { value: "assignment", label: "Assignment" },
  { value: "project", label: "Project" },
  { value: "exam", label: "Exam" },
  { value: "study", label: "Study" },
];

// Task priorities
export const TASK_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Sample AI chat prompts
export const AI_PROMPT_SUGGESTIONS = [
  "What's the most important thing to do today?",
  "I have 2 hours free — what should I complete first?",
  "Help me plan my study week based on these tasks.",
  "Remind me if I ignore a subject for too long.",
];

// Demo user ID
export const DEMO_USER_ID = 1;

// Default time blocks for scheduling (30-minute increments)
export const TIME_BLOCKS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
});
