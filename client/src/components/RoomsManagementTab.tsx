import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Home, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Clock,
  ArrowLeft,
  Key,
  Banknote,
  Sparkles,
  CalendarDays,
  ClockIcon,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RoomsManagementTabProps {
  buildings?: any[];
  rooms?: any[];
  guests?: any[];
  onBack?: () => void;
  filter?: 'all' | 'available' | 'occupied' | 'maintenance';
}

export function RoomsManagementTab({ 
  buildings = [], 
  rooms = [], 
  guests = [], 
  onBack,
  filter = 'all'
}: RoomsManagementTabProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState(filter);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  // Fetch payments data for financial information
  const { data: payments = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  // Group rooms by building and status
  const groupedRooms = useMemo(() => {
    let filteredRooms = rooms;

    // Filter by building
    if (selectedBuilding !== "all") {
      filteredRooms = filteredRooms.filter(room => room.buildingId.toString() === selectedBuilding);
    }

    // Filter by status
    if (activeFilter !== "all") {
      filteredRooms = filteredRooms.filter(room => {
        if (activeFilter === "maintenance") {
          return room.status === "maintenance" || room.status === "cleaning";
        }
        return room.status === activeFilter;
      });
    }

    // Group by building
    const grouped = filteredRooms.reduce((acc, room) => {
      const building = buildings.find(b => b.id === room.buildingId);
      const buildingName = building ? building.name : `Building ${room.buildingId}`;
      
      if (!acc[buildingName]) {
        acc[buildingName] = [];
      }
      acc[buildingName].push(room);
      return acc;
    }, {} as Record<string, any[]>);

    return grouped;
  }, [rooms, buildings, selectedBuilding, activeFilter]);

  // Helper function to determine room stage and status
  const getRoomStage = (room: any, roomGuests: any[]) => {
    const now = new Date();
    
    if (room.status === 'available') {
      return {
        stage: 'ready',
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        label: 'Ready for booking',
        urgent: false
      };
    }
    
    if (room.status === 'occupied' && roomGuests.length > 0) {
      const guest = roomGuests[0];
      const checkOutDate = guest.checkOutDate ? new Date(guest.checkOutDate) : null;
      
      if (checkOutDate) {
        const hoursUntilCheckout = checkOutDate ? (checkOutDate.getTime() - now.getTime()) / (1000 * 60 * 60) : 0;
        
        if (hoursUntilCheckout <= 0) {
          // Past checkout time - needs cleaning
          return {
            stage: 'needs_cleaning',
            icon: Sparkles,
            color: 'text-orange-500',
            bgColor: 'bg-orange-100',
            label: 'Needs cleaning',
            urgent: true,
            checkoutTime: checkOutDate
          };
        } else {
          // Still occupied
          return {
            stage: 'occupied',
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100',
            label: 'Occupied',
            urgent: false,
            checkoutTime: checkOutDate,
            hoursUntilCheckout
          };
        }
      }
    }
    
    if (room.status === 'cleaning') {
      return {
        stage: 'cleaning',
        icon: Sparkles,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100',
        label: 'Being cleaned',
        urgent: false
      };
    }
    
    if (room.status === 'maintenance') {
      return {
        stage: 'maintenance',
        icon: Wrench,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        label: 'Under maintenance',
        urgent: false
      };
    }
    
    return {
      stage: 'unknown',
      icon: AlertTriangle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      label: 'Unknown status',
      urgent: false
    };
  };

  // Get room details with guest and payment information
  const getRoomDetails = (room: any) => {
    const roomGuests = guests.filter((guest: any) => guest.roomId === room.id);
    const roomPayments = Array.isArray(payments) ? payments.filter((payment: any) => payment.payment?.roomId === room.id) : [];
    const stage = getRoomStage(room, roomGuests);
    
    return {
      ...room,
      guests: roomGuests,
      payments: roomPayments,
      stage,
      totalBalance: roomPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.payment?.amount || '0')), 0),
      hasUnpaidBalance: roomPayments.some((p: any) => p.payment?.status === 'pending')
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-200";
      case "occupied": return "bg-blue-100 text-blue-800 border-blue-200";
      case "maintenance": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cleaning": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="h-4 w-4" />;
      case "occupied": return <Users className="h-4 w-4" />;
      case "maintenance": return <Wrench className="h-4 w-4" />;
      case "cleaning": return <AlertCircle className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const totalRooms = Object.values(groupedRooms).flat().length;

  // Generate todo list based on room statuses
  const getTodoList = () => {
    const todos: any[] = [];
    const allRooms = Object.values(groupedRooms).flat();
    
    allRooms.forEach((room: any) => {
      const roomDetails = getRoomDetails(room);
      
      if (roomDetails.stage.urgent) {
        todos.push({
          id: `room-${room.id}`,
          type: 'urgent',
          icon: roomDetails.stage.icon,
          color: roomDetails.stage.color,
          bgColor: roomDetails.stage.bgColor,
          title: `Room ${room.number} - ${roomDetails.stage.label}`,
          description: roomDetails.stage.checkoutTime 
            ? `Guest checkout was due: ${roomDetails.stage.checkoutTime.toLocaleString()}`
            : 'Requires immediate attention',
          building: buildings.find(b => b.id === room.buildingId)?.name || 'Unknown Building'
        });
      }
      
      if (roomDetails.stage.stage === 'occupied' && roomDetails.stage.hoursUntilCheckout && roomDetails.stage.hoursUntilCheckout <= 6) {
        todos.push({
          id: `checkout-${room.id}`,
          type: 'reminder',
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          title: `Room ${room.number} - Checkout Soon`,
          description: `Guest checking out in ${Math.round(roomDetails.stage.hoursUntilCheckout)} hours`,
          building: buildings.find(b => b.id === room.buildingId)?.name || 'Unknown Building'
        });
      }
      
      if (roomDetails.hasUnpaidBalance) {
        todos.push({
          id: `payment-${room.id}`,
          type: 'payment',
          icon: DollarSign,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          title: `Room ${room.number} - Outstanding Payment`,
          description: `Unpaid balance: $${roomDetails.totalBalance.toFixed(2)}`,
          building: buildings.find(b => b.id === room.buildingId)?.name || 'Unknown Building'
        });
      }
    });
    
    return todos.sort((a, b) => {
      const priority: Record<string, number> = { urgent: 3, payment: 2, reminder: 1 };
      return (priority[b.type] || 0) - (priority[a.type] || 0);
    });
  };

  const todoList = getTodoList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600">
              {totalRooms} {activeFilter === 'all' ? 'total' : activeFilter} rooms
              {selectedBuilding !== "all" && ` in ${buildings.find(b => b.id.toString() === selectedBuilding)?.name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Buildings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {buildings.map((building) => (
                <SelectItem key={building.id} value={building.id.toString()}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Todo List - Action Items */}
      {todoList.length > 0 && (
        <Card className="border-l-4 border-l-orange-400">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Action Items</span>
              <Badge variant="destructive">{todoList.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todoList.map((todo) => (
                <div 
                  key={todo.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    todo.type === 'urgent' ? 'border-red-200 bg-red-50' : 
                    todo.type === 'payment' ? 'border-orange-200 bg-orange-50' : 
                    'border-yellow-200 bg-yellow-50'
                  } ${todo.type === 'urgent' ? 'animate-pulse' : ''}`}
                >
                  <div className={`p-2 rounded-full ${todo.bgColor}`}>
                    <todo.icon className={`h-4 w-4 ${todo.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${todo.color}`}>{todo.title}</h4>
                    <p className="text-sm text-gray-600">{todo.description}</p>
                    <p className="text-xs text-gray-500">{todo.building}</p>
                  </div>
                  {todo.type === 'urgent' && (
                    <Badge variant="destructive" className="animate-pulse">
                      Urgent
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Room List */}
      <div className="space-y-6">
        {Object.keys(groupedRooms).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600">
                No rooms match the current filters. Try adjusting your selection.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedRooms).map(([buildingName, buildingRooms]) => (
            <Card key={buildingName}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>{buildingName}</span>
                  <Badge variant="outline">{(buildingRooms as any[]).length} rooms</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(buildingRooms as any[]).map((room: any) => {
                    const roomDetails = getRoomDetails(room);
                    
                    return (
                      <Card key={room.id} className={`border-2 hover:shadow-md transition-shadow ${roomDetails.stage.urgent ? 'ring-2 ring-orange-300' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Key className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold">Room {room.number}</span>
                            </div>
                            <Badge className={`${getStatusColor(room.status)} border`}>
                              {getStatusIcon(room.status)}
                              <span className="ml-1 capitalize">{room.status}</span>
                            </Badge>
                          </div>
                          
                          {/* Status Indicator Icons */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex space-x-2">
                              <div className={`p-2 rounded-full ${roomDetails.stage.bgColor} ${roomDetails.stage.urgent ? 'animate-pulse' : ''}`}>
                                <roomDetails.stage.icon className={`h-4 w-4 ${roomDetails.stage.color}`} />
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-xs font-medium ${roomDetails.stage.color}`}>
                                  {roomDetails.stage.label}
                                </span>
                                {roomDetails.stage.checkoutTime && (
                                  <span className="text-xs text-gray-500">
                                    {roomDetails.stage.stage === 'occupied' ? 'Checkout: ' : 'Was due: '}
                                    {roomDetails.stage.checkoutTime.toLocaleString()}
                                  </span>
                                )}
                                {roomDetails.stage.hoursUntilCheckout !== undefined && roomDetails.stage.hoursUntilCheckout > 0 && (
                                  <span className="text-xs text-blue-600">
                                    {Math.round(roomDetails.stage.hoursUntilCheckout)}h remaining
                                  </span>
                                )}
                              </div>
                            </div>
                            {roomDetails.stage.urgent && (
                              <Badge variant="destructive" className="text-xs animate-pulse">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Room Basic Info */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Type:</span>
                              <span className="capitalize">{room.type || 'Standard'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rate:</span>
                              <span className="font-medium">${room.rate || 'N/A'}/night</span>
                            </div>
                          </div>

                          <Separator />

                          {/* Guest Information */}
                          {room.status === 'occupied' && roomDetails.guests.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3 text-blue-500" />
                                <span className="text-sm font-medium text-blue-800">Current Guests</span>
                              </div>
                              {roomDetails.guests.map((guest: any, index: number) => (
                                <div key={guest.id} className="bg-blue-50 p-2 rounded text-xs space-y-1">
                                  <div className="font-medium">{guest.guestName}</div>
                                  {guest.email && (
                                    <div className="flex items-center space-x-1 text-gray-600">
                                      <Mail className="h-3 w-3" />
                                      <span>{guest.email}</span>
                                    </div>
                                  )}
                                  {guest.phone && (
                                    <div className="flex items-center space-x-1 text-gray-600">
                                      <Phone className="h-3 w-3" />
                                      <span>{guest.phone}</span>
                                    </div>
                                  )}
                                  {guest.checkInDate && (
                                    <div className="flex items-center space-x-1 text-gray-600">
                                      <Calendar className="h-3 w-3" />
                                      <span>Check-in: {new Date(guest.checkInDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  {guest.checkOutDate && (
                                    <div className="flex items-center space-x-1 text-gray-600">
                                      <Calendar className="h-3 w-3" />
                                      <span>Check-out: {new Date(guest.checkOutDate).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : room.status === 'available' ? (
                            <div className="flex items-center justify-center py-4 text-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              <span className="text-sm">Ready for booking</span>
                            </div>
                          ) : room.status === 'maintenance' ? (
                            <div className="flex items-center justify-center py-4 text-yellow-600">
                              <Wrench className="h-4 w-4 mr-2" />
                              <span className="text-sm">Under maintenance</span>
                            </div>
                          ) : null}

                          {/* Payment Information */}
                          {room.status === 'occupied' && roomDetails.payments.length > 0 && (
                            <div className="space-y-2">
                              <Separator />
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3 text-green-500" />
                                <span className="text-sm font-medium text-green-800">Payment Status</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Total Amount:</span>
                                  <span className="font-medium">${roomDetails.totalBalance.toFixed(2)}</span>
                                </div>
                                {roomDetails.hasUnpaidBalance && (
                                  <div className="flex items-center space-x-1">
                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                    <span className="text-xs text-red-600">Outstanding balance</span>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {roomDetails.payments.slice(0, 2).map((payment: any, index: number) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className={`text-xs h-5 ${
                                        payment.payment?.status === 'completed' 
                                          ? 'bg-green-50 text-green-700 border-green-200' 
                                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                      }`}
                                    >
                                      <Banknote className="h-2 w-2 mr-1" />
                                      ${payment.payment?.amount}
                                    </Badge>
                                  ))}
                                  {roomDetails.payments.length > 2 && (
                                    <Badge variant="outline" className="text-xs h-5">
                                      +{roomDetails.payments.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-2 pt-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex-1">
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    <Key className="h-5 w-5" />
                                    <span>Room {room.number} Details</span>
                                    <Badge className={`${getStatusColor(room.status)} border ml-2`}>
                                      {getStatusIcon(room.status)}
                                      <span className="ml-1 capitalize">{room.status}</span>
                                    </Badge>
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  {/* Room Status Indicator */}
                                  <Card className={roomDetails.stage.urgent ? 'border-orange-300' : ''}>
                                    <CardContent className="p-4">
                                      <div className="flex items-center space-x-3">
                                        <div className={`p-3 rounded-full ${roomDetails.stage.bgColor} ${roomDetails.stage.urgent ? 'animate-pulse' : ''}`}>
                                          <roomDetails.stage.icon className={`h-6 w-6 ${roomDetails.stage.color}`} />
                                        </div>
                                        <div className="flex-1">
                                          <h3 className={`font-semibold ${roomDetails.stage.color}`}>
                                            {roomDetails.stage.label}
                                          </h3>
                                          {roomDetails.stage.checkoutTime && (
                                            <p className="text-sm text-gray-600">
                                              {roomDetails.stage.stage === 'occupied' ? 'Checkout scheduled: ' : 'Was due: '}
                                              {roomDetails.stage.checkoutTime.toLocaleString()}
                                            </p>
                                          )}
                                          {roomDetails.stage.hoursUntilCheckout !== undefined && roomDetails.stage.hoursUntilCheckout > 0 && (
                                            <p className="text-sm text-blue-600 font-medium">
                                              {Math.round(roomDetails.stage.hoursUntilCheckout)} hours remaining
                                            </p>
                                          )}
                                        </div>
                                        {roomDetails.stage.urgent && (
                                          <Badge variant="destructive" className="animate-pulse">
                                            Urgent Action Required
                                          </Badge>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Room Basic Information */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Room Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Room Number</label>
                                          <p className="text-lg font-semibold">{room.number}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Type</label>
                                          <p className="capitalize">{room.type || 'Standard'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Rate</label>
                                          <p className="font-medium">${room.rate || 'N/A'}/night</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-600">Building</label>
                                          <p>{buildings.find(b => b.id === room.buildingId)?.name || 'Unknown'}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Guest Information - Only for Occupied Rooms */}
                                  {room.status === 'occupied' && roomDetails.guests.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center space-x-2">
                                          <Users className="h-5 w-5 text-blue-500" />
                                          <span>Current Guests</span>
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        {roomDetails.guests.map((guest: any, index: number) => (
                                          <div key={guest.id} className="border rounded-lg p-4 bg-blue-50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <label className="text-sm font-medium text-gray-600">Guest Name</label>
                                                <p className="text-lg font-semibold text-blue-900">{guest.guestName}</p>
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium text-gray-600">Total Amount Paid</label>
                                                <p className="text-lg font-semibold text-green-600">
                                                  ${guest.amountPaid || '0.00'}
                                                </p>
                                              </div>
                                              {guest.email && (
                                                <div>
                                                  <label className="text-sm font-medium text-gray-600">Email</label>
                                                  <p className="flex items-center space-x-1">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <span>{guest.email}</span>
                                                  </p>
                                                </div>
                                              )}
                                              {guest.phone && (
                                                <div>
                                                  <label className="text-sm font-medium text-gray-600">Phone</label>
                                                  <p className="flex items-center space-x-1">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span>{guest.phone}</span>
                                                  </p>
                                                </div>
                                              )}
                                              {guest.checkInDate && (
                                                <div>
                                                  <label className="text-sm font-medium text-gray-600">Check-in Date & Time</label>
                                                  <p className="flex items-center space-x-1">
                                                    <CalendarDays className="h-4 w-4 text-green-500" />
                                                    <span className="font-medium text-green-700">
                                                      {new Date(guest.checkInDate).toLocaleString()}
                                                    </span>
                                                  </p>
                                                </div>
                                              )}
                                              {guest.checkOutDate && (
                                                <div>
                                                  <label className="text-sm font-medium text-gray-600">Check-out Date & Time</label>
                                                  <p className="flex items-center space-x-1">
                                                    <ClockIcon className="h-4 w-4 text-blue-500" />
                                                    <span className="font-medium text-blue-700">
                                                      {new Date(guest.checkOutDate).toLocaleString()}
                                                    </span>
                                                  </p>
                                                </div>
                                              )}
                                              {guest.paymentMethod && (
                                                <div>
                                                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                                                  <p className="flex items-center space-x-1">
                                                    <CreditCard className="h-4 w-4 text-gray-500" />
                                                    <span className="capitalize">{guest.paymentMethod}</span>
                                                  </p>
                                                </div>
                                              )}
                                              <div className="md:col-span-2">
                                                <label className="text-sm font-medium text-gray-600">Stay Duration</label>
                                                <p className="text-sm text-gray-700">
                                                  {guest.checkInDate && guest.checkOutDate ? (
                                                    <>
                                                      {Math.ceil((new Date(guest.checkOutDate).getTime() - new Date(guest.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                                    </>
                                                  ) : 'Duration not specified'}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Payment Information */}
                                  {roomDetails.payments.length > 0 && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center space-x-2">
                                          <DollarSign className="h-5 w-5 text-green-500" />
                                          <span>Payment History</span>
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3">
                                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium">Total Amount:</span>
                                            <span className="text-xl font-bold text-green-600">
                                              ${roomDetails.totalBalance.toFixed(2)}
                                            </span>
                                          </div>
                                          {roomDetails.hasUnpaidBalance && (
                                            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                              <span className="text-yellow-800 font-medium">Outstanding balance detected</span>
                                            </div>
                                          )}
                                          <div className="space-y-2">
                                            {roomDetails.payments.map((payment: any, index: number) => (
                                              <div key={index} className="flex justify-between items-center p-2 border rounded">
                                                <div>
                                                  <span className="font-medium">${payment.payment?.amount}</span>
                                                  <span className="text-sm text-gray-500 ml-2">
                                                    {payment.payment?.createdAt ? new Date(payment.payment.createdAt).toLocaleDateString() : 'Date unknown'}
                                                  </span>
                                                </div>
                                                <Badge 
                                                  variant={payment.payment?.status === 'completed' ? 'default' : 'secondary'}
                                                  className={payment.payment?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                                >
                                                  {payment.payment?.status || 'pending'}
                                                </Badge>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            {room.status === 'occupied' && (
                              <Button size="sm" variant="outline">
                                <DollarSign className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}