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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, CheckSquare, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import WeeklyCalendar from "@/components/WeeklyCalendar";

interface CalendarTabProps {
  events?: any[];
}

export function CalendarTab({ events = [] }: CalendarTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddTodoDialogOpen, setIsAddTodoDialogOpen] = useState(false);

  const isAdminAuthenticated = localStorage.getItem('admin-authenticated') === 'true';

  // Fetch todos
  const { data: todos } = useQuery({
    queryKey: ["/api/admin/todos"],
    enabled: isAdminAuthenticated,
  });

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

  const createTodoMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/todos', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/todos'] });
      toast({ title: "Success", description: "Todo created successfully" });
      setIsAddTodoDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create todo", variant: "destructive" });
    }
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PATCH', `/api/admin/todos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/todos'] });
      toast({ title: "Success", description: "Todo updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update todo", variant: "destructive" });
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/todos'] });
      toast({ title: "Success", description: "Todo deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete todo", variant: "destructive" });
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

  const handleCreateTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate') || null,
      assignedTo: formData.get('assignedTo') || null
    };
    createTodoMutation.mutate(data);
  };

  const handleToggleTodo = (todo: any) => {
    updateTodoMutation.mutate({
      id: todo.id,
      data: { completed: !todo.completed }
    });
  };

  const handleDeleteTodo = (id: number) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      deleteTodoMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar & Schedule Management</h2>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isAddTodoDialogOpen} onOpenChange={setIsAddTodoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <CheckSquare className="w-4 h-4 mr-1" />
                Add Todo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Todo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTodo} className="space-y-4">
                <div>
                  <Label htmlFor="todo-title">Title</Label>
                  <Input id="todo-title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="todo-description">Description</Label>
                  <Textarea id="todo-description" name="description" />
                </div>
                <div>
                  <Label htmlFor="todo-priority">Priority</Label>
                  <Select name="priority" defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="todo-dueDate">Due Date (Optional)</Label>
                  <Input id="todo-dueDate" name="dueDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="todo-assignedTo">Assigned To (Optional)</Label>
                  <Input id="todo-assignedTo" name="assignedTo" placeholder="Enter name" />
                </div>
                <Button type="submit" className="w-full" disabled={createTodoMutation.isPending}>
                  {createTodoMutation.isPending ? "Adding..." : "Add Todo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="mb-6">
        <WeeklyCalendar events={events} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Events Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendar Events
              <Badge variant="secondary">{events.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No events scheduled. Add your first event above.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event: any, index: number) => (
                  <div key={event.id || index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Todo List Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Todo List
              <Badge variant="secondary">{Array.isArray(todos) ? todos.length : 0} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(!Array.isArray(todos) || todos.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                No todos created. Add your first todo above.
              </div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo: any) => (
                  <div key={todo.id} className={`p-3 border rounded-lg ${todo.completed ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${
                            todo.priority === 'urgent' ? 'border-red-300 text-red-700' :
                            todo.priority === 'normal' ? 'border-blue-300 text-blue-700' :
                            'border-gray-300 text-gray-700'
                          }`}>
                            {todo.priority}
                          </Badge>
                          {todo.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {todo.assignedTo && (
                            <span className="text-xs text-gray-500">
                              Assigned to: {todo.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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