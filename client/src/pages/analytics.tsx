import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEMO_USER_ID } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectDistribution, WeeklyProgress, Task } from "@/lib/types";
import { formatTimeEstimate } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tasks Completed: {payload[0].value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Study Time: {formatTimeEstimate(payload[1] ? payload[1].value : 0)}
        </p>
      </div>
    );
  }

  return null;
}

export default function Analytics() {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  
  // Fetch weekly progress data
  const { data: weeklyProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/analytics/weekly-progress`],
    enabled: true,
  });
  
  // Fetch subject distribution data
  const { data: subjectDistribution, isLoading: isLoadingDistribution } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/analytics/subject-distribution`],
    enabled: true,
  });
  
  // Fetch all tasks
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/tasks`],
    enabled: true,
  });
  
  // Calculate completion rate
  const completionRate = tasks 
    ? Math.round((tasks.filter((task: Task) => task.completed).length / tasks.length) * 100) || 0
    : 0;
  
  // Calculate total study time
  const totalStudyTime = tasks
    ? tasks.filter((task: Task) => task.completed).reduce((acc: number, task: Task) => acc + task.timeEstimate, 0)
    : 0;
  
  // Calculate tasks by type
  const tasksByType = tasks
    ? ["assignment", "project", "exam", "study"].map(type => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: tasks.filter((task: Task) => task.type === type).length
      }))
    : [];
  
  // Calculate priority distribution
  const priorityDistribution = tasks
    ? ["high", "medium", "low"].map(priority => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: tasks.filter((task: Task) => task.priority === priority).length,
        color: priority === "high" ? "#ef4444" : priority === "medium" ? "#f59e0b" : "#22c55e"
      }))
    : [];
  
  // Data for subject time chart
  const subjectTimeData = subjectDistribution
    ? subjectDistribution.map((subject: SubjectDistribution) => ({
        name: subject.name,
        value: subject.percentage,
        color: subject.color
      }))
    : [];
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your academic performance and study habits</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</span>
                <span className={`text-xs py-1 px-2 rounded-full ${
                  completionRate >= 70 ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" :
                  completionRate >= 40 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                  "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                }`}>
                  {isLoadingTasks ? "..." : `${completionRate}%`}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isLoadingTasks ? "..." : completionRate}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isLoadingTasks ? "..." : tasks
                  ? `${tasks.filter((task: Task) => task.completed).length}/${tasks.length} tasks completed`
                  : "0/0 tasks completed"
                }
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Study Time</span>
                <span className="text-xs py-1 px-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                  This week
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isLoadingTasks ? "..." : `${(totalStudyTime / 60).toFixed(1)}`}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                hours
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subjects</span>
                <span className="text-xs py-1 px-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {isLoadingDistribution ? "..." : subjectDistribution ? subjectDistribution.length : 0}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isLoadingDistribution ? "..." : subjectDistribution ? subjectDistribution.length : 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                subjects tracked
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</span>
                <span className="text-xs py-1 px-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  Action needed
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isLoadingTasks ? "..." : tasks ? tasks.filter((task: Task) => !task.completed).length : 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                tasks remaining
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Weekly Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoadingProgress ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400 dark:text-gray-500">
                    Loading chart data...
                  </div>
                </div>
              ) : weeklyProgress ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyProgress}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="tasksCompleted" 
                      name="Tasks Completed" 
                      fill={theme === "dark" ? "#6366f1" : "#4f46e5"}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="studyTime" 
                      name="Study Time (minutes)" 
                      fill={theme === "dark" ? "#a855f7" : "#8b5cf6"}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No progress data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoadingDistribution ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400 dark:text-gray-500">
                    Loading chart data...
                  </div>
                </div>
              ) : subjectTimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectTimeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {subjectTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No subject data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Task Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Task Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoadingTasks ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400 dark:text-gray-500">
                    Loading chart data...
                  </div>
                </div>
              ) : tasksByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tasksByType}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
                    <XAxis 
                      type="number"
                      tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      tick={{ fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      name="Tasks" 
                      fill={theme === "dark" ? "#22c55e" : "#10b981"}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No task type data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoadingTasks ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400 dark:text-gray-500">
                    Loading chart data...
                  </div>
                </div>
              ) : priorityDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No priority data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Productivity Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Productivity Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Most Productive Day</div>
              <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">Thursday</div>
              <div className="text-xs text-success">
                40% of tasks completed
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Best Subject</div>
              <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">Computer Science</div>
              <div className="text-xs text-success">
                8 tasks completed
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Average Study Time</div>
              <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                {isLoadingTasks || !tasks ? "..." : (totalStudyTime / (7 * 60)).toFixed(1)} hours
              </div>
              <div className="text-xs text-success">
                per day
              </div>
            </div>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-100 dark:border-primary-800">
            <div className="flex items-center space-x-2 mb-2">
              <i className="ri-lightbulb-line text-primary-600 dark:text-primary-400"></i>
              <h3 className="font-medium text-primary-800 dark:text-primary-300">AI Productivity Tip</h3>
            </div>
            <p className="text-sm text-primary-700 dark:text-primary-300">
              Based on your study patterns, you could improve your productivity by starting tasks earlier in the day. 
              Try allocating 30-minute study blocks between classes for better retention.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
