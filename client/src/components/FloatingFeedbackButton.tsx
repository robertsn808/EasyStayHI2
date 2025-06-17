import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lightbulb, Bug, Zap, Bot, FileText } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackChatbot } from "./FeedbackChatbot";

export function FloatingFeedbackButton() {
  const [showForm, setShowForm] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"feedback" | "suggestion" | "bug_report" | "feature_request">("feedback");

  const quickActions = [
    {
      type: "chatbot" as const,
      label: "Chat with AI",
      icon: Bot,
      color: "bg-indigo-500 hover:bg-indigo-600",
      action: () => setShowChatbot(true),
    },
    {
      type: "form" as const,
      label: "Feedback Form",
      icon: FileText,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => setShowForm(true),
    },
    {
      type: "feedback" as const,
      label: "Quick Feedback",
      icon: MessageSquare,
      color: "bg-green-500 hover:bg-green-600",
      action: () => handleQuickAction("feedback"),
    },
    {
      type: "bug_report" as const,
      label: "Report Bug",
      icon: Bug,
      color: "bg-red-500 hover:bg-red-600",
      action: () => handleQuickAction("bug_report"),
    },
  ];

  const handleQuickAction = (type: typeof feedbackType) => {
    setFeedbackType(type);
    setShowForm(true);
    setShowQuickActions(false);
  };

  return (
    <>
      {/* Quick Action Buttons */}
      {showQuickActions && (
        <div className="fixed bottom-20 right-6 flex flex-col gap-2 z-40">
          {quickActions.map((action) => (
            <Button
              key={action.type}
              onClick={() => handleQuickAction(action.type)}
              className={`${action.color} text-white shadow-lg transition-all duration-200 transform hover:scale-105`}
              size="sm"
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Main Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            if (showQuickActions) {
              setShowQuickActions(false);
            } else {
              setShowQuickActions(true);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full h-14 w-14 transition-all duration-200 transform hover:scale-110"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* Feedback Form Modal */}
      <FeedbackForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        defaultType={feedbackType}
      />
    </>
  );
}