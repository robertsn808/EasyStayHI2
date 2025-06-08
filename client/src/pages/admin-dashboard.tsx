import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
            <h2 className="text-2xl font-bold text-gray-900">Property Management Dashboard</h2>
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

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <div className="text-green-600 text-xl">🏠</div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{availableRooms}</h3>
                <p className="text-sm text-gray-600">Available Rooms</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <div className="text-red-600 text-xl">👤</div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{occupiedRooms}</h3>
                <p className="text-sm text-gray-600">Occupied Rooms</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <div className="text-yellow-600 text-xl">🔧</div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{maintenanceRooms}</h3>
                <p className="text-sm text-gray-600">Under Maintenance</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <div className="text-blue-600 text-xl">💰</div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">${monthlyRevenue.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Room Management Grid */}
        <AdminRoomGrid rooms={rooms || []} />

        {/* Dashboard Tabs */}
        <AdminTabs />
      </div>
    </div>
  );
}
