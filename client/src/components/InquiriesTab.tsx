import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Home } from "lucide-react";
import { useState } from "react";

interface InquiriesTabProps {
  inquiries?: any[];
}

export function InquiriesTab({ inquiries = [] }: InquiriesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [assignRoomDialogOpen, setAssignRoomDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  // Fetch available rooms for assignment
  const { data: rooms } = useQuery({ queryKey: ["/api/rooms"] });

  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/admin/inquiries/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
      toast({ title: "Success", description: "Inquiry status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update inquiry status", variant: "destructive" });
    }
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/inquiries', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
      toast({ title: "Success", description: "Inquiry created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create inquiry", variant: "destructive" });
    }
  });

  const assignRoomMutation = useMutation({
    mutationFn: async ({ inquiryId, roomId, guestData }: { inquiryId: number; roomId: number; guestData: any }) => {
      // First create the guest profile
      const guestProfile = await apiRequest('POST', '/api/admin/guests', guestData);
      
      // Then update the room status to occupied
      await apiRequest('PUT', `/api/admin/rooms/${roomId}/status`, { status: 'occupied' });
      
      // Finally mark the inquiry as resolved
      await apiRequest('PATCH', `/api/admin/inquiries/${inquiryId}/status`, { status: 'resolved' });
      
      return guestProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/guests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: "Success", description: "Room assigned successfully" });
      setAssignRoomDialogOpen(false);
      setSelectedInquiry(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to assign room", variant: "destructive" });
    }
  });

  const handleMarkResolved = (inquiry: any) => {
    updateInquiryMutation.mutate({ id: inquiry.id, status: 'resolved' });
  };

  const handleReply = (inquiry: any) => {
    // Open email client with pre-filled response
    const subject = `Re: Your inquiry about our property`;
    const body = `Dear ${inquiry.name},\n\nThank you for your inquiry about our property. `;
    const mailtoLink = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const handleCreateInquiry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      inquiryType: formData.get('inquiryType'),
      status: 'pending'
    };
    createInquiryMutation.mutate(data);
  };

  const handleAssignRoom = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setAssignRoomDialogOpen(true);
  };

  const handleRoomAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    const formData = new FormData(e.currentTarget);
    const roomId = parseInt(formData.get('roomId') as string);
    
    const guestData = {
      roomId,
      guestName: selectedInquiry.name,
      email: selectedInquiry.email,
      phone: selectedInquiry.phone || '',
      bookingType: formData.get('bookingType') as string,
      checkInDate: formData.get('checkInDate') as string,
      checkOutDate: formData.get('checkOutDate') as string || undefined,
      paymentAmount: formData.get('paymentAmount') as string,
      paymentDueDay: formData.get('paymentDueDay') ? parseInt(formData.get('paymentDueDay') as string) : undefined,
      paymentStatus: 'pending' as const,
      isActive: true,
      notes: formData.get('notes') as string || undefined
    };

    assignRoomMutation.mutate({
      inquiryId: selectedInquiry.id,
      roomId,
      guestData
    });
  };

  // Filter available rooms
  const availableRooms = rooms ? rooms.filter((room: any) => room.status === 'available') : [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Property Inquiries</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{inquiries.length} total</Badge>
          <Button size="sm" variant="outline" onClick={() => setAssignRoomDialogOpen(true)}>
            <Home className="w-4 h-4 mr-1" />
            Assign from Inquiries
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Inquiry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inquiry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateInquiry} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div>
                  <Label htmlFor="inquiryType">Inquiry Type</Label>
                  <Select name="inquiryType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" required />
                </div>
                <Button type="submit" className="w-full" disabled={createInquiryMutation.isPending}>
                  {createInquiryMutation.isPending ? "Adding..." : "Add Inquiry"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Assign Room Dialog */}
          <Dialog open={assignRoomDialogOpen} onOpenChange={setAssignRoomDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Room to {selectedInquiry?.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRoomAssignment} className="space-y-4">
                <div>
                  <Label htmlFor="roomId">Select Room</Label>
                  <Select name="roomId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose available room" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room: any) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          Room {room.number} - {room.size} (${room.rentalRate}/{room.rentalPeriod})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="bookingType">Booking Type</Label>
                  <Select name="bookingType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select booking type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="checkInDate">Check-in Date</Label>
                  <Input id="checkInDate" name="checkInDate" type="date" required />
                </div>

                <div>
                  <Label htmlFor="checkOutDate">Check-out Date (Optional)</Label>
                  <Input id="checkOutDate" name="checkOutDate" type="date" />
                </div>

                <div>
                  <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                  <Input id="paymentAmount" name="paymentAmount" type="number" step="0.01" required placeholder="0.00" />
                </div>

                <div>
                  <Label htmlFor="paymentDueDay">Payment Due Day (for monthly)</Label>
                  <Input id="paymentDueDay" name="paymentDueDay" type="number" min="1" max="31" placeholder="e.g., 15" />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea id="notes" name="notes" placeholder="Additional notes about the booking" />
                </div>

                <Button type="submit" className="w-full" disabled={assignRoomMutation.isPending}>
                  {assignRoomMutation.isPending ? "Assigning..." : "Assign Room & Create Guest Profile"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No inquiries at this time.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry: any, index: number) => (
            <Card key={inquiry.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{inquiry.name}</CardTitle>
                  <Badge variant={inquiry.status === 'pending' ? 'destructive' : 'default'}>
                    {inquiry.status || 'pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{inquiry.email}</p>
                <p className="text-sm mb-3">{inquiry.message}</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleReply(inquiry)}
                    disabled={updateInquiryMutation.isPending}
                  >
                    Reply
                  </Button>
                  {inquiry.status !== 'resolved' && availableRooms.length > 0 && (
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignRoom(inquiry)}
                      disabled={assignRoomMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Home className="w-3 h-3 mr-1" />
                      Assign Room
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleMarkResolved(inquiry)}
                    disabled={updateInquiryMutation.isPending || inquiry.status === 'resolved'}
                  >
                    {inquiry.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}