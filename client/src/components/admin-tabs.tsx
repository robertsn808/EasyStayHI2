import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <Card className="shadow-sm">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="inquiries" className="relative">
              Inquiries
              {inquiries?.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {inquiries.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="todos">Todo List</TabsTrigger>
            <TabsTrigger value="guests">Guest Management</TabsTrigger>
            <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties" className="p-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Property Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">934 Kapahulu Ave</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">8 Rooms Available</p>
                  <p className="text-sm">Daily: $100 | Weekly: $500 | Monthly: $2000</p>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="p-2 border rounded text-center bg-green-100">
                        {String(i + 1).padStart(3, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">949 Kawaiahao St</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">10 Suites Available</p>
                  <p className="text-sm">Daily: $50 | Weekly: $200 | Monthly: $600</p>
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className="p-2 border rounded text-center bg-blue-100">
                        {String(i + 1).padStart(3, '0')}
                      </div>
                    ))}
                  </div>
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

        <TabsContent value="contacts" className="p-6">
          <ContactsTab contacts={contacts} />
        </TabsContent>

        <TabsContent value="calendar" className="p-6">
          <CalendarTab events={calendarEvents} />
        </TabsContent>

        <TabsContent value="inventory" className="p-6">
          <InventoryTab items={inventory} />
        </TabsContent>

        <TabsContent value="receipts" className="p-6">
          <ReceiptsTab receipts={receipts} />
        </TabsContent>

        <TabsContent value="todos" className="p-6">
          <TodosTab todos={todos} />
        </TabsContent>

        <TabsContent value="guests" className="p-6">
          <GuestProfileManager />
        </TabsContent>

        <TabsContent value="qrcodes" className="p-6">
          <QRCodeManager />
        </TabsContent>
      </Tabs>
    </Card>
  );
}