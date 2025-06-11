import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, User, Search, CheckCircle, Home, DollarSign, 
  Wrench, AlertTriangle, Calendar, Users, MessageSquare,
  TrendingUp, Activity, Clock, MapPin, Building, Mail, 
  Phone, Edit, Trash2, Plus, FileText, Package, LogOut,
  BarChart3, PieChart, LineChart, ArrowUpIcon, ArrowDownIcon,
  Shield, Brain, Zap, Eye, Settings, Filter, Download,
  Workflow, Target, Lightbulb, Award, Star, ChevronRight,
  Grid, List, RefreshCw, ExternalLink, Copy, Share,
  Calculator, Briefcase, CreditCard, Receipt
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart } from "recharts";
import backgroundImage from "@assets/image_1749351216300.png";

type TabType = 
  | "dashboard"
  | "analytics" 
  | "financial"
  | "properties"
  | "guests"
  | "maintenance"
  | "operations"
  | "marketing"
  | "security"
  | "reports";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ModernDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [dateRange, setDateRange] = useState<string>("30d");
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin-authenticated');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    setLocation("/admin-login");
  };

  // Comprehensive data queries
  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/admin/buildings"],
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["/api/admin/guests"],
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"],
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: financialSummary } = useQuery({
    queryKey: ["/api/admin/financial/summary"],
  });

  const { data: occupancyAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics/occupancy"],
  });

  const { data: revenueAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics/revenue"],
  });

  const { data: maintenanceAnalytics } = useQuery({
    queryKey: ["/api/admin/analytics/maintenance"],
  });

  const { data: predictiveInsights } = useQuery({
    queryKey: ["/api/admin/analytics/insights"],
  });

  const { data: systemNotifications = [] } = useQuery({
    queryKey: ["/api/admin/notifications"],
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/admin/vendors"],
  });

  const { data: leases = [] } = useQuery({
    queryKey: ["/api/admin/leases"],
  });

  const { data: marketingCampaigns = [] } = useQuery({
    queryKey: ["/api/admin/marketing/campaigns"],
  });

  // Calculate comprehensive stats
  const roomsArray = Array.isArray(rooms) ? rooms : [];
  const totalRooms = roomsArray.length;
  const occupiedRooms = roomsArray.filter((r: any) => r.status === 'occupied').length;
  const availableRooms = roomsArray.filter((r: any) => r.status === 'available').length;
  const maintenanceRooms = roomsArray.filter((r: any) => r.status === 'needs_cleaning' || r.status === 'out_of_service').length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  const guestsArray = Array.isArray(guests) ? guests : [];
  const activeGuests = guestsArray.filter((g: any) => g.isActive && !g.hasMovedOut).length;
  const pendingPayments = guestsArray.filter((g: any) => g.paymentStatus === 'pending').length;
  const overduePayments = guestsArray.filter((g: any) => g.paymentStatus === 'overdue').length;

  const pendingMaintenance = Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.status === 'submitted').length : 0;
  const urgentMaintenanceCount = Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.priority === 'urgent').length : 0;

  const newInquiries = Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'new').length : 0;
  const monthlyRevenue = (financialSummary as any)?.thisMonthRevenue || 0;
  const monthlyExpenses = (financialSummary as any)?.thisMonthExpenses || 0;
  const netIncome = monthlyRevenue - monthlyExpenses;

  const renderContent = () => {
    // Map modern dashboard tabs to admin tabs
    const tabMapping: Record<TabType, string> = {
      "dashboard": "quick-access",
      "analytics": "analytics", 
      "financial": "financial",
      "properties": "properties",
      "guests": "guests",
      "maintenance": "maintenance",
      "operations": "operations", 
      "marketing": "marketing",
      "security": "security",
      "reports": "reports",
      "todos": "todos",
      "receipts": "receipts",
      "receipt-editor": "receipt-editor",
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

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 h-7 px-3"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </Button>

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