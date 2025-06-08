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

  const filteredGuests = selectedRoom && selectedRoom !== "all"
    ? guests.filter((guest: GuestProfile) => guest.roomId === parseInt(selectedRoom))
    : guests;

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Guest Management</h2>
          <p className="text-gray-600">Manage guest profiles and payment tracking</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          Add Guest
        </Button>
      </div>

      {/* Room Filter */}
      <div className="flex gap-4">
        <div className="w-64">
          <Label>Filter by Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger>
              <SelectValue placeholder="All rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rooms</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  Room {room.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Guest List */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Profiles ({filteredGuests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingGuests ? (
            <div className="text-center py-8">Loading guests...</div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No guests found</div>
          ) : (
            <div className="grid gap-4">
              {filteredGuests.map((guest: GuestProfile) => (
                <div key={guest.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium">{guest.guestName}</h3>
                        <p className="text-sm text-gray-500">
                          Room {rooms.find(r => r.id === guest.roomId)?.number} • 
                          Check-in: {new Date(guest.checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getBookingTypeColor(guest.bookingType)}>
                        {guest.bookingType}
                      </Badge>
                      <Badge className={getPaymentStatusColor(guest.paymentStatus)}>
                        {guest.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Payment Amount</p>
                      <p className="font-medium">${guest.paymentAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Next Payment Due</p>
                      <p className="font-medium">{new Date(guest.nextPaymentDue).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Payment</p>
                      <p className="font-medium">
                        {guest.lastPaymentDate 
                          ? new Date(guest.lastPaymentDate).toLocaleDateString()
                          : 'None'
                        }
                      </p>
                    </div>
                  </div>

                  {guest.paymentStatus === 'pending' && guest.nextPaymentDue === new Date().toISOString().split('T')[0] && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => markPaymentMutation.mutate(guest.id)}
                        disabled={markPaymentMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Payment Received
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}