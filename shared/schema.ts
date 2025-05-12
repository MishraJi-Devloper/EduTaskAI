import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  fieldOfStudy: text("field_of_study"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  fieldOfStudy: true,
});

// Task types enum
export const taskTypeEnum = pgEnum("task_type", ["assignment", "project", "exam", "study"]);

// Task priority enum
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

// Subjects schema
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  color: text("color").notNull().default("#4338ca"), // Default color for subjects
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  name: true,
  userId: true,
  color: true,
});

// Tasks schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  type: taskTypeEnum("type").notNull(),
  deadline: timestamp("deadline").notNull(),
  timeEstimate: integer("time_estimate").notNull(), // In minutes
  priority: priorityEnum("priority").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  userId: true,
  subjectId: true,
  type: true,
  deadline: true,
  timeEstimate: true,
  priority: true,
});

export const updateTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  subjectId: true,
  type: true,
  deadline: true,
  timeEstimate: true,
  priority: true,
  completed: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;

// Task status derived from deadline and completion status
export type TaskStatus = "completed" | "in_progress" | "not_started" | "overdue";

// Task suggestion from AI
export type TaskSuggestion = {
  taskId: number;
  title: string;
  reason: string;
  subjectName: string;
  timeEstimate: number;
  deadline: Date;
};

// Daily schedule plan
export type TimeBlock = {
  taskId: number;
  title: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  isCurrent: boolean;
};

export type DailySchedule = {
  date: string;
  totalAllocated: number; // In minutes
  timeBlocks: TimeBlock[];
};

// Subject time distribution for analytics
export type SubjectDistribution = {
  subjectId: number;
  name: string;
  color: string;
  percentage: number;
};

// Weekly progress for analytics
export type WeeklyProgress = {
  day: string;
  tasksCompleted: number;
  tasksTotal: number;
  studyTime: number; // In minutes
};
