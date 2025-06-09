import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface GuestProfile {
  id: number;
  roomId: number;
  guestName: string;
  email?: string;
  phone?: string;
  bookingType: 'daily' | 'weekly' | 'monthly';
  checkInDate: string;
  checkOutDate?: string;
  paymentAmount: string;
  paymentDueDay?: number;
  lastPaymentDate?: string;
  nextPaymentDue: string;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Room {
  id: number;
  number: string;
  buildingId: number;
}

export default function GuestProfileManager() {
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestProfile | null>(null);
  const [assigningRoom, setAssigningRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    roomId: '',
    guestName: '',
    email: '',
    phone: '',
    bookingType: 'daily' as 'daily' | 'weekly' | 'monthly',
    checkInDate: '',
    checkOutDate: '',
    paymentAmount: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all guest profiles
  const { data: guests = [], isLoading: loadingGuests } = useQuery({
    queryKey: ['/api/admin/guests'],
    enabled: !!localStorage.getItem('admin-authenticated')
  });



  // Fetch rooms for dropdown
  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
    enabled: !!localStorage.getItem('admin-authenticated')
  });

  // Create guest profile mutation
  const createGuestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create guest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
      setShowForm(false);
      setAssigningRoom(null);
      setFormData({
        roomId: '',
        guestName: '',
        email: '',
        phone: '',
        bookingType: 'daily',
        checkInDate: '',
        checkOutDate: '',
        paymentAmount: '',
        notes: ''
      });
      toast({ title: "Guest profile created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create guest profile", variant: "destructive" });
    }
  });

  // Update guest profile mutation
  const updateGuestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/guests/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update guest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
      setEditingGuest(null);
      setShowForm(false);
      toast({ title: "Guest profile updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update guest profile", variant: "destructive" });
    }
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomId || !formData.guestName || !formData.checkInDate || !formData.paymentAmount) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const guestData = {
      ...formData,
      roomId: parseInt(formData.roomId),
      paymentAmount: parseFloat(formData.paymentAmount)
    };

    if (editingGuest) {
      updateGuestMutation.mutate({ ...guestData, id: editingGuest.id });
    } else {
      createGuestMutation.mutate(guestData);
    }
  };

  const handleAssignRoom = (room: Room) => {
    setAssigningRoom(room);
    setFormData({
      ...formData,
      roomId: room.id.toString()
    });
    setShowForm(true);
  };

  const handleEditGuest = (guest: GuestProfile) => {
    setEditingGuest(guest);
    setFormData({
      roomId: guest.roomId.toString(),
      guestName: guest.guestName,
      email: guest.email || '',
      phone: guest.phone || '',
      bookingType: guest.bookingType,
      checkInDate: guest.checkInDate,
      checkOutDate: guest.checkOutDate || '',
      paymentAmount: guest.paymentAmount.toString(),
      notes: guest.notes || ''
    });
    setShowForm(true);
  };

  const getBookingTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-green-100 text-green-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add buildings query
  const { data: buildings } = useQuery({
    queryKey: ["/api/admin/buildings"],
  });

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Guest Management</h2>
          <p className="text-gray-600">Manage guest profiles by building</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          Add Guest
        </Button>
      </div>

      {/* Compact Building Layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* 934 Kapahulu Ave */}
        <div>
          <div className="mb-2 p-2 bg-blue-50 rounded border-l-3 border-blue-400">
            <h3 className="font-medium text-blue-800 text-sm">934 Kapahulu Ave</h3>
            <p className="text-xs text-blue-600">8 rooms • $100/$500/$2000</p>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {(() => {
              const buildingGuests = Array.isArray(guests) ? guests.filter((guest: GuestProfile) => {
                const room = Array.isArray(rooms) ? rooms.find((r: any) => r.id === guest.roomId) : null;
                const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room?.buildingId) : null;
                return building?.name === "934 Kapahulu Ave";
              }) : [];
              
              const buildingRooms = Array.isArray(rooms) ? rooms.filter((room: any) => {
                const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room.buildingId) : null;
                return building?.name === "934 Kapahulu Ave";
              }) : [];
              
              const occupiedRoomIds = buildingGuests.map(g => g.roomId);
              const unoccupiedRooms = buildingRooms.filter(room => !occupiedRoomIds.includes(room.id));
              
              return (
                <>
                  {buildingGuests.map((guest: GuestProfile) => {
                    const room = Array.isArray(rooms) ? rooms.find((r: any) => r.id === guest.roomId) : null;
                    return (
                      <div key={guest.id} className="p-2 rounded border-l-2 border-l-blue-400 bg-blue-50/50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-blue-800">Guest {room?.number}</p>
                            <p className="text-xs text-blue-600">Room {room?.number}</p>
                          </div>
                          <Badge variant={guest.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                            {guest.paymentStatus}
                          </Badge>
                        </div>
                        <div className="text-xs text-blue-700 mt-1 flex justify-between items-center">
                          <span><span className="font-medium">{guest.bookingType}</span> • ${guest.paymentAmount}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs h-5 px-2 text-blue-600 hover:bg-blue-100"
                            onClick={() => handleEditGuest(guest)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {unoccupiedRooms.map((room: any) => (
                    <div key={`empty-${room.id}`} className="p-2 rounded border-l-2 border-dashed border-l-blue-300 bg-blue-50/30">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm text-blue-600">Room {room.number}</p>
                          <p className="text-xs text-gray-500">Available</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs h-6 text-blue-600 hover:bg-blue-100"
                          onClick={() => handleAssignRoom(room)}
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>

        {/* 949 Kawaiahao St */}
        <div>
          <div className="mb-2 p-2 bg-purple-50 rounded border-l-3 border-purple-400">
            <h3 className="font-medium text-purple-800 text-sm">949 Kawaiahao St</h3>
            <p className="text-xs text-purple-600">10 suites • $50/$200/$600</p>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {(() => {
              const buildingGuests = Array.isArray(guests) ? guests.filter((guest: GuestProfile) => {
                const room = Array.isArray(rooms) ? rooms.find((r: any) => r.id === guest.roomId) : null;
                const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room?.buildingId) : null;
                return building?.name === "949 Kawaiahao St";
              }) : [];
              
              const buildingRooms = Array.isArray(rooms) ? rooms.filter((room: any) => {
                const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room.buildingId) : null;
                return building?.name === "949 Kawaiahao St";
              }) : [];
              
              const occupiedRoomIds = buildingGuests.map(g => g.roomId);
              const unoccupiedRooms = buildingRooms.filter(room => !occupiedRoomIds.includes(room.id));
              
              return (
                <>
                  {buildingGuests.map((guest: GuestProfile) => {
                    const room = Array.isArray(rooms) ? rooms.find((r: any) => r.id === guest.roomId) : null;
                    return (
                      <div key={guest.id} className="p-2 rounded border-l-2 border-l-purple-400 bg-purple-50/50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-purple-800">Guest {room?.number}</p>
                            <p className="text-xs text-purple-600">Room {room?.number}</p>
                          </div>
                          <Badge variant={guest.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                            {guest.paymentStatus}
                          </Badge>
                        </div>
                        <div className="text-xs text-purple-700 mt-1 flex justify-between items-center">
                          <span><span className="font-medium">{guest.bookingType}</span> • ${guest.paymentAmount}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs h-5 px-2 text-purple-600 hover:bg-purple-100"
                            onClick={() => handleEditGuest(guest)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {unoccupiedRooms.map((room: any) => (
                    <div key={`empty-${room.id}`} className="p-2 rounded border-l-2 border-dashed border-l-purple-300 bg-purple-50/30">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm text-purple-600">Room {room.number}</p>
                          <p className="text-xs text-gray-500">Available</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs h-6 text-purple-600 hover:bg-purple-100"
                          onClick={() => handleAssignRoom(room)}
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Add Guest Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingGuest ? 'Edit Guest' : assigningRoom ? `Assign Guest to Room ${assigningRoom.number}` : 'Add New Guest'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomId">Room *</Label>
                <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        Room {room.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="guestName">Guest Name *</Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="bookingType">Booking Type *</Label>
                <Select value={formData.bookingType} onValueChange={(value: any) => setFormData({...formData, bookingType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentAmount">Payment Amount *</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={formData.paymentAmount}
                  onChange={(e) => setFormData({...formData, paymentAmount: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="checkInDate">Check-in Date *</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="checkOutDate">Check-out Date</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={createGuestMutation.isPending || updateGuestMutation.isPending}>
                  {editingGuest 
                    ? (updateGuestMutation.isPending ? 'Updating...' : 'Update Guest')
                    : (createGuestMutation.isPending ? 'Creating...' : 'Create Guest')
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingGuest(null);
                    setAssigningRoom(null);
                    setFormData({
                      roomId: '',
                      guestName: '',
                      email: '',
                      phone: '',
                      bookingType: 'daily',
                      checkInDate: '',
                      checkOutDate: '',
                      paymentAmount: '',
                      notes: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}