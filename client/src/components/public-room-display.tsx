import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Room } from "@shared/schema";

export default function PublicRoomDisplay() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const handleInquireRoom = (roomNumber: string) => {
    const form = document.getElementById("inquiry-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
      // Trigger room selection in form
      const roomSelect = document.querySelector('select[name="roomNumber"]') as HTMLSelectElement;
      if (roomSelect) {
        roomSelect.value = roomNumber;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Room Availability</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        return "Maintenance";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Room Availability</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms?.map((room: Room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">Room {room.number}</h4>
                <Badge className={`px-2 py-1 text-sm rounded-full ${getStatusColor(room.status)}`}>
                  {getStatusText(room.status)}
                </Badge>
              </div>
              <div className="text-gray-600 text-sm mb-3">
                <div>Size: {room.size || "Standard"}</div>
                <div>Floor: {room.floor || 1}</div>
              </div>
              {room.status === "available" ? (
                <Button
                  onClick={() => handleInquireRoom(room.number)}
                  className="w-full bg-primary text-white hover:bg-blue-700"
                >
                  Inquire About Room
                </Button>
              ) : (
                <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                  {room.status === "occupied" ? "Currently Occupied" : "Not Available"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
