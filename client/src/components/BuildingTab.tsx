import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { User, Edit, Home } from "lucide-react";

interface BuildingTabProps {
  buildingName: string;
  buildingId: number;
  rooms?: any[];
  guests?: any[];
  inquiriesCount: number;
  color: "blue" | "purple";
}

export function BuildingTab({ buildingName, buildingId, rooms = [], guests = [], inquiriesCount, color }: BuildingTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch fresh data directly to ensure real-time updates
  const { data: freshRooms } = useQuery({
    queryKey: ['/api/rooms'],
    refetchInterval: 2000, // Refetch every 2 seconds
  });

  const { data: freshGuests } = useQuery({
    queryKey: ['/api/admin/guests'],
    refetchInterval: 2000, // Refetch every 2 seconds
  });

  // Use fresh data if available, fallback to props
  const currentRooms = Array.isArray(freshRooms) ? freshRooms : rooms;
  const currentGuests = Array.isArray(freshGuests) ? freshGuests : guests;

  const colorClasses = {
    blue: {
      bg: "bg-blue-500",
      border: "border-blue-500",
      text: "text-blue-600",
      header: "text-blue-700"
    },
    purple: {
      bg: "bg-purple-500",
      border: "border-purple-500", 
      text: "text-purple-600",
      header: "text-purple-700"
    }
  };

  const updateRoomMutation = useMutation({
    mutationFn: async (data: { roomId: number; updateData: any }) => {
      const response = await fetch(`/api/admin/rooms/${data.roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(data.updateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update room');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/maintenance-requests'] });
      
      // Force immediate refetch to update UI
      queryClient.refetchQueries({ queryKey: ['/api/rooms'] });
      queryClient.refetchQueries({ queryKey: ['/api/admin/guests'] });
      
      toast({ title: "Success", description: "Room updated successfully" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update room", variant: "destructive" });
    }
  });

  const createGuestMutation = useMutation({
    mutationFn: async (guestData: any) => {
      const response = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(guestData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create guest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch all related data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['/api/admin/guests'] });
      queryClient.refetchQueries({ queryKey: ['/api/rooms'] });
      
      toast({ title: "Success", description: "Guest assigned successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign guest", variant: "destructive" });
    }
  });

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-500';
      case 'available': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  // Use useMemo to optimize filtering and ensure real-time updates
  const buildingRooms = useMemo(() => 
    currentRooms.filter(room => room.buildingId === buildingId),
    [currentRooms, buildingId]
  );
  
  const buildingGuests = useMemo(() => 
    currentGuests.filter(guest => 
      buildingRooms.some(room => room.id === guest.roomId)
    ),
    [currentGuests, buildingRooms]
  );

  const handleRoomUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get('status') as string;
    const notes = formData.get('notes') as string;
    
    // Validate maintenance status requires notes
    if (newStatus === 'maintenance' && !notes?.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide notes when setting status to maintenance",
        variant: "destructive"
      });
      return;
    }

    const updateData: any = {
      status: newStatus,
    };

    // Clear guest info when changing to cleaning or maintenance
    if (newStatus === 'cleaning' || newStatus === 'maintenance') {
      updateData.tenantName = null;
      updateData.tenantPhone = null;
      updateData.tenantEmail = null;
    } else {
      // Add optional fields only if they have values and not cleaning/maintenance
      const tenantName = formData.get('tenantName') as string;
      const tenantPhone = formData.get('tenantPhone') as string;
      const accessPin = formData.get('accessPin') as string;

      if (tenantName?.trim()) updateData.tenantName = tenantName;
      if (tenantPhone?.trim()) updateData.tenantPhone = tenantPhone;
      if (accessPin?.trim()) updateData.accessPin = accessPin;
    }

    // Add notes for maintenance status
    if (newStatus === 'maintenance' && notes?.trim()) {
      updateData.notes = notes;
    }

    updateRoomMutation.mutate({
      roomId: selectedRoom.id,
      updateData
    });
  };

  const handleGuestAssign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const formData = new FormData(e.currentTarget);
    const guestData = {
      roomId: selectedRoom.id,
      guestName: formData.get('guestName') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      bookingType: formData.get('bookingType') as string,
      checkInDate: formData.get('checkInDate') as string,
      checkOutDate: formData.get('checkOutDate') as string || undefined,
      paymentAmount: formData.get('paymentAmount') as string,
      paymentStatus: 'pending' as const,
      isActive: true,
    };

    // Only include fields that have values
    Object.keys(guestData).forEach(key => {
      if (guestData[key as keyof typeof guestData] === '' || guestData[key as keyof typeof guestData] === undefined) {
        delete guestData[key as keyof typeof guestData];
      }
    });

    createGuestMutation.mutate(guestData);

    // Also update room status to occupied
    updateRoomMutation.mutate({
      roomId: selectedRoom.id,
      updateData: { 
        status: 'occupied',
        tenantName: guestData.guestName,
        tenantPhone: guestData.phone || null
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${colorClasses[color].header}`}>{buildingName}</h2>
          <p className="text-gray-600">{buildingRooms.length} rooms • {inquiriesCount} inquiries pending</p>
        </div>
      </div>

      {/* Room Status Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Room Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
            {buildingRooms.map((room) => (
              <div
                key={room.id}
                className="relative group cursor-pointer"
                onClick={() => {
                  setSelectedRoom(room);
                  setIsDialogOpen(true);
                }}
                title={`Room ${room.number} - ${room.status}${room.tenantName ? ` - ${room.tenantName}` : ''}`}
              >
                <div
                  className={`w-12 h-12 rounded ${getRoomStatusColor(room.status)} flex items-center justify-center text-white text-xs font-medium hover:scale-105 transition-transform`}
                >
                  {room.number}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Cleaning</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Guests */}
      <Card>
        <CardHeader>
          <CardTitle>Active Guests ({buildingGuests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {buildingGuests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active guests</p>
          ) : (
            <div className="space-y-3">
              {buildingGuests.map((guest) => {
                const room = buildingRooms.find(r => r.id === guest.roomId);
                return (
                  <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded ${colorClasses[color].bg} flex items-center justify-center text-white text-xs font-medium`}>
                        {room?.number}
                      </div>
                      <div>
                        <p className="font-medium">{guest.guestName}</p>
                        <p className="text-sm text-gray-600">{guest.email || guest.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={guest.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                        {guest.paymentStatus}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{guest.bookingType}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Manage Room {selectedRoom?.number} - {buildingName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="space-y-6">
              {/* Current Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Current Status</h3>
                <div className="flex items-center gap-4">
                  <Badge variant={selectedRoom.status === 'available' ? 'default' : 'secondary'}>
                    {selectedRoom.status}
                  </Badge>
                  {selectedRoom.tenantName && (
                    <span className="text-sm text-gray-600">
                      Tenant: {selectedRoom.tenantName}
                    </span>
                  )}
                </div>
              </div>

              {/* Update Room Status */}
              <form onSubmit={handleRoomUpdate} className="space-y-4">
                <h3 className="font-medium">Update Room Status</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Room Status</Label>
                    <Select name="status" defaultValue={selectedRoom.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accessPin">Access PIN (optional)</Label>
                    <Input
                      id="accessPin"
                      name="accessPin"
                      placeholder="4-digit PIN"
                      maxLength={4}
                      defaultValue={selectedRoom.accessPin || ''}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenantName">Tenant Name (optional)</Label>
                    <Input
                      id="tenantName"
                      name="tenantName"
                      placeholder="Enter tenant name"
                      defaultValue={selectedRoom.tenantName || ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tenantPhone">Tenant Phone (optional)</Label>
                    <Input
                      id="tenantPhone"
                      name="tenantPhone"
                      placeholder="Enter phone number"
                      defaultValue={selectedRoom.tenantPhone || ''}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (required for maintenance)</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    placeholder="Add notes for maintenance status or general comments..."
                  />
                </div>

                <Button type="submit" disabled={updateRoomMutation.isPending}>
                  Update Room
                </Button>
              </form>

              {/* Assign New Guest */}
              {selectedRoom.status === 'available' && (
                <form onSubmit={handleGuestAssign} className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Assign New Guest</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guestName">Guest Name *</Label>
                      <Input
                        id="guestName"
                        name="guestName"
                        placeholder="Enter guest name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bookingType">Booking Type *</Label>
                      <Select name="bookingType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkInDate">Check-in Date *</Label>
                      <Input
                        id="checkInDate"
                        name="checkInDate"
                        type="date"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="checkOutDate">Check-out Date (optional)</Label>
                      <Input
                        id="checkOutDate"
                        name="checkOutDate"
                        type="date"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentAmount">Payment Amount *</Label>
                    <Input
                      id="paymentAmount"
                      name="paymentAmount"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={createGuestMutation.isPending} className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Assign Guest
                  </Button>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}