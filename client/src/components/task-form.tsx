import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTaskSchema } from "@shared/schema";
import { Task, Subject, TaskFormValues } from "@/lib/types";
import { TASK_TYPES, TASK_PRIORITIES, DEMO_USER_ID } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";

interface TaskFormProps {
  subjects: Subject[];
  task?: Task; // Optional for editing existing task
  onComplete: () => void;
  triggerButton?: React.ReactNode;
}

// Extend the task insert schema with client-side validation
const taskFormSchema = insertTaskSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  deadline: z.date(),
  timeEstimate: z.number().min(1, "Time estimate must be at least 1 minute"),
});

export default function TaskForm({
  subjects,
  task,
  onComplete,
  triggerButton,
}: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Set up form with React Hook Form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || "",
          subjectId: task.subjectId || 0,
          type: task.type,
          deadline: new Date(task.deadline),
          timeEstimate: task.timeEstimate,
          priority: task.priority,
        }
      : {
          title: "",
          description: "",
          subjectId: subjects.length > 0 ? subjects[0].id : 0,
          type: "assignment",
          deadline: new Date(),
          timeEstimate: 60,
          priority: "medium",
        },
  });
  
  // Update form values when editing task changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        subjectId: task.subjectId || 0,
        type: task.type,
        deadline: new Date(task.deadline),
        timeEstimate: task.timeEstimate,
        priority: task.priority,
      });
    }
  }, [task, form]);

  // Handle form submission
  const onSubmit = async (values: TaskFormValues) => {
    try {
      if (task) {
        // Update existing task
        await apiRequest("PATCH", `/api/tasks/${task.id}`, values);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        // Create new task
        await apiRequest("POST", "/api/tasks", {
          ...values,
          userId: DEMO_USER_ID,
        });
        toast({
          title: "Task created",
          description: "Your new task has been created successfully.",
        });
      }
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER_ID}/tasks`] });
      
      // Close dialog and notify parent
      setOpen(false);
      form.reset();
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${task ? "update" : "create"} task. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button size="sm" className="gap-1">
            <PlusIcon className="w-4 h-4" />
            <span>Add Task</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            <div className="flex items-center">
                              <span
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: subject.color }}
                              ></span>
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeEstimate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Estimate (minutes)</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TASK_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add details about your task"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                {task ? "Update Task" : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
