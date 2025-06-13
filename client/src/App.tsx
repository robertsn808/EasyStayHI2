import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Property949 from "@/pages/property-949";
import Property934 from "@/pages/property-934";
import Building934 from "@/pages/building-934";
import Building949 from "@/pages/building-949";
import PublicPageEditor from "@/pages/public-page-editor";
import AdminDashboard from "@/pages/admin-dashboard";
import ModernDashboard from "@/pages/modern-dashboard";
import EnterpriseDashboard from "@/pages/enterprise-dashboard";
import EnterpriseDashboardComplete from "@/pages/enterprise-dashboard-complete";
import EnterpriseDashboardWorking from "@/pages/enterprise-dashboard-working";
import TenantPortalComplete from "@/pages/tenant-portal-complete";
import InquiryComplete from "@/pages/inquiry-complete";
import Pricing from "@/pages/pricing";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

// Protected route component for admin pages
function ProtectedAdminRoute({ component: Component }: { component: any }) {
  const isAdminAuthenticated = localStorage.getItem('admin-authenticated') === 'true';
  
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }
  
  return <Component />;
}

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
      <Route path="/tenant/:roomId" component={TenantPortalComplete} />
      <Route path="/tenant" component={TenantPortalComplete} />
      <Route path="/inquiry" component={InquiryComplete} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/public" component={Landing} />
      <Route path="/property-949" component={Property949} />
      <Route path="/property-934" component={Property934} />
      <Route path="/building-934" component={Building934} />
      <Route path="/building-949" component={Building949} />
      <Route path="/public-editor" component={PublicPageEditor} />
      <Route path="/949" component={Property949} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-dashboard">
        {() => <ProtectedAdminRoute component={EnterpriseDashboardWorking} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedAdminRoute component={EnterpriseDashboardWorking} />}
      </Route>
      <Route path="/enterprise-dashboard">
        {() => <ProtectedAdminRoute component={EnterpriseDashboardWorking} />}
      </Route>
      <Route path="/modern-dashboard">
        {() => <ProtectedAdminRoute component={ModernDashboard} />}
      </Route>
      <Route path="/legacy-admin">
        {() => <ProtectedAdminRoute component={AdminDashboard} />}
      </Route>
      {isAuthenticated ? (
        <Route path="/" component={EnterpriseDashboard} />
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
