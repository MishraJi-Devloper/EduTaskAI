import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AI_PROMPT_SUGGESTIONS } from "@/lib/constants";
import { AIMessage } from "@/lib/types";

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    { 
      role: "assistant", 
      content: "Hi there! I'm your AI assistant. How can I help with your tasks and studies today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: AIMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Simulate AI response (in a real app, this would call the AI service)
    setIsLoading(true);
    
    setTimeout(() => {
      const aiResponse: AIMessage = { 
        role: "assistant", 
        content: "I'm a demo AI assistant. In the full version, I would provide intelligent responses to help you manage your academic tasks. Try asking me about task prioritization, study plans, or deadline management!" 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 lg:bottom-6 z-20 shadow-lg bg-primary-600 hover:bg-primary-700 text-white w-12 h-12 rounded-full flex items-center justify-center"
        size="icon"
      >
        <Bot size={22} />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col max-h-screen">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Chat Assistant
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 px-1">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "assistant" 
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                        : "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {AI_PROMPT_SUGGESTIONS.map((suggestion, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs py-1 px-2"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask me anything about your tasks..."
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
