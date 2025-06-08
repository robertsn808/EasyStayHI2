import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface MaintenanceTabProps {
  requests?: any[];
}

export function MaintenanceTab({ requests = [] }: MaintenanceTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<{ [key: number]: string }>({});
  const [selectedTechnician, setSelectedTechnician] = useState<{ [key: number]: string }>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'normal',
    roomId: ''
  });

  // Extract the actual request data from the nested structure
  const maintenanceRequests = requests.map((item: any) => item.request || item);

  const updateMaintenanceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PATCH', `/api/admin/maintenance/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/maintenance'] });
      toast({ title: "Success", description: "Maintenance request updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update maintenance request", variant: "destructive" });
    }
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/maintenance', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/maintenance'] });
      toast({ title: "Success", description: "Maintenance request created" });
      setShowCreateForm(false);
      setNewRequest({ title: '', description: '', priority: 'normal', roomId: '' });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create maintenance request", variant: "destructive" });
    }
  });

  const handleStatusUpdate = (request: any) => {
    const newStatus = selectedStatus[request.id] || 'in-progress';
    updateMaintenanceMutation.mutate({ 
      id: request.id, 
      data: { status: newStatus }
    });
  };

  const handleTechnicianAssign = (request: any) => {
    const technician = selectedTechnician[request.id] || 'John Smith';
    updateMaintenanceMutation.mutate({ 
      id: request.id, 
      data: { assignedTechnician: technician }
    });
  };
  
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title || !newRequest.description || !newRequest.roomId) return;
    
    createMaintenanceMutation.mutate({
      ...newRequest,
      roomId: parseInt(newRequest.roomId)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Maintenance Requests</h3>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary">{maintenanceRequests.length} total</Badge>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Add Request'}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Maintenance Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Room ID</label>
                <input
                  type="number"
                  value={newRequest.roomId}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, roomId: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Room number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <Select value={newRequest.priority} onValueChange={(value) => setNewRequest(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-md h-24"
                  placeholder="Detailed description of the maintenance issue"
                  required
                />
              </div>
              <Button type="submit" disabled={createMaintenanceMutation.isPending}>
                {createMaintenanceMutation.isPending ? 'Creating...' : 'Create Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {maintenanceRequests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No maintenance requests at this time.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {maintenanceRequests.map((request: any, index: number) => (
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
                <div className="flex gap-2 items-center space-x-2">
                  <Select value={selectedStatus[request.id] || request.status} onValueChange={(value) => setSelectedStatus(prev => ({ ...prev, [request.id]: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleStatusUpdate(request)}
                    disabled={updateMaintenanceMutation.isPending}
                  >
                    Update Status
                  </Button>
                  <Select value={selectedTechnician[request.id] || ''} onValueChange={(value) => setSelectedTechnician(prev => ({ ...prev, [request.id]: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Smith">John Smith</SelectItem>
                      <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                      <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleTechnicianAssign(request)}
                    disabled={updateMaintenanceMutation.isPending}
                  >
                    Assign
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