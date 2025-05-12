import OpenAI from "openai";
import { Task, Subject, TaskSuggestion } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key" });

// Function to generate AI-powered task suggestions
export async function generateTaskSuggestion(tasks: Task[], subjects: Subject[]): Promise<TaskSuggestion> {
  if (!tasks.length) {
    throw new Error("No tasks available for suggestion");
  }

  // Filter to incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  if (!incompleteTasks.length) {
    throw new Error("No incomplete tasks available for suggestion");
  }

  try {
    // Prepare task data for the prompt
    const tasksData = incompleteTasks.map(task => {
      const subject = subjects.find(s => s.id === task.subjectId);
      return {
        id: task.id,
        title: task.title,
        subject: subject?.name || "No Subject",
        type: task.type,
        deadline: new Date(task.deadline).toISOString().split('T')[0],
        timeEstimate: task.timeEstimate,
        priority: task.priority
      };
    });

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Create the prompt
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
    
    // Format and validate the response
    const suggestion: TaskSuggestion = {
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
    
    // Fallback to a simple algorithm if AI fails
    const task = incompleteTasks.sort((a, b) => {
      // Sort by deadline (closest first)
      const aDate = new Date(a.deadline);
      const bDate = new Date(b.deadline);
      if (aDate.getTime() !== bDate.getTime()) {
        return aDate.getTime() - bDate.getTime();
      }
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })[0];
    
    const subject = subjects.find(s => s.id === task.subjectId);
    
    // Calculate days until deadline
    const now = new Date();
    const deadline = new Date(task.deadline);
    const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    const reason = daysLeft === 0 
      ? "Due today and urgent" 
      : `Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
    
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
