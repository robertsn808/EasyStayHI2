
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState(activeTab);

  // Sync with external activeTab changes
  useEffect(() => {
    setSelectedTab(activeTab);
  }, [activeTab]);

  // Check admin authentication
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

  const { data: contacts } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: isAdminAuthenticated,
  });

  const { data: calendarEvents } = useQuery({
    queryKey: ["/api/admin/calendar"],
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

  const { data: announcements } = useQuery({
    queryKey: ["/api/admin/announcements"],
    enabled: isAdminAuthenticated,
  });

  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
    enabled: isAdminAuthenticated,
  });

  const { data: buildings } = useQuery({
    queryKey: ["/api/buildings"],
    enabled: isAdminAuthenticated,
  });

  const { data: guestProfiles } = useQuery({
    queryKey: ["/api/admin/guests"],
    enabled: isAdminAuthenticated,
  });

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return (
    <Card className="w-full">
      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="todos">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Property Management</h2>
              <div className="flex gap-2">
                <Button onClick={() => handleTabChange("qr-codes")}>
                  QR Codes
                </Button>
                <Button onClick={() => handleTabChange("manage-rooms")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Rooms
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">934 Kapahulu Ave</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10 && room.status === 'available').length : 0} of {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10).length : 0} Rooms Available
                  </p>
                  <p className="text-sm">Daily: $100 | Weekly: $500 | Monthly: $2000</p>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {Array.isArray(rooms) && rooms.filter((room: any) => room.buildingId === 10).map((room: any) => (
                      <div 
                        key={room.id} 
                        className={`p-2 border rounded text-center text-xs ${
                          room.status === 'occupied' ? 'bg-red-100 text-red-800' :
                          room.status === 'available' ? 'bg-green-100 text-green-800' :
                          room.status === 'needs_cleaning' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {room.number}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">949 Kawaiahao St</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'available').length : 0} of {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11).length : 0} Rooms Available
                  </p>
                  <p className="text-sm">Daily: $50 | Weekly: $300 | Monthly: $1200</p>
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {Array.isArray(rooms) && rooms.filter((room: any) => room.buildingId === 11).map((room: any) => (
                      <div 
                        key={room.id} 
                        className={`p-2 border rounded text-center text-xs ${
                          room.status === 'occupied' ? 'bg-red-100 text-red-800' :
                          room.status === 'available' ? 'bg-green-100 text-green-800' :
                          room.status === 'needs_cleaning' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {room.number}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Array.isArray(rooms) ? rooms.filter((room: any) => room.status === 'available').length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Available Rooms</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Array.isArray(rooms) ? rooms.filter((room: any) => room.status === 'occupied').length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Occupied Rooms</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Maintenance Requests</div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Array.isArray(guestProfiles) ? guestProfiles.length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Guests</div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="p-6">
          <InquiriesTab inquiries={inquiries} />
        </TabsContent>

        <TabsContent value="maintenance" className="p-6">
          <MaintenanceTab requests={maintenanceRequests} />
        </TabsContent>

        <TabsContent value="payments" className="p-6">
          <PaymentsTab payments={payments} />
        </TabsContent>

        <TabsContent value="guests" className="p-6">
          <GuestProfileManager />
        </TabsContent>

        <TabsContent value="announcements" className="p-6">
          <AnnouncementsTab announcements={announcements} />
        </TabsContent>

        <TabsContent value="calendar" className="p-6">
          <CalendarTab events={calendarEvents} />
        </TabsContent>

        <TabsContent value="contacts" className="p-6">
          <ContactsTab contacts={contacts} />
        </TabsContent>

        <TabsContent value="inventory" className="p-6">
          <InventoryTab inventory={inventory} />
        </TabsContent>

        <TabsContent value="receipts" className="p-6">
          <ReceiptsTab receipts={receipts} />
        </TabsContent>

        <TabsContent value="qr-codes" className="p-6">
          <QRCodeManager />
        </TabsContent>

        <TabsContent value="todos" className="p-6">
          <TodosTab todos={todos} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
