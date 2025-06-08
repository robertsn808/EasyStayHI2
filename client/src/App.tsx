import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Property949 from "@/pages/property-949";
import Property934 from "@/pages/property-934";
import AdminDashboard from "@/pages/admin-dashboard";
import ModernDashboard from "@/pages/modern-dashboard";
import TenantPortal from "@/pages/tenant-portal";
import InquiryPage from "@/pages/inquiry";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/tenant/:roomId" component={TenantPortal} />
      <Route path="/tenant" component={TenantPortal} />
      <Route path="/inquiry" component={InquiryPage} />
      <Route path="/public" component={Landing} />
      <Route path="/property-949" component={Property949} />
      <Route path="/property-934" component={Property934} />
      <Route path="/949" component={Property949} />
      <Route path="/admin-dashboard" component={ModernDashboard} />
      <Route path="/admin" component={ModernDashboard} />
      <Route path="/legacy-admin" component={AdminDashboard} />
      {isAuthenticated ? (
        <Route path="/" component={ModernDashboard} />
      ) : (
        <Route path="/" component={Landing} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
