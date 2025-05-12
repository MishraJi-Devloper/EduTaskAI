import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DailySchedule } from "@/lib/types";
import { DEMO_USER_ID } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ScheduleCard() {
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Fetch daily schedule
  const { data: schedule, isLoading } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/schedule/${today}`],
    enabled: true,
  });
  
  // Calculate progress percentage
  const calculateProgress = (totalMinutes: number) => {
    // Assuming an average workday is 10 hours (600 minutes)
    const maxMinutes = 600;
    return Math.min(Math.round((totalMinutes / maxMinutes) * 100), 100);
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Time allocated</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {isLoading ? "..." : schedule && `${(schedule.totalAllocated / 60).toFixed(1)} hrs`}
            </span>
          </div>
          <Progress 
            value={isLoading ? 0 : schedule ? calculateProgress(schedule.totalAllocated) : 0} 
            className="h-2" 
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : schedule && schedule.timeBlocks.length > 0 ? (
          <div className="space-y-3 mb-6">
            {schedule.timeBlocks.map((block, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-3 rounded-lg border ${
                  block.isCurrent 
                    ? "bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
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
                <p className={block.isCurrent 
                  ? "text-sm text-primary-700 dark:text-primary-300" 
                  : "text-sm text-gray-600 dark:text-gray-400"
                }>
                  {block.title}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks scheduled for today</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Add tasks with today's deadline to see your schedule
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button variant="default" className="w-full flex items-center justify-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>View Full Schedule</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
