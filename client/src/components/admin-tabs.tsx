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
import { PropertiesTab } from "@/components/PropertiesTab";
import QRCodeManager from "@/components/QRCodeManager";
import GuestProfileManager from "@/components/GuestProfileManager";
import AdminRoomGrid from "@/components/admin-room-grid";

interface AdminTabsProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function AdminTabs({ activeTab = "rooms", setActiveTab }: AdminTabsProps) {
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

  const { data: buildings } = useQuery({
    queryKey: ["/api/admin/buildings"],
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


          {selectedTab === "guests" && <GuestProfileManager />}
          {selectedTab === "qr-codes" && <QRCodeManager />}
          {selectedTab === "rooms" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Room Management</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </div>
              
              {/* Summary Cards by Building */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 934 Kapahulu Ave Summary */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">934 Kapahulu Ave Overview</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        {Array.isArray(rooms) && Array.isArray(buildings) ? 
                          rooms.filter((r: any) => {
                            const building = buildings.find((b: any) => b.id === r.buildingId);
                            return building?.name === "934 Kapahulu Ave" && r.status === 'available';
                          }).length : 0}
                      </div>
                      <div className="text-xs text-green-600">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-700">
                        {Array.isArray(rooms) && Array.isArray(buildings) ? 
                          rooms.filter((r: any) => {
                            const building = buildings.find((b: any) => b.id === r.buildingId);
                            return building?.name === "934 Kapahulu Ave" && r.status === 'occupied';
                          }).length : 0}
                      </div>
                      <div className="text-xs text-red-600">Occupied</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-700">
                        {Array.isArray(rooms) && Array.isArray(buildings) ? 
                          rooms.filter((r: any) => {
                            const building = buildings.find((b: any) => b.id === r.buildingId);
                            return building?.name === "934 Kapahulu Ave" && r.status === 'needs_cleaning';
                          }).length : 0}
                      </div>
                      <div className="text-xs text-orange-600">Cleaning</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-700">
                        {Array.isArray(rooms) && Array.isArray(buildings) ? 
                          rooms.filter((r: any) => {
                            const building = buildings.find((b: any) => b.id === r.buildingId);
                            return building?.name === "934 Kapahulu Ave";
                          }).length : 0}
                      </div>
                      <div className="text-xs text-blue-600">Total</div>
                    </div>
                  </div>
                </Card>

                {/* 949 Kawaiahao St Summary */}
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">949 Kawaiahao St Overview</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">
                        {Array.isArray(rooms) && Array.isArray(buildings) ? 
                          rooms.filter((r: any) => {
                            const building = buildings.find((b: any) => b.id === r.buildingId);
                            return building?.name === "949 Kawaiahao St" && r.status === 'available';
                          }).length : 0}
                      </div>
                      <div className="text-xs text-green-600">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-700">
                        {Array.isArray(rooms) && Array.isArray(buildings) ? 
                          rooms.filter((r: any) => {
                            const building = buildings.find((b: any) => b.id === r.buildingId);
                            return building?.name === "949 Kawaiahao St" && r.status === 'occupied';
                          }).length : 0}
                      </div>
                      <div className="text-xs text-red-600">Occupied</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-700">
                        {Array.isArray(rooms) && Array.isArray(buildings) ? 
                          rooms.filter((r: any) => {
                            const building = buildings.find((b: any) => b.id === r.buildingId);
                            return building?.name === "949 Kawaiahao St" && r.status === 'needs_cleaning';
                          }).length : 0}
                      </div>
                      <div className="text-xs text-orange-600">Cleaning</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-700">
                        {Array.isArray(rooms) && Array.isArray(buildings) ? 
                          rooms.filter((r: any) => {
                            const building = buildings.find((b: any) => b.id === r.buildingId);
                            return building?.name === "949 Kawaiahao St";
                          }).length : 0}
                      </div>
                      <div className="text-xs text-purple-600">Total</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Buildings Separated Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 934 Kapahulu Ave */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">934 Kapahulu Ave</h3>
                    <p className="text-sm text-gray-600">8 rooms • $100/$500/$2000 pricing</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.isArray(rooms) && rooms
                      .filter((room: any) => {
                        const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room.buildingId) : null;
                        return building?.name === "934 Kapahulu Ave";
                      })
                      .map((room: any) => {
                        const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room.buildingId) : null;
                        return (
                          <Card key={room.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-base">#{room.number}</h3>
                                <Badge 
                                  variant={
                                    room.status === 'occupied' ? 'destructive' :
                                    room.status === 'available' ? 'default' :
                                    room.status === 'needs_cleaning' ? 'secondary' :
                                    'outline'
                                  }
                                  className="text-xs"
                                >
                                  {room.status?.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-xs text-gray-600 mb-2">
                                {room.size && <p><strong>Size:</strong> {room.size}</p>}
                                {room.tenantName && <p><strong>Tenant:</strong> {room.tenantName}</p>}
                                {room.accessPin && <p><strong>PIN:</strong> {room.accessPin}</p>}
                              </div>
                              
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6 flex-1">
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6 flex-1">
                                  Status
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>

                {/* 949 Kawaiahao St */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">949 Kawaiahao St</h3>
                    <p className="text-sm text-gray-600">10 suites • $50/$200/$600 pricing</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.isArray(rooms) && rooms
                      .filter((room: any) => {
                        const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room.buildingId) : null;
                        return building?.name === "949 Kawaiahao St";
                      })
                      .map((room: any) => {
                        const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room.buildingId) : null;
                        return (
                          <Card key={room.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-base">#{room.number}</h3>
                                <Badge 
                                  variant={
                                    room.status === 'occupied' ? 'destructive' :
                                    room.status === 'available' ? 'default' :
                                    room.status === 'needs_cleaning' ? 'secondary' :
                                    'outline'
                                  }
                                  className="text-xs"
                                >
                                  {room.status?.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-xs text-gray-600 mb-2">
                                {room.size && <p><strong>Size:</strong> {room.size}</p>}
                                {room.tenantName && <p><strong>Tenant:</strong> {room.tenantName}</p>}
                                {room.accessPin && <p><strong>PIN:</strong> {room.accessPin}</p>}
                              </div>
                              
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6 flex-1">
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6 flex-1">
                                  Status
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
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