import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity
} from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("financial");
  const [dateRange, setDateRange] = useState("30");

  // Fetch data for reports
  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"],
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: financialSummary = {} } = useQuery({
    queryKey: ["/api/admin/financial/summary"],
  });

  const { data: occupancyData = {} } = useQuery({
    queryKey: ["/api/admin/analytics/occupancy"],
  });

  // Calculate financial metrics
  const totalRevenue = Array.isArray(payments) 
    ? payments.reduce((sum: number, p: any) => sum + (p.payment?.amount || 0), 0)
    : 0;

  const thisMonthPayments = Array.isArray(payments)
    ? payments.filter((p: any) => {
        const paymentDate = new Date(p.payment?.createdAt || 0);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
      })
    : [];

  const thisMonthRevenue = thisMonthPayments.reduce((sum: number, p: any) => sum + (p.payment?.amount || 0), 0);

  // Calculate occupancy metrics
  const totalRooms = Array.isArray(rooms) ? rooms.length : 0;
  const occupiedRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'occupied').length : 0;
  const availableRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'available').length : 0;
  const maintenanceRooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'maintenance').length : 0;

  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : "0";

  // Property-specific metrics
  const building934Rooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 10) : [];
  const building949Rooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 11) : [];

  const building934Occupied = building934Rooms.filter((r: any) => r.status === 'occupied').length;
  const building949Occupied = building949Rooms.filter((r: any) => r.status === 'occupied').length;

  const building934Rate = building934Rooms.length > 0 ? ((building934Occupied / building934Rooms.length) * 100).toFixed(1) : "0";
  const building949Rate = building949Rooms.length > 0 ? ((building949Occupied / building949Rooms.length) * 100).toFixed(1) : "0";

  // Maintenance metrics
  const completedMaintenance = Array.isArray(maintenanceRequests) 
    ? maintenanceRequests.filter((m: any) => m.request?.status === 'completed').length 
    : 0;
  const pendingMaintenance = Array.isArray(maintenanceRequests) 
    ? maintenanceRequests.filter((m: any) => m.request?.status === 'pending').length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive business intelligence and reporting</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ${thisMonthRevenue.toLocaleString()} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-blue-600">{occupancyRate}%</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {occupiedRooms} of {totalRooms} rooms occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Inquiries</p>
                  <p className="text-3xl font-bold text-purple-600">{Array.isArray(inquiries) ? inquiries.length : 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Prospective tenants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Maintenance</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingMaintenance}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedMaintenance} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Building 934 (Premium)</span>
                      <span className="text-green-600 font-bold">
                        ${thisMonthPayments
                          .filter((p: any) => p.room?.buildingId === 10)
                          .reduce((sum: number, p: any) => sum + (p.payment?.amount || 0), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Building 949 (Shared)</span>
                      <span className="text-blue-600 font-bold">
                        ${thisMonthPayments
                          .filter((p: any) => p.room?.buildingId === 11)
                          .reduce((sum: number, p: any) => sum + (p.payment?.amount || 0), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total This Month</span>
                        <span className="text-xl font-bold text-gray-900">
                          ${thisMonthRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Payment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {Array.isArray(payments) ? payments.filter((p: any) => p.payment?.status === 'completed').length : 0}
                        </p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {Array.isArray(payments) ? payments.filter((p: any) => p.payment?.status === 'overdue').length : 0}
                        </p>
                        <p className="text-sm text-gray-600">Overdue</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Collection Rate</span>
                        <span className="font-medium">
                          {Array.isArray(payments) && payments.length > 0 
                            ? ((payments.filter((p: any) => p.payment?.status === 'completed').length / payments.length) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Array.isArray(payments) && payments.length > 0 
                              ? ((payments.filter((p: any) => p.payment?.status === 'completed').length / payments.length) * 100)
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="occupancy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Property Occupancy Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Building 934 (Premium Rooms)</span>
                        <span className="text-lg font-bold text-green-600">{building934Rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full" 
                          style={{ width: `${building934Rate}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {building934Occupied} of {building934Rooms.length} rooms occupied
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Building 949 (Shared Suites)</span>
                        <span className="text-lg font-bold text-blue-600">{building949Rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ width: `${building949Rate}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {building949Occupied} of {building949Rooms.length} rooms occupied
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Room Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span>Available</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{availableRooms}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({totalRooms > 0 ? ((availableRooms / totalRooms) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span>Occupied</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{occupiedRooms}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span>Maintenance</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{maintenanceRooms}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({totalRooms > 0 ? ((maintenanceRooms / totalRooms) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>Completed Requests</span>
                      <span className="font-bold text-green-600">{completedMaintenance}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span>Pending Requests</span>
                      <span className="font-bold text-orange-600">{pendingMaintenance}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span>Urgent Priority</span>
                      <span className="font-bold text-red-600">
                        {Array.isArray(maintenanceRequests) 
                          ? maintenanceRequests.filter((m: any) => m.request?.priority === 'urgent').length 
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inquiry Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {Array.isArray(inquiries) ? inquiries.length : 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Inquiries</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">
                          {Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0}
                        </p>
                        <p className="text-xs text-gray-600">Pending</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">
                          {Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'converted').length : 0}
                        </p>
                        <p className="text-xs text-gray-600">Converted</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{occupancyRate}%</p>
                    <p className="text-sm text-gray-600">Current Occupancy</p>
                    <p className="text-xs text-green-600 mt-1">↗ Trending up</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">${(thisMonthRevenue / 1000).toFixed(1)}K</p>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-xs text-blue-600 mt-1">→ Stable</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{pendingMaintenance}</p>
                    <p className="text-sm text-gray-600">Active Issues</p>
                    <p className="text-xs text-orange-600 mt-1">↘ Decreasing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}