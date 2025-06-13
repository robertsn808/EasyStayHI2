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
            <CardTitle>AI-Powered Property Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg">
                <div>
                  <p className="font-medium text-indigo-800">Demand Prediction</p>
                  <p className="text-sm text-indigo-600">High demand expected next week</p>
                </div>
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
                <div>
                  <p className="font-medium text-emerald-800">Revenue Optimization</p>
                  <p className="text-sm text-emerald-600">Room rates optimized for +15% gain</p>
                </div>
                <Target className="h-6 w-6 text-emerald-600" />
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg">
                <div>
                  <p className="font-medium text-amber-800">Market Opportunity</p>
                  <p className="text-sm text-amber-600">Corporate housing demand up 25%</p>
                </div>
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                <div>
                  <p className="font-medium text-purple-800">Performance Benchmark</p>
                  <p className="text-sm text-purple-600">Top 5% in market segment</p>
                </div>
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Automated Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-green-800">Smart Pricing</p>
                    <p className="text-xs text-green-600">Active & optimizing</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-blue-800">Auto Check-in</p>
                    <p className="text-xs text-blue-600">QR-based system</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-purple-800">Maintenance Alerts</p>
                    <p className="text-xs text-purple-600">Predictive scheduling</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-600">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-orange-800">Revenue Reports</p>
                    <p className="text-xs text-orange-600">Daily automation</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-600">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <div className="flex items-center space-x-1">
                    <Award className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-bold text-green-600">Top 5%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-11/12"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Operational Efficiency</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-bold text-blue-600">Top 10%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-5/6"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Guest Satisfaction</span>
                  <div className="flex items-center space-x-1">
                    <Award className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-bold text-purple-600">Top 3%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Market Position</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-bold text-orange-600">Top 15%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predictive Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Maintenance Alert</span>
                </div>
                <p className="text-sm text-yellow-600">Room 05 HVAC due for service in 5 days</p>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Demand Surge</span>
                </div>
                <p className="text-sm text-blue-600">Bookings expected to increase 30% next week</p>
              </div>

              <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Urgent Issue</span>
                </div>
                <p className="text-sm text-red-600">Water pressure anomaly detected in Room 08</p>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Revenue Opportunity</span>
                </div>
                <p className="text-sm text-green-600">Consider rate increase for peak season</p>
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
            <div className="flex items-center mt-2">
              <ArrowUpIcon className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
              <span className="text-sm text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${(monthlyRevenue * 0.68).toLocaleString()}</div>
            <div className="flex items-center mt-2">
              <ArrowUpIcon className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600 font-medium">+8.2%</span>
              <span className="text-sm text-muted-foreground ml-1">margin: 68%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$2,400</div>
            <div className="flex items-center mt-2">
              <ArrowDownIcon className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">-15%</span>
              <span className="text-sm text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Operating Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${(monthlyRevenue * 0.32).toLocaleString()}</div>
            <div className="flex items-center mt-2">
              <ArrowDownIcon className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">-3.1%</span>
              <span className="text-sm text-muted-foreground ml-1">optimized costs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { category: 'Room Revenue', amount: monthlyRevenue * 0.85, type: 'revenue' },
                  { category: 'Service Revenue', amount: monthlyRevenue * 0.15, type: 'revenue' },
                  { category: 'Maintenance', amount: monthlyRevenue * 0.12, type: 'expense' },
                  { category: 'Utilities', amount: monthlyRevenue * 0.08, type: 'expense' },
                  { category: 'Marketing', amount: monthlyRevenue * 0.05, type: 'expense' },
                  { category: 'Administration', amount: monthlyRevenue * 0.07, type: 'expense' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={[
                  { month: 'Jan', cashFlow: 18500, cumulative: 18500 },
                  { month: 'Feb', cashFlow: 21200, cumulative: 39700 },
                  { month: 'Mar', cashFlow: 19800, cumulative: 59500 },
                  { month: 'Apr', cashFlow: 22100, cumulative: 81600 },
                  { month: 'May', cashFlow: 24300, cumulative: 105900 },
                  { month: 'Jun', cashFlow: monthlyRevenue * 0.68, cumulative: 105900 + (monthlyRevenue * 0.68) }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`$${value?.toLocaleString()}`, name === 'cashFlow' ? 'Monthly Cash Flow' : 'Cumulative']} />
                  <Line type="monotone" dataKey="cashFlow" stroke="#3b82f6" strokeWidth={3} name="cashFlow" />
                  <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="cumulative" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">94/100</div>
                <Badge variant="outline" className="text-green-600 border-green-600">Excellent</Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="text-sm text-green-600">98/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-[98%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Cash Flow</span>
                    <span className="text-sm text-green-600">95/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-[95%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Debt Ratio</span>
                    <span className="text-sm text-blue-600">88/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-[88%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <span className="text-sm text-purple-600">92/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-[92%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">On-Time Payments</p>
                  <p className="text-sm text-green-600">94.2% of all payments</p>
                </div>
                <div className="text-2xl font-bold text-green-600">94%</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Late Payments</p>
                  <p className="text-sm text-yellow-600">4.8% average delay: 3 days</p>
                </div>
                <div className="text-2xl font-bold text-yellow-600">5%</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium text-red-800">Outstanding</p>
                  <p className="text-sm text-red-600">1% requiring follow-up</p>
                </div>
                <div className="text-2xl font-bold text-red-600">1%</div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Payment Trend</span>
                </div>
                <p className="text-sm text-blue-600">Payment reliability improved 8% this quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Rate Optimization</span>
                </div>
                <p className="text-sm text-green-600">Potential +$3,200/month with dynamic pricing</p>
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Service Packages</span>
                </div>
                <p className="text-sm text-blue-600">Premium services could add +$1,800/month</p>
              </div>

              <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Extended Stays</span>
                </div>
                <p className="text-sm text-purple-600">Long-term discounts could increase retention</p>
              </div>

              <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Corporate Contracts</span>
                </div>
                <p className="text-sm text-orange-600">B2B partnerships potential +$5,500/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Key Performance Indicators</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Revenue per Room</div>
                  <div className="text-lg font-bold text-green-600">${(monthlyRevenue / totalRooms).toFixed(0)}</div>
                  <div className="text-xs text-green-600">+12% vs industry avg</div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Operating Margin</div>
                  <div className="text-lg font-bold text-blue-600">68%</div>
                  <div className="text-xs text-blue-600">Industry: 45-55%</div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Collection Rate</div>
                  <div className="text-lg font-bold text-purple-600">98.7%</div>
                  <div className="text-xs text-purple-600">Excellent performance</div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Cost per Room</div>
                  <div className="text-lg font-bold text-orange-600">${((monthlyRevenue * 0.32) / totalRooms).toFixed(0)}</div>
                  <div className="text-xs text-orange-600">-5% optimization</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Strategic Recommendations</h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Implement Dynamic Pricing</p>
                    <p className="text-sm text-green-600">AI-driven rate adjustments could increase revenue by 15-20%</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Energy Efficiency Program</p>
                    <p className="text-sm text-blue-600">Smart systems could reduce utility costs by $400-600/month</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800">Premium Service Tier</p>
                    <p className="text-sm text-purple-600">Offer concierge services for 25% rate premium</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPropertiesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.isArray(buildings) && buildings.map((building: any) => (
          <Card key={building.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{building.address}</span>
                <Badge variant="outline">{building.rooms?.length || 0} rooms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Occupancy Rate</div>
                    <div className="text-lg font-bold text-green-600">
                      {building.rooms?.length > 0 
                        ? Math.round((building.rooms.filter((r: any) => r.status === 'occupied').length / building.rooms.length) * 100)
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                    <div className="text-lg font-bold text-blue-600">
                      ${building.rooms?.reduce((total: number, room: any) => 
                        total + (room.status === 'occupied' ? parseFloat(room.rentalRate || '0') : 0), 0
                      ).toLocaleString() || '0'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available</span>
                    <span className="text-green-600">
                      {building.rooms?.filter((r: any) => r.status === 'available').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Occupied</span>
                    <span className="text-blue-600">
                      {building.rooms?.filter((r: any) => r.status === 'occupied').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Maintenance</span>
                    <span className="text-orange-600">
                      {building.rooms?.filter((r: any) => r.status === 'maintenance' || r.status === 'out_of_service').length || 0}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Property Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roomsArray.slice(0, 12).map((room: any) => (
              <div key={room.id} className={`
                p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
                ${room.status === 'occupied' ? 'border-blue-200 bg-blue-50' :
                  room.status === 'available' ? 'border-green-200 bg-green-50' :
                  room.status === 'maintenance' ? 'border-orange-200 bg-orange-50' :
                  'border-gray-200 bg-gray-50'}
              `}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Room {room.number}</span>
                  <Badge variant={
                    room.status === 'occupied' ? 'default' :
                    room.status === 'available' ? 'secondary' :
                    'destructive'
                  }>
                    {room.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Floor: {room.floor}</div>
                  <div>Type: {room.size}</div>
                  <div>Rate: ${room.rentalRate || 0}/{room.rentalPeriod || 'month'}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOperationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium text-red-800">Urgent</p>
                  <p className="text-sm text-red-600">Requires immediate attention</p>
                </div>
                <div className="text-2xl font-bold text-red-600">{urgentMaintenanceCount}</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Pending</p>
                  <p className="text-sm text-yellow-600">Scheduled for completion</p>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{pendingMaintenance}</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Completed Today</p>
                  <p className="text-sm text-green-600">Tasks finished</p>
                </div>
                <div className="text-2xl font-bold text-green-600">3</div>
              </div>

              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Maintenance Request
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guest Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Active Inquiries</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{newInquiries}</div>
                <p className="text-sm text-blue-600">New inquiries pending response</p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Check-ins Today</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">2</div>
                <p className="text-sm text-purple-600">Scheduled arrivals</p>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Check-outs Today</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">1</div>
                <p className="text-sm text-orange-600">Scheduled departures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-green-800">All Systems</p>
                    <p className="text-xs text-green-600">Operational</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">Online</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Database</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">OK</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Gateway</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">OK</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Email Service</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">OK</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Backup System</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">Running</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border-l-4 border-green-500 bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Maintenance Completed</p>
                  <p className="text-sm text-green-600">HVAC repair in Room 05 finished</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">New Guest Check-in</p>
                  <p className="text-sm text-blue-600">Sarah Chen checked into Room 12</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-4 border-purple-500 bg-purple-50">
                <DollarSign className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800">Payment Received</p>
                  <p className="text-sm text-purple-600">$1,800 monthly rent from Room 08</p>
                  <p className="text-xs text-gray-500">6 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-4 border-orange-500 bg-orange-50">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Maintenance Request</p>
                  <p className="text-sm text-orange-600">Plumbing issue reported in Room 03</p>
                  <p className="text-xs text-gray-500">8 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Guest Satisfaction</span>
                  <span className="text-sm font-bold text-green-600">4.8/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-[96%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm font-bold text-blue-600">2.3 hrs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-4/5"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Maintenance Efficiency</span>
                  <span className="text-sm font-bold text-purple-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-[92%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">System Uptime</span>
                  <span className="text-sm font-bold text-green-600">99.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-[99.8%]"></div>
                </div>
              </div>
            </div>
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
      case "properties":
        return renderPropertiesTab();
      case "operations":
        return renderOperationsTab();
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
            
            <Button
              variant={activeTab === "properties" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("properties")}
            >
              <Building className="h-4 w-4 mr-2" />
              Properties
            </Button>
            
            <Button
              variant={activeTab === "operations" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("operations")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Operations
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