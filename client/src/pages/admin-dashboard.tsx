import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, LogOut, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Property Mng</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Property 934 Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Property 934</h3>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => window.open('/property-934', '_blank')} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Manage Property
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Room
                </Button>
              </div>
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xl mb-1">🏠</div>
                <div className="text-lg font-bold text-blue-900">3</div>
                <div className="text-xs text-blue-700">Available</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xl mb-1">👤</div>
                <div className="text-lg font-bold text-green-900">5</div>
                <div className="text-xs text-green-700">Occupied</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-xl mb-1">🔧</div>
                <div className="text-lg font-bold text-orange-900">0</div>
                <div className="text-xs text-orange-700">Maintenance</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-xl mb-1">🧹</div>
                <div className="text-lg font-bold text-yellow-900">0</div>
                <div className="text-xs text-yellow-700">Cleaning</div>
              </div>
            </div>

            {/* Room List */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Room Status</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Room 1A</span>
                    <span className="text-xs text-gray-600">John Smith</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Room 2A</span>
                    <span className="text-xs text-gray-600">Maintenance</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium">Room 1B</span>
                    <span className="text-xs text-gray-600">Available</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Property 949 Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Property 949</h3>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => window.open('/property-949', '_blank')} 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  Manage Property
                </Button>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Room
                </Button>
              </div>
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xl mb-1">🏠</div>
                <div className="text-lg font-bold text-blue-900">3</div>
                <div className="text-xs text-blue-700">Available</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xl mb-1">👤</div>
                <div className="text-lg font-bold text-green-900">7</div>
                <div className="text-xs text-green-700">Occupied</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-xl mb-1">🔧</div>
                <div className="text-lg font-bold text-orange-900">0</div>
                <div className="text-xs text-orange-700">Maintenance</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-xl mb-1">🧹</div>
                <div className="text-lg font-bold text-yellow-900">0</div>
                <div className="text-xs text-yellow-700">Cleaning</div>
              </div>
            </div>

            {/* Room List */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Suite Status</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Suite 1</span>
                    <span className="text-xs text-gray-600">Maria Rodriguez</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Suite 3</span>
                    <span className="text-xs text-gray-600">David Chen</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium">Suite 7</span>
                    <span className="text-xs text-gray-600">Available</span>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operations Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Calendar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-3">
              <div className="font-medium text-gray-600">S</div>
              <div className="font-medium text-gray-600">M</div>
              <div className="font-medium text-gray-600">T</div>
              <div className="font-medium text-gray-600">W</div>
              <div className="font-medium text-gray-600">T</div>
              <div className="font-medium text-gray-600">F</div>
              <div className="font-medium text-gray-600">S</div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="aspect-square p-1 text-center border rounded text-xs hover:bg-gray-50 cursor-pointer">
                  <div>{i + 8}</div>
                  {i === 2 && <div className="w-1 h-1 bg-blue-500 rounded-full mx-auto"></div>}
                  {i === 4 && <div className="w-1 h-1 bg-red-500 rounded-full mx-auto"></div>}
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>Inspection - 934</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span>Maintenance - 949</span>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-sm" />
                <span className="text-sm">Review tenant applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-sm" />
                <span className="text-sm">Schedule maintenance</span>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-sm" defaultChecked />
                <span className="text-sm line-through text-gray-500">Update photos</span>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-sm" />
                <span className="text-sm">Process payments</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              Add Task
            </Button>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payments">Payments & Receipts</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="guests">Guests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payments" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recent Payments</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="text-sm font-medium">Room 1A - 934</p>
                        <p className="text-xs text-gray-600">Monthly rent</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">$1,200</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="text-sm font-medium">Suite 3 - 949</p>
                        <p className="text-xs text-gray-600">Weekly payment</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">$750</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Expenses</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="text-sm font-medium">Utility Bill - 934</p>
                        <p className="text-xs text-gray-600">Electric - May</p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">$456</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="text-sm font-medium">HVAC Service - 949</p>
                        <p className="text-xs text-gray-600">Repair service</p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">$280</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property 934</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Bed Linens</span>
                      <span className="text-sm font-medium">15 sets</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Towels</span>
                      <span className="text-sm font-medium">24 pieces</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm">Cleaning Supplies</span>
                      <span className="text-sm font-medium text-red-600">Low Stock</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property 949</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Premium Linens</span>
                      <span className="text-sm font-medium">8 sets</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Luxury Amenities</span>
                      <span className="text-sm font-medium">12 kits</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Coffee Supplies</span>
                      <span className="text-sm font-medium">6 packages</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="guests" className="mt-6">
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">John Smith</h5>
                      <p className="text-sm text-gray-600">Room 1A, Property 934</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="text-gray-600">Check-in: May 15, 2025</span>
                    <span className="text-gray-600">Rate: $1,200/month</span>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">Maria Rodriguez</h5>
                      <p className="text-sm text-gray-600">Suite 3, Property 949</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Extended</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="text-gray-600">Check-in: June 1, 2025</span>
                    <span className="text-gray-600">Rate: $750/week</span>
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