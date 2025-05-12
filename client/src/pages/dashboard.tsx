import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEMO_USER_ID } from "@/lib/constants";
import { Task, Subject } from "@/lib/types";
import AISuggestion from "@/components/ai-suggestion";
import ScheduleCard from "@/components/schedule-card";
import ProgressChart from "@/components/progress-chart";
import SubjectDistributionChart from "@/components/subject-distribution";
import TaskCard from "@/components/task-card";
import TasksTable from "@/components/tasks-table";
import TaskForm from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  // Fetch user's tasks
  const { 
    data: tasks, 
    isLoading: isLoadingTasks,
    refetch: refetchTasks
  } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/tasks`],
    enabled: true,
  });
  
  // Fetch user's subjects
  const { 
    data: subjects, 
    isLoading: isLoadingSubjects 
  } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/subjects`],
    enabled: true,
  });
  
  // Fetch user's upcoming tasks
  const { 
    data: upcomingTasks,
    isLoading: isLoadingUpcoming
  } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/tasks/upcoming`],
    enabled: true,
  });
  
  // Get today's tasks
  const todayDate = new Date().toISOString().split('T')[0];
  const { 
    data: todayTasks,
    isLoading: isLoadingTodayTasks
  } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/tasks/date/${todayDate}`],
    enabled: true,
  });
  
  // Loading state
  const isLoading = isLoadingTasks || isLoadingSubjects || isLoadingTodayTasks;
  
  return (
    <div>
      {/* Dashboard Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hello, Alex! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's what you need to focus on today.</p>
      </motion.div>

      {/* AI Suggestion Card */}
      <div className="mb-8">
        <AISuggestion />
      </div>

      {/* Task Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h2>
            <TaskForm 
              subjects={subjects || []}
              onComplete={() => refetchTasks()}
              triggerButton={
                <Button size="sm" variant="ghost" className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-2 rounded-full">
                  <PlusIcon className="h-5 w-5" />
                </Button>
              }
            />
          </div>
          
          <div className="space-y-3" id="tasks-container">
            {isLoadingTodayTasks ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div 
                  key={index}
                  className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="ml-7">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : todayTasks && todayTasks.length > 0 ? (
              todayTasks.map((task: Task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  subjects={subjects || []} 
                  onUpdate={() => refetchTasks()}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks for today</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  Add tasks to plan your day effectively
                </p>
                <TaskForm 
                  subjects={subjects || []}
                  onComplete={() => refetchTasks()}
                  triggerButton={
                    <Button size="sm">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Your First Task
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Today's Schedule */}
        <div>
          <ScheduleCard />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        <div>
          <SubjectDistributionChart />
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingUpcoming ? (
            <div className="flex justify-center py-4">
              <p className="text-gray-500 dark:text-gray-400">Loading upcoming tasks...</p>
            </div>
          ) : (
            <TasksTable 
              tasks={upcomingTasks || []} 
              subjects={subjects || []} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
