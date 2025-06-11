import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Banknote
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

  // Get room details with guest and payment information
  const getRoomDetails = (room: any) => {
    const roomGuests = guests.filter((guest: any) => guest.roomId === room.id);
    const roomPayments = Array.isArray(payments) ? payments.filter((payment: any) => payment.payment?.roomId === room.id) : [];
    
    return {
      ...room,
      guests: roomGuests,
      payments: roomPayments,
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
                      <Card key={room.id} className="border-2 hover:shadow-md transition-shadow">
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
                            <Button size="sm" variant="outline" className="flex-1">
                              View Details
                            </Button>
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