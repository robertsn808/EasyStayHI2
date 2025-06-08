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
import { Plus, Home, MessageSquare, Eye, Phone, Mail, Trash2 } from "lucide-react";
import { useState } from "react";

interface InquiriesTabProps {
  inquiries?: any[];
}

export function InquiriesTab({ inquiries = [] }: InquiriesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [assignRoomDialogOpen, setAssignRoomDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  // Fetch available rooms for assignment
  const { data: rooms } = useQuery({ queryKey: ["/api/rooms"] });
  
  // Fetch buildings data
  const { data: buildings } = useQuery({ queryKey: ["/api/admin/buildings"] });

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

  const deleteInquiryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': 'admin-authenticated'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete inquiry');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
      toast({ title: "Success", description: "Inquiry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete inquiry", variant: "destructive" });
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

  // Helper functions for room status colors
  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-500';
      case 'available': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  // Group inquiries by building preference (934 Kapahulu vs 949 Kawaiahao)
  const inquiriesByBuilding = {
    kapahulu: Array.isArray(inquiries) ? inquiries.filter((inquiry: any) => 
      inquiry.message?.toLowerCase().includes('934') || 
      inquiry.message?.toLowerCase().includes('kapahulu') ||
      (!inquiry.message?.toLowerCase().includes('949') && !inquiry.message?.toLowerCase().includes('kawaiahao'))
    ) : [],
    kawaiahao: Array.isArray(inquiries) ? inquiries.filter((inquiry: any) => 
      inquiry.message?.toLowerCase().includes('949') || 
      inquiry.message?.toLowerCase().includes('kawaiahao')
    ) : []
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

  const handleViewMessage = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setMessageDialogOpen(true);
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
    <div className="space-y-6">
      {/* Building Overview */}
      {Array.isArray(buildings) && Array.isArray(rooms) && (
        <Card>
          <CardHeader>
            <CardTitle>Building Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {buildings.map((building: any) => {
                const buildingRooms = rooms.filter((room: any) => room.buildingId === building.id);
                return (
                  <div key={building.id} className="space-y-3">
                    <h3 className="font-medium text-lg">{building.name}</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {buildingRooms.map((room: any) => (
                        <div
                          key={room.id}
                          className="relative group cursor-pointer"
                          title={`Room ${room.number} - ${room.status}`}
                        >
                          <div
                            className={`w-8 h-8 rounded ${getRoomStatusColor(room.status)} flex items-center justify-center text-white text-xs font-medium`}
                          >
                            {room.number}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
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
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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

          {/* Assign from Inquiries Dialog */}
          <Dialog open={assignRoomDialogOpen} onOpenChange={setAssignRoomDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assign Room from Inquiries</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Inquiry to Assign</Label>
                  <Select onValueChange={(value) => setSelectedInquiry(inquiries.find((inq: any) => inq.id === parseInt(value)))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an inquiry" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(inquiries) && inquiries.map((inquiry: any) => (
                        <SelectItem key={inquiry.id} value={inquiry.id.toString()}>
                          {inquiry.name} - {inquiry.inquiryType} ({inquiry.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInquiry && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Selected Inquiry Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Name:</strong> {selectedInquiry.name}</div>
                      <div><strong>Email:</strong> {selectedInquiry.email}</div>
                      <div><strong>Phone:</strong> {selectedInquiry.phone || 'N/A'}</div>
                      <div><strong>Type:</strong> {selectedInquiry.inquiryType}</div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Available Rooms</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Array.isArray(rooms) && rooms.filter((room: any) => room.status === 'available').map((room: any) => (
                      <Button
                        key={room.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedInquiry) {
                            // Auto-assign room and create guest profile
                            const assignData = {
                              inquiryId: selectedInquiry.id,
                              roomId: room.id,
                              guestName: selectedInquiry.name,
                              email: selectedInquiry.email,
                              phone: selectedInquiry.phone,
                              bookingType: 'monthly',
                              checkInDate: new Date().toISOString().split('T')[0],
                              paymentAmount: room.rentalRate || '0',
                              paymentDueDay: 1
                            };
                            handleAssignRoom(assignData);
                          }
                        }}
                        className="text-left"
                      >
                        <div>
                          <div className="font-medium">Room {room.number}</div>
                          <div className="text-xs text-gray-500">${room.rentalRate}/month</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setAssignRoomDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Message Viewing Dialog */}
          <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Message from {selectedInquiry?.name}</DialogTitle>
              </DialogHeader>
              {selectedInquiry && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-semibold">Email:</span> {selectedInquiry.email}
                      </div>
                      {selectedInquiry.phone && (
                        <div>
                          <span className="font-semibold">Phone:</span> {selectedInquiry.phone}
                        </div>
                      )}
                      {selectedInquiry.contactPreference && (
                        <div>
                          <span className="font-semibold">Contact Preference:</span> {selectedInquiry.contactPreference === 'any' ? 'Any method' : selectedInquiry.contactPreference}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Status:</span> {selectedInquiry.status || 'pending'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base font-semibold">Message:</Label>
                    <div className="mt-2 p-3 bg-white border rounded-lg min-h-[100px] whitespace-pre-wrap">
                      {selectedInquiry.message || 'No message provided'}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setMessageDialogOpen(false);
                      handleReply(selectedInquiry);
                    }}>
                      Reply to Inquiry
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Inquiries by Building */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 934 Kapahulu Ave Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-600">934 Kapahulu Ave</CardTitle>
            <Badge variant="secondary">{inquiriesByBuilding.kapahulu.length} inquiries</Badge>
          </CardHeader>
          <CardContent>
            {inquiriesByBuilding.kapahulu.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No inquiries for this building</p>
            ) : (
              <div className="space-y-3">
                {inquiriesByBuilding.kapahulu.map((inquiry: any, index: number) => (
                  <Card key={inquiry.id || index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{inquiry.name}</span>
                          {inquiry.message && inquiry.message.trim() && (
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <Badge variant={inquiry.status === 'pending' ? 'destructive' : 'default'} className="text-xs">
                          {inquiry.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{inquiry.email}</span>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{inquiry.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {inquiry.message && inquiry.message.trim() && (
                          <Button size="sm" variant="outline" onClick={() => handleViewMessage(inquiry)} className="text-xs h-7">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleReply(inquiry)} className="text-xs h-7">
                          Reply
                        </Button>
                        {inquiry.status !== 'resolved' && availableRooms.length > 0 && (
                          <Button size="sm" onClick={() => handleAssignRoom(inquiry)} className="bg-green-600 hover:bg-green-700 text-white text-xs h-7">
                            <Home className="w-3 h-3 mr-1" />
                            Assign
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleMarkResolved(inquiry)} disabled={inquiry.status === 'resolved'} className="text-xs h-7">
                          {inquiry.status === 'resolved' ? 'Resolved' : 'Resolve'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteInquiryMutation.mutate(inquiry.id)} disabled={deleteInquiryMutation.isPending} className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 949 Kawaiahao St Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-600">949 Kawaiahao St</CardTitle>
            <Badge variant="secondary">{inquiriesByBuilding.kawaiahao.length} inquiries</Badge>
          </CardHeader>
          <CardContent>
            {inquiriesByBuilding.kawaiahao.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No inquiries for this building</p>
            ) : (
              <div className="space-y-3">
                {inquiriesByBuilding.kawaiahao.map((inquiry: any, index: number) => (
                  <Card key={inquiry.id || index} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{inquiry.name}</span>
                          {inquiry.message && inquiry.message.trim() && (
                            <MessageSquare className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <Badge variant={inquiry.status === 'pending' ? 'destructive' : 'default'} className="text-xs">
                          {inquiry.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{inquiry.email}</span>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{inquiry.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {inquiry.message && inquiry.message.trim() && (
                          <Button size="sm" variant="outline" onClick={() => handleViewMessage(inquiry)} className="text-xs h-7">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleReply(inquiry)} className="text-xs h-7">
                          Reply
                        </Button>
                        {inquiry.status !== 'resolved' && availableRooms.length > 0 && (
                          <Button size="sm" onClick={() => handleAssignRoom(inquiry)} className="bg-green-600 hover:bg-green-700 text-white text-xs h-7">
                            <Home className="w-3 h-3 mr-1" />
                            Assign
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleMarkResolved(inquiry)} disabled={inquiry.status === 'resolved'} className="text-xs h-7">
                          {inquiry.status === 'resolved' ? 'Resolved' : 'Resolve'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteInquiryMutation.mutate(inquiry.id)} disabled={deleteInquiryMutation.isPending} className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-7">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}