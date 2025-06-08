import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Property949 from "@/pages/property-949";
import AdminDashboard from "@/pages/admin-dashboard";
import TenantPortal from "@/pages/tenant-portal";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/tenant/:roomId" component={TenantPortal} />
      <Route path="/949" component={Property949} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={AdminDashboard} />
        </>
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
