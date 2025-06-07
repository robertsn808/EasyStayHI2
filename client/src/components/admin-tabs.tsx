import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Download, 
  Printer, 
  UserPlus, 
  Plus, 
  Archive,
  CheckCircle,
  Trash2,
  Edit
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Inquiry, Contact, CalendarEvent, InventoryItem, Receipt, Todo } from "@shared/schema";

export default function AdminTabs() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("inquiries");

  // Fetch data for each tab
  const { data: inquiries } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: contacts } = useQuery({
    queryKey: ["/api/admin/contacts"],
  });

  const { data: calendarEvents } = useQuery({
    queryKey: ["/api/admin/calendar"],
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/admin/inventory"],
  });

  const { data: receipts } = useQuery({
    queryKey: ["/api/admin/receipts"],
  });

  const { data: todos } = useQuery({
    queryKey: ["/api/admin/todos"],
  });

    const { data: maintenanceRequests } = useQuery({
    queryKey: ["/api/admin/maintenance"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  // Update inquiry status mutation
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/inquiries/${id}`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({
        title: "Success",
        description: "Inquiry status updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update inquiry status.",
        variant: "destructive",
      });
    },
  });

  // Update maintenance request mutation
  const updateMaintenanceMutation = useMutation({
    mutationFn: async ({ id, status, assignedTo }: { id: number; status: string; assignedTo?: string }) => {
      const response = await apiRequest("PUT", `/api/admin/maintenance/${id}`, { status, assignedTo });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/maintenance"] });
      toast({
        title: "Success",
        description: "Maintenance request updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update maintenance request.",
        variant: "destructive",
      });
    },
  });

  // Update payment status mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/payments/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({
        title: "Success",
        description: "Payment status updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      await apiRequest("PUT", `/api/admin/todos/${id}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/todos"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/todos"] });
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const newInquiriesCount = inquiries?.filter((inquiry: Inquiry) => inquiry.status === "new").length || 0;

  return (
    <Card className="shadow-sm">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="inquiries" className="relative">
              Inquiries
              {newInquiriesCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {newInquiriesCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="todos">Todo List</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inquiries" className="p-6">
          <InquiriesTab inquiries={inquiries} onUpdateStatus={updateInquiryMutation.mutate} />
        </TabsContent>

        <TabsContent value="maintenance" className="p-6">
            <MaintenanceTab requests={maintenanceRequests} onUpdate={updateMaintenanceMutation.mutate} />
          </TabsContent>

          <TabsContent value="payments" className="p-6">
            <PaymentsTab payments={payments} onUpdateStatus={updatePaymentMutation.mutate} />
          </TabsContent>

        <TabsContent value="contacts" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Contact List</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts?.map((contact: Contact) => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{contact.email}</div>
                      <div>{contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={contact.status === "current_tenant" ? "default" : "secondary"}>
                        {contact.status?.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(contact.lastContact)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button size="sm" variant="ghost" className="mr-3">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!contacts || contacts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No contacts yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Calendar</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">{day}</div>
            ))}
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date();
              date.setDate(date.getDate() + index);
              const dayEvents = calendarEvents?.filter((event: CalendarEvent) => 
                new Date(event.date).toDateString() === date.toDateString()
              ) || [];

              return (
                <Card key={index} className="min-h-32 hover:bg-gray-50 transition-colors">
                  <CardContent className="p-3">
                    <div className="font-semibold text-sm text-gray-900 mb-2">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event: CalendarEvent) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded ${
                            event.type === "cleaning" ? "bg-blue-100 text-blue-800" :
                            event.type === "payment" ? "bg-green-100 text-green-800" :
                            event.type === "maintenance" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Supply Inventory</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory?.map((item: InventoryItem) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <span className="text-sm text-gray-500">{item.category}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <div>Quantity: <span className={`font-medium ${item.quantity <= item.minimumQuantity ? 'text-red-600' : ''}`}>{item.quantity}</span></div>
                    <div>Minimum: <span className="font-medium">{item.minimumQuantity}</span></div>
                    <div>Location: <span className="font-medium">{item.location}</span></div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant={item.quantity <= item.minimumQuantity ? "destructive" : "outline"}
                      className="flex-1"
                    >
                      {item.quantity <= item.minimumQuantity ? "Low Stock" : "Restock"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!inventory || inventory.length === 0) && (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No inventory items yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="receipts" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Receipts & Invoices</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Receipt
            </Button>
          </div>
          <div className="space-y-4">
            {receipts?.map((receipt: Receipt) => (
              <Card key={receipt.id} className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{receipt.receiptNumber}</h4>
                      <p className="text-sm text-gray-600">{receipt.description}</p>
                    </div>
                    <span className="text-lg font-semibold text-green-600">${receipt.amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>{receipt.tenantName}</span>
                    <span>{formatDate(receipt.paymentDate)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Printer className="w-4 h-4 mr-1" />
                      Print
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!receipts || receipts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No receipts yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="todos" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Todo List</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
          <div className="space-y-3">
            {todos?.map((todo: Todo) => (
              <Card key={todo.id} className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={(e) => toggleTodoMutation.mutate({ 
                        id: todo.id, 
                        isCompleted: e.target.checked 
                      })}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <h4 className={`font-medium text-gray-900 ${todo.isCompleted ? 'line-through' : ''}`}>
                        {todo.title}
                      </h4>
                      {todo.description && (
                        <p className="text-sm text-gray-500">{todo.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{formatDate(todo.dueDate)}</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTodoMutation.mutate(todo.id)}
                      disabled={deleteTodoMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!todos || todos.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No todos yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function InquiriesTab({ inquiries, onUpdateStatus }: { inquiries: Inquiry[], onUpdateStatus: (data: { id: number; status: string }) => void }) {
  if (!inquiries || inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No inquiries yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{inquiry.name}</h3>
                <p className="text-sm text-gray-600">{inquiry.email}</p>
                {inquiry.phone && <p className="text-sm text-gray-600">{inquiry.phone}</p>}
              </div>
              <Badge variant={inquiry.status === "new" ? "destructive" : inquiry.status === "responded" ? "default" : "secondary"}>
                {inquiry.status}
              </Badge>
            </div>
            <div className="space-y-2 mb-4">
              <p><strong>Room:</strong> {inquiry.roomNumber || "Any available"}</p>
              <p><strong>Rental Period:</strong> {inquiry.rentalPeriod || "Not specified"}</p>
              <p><strong>Move-in Date:</strong> {inquiry.moveInDate ? new Date(inquiry.moveInDate).toLocaleDateString() : "Flexible"}</p>
              {inquiry.message && <p><strong>Message:</strong> {inquiry.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUpdateStatus({ id: inquiry.id, status: "responded" })}
                disabled={inquiry.status === "responded"}
              >
                Mark as Responded
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUpdateStatus({ id: inquiry.id, status: "archived" })}
                disabled={inquiry.status === "archived"}
              >
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MaintenanceTab({ requests, onUpdate }: { requests: any[], onUpdate: (data: any) => void }) {
  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No maintenance requests yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((item) => {
        const request = item.request;
        const room = item.room;
        return (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{request.title}</h3>
                  <p className="text-sm text-gray-600">Room {room?.number} - {item.building?.name}</p>
                  <p className="text-sm text-gray-500">Submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={request.priority === 'urgent' ? 'destructive' : 'secondary'}>
                    {request.priority}
                  </Badge>
                  <Badge variant={request.status === 'completed' ? 'default' : 'outline'}>
                    {request.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <p><strong>Description:</strong> {request.description}</p>
                {request.assignedTo && <p><strong>Assigned to:</strong> {request.assignedTo}</p>}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onUpdate({ id: request.id, status: "in_progress" })}
                  disabled={request.status === "completed"}
                >
                  Start Work
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onUpdate({ id: request.id, status: "completed" })}
                  disabled={request.status === "completed"}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PaymentsTab({ payments, onUpdateStatus }: { payments: any[], onUpdateStatus: (data: { id: number; status: string }) => void }) {
  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No payment records yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((item) => {
        const payment = item.payment;
        const room = item.room;
        return (
          <Card key={payment.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">${payment.amount}</h3>
                  <p className="text-sm text-gray-600">Room {room?.number}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>
                </div>
                <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'failed' ? 'destructive' : 'outline'}>
                  {payment.status}
                </Badge>
              </div>
              <div className="space-y-2 mb-4">
                <p><strong>Method:</strong> {payment.paymentMethod}</p>
                {payment.notes && <p><strong>Notes:</strong> {payment.notes}</p>}
                {payment.receiptUrl && (
                  <p>
                    <strong>Receipt:</strong> 
                    <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                      View Receipt
                    </a>
                  </p>
                )}
              </div>
              {payment.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onUpdateStatus({ id: payment.id, status: "completed" })}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onUpdateStatus({ id: payment.id, status: "failed" })}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}