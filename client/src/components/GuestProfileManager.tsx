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

  // Fetch payment due guests for dashboard
  const { data: paymentDueGuests = [], isLoading: loadingPaymentDue } = useQuery({
    queryKey: ['/api/admin/guests/payment-due'],
    enabled: !!localStorage.getItem('admin-authenticated'),
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch rooms for dropdown
  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
    enabled: !!localStorage.getItem('admin-authenticated')
  });

  // Create guest profile mutation
  const createGuestMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-authenticated')}`
        },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests/payment-due'] });
      setShowForm(false);
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

  // Mark payment received mutation
  const markPaymentMutation = useMutation({
    mutationFn: async (guestId: number) => {
      return apiRequest(`/api/admin/guests/${guestId}/payment-received`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-authenticated')}`
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests/payment-due'] });
      toast({ title: "Payment marked as received!" });
    },
    onError: () => {
      toast({ title: "Failed to mark payment", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomId || !formData.guestName || !formData.checkInDate || !formData.paymentAmount) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createGuestMutation.mutate({
      ...formData,
      roomId: parseInt(formData.roomId),
      paymentAmount: parseFloat(formData.paymentAmount)
    });
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
      {/* Payment Due Dashboard */}
      {paymentDueGuests.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-800 text-base">
              <Clock className="h-4 w-4" />
              Payment Due Today ({paymentDueGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {paymentDueGuests.map((guest: GuestProfile) => (
                <div key={guest.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{guest.guestName}</p>
                      <p className="text-sm text-gray-500">
                        Room {rooms.find(r => r.id === guest.roomId)?.number} • 
                        <Badge className={`ml-1 ${getBookingTypeColor(guest.bookingType)}`}>
                          {guest.bookingType}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">${guest.paymentAmount}</p>
                      <p className="text-sm text-gray-500">Due today</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => markPaymentMutation.mutate(guest.id)}
                      disabled={markPaymentMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Paid
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Side-by-side building layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* 934 Kapahulu Ave */}
        <div>
          <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
            <h3 className="font-medium text-blue-800">934 Kapahulu Ave</h3>
            <p className="text-xs text-blue-600">$100/$500/$2000</p>
          </div>
          <div className="grid gap-2">
            {Array.isArray(guests) && guests
              .filter((guest: GuestProfile) => {
                const room = Array.isArray(rooms) ? rooms.find((r: any) => r.id === guest.roomId) : null;
                const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room?.buildingId) : null;
                return building?.name === "934 Kapahulu Ave";
              })
              .map((guest: GuestProfile) => {
                const room = Array.isArray(rooms) ? rooms.find((r: any) => r.id === guest.roomId) : null;
                return (
                  <Card key={guest.id} className="hover:shadow-sm transition-shadow border-l-4 border-l-blue-400 bg-blue-50/30">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800">{guest.guestName}</h4>
                          <p className="text-sm text-blue-700">Room #{room?.number}</p>
                        </div>
                        <Badge variant={guest.paymentStatus === 'paid' ? 'default' : guest.paymentStatus === 'overdue' ? 'destructive' : 'secondary'} className="text-xs">
                          {guest.paymentStatus}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-blue-700 space-y-1">
                        <p><strong>Type:</strong> {guest.bookingType}</p>
                        <p><strong>Amount:</strong> ${guest.paymentAmount}</p>
                        <p><strong>Next Due:</strong> {new Date(guest.nextPaymentDue).toLocaleDateString()}</p>
                        {guest.phone && <p><strong>Phone:</strong> {guest.phone}</p>}
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6 flex-1 border-blue-300 text-blue-700 hover:bg-blue-100">
                          Edit
                        </Button>
                        {guest.paymentStatus !== 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2 py-1 h-6 flex-1 border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => markPaymentMutation.mutate(guest.id)}
                            disabled={markPaymentMutation.isPending}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* 949 Kawaiahao St */}
        <div>
          <div className="mb-3 p-2 bg-purple-50 rounded border-l-4 border-purple-400">
            <h3 className="font-medium text-purple-800">949 Kawaiahao St</h3>
            <p className="text-xs text-purple-600">$50/$200/$600</p>
          </div>
          <div className="grid gap-2">
            {Array.isArray(guests) && guests
              .filter((guest: GuestProfile) => {
                const room = Array.isArray(rooms) ? rooms.find((r: any) => r.id === guest.roomId) : null;
                const building = Array.isArray(buildings) ? buildings.find((b: any) => b.id === room?.buildingId) : null;
                return building?.name === "949 Kawaiahao St";
              })
              .map((guest: GuestProfile) => {
                const room = Array.isArray(rooms) ? rooms.find((r: any) => r.id === guest.roomId) : null;
                return (
                  <Card key={guest.id} className="hover:shadow-sm transition-shadow border-l-4 border-l-purple-400 bg-purple-50/30">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-800">{guest.guestName}</h4>
                          <p className="text-sm text-purple-700">Room #{room?.number}</p>
                        </div>
                        <Badge variant={guest.paymentStatus === 'paid' ? 'default' : guest.paymentStatus === 'overdue' ? 'destructive' : 'secondary'} className="text-xs">
                          {guest.paymentStatus}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-purple-700 space-y-1">
                        <p><strong>Type:</strong> {guest.bookingType}</p>
                        <p><strong>Amount:</strong> ${guest.paymentAmount}</p>
                        <p><strong>Next Due:</strong> {new Date(guest.nextPaymentDue).toLocaleDateString()}</p>
                        {guest.phone && <p><strong>Phone:</strong> {guest.phone}</p>}
                      </div>
                      
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-6 flex-1 border-purple-300 text-purple-700 hover:bg-purple-100">
                          Edit
                        </Button>
                        {guest.paymentStatus !== 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs px-2 py-1 h-6 flex-1 border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => markPaymentMutation.mutate(guest.id)}
                            disabled={markPaymentMutation.isPending}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>

      {/* Add Guest Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Guest</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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

              <div className="col-span-2 flex gap-2">
                <Button type="submit" disabled={createGuestMutation.isPending}>
                  {createGuestMutation.isPending ? 'Creating...' : 'Create Guest'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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