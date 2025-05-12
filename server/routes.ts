import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertTaskSchema, 
  updateTaskSchema,
  insertSubjectSchema
} from "@shared/schema";
import { generateTaskSuggestion } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = app.route("/api");
  
  // User routes
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  app.post("/api/user", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Don't send the password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Subject routes
  app.get("/api/users/:userId/subjects", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const subjects = await storage.getSubjects(userId);
    res.json(subjects);
  });
  
  app.post("/api/subjects", async (req: Request, res: Response) => {
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
  
  // Task routes
  app.get("/api/users/:userId/tasks", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const tasks = await storage.getTasks(userId);
    res.json(tasks);
  });
  
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
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
  
  app.post("/api/tasks", async (req: Request, res: Response) => {
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
  
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
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
  
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
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
  
  // Advanced task routes
  app.get("/api/users/:userId/tasks/date/:date", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const date = new Date(req.params.date);
      const tasks = await storage.getTasksByDate(userId, date);
      res.json(tasks);
    } catch (error) {
      res.status(400).json({ message: "Invalid date format" });
    }
  });
  
  app.get("/api/users/:userId/tasks/upcoming", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const tasks = await storage.getUpcomingTasks(userId, limit);
    res.json(tasks);
  });
  
  app.get("/api/users/:userId/tasks/subject/:subjectId", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const subjectId = Number(req.params.subjectId);
    
    if (isNaN(userId) || isNaN(subjectId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const tasks = await storage.getTasksBySubject(userId, subjectId);
    res.json(tasks);
  });
  
  // Analytics routes
  app.get("/api/users/:userId/analytics/subject-distribution", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const distribution = await storage.getSubjectDistribution(userId);
    res.json(distribution);
  });
  
  app.get("/api/users/:userId/analytics/weekly-progress", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const weeklyProgress = await storage.getWeeklyProgress(userId);
    res.json(weeklyProgress);
  });
  
  // AI routes
  app.get("/api/users/:userId/ai/suggested-task", async (req: Request, res: Response) => {
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
  
  app.post("/api/users/:userId/ai/suggested-task", async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Get user's tasks
      const tasks = await storage.getTasks(userId);
      const subjects = await storage.getSubjects(userId);
      
      // Generate AI-powered suggestion
      const suggestion = await generateTaskSuggestion(tasks, subjects);
      
      res.json(suggestion);
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      res.status(500).json({ message: "Failed to generate AI suggestion" });
    }
  });
  
  app.get("/api/users/:userId/schedule/:date", async (req: Request, res: Response) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
