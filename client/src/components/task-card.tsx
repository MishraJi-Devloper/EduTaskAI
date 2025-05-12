import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Task, Subject } from "@/lib/types";
import { 
  generateTaskLabels, 
  formatTimeEstimate, 
  formatDeadline, 
  getPriorityColorClass, 
  getSubjectInfo,
  getTaskTypeIcon
} from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  subjects: Subject[];
  onUpdate: () => void;
}

export default function TaskCard({ task, subjects, onUpdate }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();
  
  // Generate labels
  const labels = generateTaskLabels(task);
  
  // Get subject info
  const { name: subjectName, color: subjectColor } = getSubjectInfo(task, subjects);
  
  // Get priority border class
  const priorityBorderClass = getPriorityColorClass(task.priority);
  
  // Handle task completion toggle
  const handleCompletionToggle = async () => {
    try {
      setIsCompleting(true);
      await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        completed: !task.completed
      });
      onUpdate();
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task completed!",
        description: task.title,
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`task-card bg-white dark:bg-gray-800 p-4 rounded-lg border ${priorityBorderClass} shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={handleCompletionToggle}
            disabled={isCompleting}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className={`font-medium text-gray-900 dark:text-white ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {task.title}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {labels.map((label, index) => (
            <Badge 
              key={index} 
              variant={label.color as any} 
              className="text-xs py-1 px-2"
            >
              {label.text}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="ml-7 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className="flex items-center">
            <span 
              className="subject-indicator mr-1.5 inline-block w-3 h-3 rounded-full" 
              style={{ backgroundColor: subjectColor }}
            ></span>
            <span>{subjectName}</span>
          </div>
          <div className="flex items-center">
            <i className="ri-time-line mr-1.5 text-gray-400"></i>
            <span>{formatTimeEstimate(task.timeEstimate)}</span>
          </div>
          <div className="flex items-center">
            <i className="ri-calendar-line mr-1.5 text-gray-400"></i>
            <span>{formatDeadline(new Date(task.deadline))}</span>
          </div>
          <div className="flex items-center">
            <i className={`${getTaskTypeIcon(task.type)} mr-1.5 text-gray-400`}></i>
            <span className="capitalize">{task.type}</span>
          </div>
        </div>
        {task.description && <p>{task.description}</p>}
      </div>
    </motion.div>
  );
}
