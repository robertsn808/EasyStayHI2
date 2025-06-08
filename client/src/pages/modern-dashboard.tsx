import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, User, Search, CheckCircle, Home, DollarSign, 
  Wrench, AlertTriangle, Calendar, Users, MessageSquare,
  TrendingUp, Activity, Clock, MapPin
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type TabType = 
  | "dashboard"
  | "inbox" 
  | "calendar"
  | "934" 
  | "949" 
  | "rent-tracker";

export default function ModernDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

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

  // Calculate metrics
  const building934Rooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 10) : [];
  const building949Rooms = Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 11) : [];
  const occupied934 = building934Rooms.filter((r: any) => r.status === 'occupied').length;
  const occupied949 = building949Rooms.filter((r: any) => r.status === 'occupied').length;
  const pendingInquiries = Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0;
  const urgentMaintenance = Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.priority === 'urgent').length : 0;
  const totalEarnings = 4923.68; // This would come from actual revenue calculation

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning!</h1>
            <p className="text-gray-600">Here's an overview of your properties</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>Last month</option>
            <option>This month</option>
            <option>Last week</option>
          </select>
          <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
            Analytics
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* In-House */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">In-House</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Daily: <span className="font-semibold">4</span></div>
              <div className="text-xs text-gray-500">Weekly: <span className="font-semibold">3</span></div>
              <div className="text-xs text-gray-500">Monthly: <span className="font-semibold">0</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Open Rooms */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Open Rooms</h3>
              <Home className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">934:</span>
                <span className="font-semibold">{occupied934}/{building934Rooms.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">949:</span>
                <span className="font-semibold">{occupied949}/{building949Rooms.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Earnings</h3>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${totalEarnings.toLocaleString()}<span className="text-sm font-normal text-gray-500">.68</span>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Work Orders</h3>
              <Wrench className="h-5 w-5 text-orange-500" />
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">{urgentMaintenance} Maintenance requests</div>
              <div className="text-sm text-gray-600">1 Open Project</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your next steps */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your next steps</h2>
          <div className="space-y-4">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Rent Due: <span className="text-red-600">3</span></h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Home className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Housekeeping: <span className="text-orange-600">2</span></h3>
                    <p className="text-sm text-gray-500">Out of Order: <span className="text-red-600">1</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Inquiries</h3>
                  <Badge className="bg-green-500 text-white">
                    {pendingInquiries}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {Array.isArray(inquiries) && inquiries.slice(0, 3).map((inquiry: any, index: number) => (
                    <div key={inquiry.id || index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{inquiry.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">7 Days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${inquiry.budget || '2,178'}.78</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New activity</h2>
            <Badge className="bg-green-500 text-white">
              {pendingInquiries}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {/* Activity Items */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-semibold">
                    9
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">Pet Friendliness</h3>
                      <Badge variant="outline" className="text-xs">Question</Badge>
                      <span className="text-xs text-gray-500">3h ago</span>
                    </div>
                    <p className="text-sm text-gray-600">196 Kansas Avenue, Block A, 7th Floor, Number 14</p>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-semibold">
                    9
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">Water Issue</h3>
                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">Damage Report</Badge>
                      <span className="text-xs text-gray-500">10h ago</span>
                    </div>
                    <p className="text-sm text-gray-600">817 Garden Street, Santa Monica, CA 987 360</p>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-semibold">
                    7
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">Invoice Inquiry</h3>
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">Request</Badge>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600">568 Gotham Center, Santa Monica, CA 987 360</p>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">Water Issue</h3>
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">Request</Badge>
                      <span className="text-xs text-gray-500">3 days ago</span>
                    </div>
                    <p className="text-sm text-gray-600">1470 Parrisent, Block A, 7th Floor, Number 14</p>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInbox = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inbox</h1>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {Array.isArray(inquiries) && inquiries.map((inquiry: any) => (
              <div key={inquiry.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{inquiry.name}</h3>
                  <p className="text-sm text-gray-600">{inquiry.email}</p>
                  <p className="text-sm text-gray-500">{inquiry.message}</p>
                </div>
                <div className="text-right">
                  <Badge variant={inquiry.status === 'pending' ? 'default' : 'secondary'}>
                    {inquiry.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "inbox":
        return renderInbox();
      case "calendar":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendar</h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Calendar view coming soon...</p>
            </div>
          </div>
        );
      case "934":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">934 Kapahulu Ave</h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Building 934 management coming soon...</p>
            </div>
          </div>
        );
      case "949":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">949 Kawaiahao St</h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Building 949 management coming soon...</p>
            </div>
          </div>
        );
      case "rent-tracker":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Rent Tracker</h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">Rent tracking coming soon...</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo and Search Bar */}
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">EasyStay</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {pendingInquiries > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {pendingInquiries}
                      </span>
                    </span>
                  )}
                </Button>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "dashboard"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab("inbox")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors relative ${
                activeTab === "inbox"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Inbox
              {pendingInquiries > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-500 rounded-full">
                  {pendingInquiries}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "calendar"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Calendar
            </button>

            <button
              onClick={() => setActiveTab("934")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "934"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              934
            </button>

            <button
              onClick={() => setActiveTab("949")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "949"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              949
            </button>

            <button
              onClick={() => setActiveTab("rent-tracker")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "rent-tracker"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rent Tracker
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}