import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lightbulb, Bug, Zap } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";

export function FloatingFeedbackButton() {
  const [showForm, setShowForm] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"feedback" | "suggestion" | "bug_report" | "feature_request">("feedback");

  const quickActions = [
    {
      type: "feedback" as const,
      label: "Feedback",
      icon: MessageSquare,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      type: "suggestion" as const,
      label: "Suggestion",
      icon: Lightbulb,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      type: "bug_report" as const,
      label: "Bug Report",
      icon: Bug,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      type: "feature_request" as const,
      label: "Feature Request",
      icon: Zap,
      color: "bg-purple-500 hover:bg-purple-600",
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