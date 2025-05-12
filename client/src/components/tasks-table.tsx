import { useEffect, useState } from "react";
import { Task, Subject } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  getSubjectInfo, 
  getTaskStatus, 
  getStatusLabel, 
  getStatusVariant, 
  getPriorityVariant, 
  formatDeadline 
} from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEMO_USER_ID } from "@/lib/constants";
import TaskForm from "./task-form";

interface TasksTableProps {
  tasks: Task[];
  subjects: Subject[];
}

export default function TasksTable({ tasks, subjects }: TasksTableProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Handle task completion toggle
  const handleCompletionToggle = async (taskId: number, completed: boolean) => {
    try {
      setIsUpdating(true);
      await apiRequest("PATCH", `/api/tasks/${taskId}`, { completed: !completed });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/tasks`] });
      toast({
        title: completed ? "Task marked as incomplete" : "Task completed!",
        description: "Task status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    try {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/tasks`] });
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Status</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">
                No tasks available. Create a new task to get started.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const status = getTaskStatus(task);
              const { name: subjectName, color: subjectColor } = getSubjectInfo(task, subjects);
              
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleCompletionToggle(task.id, task.completed)}
                      disabled={isUpdating}
                    />
                  </TableCell>
                  <TableCell className={task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
                    {task.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span 
                        className="subject-indicator mr-2 inline-block w-3 h-3 rounded-full" 
                        style={{ backgroundColor: subjectColor }}
                      ></span>
                      <span className="text-sm">{subjectName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDeadline(new Date(task.deadline))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <TaskForm 
                          subjects={subjects} 
                          task={task} 
                          onComplete={() => {
                            queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/tasks`] });
                          }}
                          triggerButton={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <i className="ri-edit-line mr-2 text-gray-500"></i>
                              Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          className="text-red-600 dark:text-red-400"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <i className="ri-delete-bin-line mr-2"></i>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
