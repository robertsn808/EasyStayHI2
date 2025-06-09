import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, User, Search, CheckCircle, Home, DollarSign, 
  Wrench, AlertTriangle, Calendar, Users, MessageSquare,
  TrendingUp, Activity, Clock, MapPin, Building, Mail, 
  Phone, Edit, Trash2, Plus, FileText, Package
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminTabs from "@/components/admin-tabs";
import ExpandableSideNav from "@/components/ExpandableSideNav";
import backgroundImage from "@assets/image_1749351216300.png";

type TabType = 
  | "dashboard"
  | "inbox" 
  | "calendar"
  | "934" 
  | "949" 
  | "payment-tracker"
  | "maintenance"
  | "announcement"
  | "inquiries"
  | "contacts"
  | "inventory"
  | "todos"
  | "receipts"
  | "expenses"
  | "payment-history"
  | "financial-reports"
  | "public-page-editor"
  | "admin-dashboard";

export default function ModernDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"],
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["/api/admin/guests"],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/admin/announcements"],
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["/api/admin/calendar"],
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/admin/contacts"],
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/admin/inventory"],
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["/api/admin/receipts"],
  });

  const { data: todos = [] } = useQuery({
    queryKey: ["/api/admin/todos"],
  });

  // Calculate stats
  const pendingInquiries = Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0;
  const urgentMaintenance = Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.priority === 'urgent').length : 0;
  const incompleteTodos = Array.isArray(todos) ? todos.filter((t: any) => !t.completed).length : 0;

  const renderContent = () => {
    // Map modern dashboard tabs to admin tabs
    const tabMapping: Record<TabType, string> = {
      "dashboard": "quick-access",
      "inbox": "inquiries", 
      "calendar": "calendar",
      "934": "934",
      "949": "949",
      "payment-tracker": "payment-tracker",
      "maintenance": "maintenance",
      "announcement": "announcement", 
      "inquiries": "inquiries",
      "contacts": "contacts",
      "inventory": "inventory",
      "todos": "todos",
      "receipts": "receipts",
      "expenses": "expenses",
      "payment-history": "payment-history",
      "financial-reports": "financial-reports",
      "public-page-editor": "public-page-editor",
      "admin-dashboard": "admin-dashboard"
    };

    const adminTabName = tabMapping[activeTab] || "quick-access";

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminTabs
          activeTab={adminTabName}
          setActiveTab={() => {}} // Read-only mode from modern dashboard
        />
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      {/* Expandable Sidebar Navigation */}
      <ExpandableSideNav
        activeTab={activeTab}
        setActiveTab={(tab: string) => setActiveTab(tab as TabType)}
        rooms={Array.isArray(rooms) ? rooms : []}
        guests={Array.isArray(guests) ? guests : []}
        inquiries={Array.isArray(inquiries) ? inquiries : []}
        maintenanceRequests={Array.isArray(maintenanceRequests) ? maintenanceRequests : []}
        payments={Array.isArray(payments) ? payments : []}
        announcements={Array.isArray(announcements) ? announcements : []}
        calendarEvents={Array.isArray(calendarEvents) ? calendarEvents : []}
        contacts={Array.isArray(contacts) ? contacts : []}
        inventory={Array.isArray(inventory) ? inventory : []}
        receipts={Array.isArray(receipts) ? receipts : []}
        todos={Array.isArray(todos) ? todos : []}
      />
      
      {/* Main Content with Sidebar Space */}
      <div className="lg:ml-64">
        {/* Modern Top Navigation */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Logo and Search Bar */}
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-semibold text-gray-900">EasyStay</span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-48 pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative h-7 w-7 p-0">
                    <Bell className="h-4 w-4 text-gray-600" />
                    {pendingInquiries > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {pendingInquiries}
                        </span>
                      </span>
                    )}
                  </Button>
                </div>

                {/* User Profile */}
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}