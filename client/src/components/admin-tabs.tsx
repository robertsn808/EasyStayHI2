import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { BuildingTab } from "@/components/BuildingTab";
import { PaymentTrackerTab } from "@/components/PaymentTrackerTab";
import { QuickAccessTab } from "@/components/QuickAccessTab";

interface AdminTabsProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function AdminTabs({ activeTab = "934", setActiveTab }: AdminTabsProps) {
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
    queryKey: ["/api/admin/maintenance-requests"],
    enabled: isAdminAuthenticated,
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/admin/payments"],
    enabled: isAdminAuthenticated,
  });

  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements"],
    enabled: isAdminAuthenticated,
  });

  const { data: calendarEvents } = useQuery({
    queryKey: ["/api/admin/calendar-events"],
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

  const { data: buildings } = useQuery({
    queryKey: ["/api/buildings"],
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
      <Card className="w-full">
        <div className="p-6">
          {selectedTab === "quick-access" && (
            <QuickAccessTab
              buildings={Array.isArray(buildings) ? buildings : []}
              rooms={Array.isArray(rooms) ? rooms : []}
              guests={Array.isArray(guests) ? guests : []}
              inquiries={Array.isArray(inquiries) ? inquiries : []}
              maintenanceRequests={Array.isArray(maintenanceRequests) ? maintenanceRequests : []}
            />
          )}

          {selectedTab === "934" && (
            <BuildingTab
              buildingName="934 Kapahulu Ave"
              buildingId={10}
              rooms={Array.isArray(rooms) ? rooms : []}
              guests={Array.isArray(guests) ? guests : []}
              inquiriesCount={Array.isArray(inquiries) ? inquiries.filter((i: any) => 
                i.message?.toLowerCase().includes('934') || 
                i.message?.toLowerCase().includes('kapahulu') || 
                (!i.message?.toLowerCase().includes('949') && !i.message?.toLowerCase().includes('kawaiahao'))
              ).length : 0}
              color="blue"
            />
          )}
          
          {selectedTab === "949" && (
            <BuildingTab
              buildingName="949 Kawaiahao St"
              buildingId={11}
              rooms={Array.isArray(rooms) ? rooms : []}
              guests={Array.isArray(guests) ? guests : []}
              inquiriesCount={Array.isArray(inquiries) ? inquiries.filter((i: any) => 
                i.message?.toLowerCase().includes('949') || 
                i.message?.toLowerCase().includes('kawaiahao')
              ).length : 0}
              color="purple"
            />
          )}

          {selectedTab === "payment-tracker" && (
            <PaymentTrackerTab
              payments={Array.isArray(payments) ? payments : []}
              rooms={Array.isArray(rooms) ? rooms : []}
              guests={Array.isArray(guests) ? guests : []}
            />
          )}

          {selectedTab === "maintenance" && <MaintenanceTab maintenanceRequests={maintenanceRequests} />}
          {selectedTab === "inquiries" && <InquiriesTab inquiries={inquiries} />}
          {selectedTab === "payments" && <PaymentsTab payments={payments} />}
          {selectedTab === "announcements" && <AnnouncementsTab announcements={announcements} />}
          {selectedTab === "calendar" && <CalendarTab events={calendarEvents} />}
          {selectedTab === "contacts" && <ContactsTab contacts={contacts} />}
          {selectedTab === "inventory" && <InventoryTab inventory={inventory} />}
          {selectedTab === "receipts" && <ReceiptsTab receipts={receipts} />}
          {selectedTab === "todos" && <TodosTab todos={todos} />}
          {selectedTab === "settings" && <SettingsTab />}
        </div>
      </Card>
    </div>
  );
}