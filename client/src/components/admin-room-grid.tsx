import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Room } from "@shared/schema";

interface AdminRoomGridProps {
  rooms: Room[];
}

export default function AdminRoomGrid({ rooms }: AdminRoomGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "needs_cleaning":
        return "bg-orange-100 text-orange-800";
      case "out_of_service":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "occupied":
        return "Occupied";
      case "needs_cleaning":
        return "Needs Cleaning";
      case "out_of_service":
        return "Out of Service";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Room Management</h3>
        <Button className="bg-primary text-white hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Building
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">Room {room.number}</h4>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="mb-3">
                <Badge className={`px-2 py-1 text-sm rounded-full ${getStatusColor(room.status)}`}>
                  {getStatusText(room.status)}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                <div>Last cleaned: {formatDate(room.lastCleaned)}</div>
                {room.tenantName && <div>Tenant: {room.tenantName}</div>}
                <div>Next payment: {formatDate(room.nextPaymentDue)}</div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1 bg-primary text-white hover:bg-blue-700">
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  {room.status === "available" ? "Clean" : "View"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
