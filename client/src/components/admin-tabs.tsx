import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { crossTabSync } from "@/lib/crossTabSync";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InquiriesTab } from "@/components/InquiriesTab";
import { MaintenanceTab } from "@/components/MaintenanceTab";
import { PaymentsTab } from "@/components/PaymentsTab";
import { ContactsTab } from "@/components/ContactsTab";
import { CalendarTab } from "@/components/CalendarTab";
import { InventoryTab } from "@/components/InventoryTab";
import { ReceiptsTab } from "@/components/ReceiptsTab";
import { TodosTab } from "@/components/TodosTab";

import { SettingsTab } from "@/components/SettingsTab";
import { BuildingTab } from "@/components/BuildingTab";
import { PaymentTrackerTab } from "@/components/PaymentTrackerTab";
import { QuickAccessTab } from "@/components/QuickAccessTab";
import { FinancialReportsTab } from "@/components/FinancialReportsTab";
import { ExpensesTab } from "@/components/ExpensesTab";
import { PaymentHistoryTab } from "@/components/PaymentHistoryTab";
import { ReceiptEditorTab } from "@/components/ReceiptEditorTab";
import BiometricAuthSettings from "@/components/BiometricAuthSettings";
import { RoomsManagementTab } from "@/components/RoomsManagementTab";

interface AdminTabsProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function AdminTabs({ activeTab = "934", setActiveTab }: AdminTabsProps) {
  const [selectedTab, setSelectedTab] = useState(activeTab);
  const [roomsFilter, setRoomsFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');

  useEffect(() => {
    setSelectedTab(activeTab);
  }, [activeTab]);

  // Setup cross-tab communication on mount
  useEffect(() => {
    const unsubscribers = [
      crossTabSync.subscribe('payment-updated', () => {
        // Data will be automatically invalidated by crossTabSync
      }),
      crossTabSync.subscribe('expense-updated', () => {
        // Data will be automatically invalidated by crossTabSync
      }),
      crossTabSync.subscribe('receipt-updated', () => {
        // Data will be automatically invalidated by crossTabSync
      }),
      crossTabSync.subscribe('maintenance-updated', () => {
        // Data will be automatically invalidated by crossTabSync
      }),
      crossTabSync.subscribe('inquiry-updated', () => {
        // Data will be automatically invalidated by crossTabSync
      }),
      crossTabSync.subscribe('guest-updated', () => {
        // Data will be automatically invalidated by crossTabSync
      }),
      crossTabSync.subscribe('room-updated', () => {
        // Data will be automatically invalidated by crossTabSync
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const isAdminAuthenticated = localStorage.getItem('admin-authenticated') === 'true';

  // Fetch data for each tab
  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
    enabled: isAdminAuthenticated,
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance-requests"],
    enabled: isAdminAuthenticated,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
    enabled: isAdminAuthenticated,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
    enabled: isAdminAuthenticated,
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["/api/calendar"],
    enabled: isAdminAuthenticated,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/admin/contacts"],
    enabled: isAdminAuthenticated,
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/admin/inventory"],
    enabled: isAdminAuthenticated,
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ["/api/admin/receipts"],
    enabled: isAdminAuthenticated,
  });

  const { data: todos = [] } = useQuery({
    queryKey: ["/api/admin/todos"],
    enabled: isAdminAuthenticated,
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["/api/buildings"],
    enabled: isAdminAuthenticated,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
    enabled: isAdminAuthenticated,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["/api/admin/guests"],
    enabled: isAdminAuthenticated,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/admin/notifications"],
    enabled: isAdminAuthenticated,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/admin/expenses"],
    enabled: isAdminAuthenticated,
  });

  // Create shared data context for cross-tab communication
  const sharedData = {
    inquiries,
    maintenanceRequests,
    payments,
    announcements,
    calendarEvents,
    contacts,
    inventory,
    receipts,
    todos,
    buildings,
    rooms,
    guests,
    notifications,
    expenses,
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-900 flex items-center space-x-2">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            <span>Admin Access Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-800">Please log in as admin to access the management dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full">
        {selectedTab === "quick-access" && (
          <QuickAccessTab
            buildings={Array.isArray(buildings) ? buildings : []}
            rooms={Array.isArray(rooms) ? rooms : []}
            guests={Array.isArray(guests) ? guests : []}
            inquiries={Array.isArray(inquiries) ? inquiries : []}
            maintenanceRequests={Array.isArray(maintenanceRequests) ? maintenanceRequests : []}
            onNavigateToRooms={(filter) => {
              setRoomsFilter(filter || 'all');
              handleTabChange('rooms-management');
            }}
          />
        )}

        {selectedTab === "rooms-management" && (
          <RoomsManagementTab
            buildings={Array.isArray(buildings) ? buildings : []}
            rooms={Array.isArray(rooms) ? rooms : []}
            guests={Array.isArray(guests) ? guests : []}
            filter={roomsFilter}
            onBack={() => handleTabChange('quick-access')}
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
          <PaymentTrackerTab />
        )}

        {selectedTab === "maintenance" && (
          <MaintenanceTab requests={Array.isArray(maintenanceRequests) ? maintenanceRequests : []} />
        )}
        
        {selectedTab === "inquiries" && (
          <InquiriesTab inquiries={Array.isArray(inquiries) ? inquiries : []} />
        )}
        
        {selectedTab === "payments" && (
          <PaymentsTab payments={Array.isArray(payments) ? payments : []} />
        )}

        {selectedTab === "expenses" && (
          <ExpensesTab receipts={Array.isArray(receipts) ? receipts : []} />
        )}

        {selectedTab === "payment-history" && (
          <PaymentHistoryTab payments={Array.isArray(payments) ? payments : []} />
        )}

        {selectedTab === "receipt-editor" && (
          <ReceiptEditorTab receipts={Array.isArray(receipts) ? receipts : []} />
        )}

        {selectedTab === "financial-reports" && (
          <FinancialReportsTab 
            payments={Array.isArray(payments) ? payments : []}
            receipts={Array.isArray(receipts) ? receipts : []}
            buildings={Array.isArray(buildings) ? buildings : []}
          />
        )}
        
        {selectedTab === "calendar" && (
          <CalendarTab events={Array.isArray(calendarEvents) ? calendarEvents : []} />
        )}
        
        {selectedTab === "contacts" && (
          <ContactsTab contacts={Array.isArray(contacts) ? contacts : []} />
        )}
        
        {selectedTab === "inventory" && (
          <InventoryTab items={Array.isArray(inventory) ? inventory : []} />
        )}
        
        {selectedTab === "receipts" && (
          <ReceiptsTab receipts={Array.isArray(receipts) ? receipts : []} />
        )}
        
        {selectedTab === "todos" && (
          <TodosTab todos={Array.isArray(todos) ? todos : []} />
        )}

        {selectedTab === "public-page-editor" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Public Page Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage your public website content, contact information, and display settings.
                </p>
                <ContactsTab contacts={Array.isArray(contacts) ? contacts : []} />
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "admin-dashboard" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Administrative Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Access administrative controls and system settings.
                </p>
                <SettingsTab />
              </CardContent>
            </Card>
          </div>
        )}
        
        {selectedTab === "settings" && (
          <div className="space-y-6">
            <SettingsTab />
            <BiometricAuthSettings />
          </div>
        )}

        {selectedTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Manage your account security and authentication methods.
                </p>
                <BiometricAuthSettings />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}