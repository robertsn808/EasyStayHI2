import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, Building, Home, Users, DollarSign, Wrench, MessageSquare, 
  Calendar, Megaphone, Contact, Package, Receipt, Settings, Bell,
  ChevronDown, ChevronRight, Activity, BarChart3, FileText, ClipboardList
} from "lucide-react";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  rooms?: any[];
  guests?: any[];
  inquiries?: any[];
  maintenanceRequests?: any[];
  payments?: any[];
  announcements?: any[];
  calendarEvents?: any[];
  contacts?: any[];
  inventory?: any[];
  receipts?: any[];
  todos?: any[];
}

export default function MobileNavigation({
  activeTab,
  setActiveTab,
  rooms = [],
  guests = [],
  inquiries = [],
  maintenanceRequests = [],
  payments = [],
  announcements = [],
  calendarEvents = [],
  contacts = [],
  inventory = [],
  receipts = [],
  todos = []
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buildingsExpanded, setBuildingsExpanded] = useState(true);
  const [operationsExpanded, setOperationsExpanded] = useState(false);
  const [managementExpanded, setManagementExpanded] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);

  const buildingStats = {
    building934: Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 10).length : 0,
    building949: Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 11).length : 0
  };

  const navigationSections = [
    {
      title: "Properties",
      expanded: buildingsExpanded,
      setExpanded: setBuildingsExpanded,
      icon: Building,
      items: [
        {
          id: "quick-access",
          label: "Dashboard Overview",
          icon: Home,
          badge: null,
          color: "slate"
        },
        {
          id: "934",
          label: "934 Kapahulu Ave",
          icon: Building,
          badge: buildingStats.building934,
          color: "blue"
        },
        {
          id: "949",
          label: "949 Kawaiahao St",
          icon: Building,
          badge: buildingStats.building949,
          color: "purple"
        }
      ]
    },
    {
      title: "Operations",
      expanded: operationsExpanded,
      setExpanded: setOperationsExpanded,
      icon: Activity,
      items: [
        {
          id: "payment-tracker",
          label: "Payment Tracker",
          icon: DollarSign,
          badge: Array.isArray(payments) ? payments.length : 0,
          color: "emerald"
        },
        {
          id: "maintenance",
          label: "Maintenance",
          icon: Wrench,
          badge: Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0,
          color: "orange"
        },
        {
          id: "inquiries",
          label: "Inquiries",
          icon: MessageSquare,
          badge: Array.isArray(inquiries) ? inquiries.length : 0,
          color: "cyan"
        },
        {
          id: "calendar",
          label: "Calendar",
          icon: Calendar,
          badge: Array.isArray(calendarEvents) ? calendarEvents.length : 0,
          color: "indigo"
        }
      ]
    },
    {
      title: "Management",
      expanded: managementExpanded,
      setExpanded: setManagementExpanded,
      icon: ClipboardList,
      items: [
        {
          id: "announcements",
          label: "Announcements",
          icon: Megaphone,
          badge: Array.isArray(announcements) ? announcements.length : 0,
          color: "pink"
        },
        {
          id: "contacts",
          label: "Contacts",
          icon: Contact,
          badge: Array.isArray(contacts) ? contacts.length : 0,
          color: "teal"
        },
        {
          id: "inventory",
          label: "Inventory",
          icon: Package,
          badge: Array.isArray(inventory) ? inventory.length : 0,
          color: "amber"
        },
        {
          id: "todos",
          label: "Tasks & TODOs",
          icon: ClipboardList,
          badge: Array.isArray(todos) ? todos.filter((t: any) => !t.completed).length : 0,
          color: "violet"
        }
      ]
    },
    {
      title: "Reports & Finance",
      expanded: reportsExpanded,
      setExpanded: setReportsExpanded,
      icon: BarChart3,
      items: [
        {
          id: "receipts",
          label: "Receipts",
          icon: Receipt,
          badge: Array.isArray(receipts) ? receipts.length : 0,
          color: "green"
        },
        {
          id: "payments",
          label: "Payment History",
          icon: FileText,
          badge: null,
          color: "slate"
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      slate: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
      blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
      purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
      orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
      cyan: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300" },
      pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
      teal: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300" },
      amber: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
      violet: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-300" },
      green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" }
    };
    return colorMap[color] || colorMap.slate;
  };

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm shadow-sm">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-white/95 backdrop-blur-lg">
          <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-lg font-bold text-gray-800">Navigation</h2>
              <p className="text-sm text-gray-600">EasyStay HI Property Management</p>
            </div>

            {/* Navigation Sections */}
            <div className="p-4 space-y-3">
              {navigationSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <Collapsible open={section.expanded} onOpenChange={section.setExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-sm font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <section.icon className="h-4 w-4" />
                          {section.title}
                        </div>
                        {section.expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-2">
                      {section.items.map((item) => {
                        const colors = getColorClasses(item.color);
                        const isActive = activeTab === item.id;
                        
                        return (
                          <Button
                            key={item.id}
                            variant="ghost"
                            className={`w-full justify-start text-sm h-10 ${
                              isActive 
                                ? `${colors.bg} ${colors.text} ${colors.border} border-l-4 shadow-sm` 
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsOpen(false);
                            }}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.badge !== null && item.badge > 0 && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs h-5 px-1.5 bg-gray-200 text-gray-700"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}

              {/* Settings Section */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm h-10 ${
                    activeTab === "settings" 
                      ? "bg-gray-100 text-gray-700 border-l-4 border-gray-300 shadow-sm" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setActiveTab("settings");
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-700">
                          {Array.isArray(rooms) ? rooms.length : 0}
                        </p>
                        <p className="text-xs text-blue-600">Total Rooms</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="p-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-700">
                          {Array.isArray(guests) ? guests.length : 0}
                        </p>
                        <p className="text-xs text-emerald-600">Active Guests</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}