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
      {/* Quick Actions - All Management Functions */}
      <Card>
        <CardHeader>
          <CardTitle>Management Dashboard - Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <Button
              variant={selectedTab === "properties" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("properties")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Properties</span>
            </Button>
            <Button
              variant={selectedTab === "guests" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("guests")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Guest Profiles</span>
              {guests && Array.isArray(guests) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {guests.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "qr-codes" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("qr-codes")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">QR Codes</span>
            </Button>
            <Button
              variant={selectedTab === "maintenance" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("maintenance")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Maintenance</span>
              {maintenanceRequests && Array.isArray(maintenanceRequests) && (
                <Badge variant="destructive" className="mt-1 text-xs">
                  {maintenanceRequests.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "inquiries" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("inquiries")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Inquiries</span>
              {inquiries && Array.isArray(inquiries) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {inquiries.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "payments" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("payments")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Payments</span>
              {payments && Array.isArray(payments) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {payments.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "announcements" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("announcements")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Announcements</span>
              {announcements && Array.isArray(announcements) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {announcements.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "calendar" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("calendar")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Calendar</span>
              {calendarEvents && Array.isArray(calendarEvents) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {calendarEvents.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "contacts" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("contacts")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Contacts</span>
              {contacts && Array.isArray(contacts) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {contacts.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "inventory" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("inventory")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Inventory</span>
              {inventory && Array.isArray(inventory) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {inventory.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "receipts" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("receipts")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Receipts</span>
              {receipts && Array.isArray(receipts) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {receipts.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={selectedTab === "todos" ? "default" : "outline"}
              className="flex flex-col h-auto py-4"
              onClick={() => handleTabChange("todos")}
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs">Todo List</span>
              {todos && Array.isArray(todos) && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {todos.length}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  <Button>
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
            </div>
          )}

          {selectedTab === "guests" && <GuestProfileManager />}
          {selectedTab === "qr-codes" && <QRCodeManager />}
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