// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { compareDesc, parseISO, addDays, format, startOfDay, isBefore, isAfter, isToday } from "date-fns";
var MemStorage = class {
  users;
  tasks;
  subjects;
  userIdCounter;
  taskIdCounter;
  subjectIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.tasks = /* @__PURE__ */ new Map();
    this.subjects = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.subjectIdCounter = 1;
    this.initializeDemoData();
  }
  initializeDemoData() {
    const user = {
      id: this.userIdCounter++,
      username: "demo_user",
      password: "password123",
      // Note: In a real app, this would be hashed
      fullName: "Alex Johnson",
      fieldOfStudy: "Computer Science"
    };
    this.users.set(user.id, user);
    const subjects2 = [
      {
        id: this.subjectIdCounter++,
        name: "Computer Science",
        userId: user.id,
        color: "#4338ca"
        // Blue
      },
      {
        id: this.subjectIdCounter++,
        name: "Physics",
        userId: user.id,
        color: "#a855f7"
        // Purple
      },
      {
        id: this.subjectIdCounter++,
        name: "English Literature",
        userId: user.id,
        color: "#ec4899"
        // Pink
      },
      {
        id: this.subjectIdCounter++,
        name: "Mathematics",
        userId: user.id,
        color: "#22c55e"
        // Green
      }
    ];
    subjects2.forEach((subject) => this.subjects.set(subject.id, subject));
    const today = /* @__PURE__ */ new Date();
    const tomorrow = addDays(today, 1);
    const threeDaysLater = addDays(today, 3);
    const fiveDaysLater = addDays(today, 5);
    const sevenDaysLater = addDays(today, 7);
    const tasks2 = [
      {
        id: this.taskIdCounter++,
        title: "Complete Algorithm Assignment",
        description: "Implement quicksort algorithm and analyze its complexity.",
        userId: user.id,
        subjectId: subjects2[0].id,
        // Computer Science
        type: "assignment",
        deadline: addDays(today, 0),
        // Today
        timeEstimate: 120,
        // 2 hours in minutes
        priority: "high",
        completed: false,
        createdAt: addDays(today, -2)
      },
      {
        id: this.taskIdCounter++,
        title: "Study for Physics Exam",
        description: "Review chapters 5-7 on thermodynamics.",
        userId: user.id,
        subjectId: subjects2[1].id,
        // Physics
        type: "exam",
        deadline: threeDaysLater,
        timeEstimate: 90,
        // 1.5 hours in minutes
        priority: "medium",
        completed: false,
        createdAt: addDays(today, -3)
      },
      {
        id: this.taskIdCounter++,
        title: "Literature Review Notes",
        description: "Organize notes on Victorian-era literature.",
        userId: user.id,
        subjectId: subjects2[2].id,
        // English Literature
        type: "study",
        deadline: fiveDaysLater,
        timeEstimate: 30,
        // 30 minutes
        priority: "low",
        completed: false,
        createdAt: addDays(today, -1)
      },
      {
        id: this.taskIdCounter++,
        title: "Calculus Problem Set",
        description: "Complete problems 1-15 from Chapter 4.",
        userId: user.id,
        subjectId: subjects2[3].id,
        // Mathematics
        type: "assignment",
        deadline: sevenDaysLater,
        timeEstimate: 90,
        // 1.5 hours in minutes
        priority: "medium",
        completed: false,
        createdAt: today
      }
    ];
    tasks2.forEach((task) => this.tasks.set(task.id, task));
  }
  // User methods implementation
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Subject methods implementation
  async getSubjects(userId) {
    return Array.from(this.subjects.values()).filter(
      (subject) => subject.userId === userId
    );
  }
  async getSubject(id) {
    return this.subjects.get(id);
  }
  async createSubject(insertSubject) {
    const id = this.subjectIdCounter++;
    const subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }
  // Task methods implementation
  async getTasks(userId) {
    return Array.from(this.tasks.values()).filter((task) => task.userId === userId).sort((a, b) => compareDesc(parseISO(b.deadline.toString()), parseISO(a.deadline.toString())));
  }
  async getTask(id) {
    return this.tasks.get(id);
  }
  async createTask(insertTask) {
    const id = this.taskIdCounter++;
    const task = {
      ...insertTask,
      id,
      completed: false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.tasks.set(id, task);
    return task;
  }
  async updateTask(id, updateTask) {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return void 0;
    const updatedTask = {
      ...existingTask,
      ...updateTask
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  async deleteTask(id) {
    return this.tasks.delete(id);
  }
  // Advanced task methods implementation
  async getTasksByDate(userId, date) {
    const targetDate = startOfDay(date);
    return Array.from(this.tasks.values()).filter((task) => {
      const taskDate = startOfDay(new Date(task.deadline));
      return task.userId === userId && taskDate.getTime() === targetDate.getTime();
    }).sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || compareDesc(parseISO(b.deadline.toString()), parseISO(a.deadline.toString()));
    });
  }
  async getUpcomingTasks(userId, limit = 10) {
    const now = /* @__PURE__ */ new Date();
    return Array.from(this.tasks.values()).filter((task) => task.userId === userId && !task.completed && isAfter(new Date(task.deadline), now)).sort((a, b) => compareDesc(parseISO(b.deadline.toString()), parseISO(a.deadline.toString()))).slice(0, limit);
  }
  async getTasksBySubject(userId, subjectId) {
    return Array.from(this.tasks.values()).filter((task) => task.userId === userId && task.subjectId === subjectId).sort((a, b) => compareDesc(parseISO(b.deadline.toString()), parseISO(a.deadline.toString())));
  }
  // Analytics methods implementation
  async getSubjectDistribution(userId) {
    const userTasks = await this.getTasks(userId);
    const userSubjects = await this.getSubjects(userId);
    const subjectCounts = /* @__PURE__ */ new Map();
    userTasks.forEach((task) => {
      if (!task.subjectId) return;
      const count = subjectCounts.get(task.subjectId) || 0;
      subjectCounts.set(task.subjectId, count + 1);
    });
    const totalTasks = userTasks.length;
    const distribution = userSubjects.map((subject) => {
      const count = subjectCounts.get(subject.id) || 0;
      const percentage = totalTasks > 0 ? Math.round(count / totalTasks * 100) : 0;
      return {
        subjectId: subject.id,
        name: subject.name,
        color: subject.color,
        percentage
      };
    });
    return distribution.sort((a, b) => b.percentage - a.percentage);
  }
  async getWeeklyProgress(userId) {
    const today = /* @__PURE__ */ new Date();
    const userTasks = await this.getTasks(userId);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const dayName = format(date, "EEE");
      days.push({
        day: dayName,
        tasksCompleted: 0,
        tasksTotal: 0,
        studyTime: 0
      });
    }
    userTasks.forEach((task) => {
      const taskDate = new Date(task.deadline);
      const dayIndex = days.findIndex((d) => {
        const dayDate = addDays(today, -days.findIndex((day) => day.day === d.day));
        return format(dayDate, "yyyy-MM-dd") === format(taskDate, "yyyy-MM-dd");
      });
      if (dayIndex !== -1) {
        days[dayIndex].tasksTotal++;
        if (task.completed) {
          days[dayIndex].tasksCompleted++;
          days[dayIndex].studyTime += task.timeEstimate;
        }
      }
    });
    return days;
  }
  // AI helper methods implementation
  async getSuggestedNextTask(userId) {
    const tasks2 = await this.getTasks(userId);
    if (tasks2.length === 0) return void 0;
    const incompleteTasks = tasks2.filter((task) => !task.completed);
    if (incompleteTasks.length === 0) return void 0;
    const sortedTasks = incompleteTasks.sort((a, b) => {
      const priorityValue = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityValue[a.priority];
      const bPriority = priorityValue[b.priority];
      const now = /* @__PURE__ */ new Date();
      const aDaysLeft = Math.max(0, Math.floor((new Date(a.deadline).getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)));
      const bDaysLeft = Math.max(0, Math.floor((new Date(b.deadline).getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)));
      if (aPriority !== bPriority) return bPriority - aPriority;
      return aDaysLeft - bDaysLeft;
    });
    const topTask = sortedTasks[0];
    const subject = topTask.subjectId ? await this.getSubject(topTask.subjectId) : void 0;
    const subjectName = subject ? subject.name : "No Subject";
    let reason = "";
    const deadlineDate = new Date(topTask.deadline);
    if (isToday(deadlineDate)) {
      reason = "Due today";
    } else if (isBefore(deadlineDate, /* @__PURE__ */ new Date())) {
      reason = "Overdue";
    } else {
      const daysLeft = Math.floor((deadlineDate.getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24));
      reason = `Due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
    }
    if (topTask.priority === "high") {
      reason += " and marked as high priority";
    }
    return {
      taskId: topTask.id,
      title: topTask.title,
      reason,
      subjectName,
      timeEstimate: topTask.timeEstimate,
      deadline: topTask.deadline
    };
  }
  async generateDailySchedule(userId, date) {
    const tasks2 = await this.getTasksByDate(userId, date);
    const timeBlocks = [];
    let startTime = 10;
    let totalAllocated = 0;
    const currentHour = (/* @__PURE__ */ new Date()).getHours();
    tasks2.forEach((task) => {
      if (task.completed) return;
      const hours = task.timeEstimate / 60;
      const endTime = startTime + hours;
      const startTimeStr = `${Math.floor(startTime)}:${startTime % 1 * 60 === 0 ? "00" : startTime % 1 * 60} ${startTime >= 12 ? "PM" : "AM"}`;
      const endTimeStr = `${Math.floor(endTime)}:${endTime % 1 * 60 === 0 ? "00" : endTime % 1 * 60} ${endTime >= 12 ? "PM" : "AM"}`;
      const subject = task.subjectId ? this.subjects.get(task.subjectId) : void 0;
      const subjectName = subject ? subject.name : "No Subject";
      const isCurrent = isToday(date) && currentHour >= Math.floor(startTime) && currentHour < Math.floor(endTime);
      timeBlocks.push({
        taskId: task.id,
        title: task.title,
        subjectName,
        startTime: startTimeStr,
        endTime: endTimeStr,
        isCurrent
      });
      totalAllocated += task.timeEstimate;
      startTime = endTime + 0.5;
    });
    return {
      date: format(date, "yyyy-MM-dd"),
      totalAllocated,
      timeBlocks
    };
  }
};
var storage = new MemStorage();

// server/routes.ts
import { z } from "zod";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  fieldOfStudy: text("field_of_study")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  fieldOfStudy: true
});
var taskTypeEnum = pgEnum("task_type", ["assignment", "project", "exam", "study"]);
var priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
var subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  color: text("color").notNull().default("#4338ca")
  // Default color for subjects
});
var insertSubjectSchema = createInsertSchema(subjects).pick({
  name: true,
  userId: true,
  color: true
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull().references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  type: taskTypeEnum("type").notNull(),
  deadline: timestamp("deadline").notNull(),
  timeEstimate: integer("time_estimate").notNull(),
  // In minutes
  priority: priorityEnum("priority").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  userId: true,
  subjectId: true,
  type: true,
  deadline: true,
  timeEstimate: true,
  priority: true
});
var updateTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  subjectId: true,
  type: true,
  deadline: true,
  timeEstimate: true,
  priority: true,
  completed: true
});

// server/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key" });
async function generateTaskSuggestion(tasks2, subjects2) {
  if (!tasks2.length) {
    throw new Error("No tasks available for suggestion");
  }
  const incompleteTasks = tasks2.filter((task) => !task.completed);
  if (!incompleteTasks.length) {
    throw new Error("No incomplete tasks available for suggestion");
  }
  try {
    const tasksData = incompleteTasks.map((task) => {
      const subject = subjects2.find((s) => s.id === task.subjectId);
      return {
        id: task.id,
        title: task.title,
        subject: subject?.name || "No Subject",
        type: task.type,
        deadline: new Date(task.deadline).toISOString().split("T")[0],
        timeEstimate: task.timeEstimate,
        priority: task.priority
      };
    });
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const prompt = `
      You are EduTask AI, a smart academic task prioritization assistant.
      
      Current date: ${today}
      
      Here are the student's incomplete tasks:
      ${JSON.stringify(tasksData, null, 2)}
      
      Based on deadline proximity, task priority, estimated time, and task type,
      recommend ONE task the student should focus on next.
      
      Consider these factors:
      - Tasks with closer deadlines should generally be prioritized
      - Higher priority tasks are more important
      - Try to maintain subject rotation (don't focus too much on one subject)
      - Balance between different task types (assignments, exams, study)
      
      Provide a JSON response with:
      - taskId: the ID of the recommended task
      - title: the title of the task
      - reason: a brief explanation of why this task should be prioritized (max 100 characters)
      - subjectName: the subject of the task
      - timeEstimate: estimated time to complete (in minutes)
      - deadline: the task deadline
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are EduTask AI, a smart academic assistant that helps students prioritize tasks." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content);
    const suggestion = {
      taskId: Number(result.taskId),
      title: result.title,
      reason: result.reason,
      subjectName: result.subjectName,
      timeEstimate: Number(result.timeEstimate),
      deadline: new Date(result.deadline)
    };
    return suggestion;
  } catch (error) {
    console.error("Error generating AI suggestion:", error);
    const task = incompleteTasks.sort((a, b) => {
      const aDate = new Date(a.deadline);
      const bDate = new Date(b.deadline);
      if (aDate.getTime() !== bDate.getTime()) {
        return aDate.getTime() - bDate.getTime();
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })[0];
    const subject = subjects2.find((s) => s.id === task.subjectId);
    const now = /* @__PURE__ */ new Date();
    const deadline = new Date(task.deadline);
    const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)));
    const reason = daysLeft === 0 ? "Due today and urgent" : `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
    return {
      taskId: task.id,
      title: task.title,
      reason,
      subjectName: subject?.name || "No Subject",
      timeEstimate: task.timeEstimate,
      deadline: task.deadline
    };
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  const apiRouter = app2.route("/api");
  app2.get("/api/user/:id", async (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  app2.post("/api/user", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.get("/api/users/:userId/subjects", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const subjects2 = await storage.getSubjects(userId);
    res.json(subjects2);
  });
  app2.post("/api/subjects", async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subject data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });
  app2.get("/api/users/:userId/tasks", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const tasks2 = await storage.getTasks(userId);
    res.json(tasks2);
  });
  app2.get("/api/tasks/:id", async (req, res) => {
    const taskId = Number(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  });
  app2.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  app2.patch("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = Number(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const updateData = updateTaskSchema.parse(req.body);
      const updatedTask = await storage.updateTask(taskId, updateData);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  app2.delete("/api/tasks/:id", async (req, res) => {
    const taskId = Number(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    const deleted = await storage.deleteTask(taskId);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(204).end();
  });
  app2.get("/api/users/:userId/tasks/date/:date", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      const date = new Date(req.params.date);
      const tasks2 = await storage.getTasksByDate(userId, date);
      res.json(tasks2);
    } catch (error) {
      res.status(400).json({ message: "Invalid date format" });
    }
  });
  app2.get("/api/users/:userId/tasks/upcoming", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const limit = req.query.limit ? Number(req.query.limit) : void 0;
    const tasks2 = await storage.getUpcomingTasks(userId, limit);
    res.json(tasks2);
  });
  app2.get("/api/users/:userId/tasks/subject/:subjectId", async (req, res) => {
    const userId = Number(req.params.userId);
    const subjectId = Number(req.params.subjectId);
    if (isNaN(userId) || isNaN(subjectId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const tasks2 = await storage.getTasksBySubject(userId, subjectId);
    res.json(tasks2);
  });
  app2.get("/api/users/:userId/analytics/subject-distribution", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const distribution = await storage.getSubjectDistribution(userId);
    res.json(distribution);
  });
  app2.get("/api/users/:userId/analytics/weekly-progress", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const weeklyProgress = await storage.getWeeklyProgress(userId);
    res.json(weeklyProgress);
  });
  app2.get("/api/users/:userId/ai/suggested-task", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const suggestion = await storage.getSuggestedNextTask(userId);
    if (!suggestion) {
      return res.status(404).json({ message: "No tasks available for suggestion" });
    }
    res.json(suggestion);
  });
  app2.post("/api/users/:userId/ai/suggested-task", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      const tasks2 = await storage.getTasks(userId);
      const subjects2 = await storage.getSubjects(userId);
      const suggestion = await generateTaskSuggestion(tasks2, subjects2);
      res.json(suggestion);
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      res.status(500).json({ message: "Failed to generate AI suggestion" });
    }
  });
  app2.get("/api/users/:userId/schedule/:date", async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
      const date = new Date(req.params.date);
      const schedule = await storage.generateDailySchedule(userId, date);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Invalid date format" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
