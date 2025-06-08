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
import QRCodeManager from "@/components/QRCodeManager";
import GuestProfileManager from "@/components/GuestProfileManager";

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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Property Management</h2>
                <div className="flex gap-2">
                  <Button onClick={() => handleTabChange("qr-codes")}>
                    QR Codes
                  </Button>
                  <Button onClick={() => handleTabChange("rooms")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Rooms
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">934 Kapahulu Ave</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10 && room.status === 'available').length : 0} of {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10).length : 0} Rooms Available
                      </p>
                      <p className="text-sm">Daily: $100 | Weekly: $500 | Monthly: $2000</p>
                    </div>
                    
                    {/* Room Status Overview */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700">Room Status Overview</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-green-700">Available:</span>
                          <span className="font-semibold text-green-800">
                            {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10 && room.status === 'available').length : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-red-700">Occupied:</span>
                          <span className="font-semibold text-red-800">
                            {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10 && room.status === 'occupied').length : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-orange-700">Needs Cleaning:</span>
                          <span className="font-semibold text-orange-800">
                            {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10 && room.status === 'needs_cleaning').length : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-yellow-700">Maintenance:</span>
                          <span className="font-semibold text-yellow-800">
                            {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10 && room.status === 'maintenance').length : 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Room Grid */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Room Layout</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.isArray(rooms) && rooms.filter((room: any) => room.buildingId === 10).map((room: any) => (
                          <div 
                            key={room.id} 
                            className={`p-2 border rounded text-center text-xs ${
                              room.status === 'occupied' ? 'bg-red-100 text-red-800 border-red-300' :
                              room.status === 'available' ? 'bg-green-100 text-green-800 border-green-300' :
                              room.status === 'needs_cleaning' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                              'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}
                            title={`Room ${room.number} - ${room.status}`}
                          >
                            {room.number}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">949 Kawaiahao St</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'available').length : 0} of {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11).length : 0} Suites Available
                      </p>
                      <p className="text-sm">Daily: $50 | Weekly: $200 | Monthly: $600</p>
                    </div>
                    
                    {/* Room Status Overview */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700">Suite Status Overview</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-green-700">Available:</span>
                          <span className="font-semibold text-green-800">
                            {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'available').length : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-red-700">Occupied:</span>
                          <span className="font-semibold text-red-800">
                            {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'occupied').length : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-orange-700">Needs Cleaning:</span>
                          <span className="font-semibold text-orange-800">
                            {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'needs_cleaning').length : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <span className="text-yellow-700">Maintenance:</span>
                          <span className="font-semibold text-yellow-800">
                            {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'maintenance').length : 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Room Grid */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Suite Layout</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.isArray(rooms) && rooms.filter((room: any) => room.buildingId === 11).map((room: any) => (
                          <div 
                            key={room.id} 
                            className={`p-2 border rounded text-center text-xs ${
                              room.status === 'occupied' ? 'bg-red-100 text-red-800 border-red-300' :
                              room.status === 'available' ? 'bg-green-100 text-green-800 border-green-300' :
                              room.status === 'needs_cleaning' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                              'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}
                            title={`Suite ${room.number} - ${room.status}`}
                          >
                            {room.number}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
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
        </div>
      </Card>
    </div>
  );
}