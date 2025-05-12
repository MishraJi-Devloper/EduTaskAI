import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEMO_USER_ID } from "@/lib/constants";
import { Task, Subject, DailySchedule } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { getSubjectInfo, formatTimeEstimate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import TaskForm from "@/components/task-form";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, parseISO } from "date-fns";
import { PlusIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Calendar() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const formattedDate = format(date, "yyyy-MM-dd");
  
  // Fetch tasks data for the calendar
  const { data: tasks } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/tasks`],
    enabled: true,
  });
  
  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/subjects`],
    enabled: true,
  });
  
  // Fetch schedule for selected date
  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/schedule/${formattedDate}`],
    enabled: true,
  });
  
  // Handle task completion toggle
  const handleTaskCompletion = async (taskId: number, completed: boolean) => {
    try {
      await apiRequest("PATCH", `/api/tasks/${taskId}`, {
        completed: !completed
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/tasks`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/schedule/${formattedDate}`] });
      toast({
        title: completed ? "Task marked as incomplete" : "Task completed!",
        description: "Task status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Get tasks for the selected date
  const tasksForSelectedDate = tasks
    ? tasks.filter((task: Task) => {
        const taskDate = new Date(task.deadline);
        return isSameDay(taskDate, date);
      })
    : [];
    
  // Helper to get day with tasks for calendar highlighting
  const getDayClassNames = (day: Date) => {
    if (!tasks) return "";
    
    const hasTasksOnDay = tasks.some((task: Task) => {
      const taskDate = new Date(task.deadline);
      return isSameDay(taskDate, day);
    });
    
    return hasTasksOnDay ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium" : "";
  };
  
  // Navigation to previous/next day
  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setDate(newDate);
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan your schedule and track deadlines</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <TaskForm 
            subjects={subjects || []}
            onComplete={() => {
              queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/tasks`] });
            }}
            triggerButton={
              <Button className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add New Task
              </Button>
            }
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
              components={{
                DayContent: ({ date }) => (
                  <div className={`h-9 w-9 p-0 font-normal flex items-center justify-center rounded-md ${getDayClassNames(date)}`}>
                    {format(date, "d")}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>
        
        {/* Daily Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={() => navigateDay("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg font-semibold mx-4">
                {format(date, "MMMM d, yyyy")}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={() => navigateDay("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="outline" className="font-normal">
              {tasksForSelectedDate.length} task{tasksForSelectedDate.length !== 1 ? 's' : ''}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoadingSchedule ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : schedule && schedule.timeBlocks.length > 0 ? (
              <div className="space-y-3">
                {schedule.timeBlocks.map((block, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${
                      block.isCurrent 
                        ? "bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800" 
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium ${
                        block.isCurrent 
                          ? "text-primary-800 dark:text-primary-300" 
                          : "text-gray-800 dark:text-gray-300"
                      }`}>
                        {block.startTime} - {block.endTime}
                      </span>
                      {block.isCurrent && (
                        <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-800/50 py-0.5 px-2 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${
                          block.isCurrent 
                            ? "text-primary-700 dark:text-primary-300" 
                            : "text-gray-700 dark:text-gray-300"
                        }`}>
                          {block.title}
                        </p>
                        <div className="flex items-center mt-1">
                          <span 
                            className="w-2 h-2 rounded-full mr-1.5" 
                            style={{ 
                              backgroundColor: subjects?.find(s => s.name === block.subjectName)?.color || '#4338ca' 
                            }}
                          ></span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {block.subjectName}
                          </span>
                        </div>
                      </div>
                      <div>
                        {tasksForSelectedDate.map((task: Task) => {
                          if (task.id === block.taskId) {
                            return (
                              <input 
                                key={task.id}
                                type="checkbox" 
                                checked={task.completed}
                                onChange={() => handleTaskCompletion(task.id, task.completed)}
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : tasksForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {tasksForSelectedDate.map((task: Task) => {
                  const { name, color } = getSubjectInfo(task, subjects || []);
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={task.completed}
                            onChange={() => handleTaskCompletion(task.id, task.completed)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {task.title}
                          </span>
                        </div>
                        <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "warning" : "success"}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      </div>
                      <div className="ml-6 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <span 
                            className="w-2 h-2 rounded-full mr-1.5" 
                            style={{ backgroundColor: color }}
                          ></span>
                          <span>{name}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="ri-time-line mr-1.5 text-gray-400"></i>
                          <span>{formatTimeEstimate(task.timeEstimate)}</span>
                        </div>
                        <div className="flex items-center">
                          <i className={`ri-${task.type === "assignment" ? "file-list-line" : task.type === "exam" ? "exam-line" : "book-open-line"} mr-1.5 text-gray-400`}></i>
                          <span className="capitalize">{task.type}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-3">
                  <i className="ri-calendar-line text-5xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No tasks scheduled
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  There are no tasks scheduled for {format(date, "MMMM d, yyyy")}
                </p>
                <TaskForm 
                  subjects={subjects || []}
                  onComplete={() => {
                    queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/tasks`] });
                  }}
                  triggerButton={
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Task for This Day
                    </Button>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
