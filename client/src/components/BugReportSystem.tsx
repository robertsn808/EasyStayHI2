import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, AlertTriangle, Info, CheckCircle, Clock, X } from "lucide-react";

interface BugReport {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  category: "ui" | "functionality" | "performance" | "data" | "security";
  status: "open" | "investigating" | "in-progress" | "resolved" | "closed";
  steps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browserInfo?: string;
  userAgent?: string;
  timestamp: string;
  submittedBy?: string;
  tags?: string[];
}

interface BugReportFormData {
  title: string;
  description: string;
  priority: string;
  category: string;
  steps: string;
  expectedBehavior: string;
  actualBehavior: string;
}

export default function BugReportSystem() {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportForm, setReportForm] = useState<BugReportFormData>({
    title: "",
    description: "",
    priority: "",
    category: "",
    steps: "",
    expectedBehavior: "",
    actualBehavior: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-capture browser information
  const getBrowserInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  };

  // Submit bug report mutation
  const submitBugMutation = useMutation({
    mutationFn: async (bugData: BugReportFormData) => {
      const browserInfo = getBrowserInfo();
      const fullReport = {
        ...bugData,
        browserInfo: JSON.stringify(browserInfo),
        userAgent: browserInfo.userAgent,
        timestamp: new Date().toISOString(),
        status: "open"
      };

      const response = await fetch("/api/bug-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fullReport),
      });
      
      if (!response.ok) throw new Error("Failed to submit bug report");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bug-reports"] });
      setShowReportDialog(false);
      setReportForm({
        title: "",
        description: "",
        priority: "",
        category: "",
        steps: "",
        expectedBehavior: "",
        actualBehavior: ""
      });
      
      toast({
        title: "Bug Report Submitted",
        description: "Thank you for reporting this issue. We'll investigate and get back to you.",
      });

      // Auto-notify developers
      console.log("🐛 NEW BUG REPORT SUBMITTED:");
      console.log("Title:", reportForm.title);
      console.log("Priority:", reportForm.priority);
      console.log("Category:", reportForm.category);
      console.log("Description:", reportForm.description);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to submit bug report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "high": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "medium": return <Info className="w-4 h-4 text-yellow-500" />;
      case "low": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Bug Report Button - Fixed Position */}
      <div className="fixed bottom-4 right-4 z-50">
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogTrigger asChild>
            <Button 
              className="rounded-full shadow-lg bg-red-500 hover:bg-red-600 text-white"
              size="sm"
            >
              <Bug className="w-4 h-4 mr-2" />
              Report Bug
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report a Bug</DialogTitle>
              <DialogDescription>
                Help us improve the system by reporting issues you encounter
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              submitBugMutation.mutate(reportForm);
            }} className="space-y-4">
              <div>
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={reportForm.priority} onValueChange={(value) => setReportForm({...reportForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor issue</SelectItem>
                      <SelectItem value="medium">Medium - Moderate impact</SelectItem>
                      <SelectItem value="high">High - Major issue</SelectItem>
                      <SelectItem value="critical">Critical - System broken</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={reportForm.category} onValueChange={(value) => setReportForm({...reportForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ui">UI/Design Issue</SelectItem>
                      <SelectItem value="functionality">Functionality Bug</SelectItem>
                      <SelectItem value="performance">Performance Issue</SelectItem>
                      <SelectItem value="data">Data/API Issue</SelectItem>
                      <SelectItem value="security">Security Concern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="Detailed description of the issue"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="steps">Steps to Reproduce</Label>
                <Textarea
                  id="steps"
                  value={reportForm.steps}
                  onChange={(e) => setReportForm({...reportForm, steps: e.target.value})}
                  placeholder="1. Go to... 2. Click on... 3. See error..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                  <Textarea
                    id="expectedBehavior"
                    value={reportForm.expectedBehavior}
                    onChange={(e) => setReportForm({...reportForm, expectedBehavior: e.target.value})}
                    placeholder="What should happen?"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="actualBehavior">Actual Behavior</Label>
                  <Textarea
                    id="actualBehavior"
                    value={reportForm.actualBehavior}
                    onChange={(e) => setReportForm({...reportForm, actualBehavior: e.target.value})}
                    placeholder="What actually happens?"
                    rows={2}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  📊 Browser information and technical details will be automatically included to help with debugging.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowReportDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitBugMutation.isPending}>
                  {submitBugMutation.isPending ? "Submitting..." : "Submit Bug Report"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}