import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar } from "lucide-react";
import { useState } from "react";

interface CalendarTabProps {
  events?: any[];
}

export function CalendarTab({ events = [] }: CalendarTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/calendar', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/calendar'] });
      toast({ title: "Success", description: "Calendar event created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create calendar event", variant: "destructive" });
    }
  });

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      type: formData.get('type'),
      roomId: formData.get('roomId') ? parseInt(formData.get('roomId') as string) : null
    };
    createEventMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Calendar Events</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{events.length} total</Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Calendar Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="checkout">Check-out</SelectItem>
                      <SelectItem value="checkin">Check-in</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="roomId">Room (Optional)</Label>
                  <Input id="roomId" name="roomId" type="number" placeholder="Enter room ID" />
                </div>
                <Button type="submit" className="w-full" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? "Adding..." : "Add Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No calendar events scheduled.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event: any, index: number) => (
            <Card key={event.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <Badge variant="secondary">{event.type || 'General'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  {event.description && (
                    <p className="text-gray-600">{event.description}</p>
                  )}
                  {event.roomId && (
                    <p className="text-sm text-gray-500">Room: {event.roomId}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="outline">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}