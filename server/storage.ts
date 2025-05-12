import { 
  User, InsertUser, Task, InsertTask, UpdateTask, Subject, InsertSubject,
  TaskStatus, TaskSuggestion, DailySchedule, SubjectDistribution, WeeklyProgress
} from "@shared/schema";
import { compareDesc, formatISO, parseISO, addDays, format, startOfDay, isBefore, isAfter, isToday } from "date-fns";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Subject methods
  getSubjects(userId: number): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;

  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Advanced task methods
  getTasksByDate(userId: number, date: Date): Promise<Task[]>;
  getUpcomingTasks(userId: number, limit?: number): Promise<Task[]>;
  getTasksBySubject(userId: number, subjectId: number): Promise<Task[]>;
  
  // Analytics methods
  getSubjectDistribution(userId: number): Promise<SubjectDistribution[]>;
  getWeeklyProgress(userId: number): Promise<WeeklyProgress[]>;
  
  // AI helper methods
  getSuggestedNextTask(userId: number): Promise<TaskSuggestion | undefined>;
  generateDailySchedule(userId: number, date: Date): Promise<DailySchedule>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private subjects: Map<number, Subject>;
  private userIdCounter: number;
  private taskIdCounter: number;
  private subjectIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.subjects = new Map();
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.subjectIdCounter = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo user
    const user: User = {
      id: this.userIdCounter++,
      username: "demo_user",
      password: "password123", // Note: In a real app, this would be hashed
      fullName: "Alex Johnson",
      fieldOfStudy: "Computer Science"
    };
    this.users.set(user.id, user);

    // Create demo subjects
    const subjects: Subject[] = [
      { 
        id: this.subjectIdCounter++, 
        name: "Computer Science", 
        userId: user.id, 
        color: "#4338ca" // Blue
      },
      { 
        id: this.subjectIdCounter++, 
        name: "Physics", 
        userId: user.id, 
        color: "#a855f7" // Purple
      },
      { 
        id: this.subjectIdCounter++, 
        name: "English Literature", 
        userId: user.id, 
        color: "#ec4899" // Pink
      },
      { 
        id: this.subjectIdCounter++, 
        name: "Mathematics", 
        userId: user.id, 
        color: "#22c55e" // Green
      }
    ];
    
    subjects.forEach(subject => this.subjects.set(subject.id, subject));

    // Create demo tasks
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const threeDaysLater = addDays(today, 3);
    const fiveDaysLater = addDays(today, 5);
    const sevenDaysLater = addDays(today, 7);

    const tasks: Task[] = [
      {
        id: this.taskIdCounter++,
        title: "Complete Algorithm Assignment",
        description: "Implement quicksort algorithm and analyze its complexity.",
        userId: user.id,
        subjectId: subjects[0].id, // Computer Science
        type: "assignment",
        deadline: addDays(today, 0), // Today
        timeEstimate: 120, // 2 hours in minutes
        priority: "high",
        completed: false,
        createdAt: addDays(today, -2)
      },
      {
        id: this.taskIdCounter++,
        title: "Study for Physics Exam",
        description: "Review chapters 5-7 on thermodynamics.",
        userId: user.id,
        subjectId: subjects[1].id, // Physics
        type: "exam",
        deadline: threeDaysLater,
        timeEstimate: 90, // 1.5 hours in minutes
        priority: "medium",
        completed: false,
        createdAt: addDays(today, -3)
      },
      {
        id: this.taskIdCounter++,
        title: "Literature Review Notes",
        description: "Organize notes on Victorian-era literature.",
        userId: user.id,
        subjectId: subjects[2].id, // English Literature
        type: "study",
        deadline: fiveDaysLater,
        timeEstimate: 30, // 30 minutes
        priority: "low",
        completed: false,
        createdAt: addDays(today, -1)
      },
      {
        id: this.taskIdCounter++,
        title: "Calculus Problem Set",
        description: "Complete problems 1-15 from Chapter 4.",
        userId: user.id,
        subjectId: subjects[3].id, // Mathematics
        type: "assignment",
        deadline: sevenDaysLater,
        timeEstimate: 90, // 1.5 hours in minutes
        priority: "medium",
        completed: false,
        createdAt: today
      }
    ];

    tasks.forEach(task => this.tasks.set(task.id, task));
  }

  // User methods implementation
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Subject methods implementation
  async getSubjects(userId: number): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(
      (subject) => subject.userId === userId
    );
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.subjectIdCounter++;
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  // Task methods implementation
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.userId === userId)
      .sort((a, b) => compareDesc(parseISO(b.deadline.toString()), parseISO(a.deadline.toString())));
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = { 
      ...insertTask, 
      id, 
      completed: false, 
      createdAt: new Date() 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateTask: UpdateTask): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask: Task = {
      ...existingTask,
      ...updateTask
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Advanced task methods implementation
  async getTasksByDate(userId: number, date: Date): Promise<Task[]> {
    const targetDate = startOfDay(date);
    
    return Array.from(this.tasks.values())
      .filter(task => {
        const taskDate = startOfDay(new Date(task.deadline));
        return task.userId === userId && 
               taskDate.getTime() === targetDate.getTime();
      })
      .sort((a, b) => {
        // Sort by priority first, then by deadline
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority] ||
               compareDesc(parseISO(b.deadline.toString()), parseISO(a.deadline.toString()));
      });
  }

  async getUpcomingTasks(userId: number, limit = 10): Promise<Task[]> {
    const now = new Date();
    
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId && !task.completed && 
              isAfter(new Date(task.deadline), now))
      .sort((a, b) => compareDesc(parseISO(b.deadline.toString()), parseISO(a.deadline.toString())))
      .slice(0, limit);
  }

  async getTasksBySubject(userId: number, subjectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId && task.subjectId === subjectId)
      .sort((a, b) => compareDesc(parseISO(b.deadline.toString()), parseISO(a.deadline.toString())));
  }

  // Analytics methods implementation
  async getSubjectDistribution(userId: number): Promise<SubjectDistribution[]> {
    const userTasks = await this.getTasks(userId);
    const userSubjects = await this.getSubjects(userId);
    
    // Count tasks per subject
    const subjectCounts = new Map<number, number>();
    userTasks.forEach(task => {
      if (!task.subjectId) return;
      const count = subjectCounts.get(task.subjectId) || 0;
      subjectCounts.set(task.subjectId, count + 1);
    });
    
    // Calculate percentages
    const totalTasks = userTasks.length;
    const distribution: SubjectDistribution[] = userSubjects.map(subject => {
      const count = subjectCounts.get(subject.id) || 0;
      const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      
      return {
        subjectId: subject.id,
        name: subject.name,
        color: subject.color,
        percentage
      };
    });
    
    // Sort by percentage (highest first)
    return distribution.sort((a, b) => b.percentage - a.percentage);
  }

  async getWeeklyProgress(userId: number): Promise<WeeklyProgress[]> {
    const today = new Date();
    const userTasks = await this.getTasks(userId);
    
    // Generate days of the week (last 7 days)
    const days: WeeklyProgress[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const dayName = format(date, 'EEE'); // 'Mon', 'Tue', etc.
      
      days.push({
        day: dayName,
        tasksCompleted: 0,
        tasksTotal: 0,
        studyTime: 0
      });
    }
    
    // Fill in the data
    userTasks.forEach(task => {
      const taskDate = new Date(task.deadline);
      const dayIndex = days.findIndex(d => {
        const dayDate = addDays(today, -days.findIndex(day => day.day === d.day));
        return format(dayDate, 'yyyy-MM-dd') === format(taskDate, 'yyyy-MM-dd');
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
  async getSuggestedNextTask(userId: number): Promise<TaskSuggestion | undefined> {
    const tasks = await this.getTasks(userId);
    if (tasks.length === 0) return undefined;
    
    // Filter to incomplete tasks
    const incompleteTasks = tasks.filter(task => !task.completed);
    if (incompleteTasks.length === 0) return undefined;
    
    // Simple algorithm - prioritize based on deadline and priority
    const sortedTasks = incompleteTasks.sort((a, b) => {
      // Convert priority to numeric value
      const priorityValue = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityValue[a.priority];
      const bPriority = priorityValue[b.priority];
      
      // Calculate days until deadline
      const now = new Date();
      const aDaysLeft = Math.max(0, Math.floor((new Date(a.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const bDaysLeft = Math.max(0, Math.floor((new Date(b.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Higher priority first, then earlier deadlines
      if (aPriority !== bPriority) return bPriority - aPriority;
      return aDaysLeft - bDaysLeft;
    });
    
    const topTask = sortedTasks[0];
    
    // Find subject name
    const subject = topTask.subjectId ? await this.getSubject(topTask.subjectId) : undefined;
    const subjectName = subject ? subject.name : "No Subject";
    
    // Generate reason based on priority and deadline
    let reason = "";
    const deadlineDate = new Date(topTask.deadline);
    if (isToday(deadlineDate)) {
      reason = "Due today";
    } else if (isBefore(deadlineDate, new Date())) {
      reason = "Overdue";
    } else {
      const daysLeft = Math.floor((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      reason = `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
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

  async generateDailySchedule(userId: number, date: Date): Promise<DailySchedule> {
    const tasks = await this.getTasksByDate(userId, date);
    
    // Generate time blocks based on tasks
    const timeBlocks: TimeBlock[] = [];
    let startTime = 10; // Start at 10 AM
    let totalAllocated = 0;
    const currentHour = new Date().getHours();
    
    tasks.forEach(task => {
      if (task.completed) return;
      
      // Convert minutes to hours
      const hours = task.timeEstimate / 60;
      const endTime = startTime + hours;
      
      // Format time strings (e.g., "10:00 AM")
      const startTimeStr = `${Math.floor(startTime)}:${(startTime % 1) * 60 === 0 ? '00' : (startTime % 1) * 60} ${startTime >= 12 ? 'PM' : 'AM'}`;
      const endTimeStr = `${Math.floor(endTime)}:${(endTime % 1) * 60 === 0 ? '00' : (endTime % 1) * 60} ${endTime >= 12 ? 'PM' : 'AM'}`;
      
      // Find subject name
      const subject = task.subjectId ? this.subjects.get(task.subjectId) : undefined;
      const subjectName = subject ? subject.name : "No Subject";
      
      // Check if this time block is current
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
      startTime = endTime + 0.5; // Add 30 min break
    });
    
    return {
      date: format(date, 'yyyy-MM-dd'),
      totalAllocated,
      timeBlocks
    };
  }
}

export const storage = new MemStorage();
