import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Lightbulb, Bug, Zap, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackFormData {
  type: "feedback" | "suggestion" | "bug_report" | "feature_request";
  title: string;
  message: string;
  rating?: number;
  category?: "ui_ux" | "functionality" | "performance" | "content" | "other";
  userEmail?: string;
  userType: "guest" | "tenant" | "admin" | "anonymous";
  priority: "low" | "medium" | "high" | "urgent";
}

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "feedback" | "suggestion" | "bug_report" | "feature_request";
}

export function FeedbackForm({ isOpen, onClose, defaultType = "feedback" }: FeedbackFormProps) {
  const [showRating, setShowRating] = useState(defaultType === "feedback");
  const [rating, setRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FeedbackFormData>({
    defaultValues: {
      type: defaultType,
      title: "",
      message: "",
      rating: undefined,
      category: "other",
      userEmail: "",
      userType: "anonymous",
      priority: "medium",
    },
  });

  const submitFeedback = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          rating: showRating ? rating || undefined : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it shortly.",
      });
      form.reset();
      setRating(0);
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTypeChange = (type: string) => {
    form.setValue("type", type as any);
    setShowRating(type === "feedback");
    
    // Auto-set priority based on type
    if (type === "bug_report") {
      form.setValue("priority", "high");
    } else if (type === "feature_request") {
      form.setValue("priority", "medium");
    } else {
      form.setValue("priority", "medium");
    }
  };

  const handleSubmit = (data: FeedbackFormData) => {
    submitFeedback.mutate(data);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feedback": return <MessageSquare className="h-4 w-4" />;
      case "suggestion": return <Lightbulb className="h-4 w-4" />;
      case "bug_report": return <Bug className="h-4 w-4" />;
      case "feature_request": return <Zap className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feedback": return "blue";
      case "suggestion": return "green";
      case "bug_report": return "red";
      case "feature_request": return "purple";
      default: return "gray";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon(form.watch("type"))}
            Quick Feedback & Suggestions
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Feedback Type Selection */}
            <div className="space-y-3">
              <Label>What would you like to share?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "feedback", label: "General Feedback", icon: MessageSquare },
                  { value: "suggestion", label: "Suggestion", icon: Lightbulb },
                  { value: "bug_report", label: "Bug Report", icon: Bug },
                  { value: "feature_request", label: "Feature Request", icon: Zap },
                ].map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={form.watch("type") === type.value ? "default" : "outline"}
                    className="justify-start gap-2 h-auto p-3"
                    onClick={() => handleTypeChange(type.value)}
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="text-sm">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback"
                {...form.register("title", { required: "Title is required" })}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            {/* Rating (for feedback only) */}
            {showRating && (
              <div className="space-y-3">
                <Label>Rating (optional)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ui_ux">User Interface / Experience</SelectItem>
                  <SelectItem value="functionality">Functionality</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Please provide detailed information about your feedback..."
                rows={5}
                {...form.register("message", { required: "Message is required" })}
              />
              {form.formState.errors.message && (
                <p className="text-sm text-red-500">{form.formState.errors.message.message}</p>
              )}
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <Label>I am a...</Label>
              <Select value={form.watch("userType")} onValueChange={(value) => form.setValue("userType", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="anonymous">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email (optional) */}
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email (optional)</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="your.email@example.com"
                {...form.register("userEmail")}
              />
              <p className="text-xs text-gray-500">
                Provide your email if you'd like us to follow up with you
              </p>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.watch("priority")} onValueChange={(value) => form.setValue("priority", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current type badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Submitting as:</span>
              <Badge variant="secondary" className="gap-1">
                {getTypeIcon(form.watch("type"))}
                {form.watch("type").replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitFeedback.isPending}
                className="flex-1"
              >
                {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}