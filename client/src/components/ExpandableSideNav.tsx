import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, X, Building, Home, Users, DollarSign, Wrench, MessageSquare, 
  Calendar, Megaphone, Contact, Package, Receipt, Settings, Bell,
  ChevronDown, ChevronRight, Activity, BarChart3, FileText, ClipboardList,
  Search, Filter, TrendingUp, MapPin, Clock, AlertCircle
} from "lucide-react";

interface ExpandableSideNavProps {
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

export default function ExpandableSideNav({
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
}: ExpandableSideNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [propertiesExpanded, setPropertiesExpanded] = useState(true);
  const [operationsExpanded, setOperationsExpanded] = useState(false);
  const [managementExpanded, setManagementExpanded] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle smooth collapse/expand transitions
  const handleCollapseToggle = () => {
    setIsTransitioning(true);
    setIsCollapsed(!isCollapsed);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Auto-close on desktop when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buildingStats = {
    building934: Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 10).length : 0,
    building949: Array.isArray(rooms) ? rooms.filter((r: any) => r.buildingId === 11).length : 0,
    occupiedRooms: Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'occupied').length : 0,
    availableRooms: Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'available').length : 0,
    maintenanceRooms: Array.isArray(rooms) ? rooms.filter((r: any) => r.status === 'maintenance').length : 0
  };

  const urgentItems = {
    urgentMaintenance: Array.isArray(maintenanceRequests) ? maintenanceRequests.filter((m: any) => m.priority === 'urgent').length : 0,
    pendingInquiries: Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0,
    incompleteTodos: Array.isArray(todos) ? todos.filter((t: any) => !t.completed).length : 0
  };

  interface NavigationItem {
    id: string;
    label: string;
    icon: any;
    badge: number | null;
    color: string;
    description: string;
    urgent?: boolean;
  }

  const navigationSections = [
    {
      title: "Dashboard",
      expanded: propertiesExpanded,
      setExpanded: setPropertiesExpanded,
      icon: Home,
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: Home,
          badge: null,
          color: "green",
          description: "Main dashboard overview",
          urgent: false
        },
        {
          id: "inbox",
          label: "Inbox",
          icon: MessageSquare,
          badge: Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0,
          color: "green",
          description: "Customer inquiries and communications",
          urgent: false
        },
        {
          id: "calendar",
          label: "Calendar",
          icon: Calendar,
          badge: Array.isArray(calendarEvents) ? calendarEvents.length : 0,
          color: "green",
          description: "Schedule and events management",
          urgent: false
        }
      ] as NavigationItem[]
    },
    {
      title: "Properties",
      expanded: operationsExpanded,
      setExpanded: setOperationsExpanded,
      icon: Building,
      items: [
        {
          id: "934",
          label: "934 Kapahulu Ave",
          icon: Building,
          badge: buildingStats.building934,
          color: "blue",
          description: "8 rooms • $100/$500/$2000 pricing",
          urgent: false
        },
        {
          id: "949",
          label: "949 Kawaiahao St",
          icon: Building,
          badge: buildingStats.building949,
          color: "purple",
          description: "10 suites • $50/$200/$600 pricing",
          urgent: false
        }
      ] as NavigationItem[]
    },
    {
      title: "Operations",
      expanded: managementExpanded,
      setExpanded: setManagementExpanded,
      icon: Activity,
      items: [
        {
          id: "payment-tracker",
          label: "Payment Tracker",
          icon: DollarSign,
          badge: Array.isArray(payments) ? payments.length : 0,
          color: "emerald",
          description: "Track payments and financial status",
          urgent: false
        },
        {
          id: "maintenance",
          label: "Maintenance",
          icon: Wrench,
          badge: Array.isArray(maintenanceRequests) ? maintenanceRequests.length : 0,
          color: "orange",
          description: "Manage maintenance requests and repairs",
          urgent: urgentItems.urgentMaintenance > 0
        },
        {
          id: "announcement",
          label: "Announcements",
          icon: Megaphone,
          badge: Array.isArray(announcements) ? announcements.length : 0,
          color: "pink",
          description: "System-wide announcements and notices",
          urgent: false
        },
        {
          id: "inquiries",
          label: "Inquiries",
          icon: MessageSquare,
          badge: Array.isArray(inquiries) ? inquiries.length : 0,
          color: "cyan",
          description: "Customer inquiries and communications",
          urgent: false
        }
      ] as NavigationItem[]
    },
    {
      title: "Management",
      expanded: reportsExpanded,
      setExpanded: setReportsExpanded,
      icon: ClipboardList,
      items: [
        {
          id: "contacts",
          label: "Contact Directory",
          icon: Contact,
          badge: Array.isArray(contacts) ? contacts.length : 0,
          color: "teal",
          description: "Manage public contact information",
          urgent: false
        },
        {
          id: "inventory",
          label: "Inventory",
          icon: Package,
          badge: Array.isArray(inventory) ? inventory.length : 0,
          color: "amber",
          description: "Supplies and equipment tracking",
          urgent: false
        },
        {
          id: "todos",
          label: "Tasks & TODOs",
          icon: ClipboardList,
          badge: urgentItems.incompleteTodos,
          color: "violet",
          description: "Task management and workflow",
          urgent: urgentItems.incompleteTodos > 0
        },
        {
          id: "public-page-editor",
          label: "Public Page Editor",
          icon: Settings,
          badge: null,
          color: "slate",
          description: "Edit public website content",
          urgent: false
        },
        {
          id: "admin-dashboard",
          label: "Admin Dashboard",
          icon: Settings,
          badge: null,
          color: "slate",
          description: "Administrative controls",
          urgent: false
        }
      ] as NavigationItem[]
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
          color: "green",
          description: "Financial receipts and documentation",
          urgent: false
        },
        {
          id: "receipt-editor",
          label: "Receipt Editor",
          icon: FileText,
          badge: null,
          color: "emerald",
          description: "Advanced receipt editing and management",
          urgent: false
        },
        {
          id: "expenses",
          label: "Expenses",
          icon: DollarSign,
          badge: Array.isArray(receipts) ? receipts.length : 0,
          color: "red",
          description: "Expense tracking and management",
          urgent: false
        },
        {
          id: "payment-history",
          label: "Payment History",
          icon: FileText,
          badge: null,
          color: "slate",
          description: "Complete payment transaction history",
          urgent: false
        },
        {
          id: "financial-reports",
          label: "Financial Reports",
          icon: TrendingUp,
          badge: null,
          color: "blue",
          description: "P&L statements and revenue analysis",
          urgent: false
        }
      ] as NavigationItem[]
    }
  ];

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colorMap: Record<string, { 
      bg: string; 
      text: string; 
      border: string; 
      activeBg: string; 
      activeText: string;
      icon: string;
    }> = {
      slate: { 
        bg: "bg-slate-50", 
        text: "text-slate-700", 
        border: "border-slate-300",
        activeBg: "bg-slate-100",
        activeText: "text-slate-900",
        icon: "text-slate-500"
      },
      blue: { 
        bg: "bg-blue-50", 
        text: "text-blue-700", 
        border: "border-blue-300",
        activeBg: "bg-blue-100",
        activeText: "text-blue-900",
        icon: "text-blue-500"
      },
      purple: { 
        bg: "bg-purple-50", 
        text: "text-purple-700", 
        border: "border-purple-300",
        activeBg: "bg-purple-100",
        activeText: "text-purple-900",
        icon: "text-purple-500"
      },
      emerald: { 
        bg: "bg-emerald-50", 
        text: "text-emerald-700", 
        border: "border-emerald-300",
        activeBg: "bg-emerald-100",
        activeText: "text-emerald-900",
        icon: "text-emerald-500"
      },
      orange: { 
        bg: "bg-orange-50", 
        text: "text-orange-700", 
        border: "border-orange-300",
        activeBg: "bg-orange-100",
        activeText: "text-orange-900",
        icon: "text-orange-500"
      },
      cyan: { 
        bg: "bg-cyan-50", 
        text: "text-cyan-700", 
        border: "border-cyan-300",
        activeBg: "bg-cyan-100",
        activeText: "text-cyan-900",
        icon: "text-cyan-500"
      },
      indigo: { 
        bg: "bg-indigo-50", 
        text: "text-indigo-700", 
        border: "border-indigo-300",
        activeBg: "bg-indigo-100",
        activeText: "text-indigo-900",
        icon: "text-indigo-500"
      },
      pink: { 
        bg: "bg-pink-50", 
        text: "text-pink-700", 
        border: "border-pink-300",
        activeBg: "bg-pink-100",
        activeText: "text-pink-900",
        icon: "text-pink-500"
      },
      teal: { 
        bg: "bg-teal-50", 
        text: "text-teal-700", 
        border: "border-teal-300",
        activeBg: "bg-teal-100",
        activeText: "text-teal-900",
        icon: "text-teal-500"
      },
      amber: { 
        bg: "bg-amber-50", 
        text: "text-amber-700", 
        border: "border-amber-300",
        activeBg: "bg-amber-100",
        activeText: "text-amber-900",
        icon: "text-amber-500"
      },
      violet: { 
        bg: "bg-violet-50", 
        text: "text-violet-700", 
        border: "border-violet-300",
        activeBg: "bg-violet-100",
        activeText: "text-violet-900",
        icon: "text-violet-500"
      },
      green: { 
        bg: "bg-green-50", 
        text: "text-green-700", 
        border: "border-green-300",
        activeBg: "bg-green-100",
        activeText: "text-green-900",
        icon: "text-green-500"
      }
    };
    
    const colors = colorMap[color] || colorMap.slate;
    return isActive ? { ...colors, bg: colors.activeBg, text: colors.activeText } : colors;
  };

  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      searchQuery === "" || 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="lg:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Expandable Side Navigation */}
      <div className={`
        fixed top-0 left-0 h-full bg-white/95 backdrop-blur-lg border-r border-gray-200 shadow-xl z-50 
        transition-all duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : isExpanded ? 'w-80' : 'w-64'}
        ${isTransitioning ? 'overflow-hidden' : ''}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="h-4 w-4 text-white" />
              </div>
              <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                <h2 className="text-sm font-bold text-gray-800 whitespace-nowrap">EasyStay HI</h2>
                <p className="text-xs text-gray-600 whitespace-nowrap">Property Management</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseToggle}
                className="h-8 w-8 p-0"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Collapse Toggle for Collapsed State */}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseToggle}
                className="absolute top-4 right-2 h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className={`transition-all duration-300 border-b border-gray-200 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {!isCollapsed ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Search"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-700">{buildingStats.building934 + buildingStats.building949}</p>
                <p className="text-xs text-blue-600">Total Rooms</p>
              </div>
              <div className="text-center p-2 bg-emerald-50 rounded-lg">
                <p className="text-xs font-semibold text-emerald-700">{buildingStats.occupiedRooms}</p>
                <p className="text-xs text-emerald-600">Occupied</p>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <p className="text-xs font-semibold text-orange-700">{urgentItems.urgentMaintenance + urgentItems.pendingInquiries}</p>
                <p className="text-xs text-orange-600">Urgent</p>
              </div>
            </div>
          </div>

          {/* Navigation Content */}
          <ScrollArea className="flex-1">
            <div className={`transition-all duration-300 space-y-3 ${isCollapsed ? 'p-1' : 'p-4'}`}>
              {filteredSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  {!isCollapsed ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-sm font-semibold text-gray-700 hover:bg-gray-100 h-8"
                      onClick={() => section.setExpanded(!section.expanded)}
                    >
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4" />
                        {section.title}
                      </div>
                      {section.expanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  ) : (
                    <div className="flex justify-center py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => section.setExpanded(!section.expanded)}
                        title={section.title}
                      >
                        <section.icon className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  )}
                  
                  {(section.expanded || isCollapsed) && (
                    <div className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'pl-0' : 'pl-2'}`}>
                      {section.items.map((item) => {
                        const isActive = activeTab === item.id;
                        const colors = getColorClasses(item.color, isActive);
                        
                        return (
                          <div
                            key={item.id}
                            className={`
                              group cursor-pointer rounded-lg border transition-all duration-200 relative
                              ${isCollapsed ? 'p-2 mx-1' : 'p-3'}
                              ${isActive 
                                ? `${colors.bg} ${colors.border} ${!isCollapsed ? 'border-l-4' : ''} shadow-sm` 
                                : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                              }
                            `}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsOpen(false);
                            }}
                            title={isCollapsed ? item.label : undefined}
                          >
                            {isCollapsed ? (
                              // Collapsed view - icon only with badge
                              <div className="flex justify-center relative">
                                <div className={`
                                  p-1.5 rounded-md transition-all duration-200
                                  ${isActive ? colors.bg : 'bg-gray-100 group-hover:bg-gray-200'}
                                `}>
                                  <item.icon className={`h-4 w-4 ${isActive ? colors.icon : 'text-gray-500'}`} />
                                </div>
                                {item.badge !== null && item.badge > 0 && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">
                                      {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                  </div>
                                )}
                                {item.urgent && (
                                  <AlertCircle className="absolute -bottom-1 -left-1 h-3 w-3 text-red-500" />
                                )}
                              </div>
                            ) : (
                              // Expanded view - full layout
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`
                                    p-1.5 rounded-md
                                    ${isActive ? colors.bg : 'bg-gray-100 group-hover:bg-gray-200'}
                                  `}>
                                    <item.icon className={`h-4 w-4 ${isActive ? colors.icon : 'text-gray-500'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className={`text-sm font-medium truncate ${isActive ? colors.text : 'text-gray-700'}`}>
                                        {item.label}
                                      </p>
                                      {item.urgent && (
                                        <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                      )}
                                    </div>
                                    {isExpanded && (
                                      <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {item.badge !== null && item.badge > 0 && (
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs h-5 px-1.5 ${
                                      item.urgent 
                                        ? 'bg-red-100 text-red-700 border-red-200' 
                                        : 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <Separator />

              {/* Settings */}
              <div
                className={`
                  group cursor-pointer p-3 rounded-lg border transition-all duration-200
                  ${activeTab === "settings" 
                    ? "bg-gray-100 border-gray-300 border-l-4 shadow-sm" 
                    : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                  }
                `}
                onClick={() => {
                  setActiveTab("settings");
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-1.5 rounded-md
                    ${activeTab === "settings" ? 'bg-gray-200' : 'bg-gray-100 group-hover:bg-gray-200'}
                  `}>
                    <Settings className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Settings</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}