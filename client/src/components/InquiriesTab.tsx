import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface InquiriesTabProps {
  inquiries?: any[];
}

export function InquiriesTab({ inquiries = [] }: InquiriesTabProps) {
  const { toast } = useToast();
  
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
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Reply", description: `Replying to ${inquiry.name}` })}>Reply</Button>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Marked Resolved", description: `Inquiry from ${inquiry.name} marked as resolved` })}>Mark Resolved</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}