import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, LogOut, Plus } from "lucide-react";
import AdminRoomGrid from "@/components/admin-room-grid";
import AdminTabs from "@/components/admin-tabs";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["/api/admin/rooms"],
    enabled: isAuthenticated,
  });

  const { data: inquiries } = useQuery({
    queryKey: ["/api/admin/inquiries"],
    enabled: isAuthenticated,
  });

  if (isLoading || roomsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const availableRooms = rooms?.filter((room: any) => room.status === "available").length || 0;
  const occupiedRooms = rooms?.filter((room: any) => room.status === "occupied").length || 0;
  const maintenanceRooms = rooms?.filter((room: any) => room.status === "out_of_service").length || 0;
  const newInquiries = inquiries?.filter((inquiry: any) => inquiry.status === "new").length || 0;
  
  // Calculate monthly revenue (simplified calculation)
  const monthlyRevenue = occupiedRooms * 2000; // Assuming average monthly rate

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Navigation */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Property Mng</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                  {newInquiries > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {newInquiries}
                    </span>
                  )}
                </Button>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>



        {/* Room Management Grid */}
        <AdminRoomGrid rooms={rooms || []} />

        {/* Property 934 Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Property 934 - Kapahulu</h3>
            <Button 
              onClick={() => window.open('/', '_blank')} 
              variant="outline"
            >
              View Property Page
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-2xl font-bold text-blue-900">{availableRooms}</div>
              <div className="text-xs text-blue-700">Available Rooms</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">👤</div>
              <div className="text-2xl font-bold text-green-900">{(rooms?.length || 0) - availableRooms}</div>
              <div className="text-xs text-green-700">Occupied Rooms</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🔧</div>
              <div className="text-2xl font-bold text-orange-900">2</div>
              <div className="text-xs text-orange-700">Under Maintenance</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🧹</div>
              <div className="text-2xl font-bold text-yellow-900">3</div>
              <div className="text-xs text-yellow-700">Need Cleaning</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Room Manager</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Room 1A</span>
                    <span className="text-sm text-gray-600">John Smith</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Room 2A</span>
                    <span className="text-sm text-gray-600">Maintenance</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">Room 1B</span>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Recent Tenant Requests</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Maintenance Request - Room 2A</p>
                    <p className="text-sm text-gray-600">AC unit not cooling properly</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">Urgent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Payment Inquiry - Room 1B</p>
                    <p className="text-sm text-gray-600">Question about next month's rent</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property 949 Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Property 949 - Luxury Suites</h3>
            <Button 
              onClick={() => window.open('/949', '_blank')} 
              variant="outline"
            >
              View Property Page
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-2xl font-bold text-blue-900">2</div>
              <div className="text-xs text-blue-700">Available Rooms</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">👤</div>
              <div className="text-2xl font-bold text-green-900">8</div>
              <div className="text-xs text-green-700">Occupied Rooms</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🔧</div>
              <div className="text-2xl font-bold text-orange-900">0</div>
              <div className="text-xs text-orange-700">Under Maintenance</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🧹</div>
              <div className="text-2xl font-bold text-yellow-900">1</div>
              <div className="text-xs text-yellow-700">Need Cleaning</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Room Manager</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Suite 1</span>
                    <span className="text-sm text-gray-600">Maria Rodriguez</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Suite 3</span>
                    <span className="text-sm text-gray-600">David Chen</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">Suite 7</span>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="font-medium">Suite 9</span>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Recent Tenant Requests</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Service Request - Suite 5</p>
                    <p className="text-sm text-gray-600">Request for additional towels and amenities</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Progress</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Extension Request - Suite 3</p>
                    <p className="text-sm text-gray-600">Tenant requesting 2-week extension</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar and Todo Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Weekly Calendar</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-4">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="aspect-square p-2 text-center border rounded hover:bg-gray-50 cursor-pointer">
                    <div className="text-sm">{i + 8}</div>
                    {i === 2 && <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>}
                    {i === 4 && <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Room inspection - Property 934</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>Maintenance scheduled - Property 949</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Todo List</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Review tenant applications for Property 934</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Schedule maintenance for Suite 7 - Property 949</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                <span className="text-sm line-through text-gray-500">Update property listing photos</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Process rent payments for June</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm">Send welcome package to new tenant</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Add New Task
            </Button>
          </div>
        </div>

        {/* Management Tabs Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payments">Payments & Receipts</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="guests">Guests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payments" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Room 2A - Property 934</p>
                        <p className="text-sm text-gray-600">Monthly rent payment</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$1,200</p>
                        <p className="text-sm text-gray-500">June 1, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Suite 5 - Property 949</p>
                        <p className="text-sm text-gray-600">Weekly payment</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$750</p>
                        <p className="text-sm text-gray-500">June 7, 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Receipts & Documents</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Utility Bill - Property 934</p>
                        <p className="text-sm text-gray-600">Electric company - May 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">$456</p>
                        <Button variant="outline" size="sm">View Receipt</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Maintenance Service - Property 949</p>
                        <p className="text-sm text-gray-600">HVAC repair service</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">$280</p>
                        <Button variant="outline" size="sm">View Receipt</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="mt-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Inventory</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Property 934 - Items</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">Bed Linens</span>
                        <span className="text-sm font-medium">15 sets</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">Towels</span>
                        <span className="text-sm font-medium">24 pieces</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">Cleaning Supplies</span>
                        <span className="text-sm font-medium text-red-600">Low Stock</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Property 949 - Items</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">Premium Linens</span>
                        <span className="text-sm font-medium">8 sets</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">Luxury Amenities</span>
                        <span className="text-sm font-medium">12 kits</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">Coffee Supplies</span>
                        <span className="text-sm font-medium">6 packages</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="guests" className="mt-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Guests</h4>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium">John Smith</h5>
                        <p className="text-sm text-gray-600">Room 2A, Property 934</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Check-in: May 15, 2025</p>
                        <p className="text-gray-600">Check-out: June 15, 2025</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration: 31 days</p>
                        <p className="text-gray-600">Rate: $1,200/month</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium">Maria Rodriguez</h5>
                        <p className="text-sm text-gray-600">Suite 5, Property 949</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Extended</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Check-in: June 1, 2025</p>
                        <p className="text-gray-600">Check-out: June 21, 2025</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration: 3 weeks</p>
                        <p className="text-gray-600">Rate: $750/week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
