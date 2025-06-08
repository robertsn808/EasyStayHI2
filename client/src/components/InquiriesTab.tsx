import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface InquiriesTabProps {
  inquiries?: any[];
}

export function InquiriesTab({ inquiries = [] }: InquiriesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Property Inquiries</h3>
        <Badge variant="secondary">{inquiries.length} total</Badge>
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