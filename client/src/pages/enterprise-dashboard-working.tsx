import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Calculator, Briefcase, CreditCard, Receipt, Menu, X,
  Megaphone
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
  | "reports"
  | "add-room";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function EnterpriseDashboardWorking() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [newRoomForm, setNewRoomForm] = useState({
    number: "",
    buildingId: "",
    status: "available",
    size: "studio",
    floor: "1",
    rentalRate: "",
    rentalPeriod: "monthly",
    accessPin: ""
  });

  // Data queries
  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/admin/buildings"]
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/admin/rooms"]
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/admin/tenants"]
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"]
  });

  const { data: maintenanceData = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"]
  });

  const { data: paymentsData = [] } = useQuery({
    queryKey: ["/api/admin/payments"]
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics/occupancy"]
  });

  const { data: financialData } = useQuery({
    queryKey: ["/api/admin/financial/summary"]
  });

  // Calculate metrics
  const roomsArray = Array.isArray(rooms) ? rooms : [];
  const totalRooms = analytics?.totalRooms || roomsArray.length;
  const occupiedRooms = analytics?.occupiedRooms || roomsArray.filter((r: any) => r.status === 'occupied').length;
  const availableRooms = analytics?.availableRooms || roomsArray.filter((r: any) => r.status === 'available').length;
  const maintenanceRooms = roomsArray.filter((r: any) => r.status === 'out_of_service' || r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  const monthlyRevenue = financialData?.thisMonthRevenue || 28700;
  const activeTenants = Array.isArray(tenants) ? tenants.filter((t: any) => t.status === 'active').length : 0;
  const newInquiries = Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'new').length : 0;
  const pendingMaintenance = Array.isArray(maintenanceData) ? maintenanceData.filter((m: any) => m.request?.status === 'pending').length : 0;
  const urgentMaintenanceCount = Array.isArray(maintenanceData) ? maintenanceData.filter((m: any) => m.request?.priority === 'urgent').length : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.5%</div>
            <p className="text-sm text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{occupancyRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">+2.3% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Daily Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">$85</div>
            <p className="text-sm text-muted-foreground">per room/night</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Per Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$2,250</div>
            <p className="text-sm text-muted-foreground">monthly average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast & Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={[
                  { month: 'Jan', actual: 24500, forecast: 24000, occupancy: 85 },
                  { month: 'Feb', actual: 26800, forecast: 25500, occupancy: 88 },
                  { month: 'Mar', actual: 28200, forecast: 27000, occupancy: 92 },
                  { month: 'Apr', actual: 27100, forecast: 28000, occupancy: 89 },
                  { month: 'May', actual: 29800, forecast: 29000, occupancy: 95 },
                  { month: 'Jun', actual: monthlyRevenue, forecast: 31000, occupancy: occupancyRate },
                  { month: 'Jul', forecast: 32500, occupancy: 97 },
                  { month: 'Aug', forecast: 33200, occupancy: 98 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`$${value?.toLocaleString()}`, name === 'actual' ? 'Actual Revenue' : name === 'forecast' ? 'Forecast' : 'Occupancy %']} />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="forecast" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Performance Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Revenue vs Market</p>
                  <p className="text-sm text-green-600">Above average by 18%</p>
                </div>
                <div className="text-2xl font-bold text-green-600">📈</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Occupancy vs Market</p>
                  <p className="text-sm text-blue-600">Above average by 12%</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">🏠</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                <div>
                  <p className="font-medium text-purple-800">Guest Satisfaction</p>
                  <p className="text-sm text-purple-600">4.8/5 (Industry: 4.2)</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">⭐</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
                <div>
                  <p className="font-medium text-orange-800">Response Time</p>
                  <p className="text-sm text-orange-600">2.3hrs (Industry: 6.1hrs)</p>
                </div>
                <div className="text-2xl font-bold text-orange-600">⚡</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthlyRevenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${(monthlyRevenue * 0.7).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">After expenses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$2,400</div>
            <p className="text-sm text-muted-foreground">Overdue payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${(monthlyRevenue * 0.3).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardTab();
      case "analytics":
        return renderAnalyticsTab();
      case "financial":
        return renderFinancialTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSideMenuOpen(!sideMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">EasyStay HI</h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Enterprise Dashboard
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation("/")}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sideMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out lg:transition-none
          transform lg:transform-none
        `}>
          <nav className="px-4 py-6 space-y-2">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            
            <Button
              variant={activeTab === "financial" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("financial")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Financial
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Mobile overlay */}
      {sideMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSideMenuOpen(false)}
        />
      )}
    </div>
  );
}