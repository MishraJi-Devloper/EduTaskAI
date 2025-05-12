import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WeeklyProgress } from "@/lib/types";
import { DEMO_USER_ID } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { formatTimeEstimate } from "@/lib/utils";

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded-md border border-gray-200 dark:border-gray-700">
        <p className="font-medium">{data.day}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.tasksCompleted}/{data.tasksTotal} tasks
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatTimeEstimate(data.studyTime)}
        </p>
      </div>
    );
  }

  return null;
}

export default function ProgressChart() {
  const { theme } = useTheme();
  
  // Fetch weekly progress data
  const { data: progressData, isLoading } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/analytics/weekly-progress`],
    enabled: true,
  });
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weekly Progress</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="h-64 mb-4">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400 dark:text-gray-500">
                Loading chart data...
              </div>
            </div>
          ) : progressData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                />
                <XAxis 
                  dataKey="day" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="studyTime" 
                  radius={[4, 4, 0, 0]}
                  background={{ fill: theme === "dark" ? "#374151" : "#f3f4f6" }}
                >
                  {progressData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={theme === "dark" ? "#4f46e5" : "#6366f1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No progress data available</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {isLoading ? "..." : progressData ? (
                `${progressData.reduce((acc, day) => acc + day.tasksCompleted, 0)}/${progressData.reduce((acc, day) => acc + day.tasksTotal, 0)}`
              ) : "0/0"}
            </div>
            <div className="text-xs text-success">
              {isLoading ? "..." : progressData ? (
                `${Math.round((progressData.reduce((acc, day) => acc + day.tasksCompleted, 0) / 
                Math.max(1, progressData.reduce((acc, day) => acc + day.tasksTotal, 0))) * 100)}% completion rate`
              ) : "0% completion rate"}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Study Time</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {isLoading ? "..." : progressData ? (
                `${(progressData.reduce((acc, day) => acc + day.studyTime, 0) / 60).toFixed(1)} hours`
              ) : "0 hours"}
            </div>
            <div className="text-xs text-success">
              ↑ 2.5h from last week
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
