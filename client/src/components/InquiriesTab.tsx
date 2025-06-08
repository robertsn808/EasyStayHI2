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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Property Inquiries</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{inquiries.length} total</Badge>
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