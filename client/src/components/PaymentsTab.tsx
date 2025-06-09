import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, DollarSign, Receipt, FileText, Download } from "lucide-react";

interface PaymentsTabProps {
  payments?: any[];
  showHistoryView?: boolean;
}

export function PaymentsTab({ payments = [], showHistoryView = false }: PaymentsTabProps) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState(showHistoryView ? "payment-history" : "payments");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch receipts data
  const { data: receipts = [] } = useQuery({
    queryKey: ["/api/admin/receipts"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  // Fetch expenses data
  const { data: expensesData = [] } = useQuery({
    queryKey: ["/api/admin/expenses"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/payments", data);
    },
    onSuccess: () => {
      toast({
        title: "Payment Added",
        description: "Payment record has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      setShowAddPayment(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add payment record.",
        variant: "destructive",
      });
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      toast({
        title: "Expense Added",
        description: "Expense record has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
      setShowAddExpense(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense record.",
        variant: "destructive",
      });
    },
  });

  const addReceiptMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/receipts", data);
    },
    onSuccess: () => {
      toast({
        title: "Receipt Generated",
        description: "Receipt has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      setShowAddReceipt(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate receipt.",
        variant: "destructive",
      });
    },
  });

  const generateReceiptForPayment = (payment: any) => {
    const receiptData = {
      title: `Payment Receipt - Room ${payment.roomId}`,
      description: `Payment received for room ${payment.roomId}`,
      amount: payment.amount,
      category: "payment",
      paymentId: payment.id,
      roomId: payment.roomId,
      date: new Date().toISOString().split('T')[0]
    };
    addReceiptMutation.mutate(receiptData);
  };

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/admin/payments/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      return await apiRequest("PUT", `/api/admin/receipts/${expenseData.id}`, expenseData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
      setShowEditExpense(false);
      setEditingExpense(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update expense.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      return await apiRequest("DELETE", `/api/admin/receipts/${expenseId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (paymentId: number, newStatus: string) => {
    updatePaymentStatusMutation.mutate({ id: paymentId, status: newStatus });
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const paymentData = {
      roomId: parseInt(formData.get("roomId") as string),
      amount: parseFloat(formData.get("amount") as string),
      type: formData.get("type") as string,
      status: formData.get("status") as string,
      description: formData.get("description") as string,
    };

    addPaymentMutation.mutate(paymentData);
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const expenseData = {
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
      vendor: formData.get("vendor") as string,
      description: formData.get("description") as string,
      property: formData.get("property") as string,
    };

    addExpenseMutation.mutate(expenseData);
  };



  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Financial Management</h3>
        <div className="flex gap-2">
          <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <Label htmlFor="roomId">Room ID</Label>
                  <Input id="roomId" name="roomId" type="number" required />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="type">Payment Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="deposit">Security Deposit</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="cleaning">Cleaning Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" />
                </div>
                <Button type="submit" className="w-full" disabled={addPaymentMutation.isPending}>
                  {addPaymentMutation.isPending ? "Adding..." : "Add Payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input id="vendor" name="vendor" required />
                </div>
                <div>
                  <Label htmlFor="property">Property</Label>
                  <Select name="property" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="934">Property 934 - Kapahulu Ave</SelectItem>
                      <SelectItem value="949">Property 949 - Kawaiahao St</SelectItem>
                      <SelectItem value="both">Both Properties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" required />
                </div>
                <Button type="submit" className="w-full" disabled={addExpenseMutation.isPending}>
                  {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Expenses ({Array.isArray(expensesData) ? expensesData.length : 0})
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Receipts ({Array.isArray(receipts) ? receipts.length : 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No payment records available. Click "Add Payment" to create your first payment record.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any, index: number) => (
                <Card key={payment.id || index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Payment #{payment.id || index + 1}</CardTitle>
                      <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                        {payment.status || 'pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">${payment.amount || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span>{payment.roomId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>{payment.type || 'Rent'}</span>
                      </div>
                      {payment.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span>{payment.description}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Select onValueChange={(value) => handleStatusUpdate(payment.id, value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={updatePaymentStatusMutation.isPending}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {!Array.isArray(expensesData) || expensesData.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No expense records available. Click "Add Expense" to create your first expense record.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {expensesData.map((expense: any, index: number) => (
                <Card key={expense.id || index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Expense #{expense.id || index + 1}</CardTitle>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        {expense.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-red-600">-${expense.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vendor:</span>
                        <span>{expense.vendor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property:</span>
                        <span>Property {expense.property}</span>
                      </div>
                      {expense.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span>{expense.description}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">View Receipt</Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowEditExpense(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this expense?')) {
                            deleteExpenseMutation.mutate(expense.id);
                          }
                        }}
                        disabled={deleteExpenseMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Generated Receipts</h4>
            <Dialog open={showAddReceipt} onOpenChange={setShowAddReceipt}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Receipt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New Receipt</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const receiptData = {
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    amount: formData.get("amount") as string,
                    category: formData.get("category") as string,
                    date: formData.get("date") as string,
                  };
                  addReceiptMutation.mutate(receiptData);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Receipt Title</Label>
                    <Input id="title" name="title" placeholder="Payment Receipt - Room 01" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" placeholder="Monthly rent payment" required />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" placeholder="500.00" required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="fee">Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={addReceiptMutation.isPending}>
                    {addReceiptMutation.isPending ? "Generating..." : "Generate Receipt"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Expense Dialog */}
          <Dialog open={showEditExpense} onOpenChange={setShowEditExpense}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
              </DialogHeader>
              {editingExpense && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedExpense = {
                    id: editingExpense.id,
                    title: formData.get("title") as string,
                    description: formData.get("description") as string,
                    amount: parseFloat(formData.get("amount") as string),
                    category: formData.get("category") as string,
                    vendor: formData.get("vendor") as string,
                    receipt_date: formData.get("receipt_date") as string,
                  };
                  updateExpenseMutation.mutate(updatedExpense);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Expense Title</Label>
                    <Input 
                      id="edit-title" 
                      name="title" 
                      defaultValue={editingExpense.title || ''} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Input 
                      id="edit-description" 
                      name="description" 
                      defaultValue={editingExpense.description || ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-amount">Amount</Label>
                    <Input 
                      id="edit-amount" 
                      name="amount" 
                      type="number" 
                      step="0.01" 
                      defaultValue={editingExpense.amount || ''} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-vendor">Vendor</Label>
                    <Input 
                      id="edit-vendor" 
                      name="vendor" 
                      defaultValue={editingExpense.vendor || ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select name="category" defaultValue={editingExpense.category || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="repairs">Repairs</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-receipt-date">Date</Label>
                    <Input 
                      id="edit-receipt-date" 
                      name="receipt_date" 
                      type="date" 
                      defaultValue={editingExpense.receipt_date || ''} 
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowEditExpense(false);
                        setEditingExpense(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={updateExpenseMutation.isPending}
                    >
                      {updateExpenseMutation.isPending ? "Updating..." : "Update Expense"}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {!Array.isArray(receipts) || receipts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No receipts generated yet. Click "Generate Receipt" to create your first receipt.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt: any, index: number) => (
                <Card key={receipt.id || index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{receipt.title || `Receipt #${receipt.id || index + 1}`}</CardTitle>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {receipt.category || 'payment'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">${receipt.amount || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{receipt.date || new Date().toLocaleDateString()}</span>
                      </div>
                      {receipt.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span>{receipt.description}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}