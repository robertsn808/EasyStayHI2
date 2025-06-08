import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, Users, QrCode, Wrench, MessageSquare, Calendar, 
  DollarSign, Megaphone, Contact, Package, Receipt, Bell,
  CheckCircle, AlertTriangle, Clock, User
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import backgroundImage from "@assets/image_1749351216300.png";
import AdminTabs from "@/components/AdminTabs";

type TabType = 
  | "properties" 
  | "guests" 
  | "qr-codes" 
  | "maintenance" 
  | "inquiries" 
  | "payments" 
  | "announcements" 
  | "calendar" 
  | "contacts" 
  | "inventory" 
  | "receipts" 
  | "todos";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("properties");

  // Fetch all data
  const { data: rooms } = useQuery({ queryKey: ["/api/rooms"] });
  const { data: guests } = useQuery({ queryKey: ["/api/admin/guests"] });
  const { data: maintenanceRequests } = useQuery({ queryKey: ["/api/admin/maintenance"] });
  const { data: inquiries } = useQuery({ queryKey: ["/api/admin/inquiries"] });
  const { data: payments } = useQuery({ queryKey: ["/api/admin/payments"] });
  const { data: announcements } = useQuery({ queryKey: ["/api/admin/announcements"] });
  const { data: calendarEvents } = useQuery({ queryKey: ["/api/admin/calendar"] });
  const { data: contacts } = useQuery({ queryKey: ["/api/admin/contacts"] });
  const { data: inventory } = useQuery({ queryKey: ["/api/admin/inventory"] });
  const { data: receipts } = useQuery({ queryKey: ["/api/admin/receipts"] });
  const { data: todos } = useQuery({ queryKey: ["/api/admin/todos"] });

  // Calculate room statistics
  const roomStats = rooms ? {
    total: rooms.length,
    occupied: rooms.filter((room: any) => room.status === 'occupied').length,
    available: rooms.filter((room: any) => room.status === 'available').length,
    maintenance: rooms.filter((room: any) => room.status === 'maintenance').length,
    cleaning: rooms.filter((room: any) => room.status === 'needs cleaning').length
  } : { total: 0, occupied: 0, available: 0, maintenance: 0, cleaning: 0 };

  // Count today's payment due guests
  const todaysPaymentDue = guests ? guests.filter((guest: any) => {
    if (!guest.nextPaymentDue) return false;
    const today = new Date().toDateString();
    const paymentDue = new Date(guest.nextPaymentDue).toDateString();
    return today === paymentDue && guest.paymentStatus !== 'paid';
  }).length : 0;

  // Count incomplete todos
  const incompleteTodos = todos ? todos.filter((todo: any) => !todo.isCompleted).length : 0;

  // If loading initial data, show loading state
  if (!rooms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96 p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Please wait while we load your property data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile Overview Cards */}
        <div className="lg:hidden grid grid-cols-4 gap-2 mb-6">
          <Card className={`${activeTab === "properties" ? "bg-green-100 border-green-300" : "bg-green-50 border-green-200"} cursor-pointer`}
            onClick={() => setActiveTab("properties")}
          >
            <CardContent className="p-2">
              <div className="text-center">
                <Home className="h-4 w-4 text-green-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-green-900">Properties</p>
                <p className="text-sm font-bold text-green-700">2</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${activeTab === "guests" ? "bg-blue-100 border-blue-300" : "bg-blue-50 border-blue-200"} cursor-pointer`}
            onClick={() => setActiveTab("guests")}
          >
            <CardContent className="p-2">
              <div className="text-center">
                <Users className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-blue-900">Guests</p>
                <p className="text-sm font-bold text-blue-700">{Array.isArray(guests) ? guests.length : 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${activeTab === "maintenance" ? "bg-orange-100 border-orange-300" : "bg-orange-50 border-orange-200"} cursor-pointer`}
            onClick={() => setActiveTab("maintenance")}
          >
            <CardContent className="p-2">
              <div className="text-center">
                <Wrench className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-orange-900">Maintenance</p>
                <p className="text-sm font-bold text-orange-700">{Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${activeTab === "inquiries" ? "bg-cyan-100 border-cyan-300" : "bg-cyan-50 border-cyan-200"} cursor-pointer`}
            onClick={() => setActiveTab("inquiries")}
          >
            <CardContent className="p-2">
              <div className="text-center">
                <MessageSquare className="h-4 w-4 text-cyan-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-cyan-900">Inquiries</p>
                <p className="text-sm font-bold text-cyan-700">{Array.isArray(inquiries) ? inquiries.length : 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar with Condensed Overview */}
          <div className="hidden lg:block w-80 space-y-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
            
            {/* Main Management Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className={`${activeTab === "properties" ? "bg-green-100 border-green-300" : "bg-green-50 border-green-200"} cursor-pointer`}
                onClick={() => setActiveTab("properties")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-green-900">Properties</h3>
                      <p className="text-lg font-bold text-green-700">2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "guests" ? "bg-blue-100 border-blue-300" : "bg-blue-50 border-blue-200"} cursor-pointer`}
                onClick={() => setActiveTab("guests")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-blue-900">Guests</h3>
                      <p className="text-lg font-bold text-blue-700">{Array.isArray(guests) ? guests.length : 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "qr-codes" ? "bg-purple-100 border-purple-300" : "bg-purple-50 border-purple-200"} cursor-pointer`}
                onClick={() => setActiveTab("qr-codes")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-purple-900">QR Codes</h3>
                      <p className="text-lg font-bold text-purple-700">18</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "maintenance" ? "bg-orange-100 border-orange-300" : "bg-orange-50 border-orange-200"} cursor-pointer`}
                onClick={() => setActiveTab("maintenance")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-orange-900">Maintenance</h3>
                      <p className="text-lg font-bold text-orange-700">{Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "inquiries" ? "bg-cyan-100 border-cyan-300" : "bg-cyan-50 border-cyan-200"} cursor-pointer`}
                onClick={() => setActiveTab("inquiries")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-cyan-900">Inquiries</h3>
                      <p className="text-lg font-bold text-cyan-700">{Array.isArray(inquiries) ? inquiries.length : 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${activeTab === "calendar" ? "bg-indigo-100 border-indigo-300" : "bg-indigo-50 border-indigo-200"} cursor-pointer`}
                onClick={() => setActiveTab("calendar")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-semibold text-indigo-900">Calendar</h3>
                      <p className="text-lg font-bold text-indigo-700">{Array.isArray(calendarEvents) ? calendarEvents.length : 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Buttons */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Quick Access</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("payments")}
                >
                  <DollarSign className="h-3 w-3 mr-2" />
                  Payments ({Array.isArray(payments) ? payments.length : 0})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("announcements")}
                >
                  <Megaphone className="h-3 w-3 mr-2" />
                  Announcements ({Array.isArray(announcements) ? announcements.length : 0})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("contacts")}
                >
                  <Contact className="h-3 w-3 mr-2" />
                  Contacts ({Array.isArray(contacts) ? contacts.length : 0})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("inventory")}
                >
                  <Package className="h-3 w-3 mr-2" />
                  Inventory ({Array.isArray(inventory) ? inventory.length : 0})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 justify-start"
                  onClick={() => setActiveTab("receipts")}
                >
                  <Receipt className="h-3 w-3 mr-2" />
                  Receipts ({Array.isArray(receipts) ? receipts.length : 0})
                </Button>
              </div>
            </div>

            {/* Today's Overview */}
            <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-3">Today's Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-800">Payment Due</span>
                    </div>
                    <span className="text-sm font-bold text-amber-700">{todaysPaymentDue}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-800">Pending Tasks</span>
                    </div>
                    <span className="text-sm font-bold text-amber-700">{incompleteTodos}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-amber-800">Available Rooms</span>
                    </div>
                    <span className="text-sm font-bold text-amber-700">{roomStats.available}</span>
                  </div>

                  {calendarEvents && calendarEvents.length > 0 && (
                    <div className="pt-2 border-t border-amber-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-amber-800">Today's Events</span>
                      </div>
                      {calendarEvents.slice(0, 2).map((event: any) => (
                        <div key={event.id} className="text-xs text-amber-700 mb-1">
                          • {event.title}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs h-8"
                    onClick={() => setActiveTab("calendar")}
                  >
                    View Full Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-4 lg:space-y-8">
            <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
}