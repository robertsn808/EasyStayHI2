import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { InquiriesTab } from "@/components/InquiriesTab";
import { MaintenanceTab } from "@/components/MaintenanceTab";
import { PaymentsTab } from "@/components/PaymentsTab";
import { ContactsTab } from "@/components/ContactsTab";
import { CalendarTab } from "@/components/CalendarTab";
import { InventoryTab } from "@/components/InventoryTab";
import { ReceiptsTab } from "@/components/ReceiptsTab";
import { TodosTab } from "@/components/TodosTab";
import { AnnouncementsTab } from "@/components/AnnouncementsTab";
import { SettingsTab } from "@/components/SettingsTab";
import { BuildingsTab } from "@/components/BuildingsTab";
import QRCodeManager from "@/components/QRCodeManager";
import GuestProfileManager from "@/components/GuestProfileManager";
import AdminRoomGrid from "@/components/admin-room-grid";

interface AdminTabsProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function AdminTabs({ activeTab = "properties", setActiveTab }: AdminTabsProps) {
  const [selectedTab, setSelectedTab] = useState(activeTab);

  useEffect(() => {
    setSelectedTab(activeTab);
  }, [activeTab]);

  const isAdminAuthenticated = localStorage.getItem('admin-authenticated') === 'true';

  // Fetch data for each tab
  const { data: inquiries } = useQuery({
    queryKey: ["/api/admin/inquiries"],
    enabled: isAdminAuthenticated,
  });

  const { data: maintenanceRequests } = useQuery({
    queryKey: ["/api/admin/maintenance"],
    enabled: isAdminAuthenticated,
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/admin/payments"],
    enabled: isAdminAuthenticated,
  });

  const { data: announcements } = useQuery({
    queryKey: ["/api/admin/announcements"],
    enabled: isAdminAuthenticated,
  });

  const { data: calendarEvents } = useQuery({
    queryKey: ["/api/admin/calendar"],
    enabled: isAdminAuthenticated,
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: isAdminAuthenticated,
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/admin/inventory"],
    enabled: isAdminAuthenticated,
  });

  const { data: receipts } = useQuery({
    queryKey: ["/api/admin/receipts"],
    enabled: isAdminAuthenticated,
  });

  const { data: todos } = useQuery({
    queryKey: ["/api/admin/todos"],
    enabled: isAdminAuthenticated,
  });

  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
    enabled: isAdminAuthenticated,
  });

  const { data: guests } = useQuery({
    queryKey: ["/api/admin/guests"],
    enabled: isAdminAuthenticated,
  });

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Access Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in as admin to access the management dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Area */}
      <Card className="w-full">
        <div className="p-6">
          {selectedTab === "properties" && (
            <AdminRoomGrid rooms={Array.isArray(rooms) ? rooms : []} />
          )}

          {selectedTab === "buildings" && (
            <BuildingsTab buildings={Array.isArray(rooms) ? [] : []} rooms={Array.isArray(rooms) ? rooms : []} />
          )}

          {selectedTab === "guests" && <GuestProfileManager />}
          {selectedTab === "qr-codes" && <QRCodeManager />}
          {selectedTab === "rooms" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Room Management</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.isArray(rooms) && rooms.map((room: any) => (
                  <Card key={room.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Room {room.number}</h3>
                        <p className="text-sm text-gray-600">Building ID: {room.buildingId}</p>
                      </div>
                      <Badge 
                        className={
                          room.status === 'occupied' ? 'bg-red-100 text-red-800' :
                          room.status === 'available' ? 'bg-green-100 text-green-800' :
                          room.status === 'needs_cleaning' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {room.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {room.type || 'Standard'}</p>
                      <p><strong>Size:</strong> {room.size || 'Not specified'}</p>
                      <p><strong>Amenities:</strong> {room.amenities || 'Basic amenities'}</p>
                      <p><strong>Notes:</strong> {room.notes || 'No notes'}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Update Status</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {selectedTab === "maintenance" && <MaintenanceTab requests={maintenanceRequests as any[]} />}
          {selectedTab === "inquiries" && <InquiriesTab inquiries={inquiries as any[]} />}
          {selectedTab === "payments" && <PaymentsTab payments={payments as any[]} />}
          {selectedTab === "announcements" && <AnnouncementsTab announcements={announcements as any[]} />}
          {selectedTab === "calendar" && <CalendarTab events={calendarEvents as any[]} />}
          {selectedTab === "contacts" && <ContactsTab contacts={contacts as any[]} />}
          {selectedTab === "inventory" && <InventoryTab items={inventory as any[]} />}
          {selectedTab === "receipts" && <ReceiptsTab receipts={receipts as any[]} />}
          {selectedTab === "todos" && <TodosTab todos={todos as any[]} />}
          {selectedTab === "settings" && <SettingsTab />}
        </div>
      </Card>
    </div>
  );
}