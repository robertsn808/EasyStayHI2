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

  // Mutations
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/admin/inquiries/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({
        title: "Success",
        description: "Inquiry updated successfully",
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
        description: "Failed to update inquiry",
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
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="inquiries" className="relative">
              Inquiries
              {newInquiriesCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {newInquiriesCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="todos">Todo List</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inquiries" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Inquiries</h3>
            <Button size="sm">Mark All Read</Button>
          </div>
          <div className="space-y-4">
            {inquiries?.map((inquiry: Inquiry) => (
              <Card key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{inquiry.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{formatDate(inquiry.createdAt!)}</span>
                      <Badge variant={inquiry.status === "new" ? "destructive" : "secondary"}>
                        {inquiry.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div>{inquiry.email}</div>
                    <div>{inquiry.phone}</div>
                  </div>
                  <div className="text-sm mb-3">
                    <span className="font-medium">Interested in:</span> Room {inquiry.roomNumber} - {inquiry.rentalPeriod} rental
                  </div>
                  {inquiry.message && (
                    <p className="text-sm text-gray-700 mb-3">{inquiry.message}</p>
                  )}
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => updateInquiryMutation.mutate({ id: inquiry.id, status: "responded" })}
                      disabled={updateInquiryMutation.isPending}
                    >
                      Respond
                    </Button>
                    <Button size="sm" variant="outline">
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add to Contacts
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateInquiryMutation.mutate({ id: inquiry.id, status: "archived" })}
                      disabled={updateInquiryMutation.isPending}
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      Archive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!inquiries || inquiries.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No inquiries yet.
              </div>
            )}
          </div>
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
