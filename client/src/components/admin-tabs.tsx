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
import QRCodeManager from "@/components/QRCodeManager";
import GuestProfileManager from "@/components/GuestProfileManager";
import WeeklyCalendar from "@/components/WeeklyCalendar";
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

  // Fetch data for each tab
  const { data: inquiries } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: maintenanceRequests } = useQuery({
    queryKey: ["/api/admin/maintenance"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/admin/contacts"],
  });

  const { data: calendarEvents } = useQuery({
    queryKey: ["/api/admin/calendar"],
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/admin/inventory"],
  });

  const { data: receipts } = useQuery({
    queryKey: ["/api/admin/receipts"],
  });

  const { data: todos } = useQuery({
    queryKey: ["/api/admin/todos"],
  });

  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
  });

  return (
    <Card className="shadow-sm">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="current-guests">Current Guests</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties" className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Property Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Manage Rooms
              </Button>
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
                          room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {room.number}
                        <div className="text-[10px] mt-1 capitalize">{room.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">949 Kawaiahao St</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'available').length : 0} of {Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11).length : 0} Suites Available
                  </p>
                  <p className="text-sm">Daily: $50 | Weekly: $200 | Monthly: $600</p>
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {Array.isArray(rooms) && rooms.filter((room: any) => room.buildingId === 11).map((room: any) => (
                      <div 
                        key={room.id} 
                        className={`p-2 border rounded text-center text-xs ${
                          room.status === 'occupied' ? 'bg-red-100 text-red-800' :
                          room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {room.number}
                        <div className="text-[10px] mt-1 capitalize">{room.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="p-6">
          <PaymentsTab payments={payments} />
        </TabsContent>

        <TabsContent value="contacts" className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Contacts Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Show Vendors Only
                </Button>
                <Button>Add New Contact</Button>
              </div>
            </div>
            <ContactsTab contacts={contacts} />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="p-6">
          <InventoryTab items={inventory} />
        </TabsContent>

        <TabsContent value="receipts" className="p-6">
          <ReceiptsTab receipts={receipts} />
        </TabsContent>

        <TabsContent value="current-guests" className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Current Guests</h2>
              <div className="text-sm text-gray-600">
                Showing guests currently checked in
              </div>
            </div>
            <div className="grid gap-4">
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">John Smith</h3>
                    <p className="text-sm text-gray-600">Room 001 - 934 Kapahulu</p>
                    <p className="text-sm">Check-in: Dec 1, 2024</p>
                    <p className="text-sm">Monthly Rate: $2000</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Badge variant="outline">Payment Due: Dec 15</Badge>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Maria Garcia</h3>
                    <p className="text-sm text-gray-600">Room 003 - 949 Kawaiahao</p>
                    <p className="text-sm">Check-in: Nov 28, 2024</p>
                    <p className="text-sm">Weekly Rate: $200</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Badge className="bg-orange-100 text-orange-800">Payment Overdue</Badge>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">David Chen</h3>
                    <p className="text-sm text-gray-600">Room 005 - 934 Kapahulu</p>
                    <p className="text-sm">Check-in: Dec 5, 2024</p>
                    <p className="text-sm">Daily Rate: $100</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Badge className="bg-green-100 text-green-800">Payment Current</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}