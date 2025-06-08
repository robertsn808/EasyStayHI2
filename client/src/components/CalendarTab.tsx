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
                  <Badge variant="outline">{event.type || 'Event'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(event.date || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span>{event.time || 'All day'}</span>
                  </div>
                </div>
                <p className="text-sm mt-2">{event.description}</p>
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
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Calendar, Clock, MapPin } from "lucide-react";

interface CalendarTabProps {
  events?: any[];
}

export function CalendarTab({ events = [] }: CalendarTabProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/calendar', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/calendar'] });
      toast({ title: "Success", description: "Event created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create event", variant: "destructive" });
    }
  });

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      eventDate: formData.get('eventDate'),
      eventTime: formData.get('eventTime'),
      location: formData.get('location'),
      eventType: formData.get('eventType'),
      isRecurring: formData.get('isRecurring') === 'on'
    };
    createEventMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      case 'inspection': return 'bg-yellow-100 text-yellow-800';
      case 'meeting': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Calendar Events</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{events.length} events</Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Date</Label>
                    <Input id="eventDate" name="eventDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Time</Label>
                    <Input id="eventTime" name="eventTime" type="time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="e.g., Room 101, Lobby" />
                </div>
                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select name="eventType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isRecurring">Recurring event</Label>
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
            No events scheduled. Add your first event above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event: any, index: number) => (
            <Card key={event.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <Badge className={getEventTypeColor(event.eventType)}>
                    {event.eventType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  {event.eventTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{event.eventTime}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.description && (
                    <p className="text-gray-600 mt-2">{event.description}</p>
                  )}
                  {event.isRecurring && (
                    <Badge variant="outline" className="mt-2">
                      Recurring
                    </Badge>
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
