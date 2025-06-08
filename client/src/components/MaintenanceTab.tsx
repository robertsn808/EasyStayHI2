import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceTabProps {
  requests?: any[];
}

export function MaintenanceTab({ requests = [] }: MaintenanceTabProps) {
  const { toast } = useToast();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Maintenance Requests</h3>
        <Badge variant="secondary">{requests.length} total</Badge>
      </div>
      
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No maintenance requests at this time.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any, index: number) => (
            <Card key={request.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{request.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={request.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {request.priority || 'normal'}
                    </Badge>
                    <Badge variant={request.status === 'completed' ? 'default' : 'outline'}>
                      {request.status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Room: {request.roomId}</p>
                <p className="text-sm mb-3">{request.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Status Updated", description: `Request for ${request.title} status updated` })}>Update Status</Button>
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Technician Assigned", description: `Technician assigned to ${request.title}` })}>Assign Technician</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}