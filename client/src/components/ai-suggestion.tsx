import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTimeEstimate, formatDeadline } from "@/lib/utils";
import { TaskSuggestion } from "@/lib/types";
import { DEMO_USER_ID } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function AISuggestion() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch AI suggestion
  const { data: suggestion, isLoading, error } = useQuery({
    queryKey: [`/api/users/${DEMO_USER_ID}/ai/suggested-task`],
    enabled: true,
  });
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Effect to invalidate and refetch on refreshKey change
  useEffect(() => {
    if (refreshKey > 0) {
      // We don't need to explicitly refetch here as we're changing the refreshKey
      // which will cause the component to re-render and the query to be executed again
    }
  }, [refreshKey]);
  
  // Show error toast if fetch fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load AI suggestion",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Bot size={20} />
                <h3 className="font-semibold">AI Suggestion</h3>
              </div>
              <p className="mb-4">Based on your schedule, I recommend working on:</p>
              
              {isLoading ? (
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm animate-pulse h-24">
                  <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/30 rounded w-1/2 mb-3"></div>
                  <div className="h-3 bg-white/30 rounded w-5/6"></div>
                </div>
              ) : suggestion ? (
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-sm opacity-90 mb-2">
                    {suggestion.reason} · Est. time: {formatTimeEstimate(suggestion.timeEstimate)}
                  </p>
                  <div className="text-sm">
                    Start now to avoid last-minute pressure. This is from your {suggestion.subjectName} subject.
                  </div>
                </div>
              ) : (
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <h4 className="font-medium">No tasks to suggest</h4>
                  <p className="text-sm opacity-90">
                    Add some tasks to get AI-powered suggestions.
                  </p>
                </div>
              )}
            </div>
            <Button 
              onClick={handleRefresh}
              variant="ghost" 
              size="icon"
              className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              disabled={isLoading}
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
