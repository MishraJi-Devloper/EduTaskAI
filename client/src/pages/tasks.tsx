import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEMO_USER_ID } from "@/lib/constants";
import { Task, Subject } from "@/lib/types";
import TaskForm from "@/components/task-form";
import TaskCard from "@/components/task-card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  formatDeadline, 
  getSubjectInfo, 
  getPriorityVariant, 
  getStatusVariant, 
  getStatusLabel,
  getTaskStatus
} from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon, MoreHorizontal, CheckCircle, Filter } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const { toast } = useToast();
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  
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
  
  // Loading state
  const isLoading = isLoadingTasks || isLoadingSubjects;
  
  // Filter tasks based on selected filter
  const filteredTasks = tasks ? tasks.filter((task: Task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    if (filter === "incomplete") return !task.completed;
    if (filter === "high") return task.priority === "high" && !task.completed;
    if (filter === "today") {
      const today = new Date().setHours(0, 0, 0, 0);
      const taskDate = new Date(task.deadline).setHours(0, 0, 0, 0);
      return taskDate === today && !task.completed;
    }
    if (filter === "overdue") {
      const today = new Date().setHours(0, 0, 0, 0);
      const taskDate = new Date(task.deadline).setHours(0, 0, 0, 0);
      return taskDate < today && !task.completed;
    }
    return true;
  }) : [];
  
  // Table columns definition
  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={task.completed}
              onChange={() => handleTaskCompletion(task)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className={task.completed ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "subjectId",
      header: "Subject",
      cell: ({ row }) => {
        const task = row.original;
        const { name, color } = getSubjectInfo(task, subjects || []);
        return (
          <div className="flex items-center gap-2">
            <span 
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "deadline",
      header: "Deadline",
      cell: ({ row }) => {
        return formatDeadline(new Date(row.original.deadline));
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority;
        return (
          <Badge variant={getPriorityVariant(priority)}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getTaskStatus(row.original);
        return (
          <Badge variant={getStatusVariant(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <TaskForm 
                subjects={subjects || []} 
                task={task} 
                onComplete={() => refetchTasks()}
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
        );
      },
    },
  ];
  
  // Handle task completion toggle
  const handleTaskCompletion = async (task: Task) => {
    try {
      await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        completed: !task.completed
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/tasks`] });
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
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your academic tasks and assignments</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <TaskForm 
            subjects={subjects || []}
            onComplete={() => refetchTasks()}
            triggerButton={
              <Button className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add New Task
              </Button>
            }
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
              <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="high">High Priority</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2">
            <Input placeholder="Search tasks..." className="w-full sm:w-auto max-w-xs" />
            <div className="flex gap-1">
              <Button 
                variant={view === "grid" ? "default" : "outline"} 
                size="icon" 
                onClick={() => setView("grid")}
              >
                <i className="ri-grid-line text-base"></i>
              </Button>
              <Button 
                variant={view === "list" ? "default" : "outline"} 
                size="icon" 
                onClick={() => setView("list")}
              >
                <i className="ri-list-check-2 text-base"></i>
              </Button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filter === "all"
                ? "You don't have any tasks yet. Create your first task to get started."
                : filter === "completed"
                ? "You don't have any completed tasks yet."
                : filter === "today"
                ? "You don't have any tasks due today."
                : "No tasks match the current filter."}
            </p>
            <TaskForm 
              subjects={subjects || []}
              onComplete={() => refetchTasks()}
              triggerButton={
                <Button>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add New Task
                </Button>
              }
            />
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task: Task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                subjects={subjects || []} 
                onUpdate={() => refetchTasks()}
              />
            ))}
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredTasks} 
            searchKey="title" 
            searchPlaceholder="Search tasks..."
          />
        )}
      </div>
    </div>
  );
}
