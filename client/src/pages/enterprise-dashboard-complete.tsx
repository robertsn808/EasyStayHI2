import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie } from "recharts";

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

export default function EnterpriseDashboardComplete() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin-authenticated');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation('/admin-login');
  };

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('admin-authenticated');
    if (!token) {
      setLocation('/admin-login');
    }
  }, [setLocation]);

  // API Data Fetching with proper authentication
  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/admin/buildings"],
    queryFn: async () => {
      const response = await fetch('/api/admin/buildings', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch buildings');
      return response.json();
    }
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/admin/rooms"],
    queryFn: async () => {
      const response = await fetch('/api/admin/rooms', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return response.json();
    }
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/admin/tenants"],
    queryFn: async () => {
      const response = await fetch('/api/admin/tenants', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch tenants');
      return response.json();
    }
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
    queryFn: async () => {
      const response = await fetch('/api/admin/payments', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      return response.json();
    }
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"],
    queryFn: async () => {
      const response = await fetch('/api/admin/maintenance', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch maintenance requests');
      return response.json();
    }
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
    queryFn: async () => {
      const response = await fetch('/api/admin/inquiries', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch inquiries');
      return response.json();
    }
  });

  const { data: financialSummary = {} } = useQuery({
    queryKey: ["/api/admin/financial/summary"],
    queryFn: async () => {
      const response = await fetch('/api/admin/financial/summary', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch financial summary');
      return response.json();
    }
  });

  const { data: occupancyData = {} } = useQuery({
    queryKey: ["/api/admin/analytics/occupancy"],
    queryFn: async () => {
      const response = await fetch('/api/admin/analytics/occupancy', {
        headers: { 'x-admin-token': 'admin-authenticated' }
      });
      if (!response.ok) throw new Error('Failed to fetch occupancy data');
      return response.json();
    }
  });

  // Calculate comprehensive stats
  const roomsArray = Array.isArray(rooms) ? rooms : [];
  const totalRooms = roomsArray.length;
  const occupiedRooms = roomsArray.filter((r: any) => r.status === 'occupied').length;
  const availableRooms = roomsArray.filter((r: any) => r.status === 'available').length;
  const maintenanceRooms = roomsArray.filter((r: any) => r.status === 'needs_cleaning' || r.status === 'out_of_service').length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  const tenantsArray = Array.isArray(tenants) ? tenants : [];
  const activeTenants = tenantsArray.filter((t: any) => t.status === 'active').length;
  
  const maintenanceArray = Array.isArray(maintenanceRequests) ? maintenanceRequests : [];
  const pendingMaintenance = maintenanceArray.filter((m: any) => m.status === 'submitted').length;
  const urgentMaintenanceCount = maintenanceArray.filter((m: any) => m.priority === 'urgent').length;

  const inquiriesArray = Array.isArray(inquiries) ? inquiries : [];
  const newInquiries = inquiriesArray.filter((i: any) => i.status === 'new').length;
  
  const monthlyRevenue = (financialSummary as any)?.thisMonthRevenue || 0;
  const monthlyExpenses = (financialSummary as any)?.thisMonthExpenses || 0;
  const netIncome = monthlyRevenue - monthlyExpenses;

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(buildings) ? buildings.length : 0}</div>
            <p className="text-xs text-muted-foreground">Active buildings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{occupiedRooms} of {totalRooms} rooms</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Issues</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">{urgentMaintenanceCount} urgent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">New tenant moved in</p>
                <p className="text-xs text-muted-foreground">Room 101 - John Smith</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Maintenance request</p>
                <p className="text-xs text-muted-foreground">AC repair needed in Room 203</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">$1,800 rent payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Tenant
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Wrench className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Announcement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={[
                  { month: 'Jan', occupancy: 85 },
                  { month: 'Feb', occupancy: 88 },
                  { month: 'Mar', occupancy: 92 },
                  { month: 'Apr', occupancy: 89 },
                  { month: 'May', occupancy: 95 },
                  { month: 'Jun', occupancy: occupancyRate }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="occupancy" stroke="#8884d8" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Room Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie 
                    data={[
                      { name: 'Occupied', value: occupiedRooms },
                      { name: 'Available', value: availableRooms },
                      { name: 'Maintenance', value: maintenanceRooms }
                    ]}
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Occupied', value: occupiedRooms },
                      { name: 'Available', value: availableRooms },
                      { name: 'Maintenance', value: maintenanceRooms }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">${monthlyExpenses.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netIncome.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { category: 'Rent', amount: monthlyRevenue * 0.85 },
                { category: 'Utilities', amount: monthlyRevenue * 0.10 },
                { category: 'Fees', amount: monthlyRevenue * 0.05 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPropertiesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Building Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(buildings) && buildings.map((building: any) => (
              <Card key={building.id} className="p-4">
                <h3 className="font-semibold">{building.name}</h3>
                <p className="text-sm text-muted-foreground">{building.address}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Units: {building.totalUnits || 0}</span>
                  <span>Floors: {building.totalFloors || 0}</span>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Room Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{occupiedRooms}</div>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{availableRooms}</div>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{maintenanceRooms}</div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{totalRooms}</div>
              <p className="text-sm text-muted-foreground">Total Rooms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGuestsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTenants}</div>
            <p className="text-sm text-muted-foreground">Currently residing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>New Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{newInquiries}</div>
            <p className="text-sm text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{occupancyRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Current occupancy</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingMaintenance}</div>
            <p className="text-sm text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Urgent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{urgentMaintenanceCount}</div>
            <p className="text-sm text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'financial':
        return renderFinancialTab();
      case 'properties':
        return renderPropertiesTab();
      case 'guests':
        return renderGuestsTab();
      case 'maintenance':
        return renderMaintenanceTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">EasyStay HI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-10">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}