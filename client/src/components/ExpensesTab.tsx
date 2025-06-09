import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, DollarSign, Edit, Trash2, FileText, Download, FileSpreadsheet, File } from "lucide-react";

interface ExpensesTabProps {
  receipts?: any[];
}

export function ExpensesTab({ receipts = [] }: ExpensesTabProps) {
  const { toast } = useToast();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch expenses data
  const { data: expensesData = [] } = useQuery({
    queryKey: ["/api/admin/expenses"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  // Export mutations
  const exportExpensesMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'excel') => {
      const response = await apiRequest("POST", "/api/admin/export/expenses", {
        format,
        data: currentExpenses,
      });
      return response;
    },
    onSuccess: (data: any, format) => {
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        toast({
          title: "Export Successful",
          description: `Expenses ${format.toUpperCase()} has been generated and downloaded.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export expenses",
        variant: "destructive",
      });
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/receipts", data);
    },
    onSuccess: () => {
      toast({
        title: "Expense Added",
        description: "Expense record has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
      setShowAddExpense(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...updateData } = data;
      return await apiRequest("PUT", `/api/admin/receipts/${id}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Expense Updated",
        description: "Expense has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
      setShowEditExpense(false);
      setEditingExpense(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/receipts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Expense Deleted",
        description: "Expense has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      amount: formData.get("amount"),
      category: formData.get("category"),
      vendor: formData.get("vendor"),
      receipt_date: formData.get("receipt_date"),
      description: formData.get("description"),
    };
    addExpenseMutation.mutate(data);
  };

  const handleEditExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingExpense.id,
      title: formData.get("title"),
      amount: formData.get("amount"),
      category: formData.get("category"),
      vendor: formData.get("vendor"),
      receipt_date: formData.get("receipt_date"),
      description: formData.get("description"),
    };
    updateExpenseMutation.mutate(data);
  };

  const handleDeleteExpense = (id: number) => {
    deleteExpenseMutation.mutate(id);
  };

  const handleEditClick = (expense: any) => {
    setEditingExpense(expense);
    setShowEditExpense(true);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Title", "Amount", "Category", "Vendor", "Description"];
    const csvData = currentExpenses.map((expense: any) => [
      expense.receipt_date ? new Date(expense.receipt_date).toLocaleDateString() : "",
      expense.title || "",
      expense.amount || "",
      expense.category || "",
      expense.vendor || "",
      expense.description || ""
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination logic
  const totalPages = Math.ceil(expensesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = expensesData.slice(startIndex, endIndex);

  const getPaginationInfo = () => {
    const start = startIndex + 1;
    const end = Math.min(endIndex, expensesData.length);
    const total = expensesData.length;
    return `${start}-${end} of ${total}`;
  };

  const categoryOptions = [
    "Maintenance",
    "Utilities",
    "Supplies",
    "Cleaning",
    "Repairs",
    "Insurance",
    "Legal",
    "Marketing",
    "Office",
    "Travel",
    "Other"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Expense Management
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={() => exportExpensesMutation.mutate('pdf')} 
              variant="outline"
              disabled={exportExpensesMutation.isPending}
            >
              <File className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              onClick={() => exportExpensesMutation.mutate('excel')} 
              variant="outline"
              disabled={exportExpensesMutation.isPending}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input id="vendor" name="vendor" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="receipt_date">Date</Label>
                  <Input id="receipt_date" name="receipt_date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" />
                </div>
                <Button type="submit" disabled={addExpenseMutation.isPending}>
                  {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentExpenses.length === 0 ? (
              <p className="text-muted-foreground">No expenses recorded.</p>
            ) : (
              <>
                <div className="grid gap-4">
                  {currentExpenses.map((expense: any) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{expense.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {expense.category || "Uncategorized"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Amount: <span className="font-medium">${expense.amount}</span></div>
                          {expense.vendor && <div>Vendor: {expense.vendor}</div>}
                          {expense.receipt_date && (
                            <div>Date: {new Date(expense.receipt_date).toLocaleDateString()}</div>
                          )}
                          {expense.description && <div>Description: {expense.description}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          disabled={deleteExpenseMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {getPaginationInfo()} expenses
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      <Dialog open={showEditExpense} onOpenChange={setShowEditExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <form onSubmit={handleEditExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    defaultValue={editingExpense.title} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input 
                    id="edit-amount" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingExpense.amount} 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select name="category" defaultValue={editingExpense.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-vendor">Vendor</Label>
                  <Input 
                    id="edit-vendor" 
                    name="vendor" 
                    defaultValue={editingExpense.vendor || ""} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-receipt_date">Date</Label>
                <Input 
                  id="edit-receipt_date" 
                  name="receipt_date" 
                  type="date" 
                  defaultValue={editingExpense.receipt_date ? 
                    new Date(editingExpense.receipt_date).toISOString().split('T')[0] : ""} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input 
                  id="edit-description" 
                  name="description" 
                  defaultValue={editingExpense.description || ""} 
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateExpenseMutation.isPending}>
                  {updateExpenseMutation.isPending ? "Updating..." : "Update Expense"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditExpense(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}