// Re-export types from schema for frontend use
export type {
  User,
  Subject,
  Task,
  InsertTask,
  UpdateTask,
  TaskStatus,
  TaskSuggestion,
  TimeBlock,
  DailySchedule,
  SubjectDistribution,
  WeeklyProgress
} from "@shared/schema";

// Additional frontend-specific types

export type TaskWithSubject = Task & {
  subjectName: string;
  subjectColor: string;
};

export type TaskLabel = {
  text: string;
  color: string;
};

export type NavItem = {
  name: string;
  href: string;
  icon: string;
};

export type ThemeMode = "light" | "dark";

export type TaskFormValues = {
  title: string;
  description?: string;
  subjectId: number;
  type: string;
  deadline: Date;
  timeEstimate: number;
  priority: string;
};

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIChat = {
  messages: AIMessage[];
  isLoading: boolean;
};
