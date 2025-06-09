import { useQuery } from "@tanstack/react-query";
import { BillPaymentTracker } from "@/components/BillPaymentTracker";

export default function Building934() {
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

  // Filter for 934 building specifically
  const building934 = (buildings as any[]).find((b: any) => b.name === "934 Kapahulu Ave") || { id: 10 };
  const building934Rooms = (rooms as any[]).filter((room: any) => room.buildingId === building934.id);
  const building934Guests = (guests as any[]).filter((guest: any) => 
    building934Rooms.some((room: any) => room.id === guest.roomId)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">934 Kapahulu Ave</h1>
          <p className="text-gray-600">Payment tracking and room status management</p>
        </div>
        
        <BillPaymentTracker 
          guests={building934Guests}
          rooms={building934Rooms}
          buildings={[building934]}
        />
      </div>
    </div>
  );
}