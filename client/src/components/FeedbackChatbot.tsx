import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Bot, User, X, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  feedbackType?: "feedback" | "suggestion" | "bug_report" | "feature_request";
  rating?: number;
}

interface ParsedFeedback {
  type: "feedback" | "suggestion" | "bug_report" | "feature_request";
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: "ui_ux" | "functionality" | "performance" | "content" | "other";
  rating?: number;
}

interface FeedbackChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackChatbot({ isOpen, onClose }: FeedbackChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "bot",
      content: "Hello! I'm here to help you share feedback, suggestions, or report issues. What would you like to discuss today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Partial<ParsedFeedback> | null>(null);
  const [conversationStep, setConversationStep] = useState<"initial" | "gathering" | "rating" | "confirmation">("initial");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const submitFeedback = useMutation({
    mutationFn: async (feedback: ParsedFeedback) => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...feedback,
          userType: "anonymous",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      
      return response.json();
    },
    onSuccess: () => {
      addBotMessage("Thank you! Your feedback has been submitted successfully. Our team will review it and get back to you if needed.");
      setCurrentFeedback(null);
      setConversationStep("initial");
      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve!",
      });
    },
    onError: () => {
      addBotMessage("I'm sorry, there was an error submitting your feedback. Please try again or use the feedback form instead.");
    },
  });

  const addMessage = (content: string, type: "user" | "bot", feedbackType?: ChatMessage["feedbackType"], rating?: number) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      feedbackType,
      rating,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const addBotMessage = (content: string) => {
    setTimeout(() => {
      addMessage(content, "bot");
    }, 500);
  };

  const parseUserIntent = (message: string): { type: string; confidence: number } => {
    const lowerMessage = message.toLowerCase();
    
    // Bug report indicators
    if (lowerMessage.includes("bug") || lowerMessage.includes("error") || lowerMessage.includes("broken") || 
        lowerMessage.includes("crash") || lowerMessage.includes("not working") || lowerMessage.includes("issue")) {
      return { type: "bug_report", confidence: 0.9 };
    }
    
    // Feature request indicators
    if (lowerMessage.includes("feature") || lowerMessage.includes("add") || lowerMessage.includes("want") ||
        lowerMessage.includes("wish") || lowerMessage.includes("could you") || lowerMessage.includes("would be nice")) {
      return { type: "feature_request", confidence: 0.8 };
    }
    
    // Suggestion indicators
    if (lowerMessage.includes("suggest") || lowerMessage.includes("improve") || lowerMessage.includes("better") ||
        lowerMessage.includes("enhancement") || lowerMessage.includes("idea")) {
      return { type: "suggestion", confidence: 0.8 };
    }
    
    // General feedback
    return { type: "feedback", confidence: 0.6 };
  };

  const categorizeFeedback = (message: string): ParsedFeedback["category"] => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("slow") || lowerMessage.includes("fast") || lowerMessage.includes("performance") ||
        lowerMessage.includes("speed") || lowerMessage.includes("loading")) {
      return "performance";
    }
    
    if (lowerMessage.includes("design") || lowerMessage.includes("interface") || lowerMessage.includes("ui") ||
        lowerMessage.includes("ux") || lowerMessage.includes("layout") || lowerMessage.includes("look")) {
      return "ui_ux";
    }
    
    if (lowerMessage.includes("content") || lowerMessage.includes("text") || lowerMessage.includes("information") ||
        lowerMessage.includes("wording") || lowerMessage.includes("copy")) {
      return "content";
    }
    
    if (lowerMessage.includes("function") || lowerMessage.includes("feature") || lowerMessage.includes("work") ||
        lowerMessage.includes("does") || lowerMessage.includes("button") || lowerMessage.includes("click")) {
      return "functionality";
    }
    
    return "other";
  };

  const determinePriority = (message: string, type: string): ParsedFeedback["priority"] => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("urgent") || lowerMessage.includes("critical") || lowerMessage.includes("serious") ||
        lowerMessage.includes("important") || type === "bug_report") {
      return "high";
    }
    
    if (lowerMessage.includes("minor") || lowerMessage.includes("small") || lowerMessage.includes("simple")) {
      return "low";
    }
    
    return "medium";
  };

  const generateTitle = (message: string, type: string): string => {
    const words = message.split(" ").slice(0, 8).join(" ");
    const typePrefix = {
      "bug_report": "Bug Report:",
      "feature_request": "Feature Request:",
      "suggestion": "Suggestion:",
      "feedback": "Feedback:"
    }[type] || "Feedback:";
    
    return `${typePrefix} ${words}${words.length > 50 ? "..." : ""}`;
  };

  const handleUserMessage = async (content: string) => {
    addMessage(content, "user");
    setIsProcessing(true);

    if (conversationStep === "initial" || conversationStep === "gathering") {
      const intent = parseUserIntent(content);
      const category = categorizeFeedback(content);
      const priority = determinePriority(content, intent.type);
      const title = generateTitle(content, intent.type);

      const feedback: Partial<ParsedFeedback> = {
        type: intent.type as ParsedFeedback["type"],
        title,
        message: content,
        category,
        priority,
      };

      setCurrentFeedback(feedback);

      if (intent.type === "feedback" && intent.confidence > 0.7) {
        setConversationStep("rating");
        addBotMessage("Thank you for your feedback! On a scale of 1-5 stars, how would you rate your overall experience? You can type a number or click the stars below.");
      } else {
        setConversationStep("confirmation");
        addBotMessage(`I understand you want to submit a ${intent.type.replace("_", " ")}. I've categorized this as ${category.replace("_", "/")} with ${priority} priority. Would you like me to submit this feedback? (Type 'yes' to confirm or 'no' to make changes)`);
      }
    } else if (conversationStep === "rating") {
      const rating = parseInt(content);
      if (rating >= 1 && rating <= 5) {
        setCurrentFeedback(prev => ({ ...prev, rating }));
        setConversationStep("confirmation");
        addBotMessage(`Thank you for the ${rating}-star rating! Would you like me to submit your feedback now? (Type 'yes' to confirm)`);
      } else {
        addBotMessage("Please provide a rating between 1 and 5 stars, or click one of the star buttons below.");
      }
    } else if (conversationStep === "confirmation") {
      if (content.toLowerCase().includes("yes") || content.toLowerCase().includes("submit") || 
          content.toLowerCase().includes("confirm")) {
        if (currentFeedback && currentFeedback.type && currentFeedback.title && currentFeedback.message) {
          submitFeedback.mutate(currentFeedback as ParsedFeedback);
        }
      } else if (content.toLowerCase().includes("no") || content.toLowerCase().includes("cancel")) {
        setCurrentFeedback(null);
        setConversationStep("initial");
        addBotMessage("No problem! Feel free to share your feedback again, and I'll help you submit it.");
      } else {
        addBotMessage("Please type 'yes' to submit your feedback or 'no' to make changes.");
      }
    }

    setIsProcessing(false);
  };

  const handleStarRating = (rating: number) => {
    setCurrentFeedback(prev => ({ ...prev, rating }));
    setConversationStep("confirmation");
    addBotMessage(`Thank you for the ${rating}-star rating! Would you like me to submit your feedback now? (Type 'yes' to confirm)`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      handleUserMessage(input.trim());
      setInput("");
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Feedback Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.rating && (
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= message.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {conversationStep === "rating" && (
            <div className="px-6 py-2">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStarRating(star)}
                    className="p-1"
                  >
                    <Star className="h-6 w-6 text-yellow-400 hover:fill-yellow-400" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Separator />
          
          <div className="p-6 pt-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your feedback or question..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (input.trim()) {
                    handleUserMessage(input.trim());
                    setInput("");
                  }
                }}
                disabled={isProcessing || !input.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {currentFeedback && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">
                    {currentFeedback.type?.replace("_", " ").toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {currentFeedback.priority}
                  </Badge>
                  <Badge variant="outline">
                    {currentFeedback.category?.replace("_", "/")}
                  </Badge>
                  {currentFeedback.rating && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= currentFeedback.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}