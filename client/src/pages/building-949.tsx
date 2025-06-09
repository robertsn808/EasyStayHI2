import { useQuery } from "@tanstack/react-query";
import { BillPaymentTracker } from "@/components/BillPaymentTracker";

export default function Building949() {
  // Fetch all necessary data
  const { data: guests = [] } = useQuery({
    queryKey: ["/api/admin/guests"],
    enabled: !!localStorage.getItem('admin-authenticated')
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
    enabled: !!localStorage.getItem('admin-authenticated')
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/buildings"],
    enabled: !!localStorage.getItem('admin-authenticated')
  });

  // Filter for 949 building specifically
  const building949 = (buildings as any[]).find((b: any) => b.name === "949 Kawaiahao St") || { id: 11 };
  const building949Rooms = (rooms as any[]).filter((room: any) => room.buildingId === building949.id);
  const building949Guests = (guests as any[]).filter((guest: any) => 
    building949Rooms.some((room: any) => room.id === guest.roomId)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">949 Kawaiahao St</h1>
          <p className="text-gray-600">Payment tracking and room status management</p>
        </div>
        
        <BillPaymentTracker 
          guests={building949Guests}
          rooms={building949Rooms}
          buildings={[building949]}
        />
      </div>
    </div>
  );
}