import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Receipt, Upload, Download, Eye } from "lucide-react";

interface ReceiptEditorTabProps {
  receipts?: any[];
}

export function ReceiptEditorTab({ receipts = [] }: ReceiptEditorTabProps) {
  const { toast } = useToast();
  const [showAddReceipt, setShowAddReceipt] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);
  const [showEditReceipt, setShowEditReceipt] = useState(false);
  const [showViewReceipt, setShowViewReceipt] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch receipts data
  const { data: receiptsData = [] } = useQuery({
    queryKey: ["/api/admin/receipts"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  const addReceiptMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/receipts", data);
    },
    onSuccess: () => {
      toast({
        title: "Receipt Added",
        description: "Receipt has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
      setShowAddReceipt(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add receipt",
        variant: "destructive",
      });
    },
  });

  const updateReceiptMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...updateData } = data;
      return await apiRequest("PUT", `/api/admin/receipts/${id}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Receipt Updated",
        description: "Receipt has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
      setShowEditReceipt(false);
      setEditingReceipt(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update receipt",
        variant: "destructive",
      });
    },
  });

  const deleteReceiptMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/receipts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Receipt Deleted",
        description: "Receipt has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expenses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete receipt",
        variant: "destructive",
      });
    },
  });

  const handleAddReceipt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      amount: formData.get("amount"),
      category: formData.get("category"),
      vendor: formData.get("vendor"),
      receipt_date: formData.get("receipt_date"),
      description: formData.get("description"),
      payment_method: formData.get("payment_method"),
      tax_amount: formData.get("tax_amount"),
      notes: formData.get("notes"),
    };
    addReceiptMutation.mutate(data);
  };

  const handleEditReceipt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingReceipt.id,
      title: formData.get("title"),
      amount: formData.get("amount"),
      category: formData.get("category"),
      vendor: formData.get("vendor"),
      receipt_date: formData.get("receipt_date"),
      description: formData.get("description"),
      payment_method: formData.get("payment_method"),
      tax_amount: formData.get("tax_amount"),
      notes: formData.get("notes"),
    };
    updateReceiptMutation.mutate(data);
  };

  const handleDeleteReceipt = (id: number) => {
    deleteReceiptMutation.mutate(id);
  };

  const handleEditClick = (receipt: any) => {
    setEditingReceipt(receipt);
    setShowEditReceipt(true);
  };

  const handleViewClick = (receipt: any) => {
    setViewingReceipt(receipt);
    setShowViewReceipt(true);
  };

  // Filter receipts
  const filteredReceipts = (Array.isArray(receiptsData) ? receiptsData : []).filter((receipt: any) => {
    const matchesSearch = searchTerm === "" || 
      receipt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || receipt.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReceipts = filteredReceipts.slice(startIndex, endIndex);

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
    "Food",
    "Equipment",
    "Software",
    "Professional Services",
    "Other"
  ];

  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card", 
    "Check",
    "Bank Transfer",
    "PayPal",
    "Venmo",
    "Zelle",
    "Money Order",
    "Other"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt Editor & Manager
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={showAddReceipt} onOpenChange={setShowAddReceipt}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Receipt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Receipt</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddReceipt} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Receipt Title</Label>
                      <Input id="title" name="title" required placeholder="e.g., Home Depot - Cleaning Supplies" />
                    </div>
                    <div>
                      <Label htmlFor="amount">Total Amount</Label>
                      <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" />
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
                            <SelectItem key={category} value={category.toLowerCase()}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vendor">Vendor/Store</Label>
                      <Input id="vendor" name="vendor" placeholder="e.g., Home Depot, Target" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="receipt_date">Receipt Date</Label>
                      <Input id="receipt_date" name="receipt_date" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select name="payment_method">
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method.toLowerCase().replace(' ', '_')}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tax_amount">Tax Amount (Optional)</Label>
                      <Input id="tax_amount" name="tax_amount" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="description">Short Description</Label>
                      <Input id="description" name="description" placeholder="Brief description of items" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Additional notes, receipt details, or comments" rows={3} />
                  </div>
                  <Button type="submit" disabled={addReceiptMutation.isPending}>
                    {addReceiptMutation.isPending ? "Adding..." : "Add Receipt"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredReceipts.length} receipts
              </span>
            </div>
          </div>

          {/* Receipts List */}
          <div className="space-y-4">
            {currentReceipts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {filteredReceipts.length === 0 ? "No receipts found." : "No receipts match your filters."}
              </p>
            ) : (
              <>
                <div className="grid gap-4">
                  {currentReceipts.map((receipt: any) => (
                    <div key={receipt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{receipt.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {receipt.category || "Uncategorized"}
                          </Badge>
                          {receipt.payment_method && (
                            <Badge variant="secondary" className="text-xs">
                              {receipt.payment_method.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="font-medium">Amount:</span> ${receipt.amount}
                          </div>
                          {receipt.vendor && (
                            <div>
                              <span className="font-medium">Vendor:</span> {receipt.vendor}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Date:</span>{" "}
                            {receipt.receipt_date 
                              ? new Date(receipt.receipt_date).toLocaleDateString()
                              : "N/A"}
                          </div>
                          {receipt.tax_amount && (
                            <div>
                              <span className="font-medium">Tax:</span> ${receipt.tax_amount}
                            </div>
                          )}
                        </div>
                        {receipt.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Description:</span> {receipt.description}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewClick(receipt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(receipt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deleteReceiptMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{receipt.title}"? This action cannot be undone and will permanently remove this receipt from your records.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReceipt(receipt.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleteReceiptMutation.isPending ? "Deleting..." : "Delete Receipt"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredReceipts.length)} of {filteredReceipts.length} receipts
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

      {/* View Receipt Dialog */}
      <Dialog open={showViewReceipt} onOpenChange={setShowViewReceipt}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {viewingReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm">{viewingReceipt.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm font-bold">${viewingReceipt.amount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{viewingReceipt.category || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Vendor</Label>
                  <p className="text-sm">{viewingReceipt.vendor || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">
                    {viewingReceipt.receipt_date 
                      ? new Date(viewingReceipt.receipt_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p className="text-sm">{viewingReceipt.payment_method?.replace('_', ' ') || "N/A"}</p>
                </div>
              </div>
              {viewingReceipt.tax_amount && (
                <div>
                  <Label className="text-sm font-medium">Tax Amount</Label>
                  <p className="text-sm">${viewingReceipt.tax_amount}</p>
                </div>
              )}
              {viewingReceipt.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{viewingReceipt.description}</p>
                </div>
              )}
              {viewingReceipt.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm whitespace-pre-wrap">{viewingReceipt.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Receipt Dialog */}
      <Dialog open={showEditReceipt} onOpenChange={setShowEditReceipt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Receipt</DialogTitle>
          </DialogHeader>
          {editingReceipt && (
            <form onSubmit={handleEditReceipt} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Receipt Title</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    defaultValue={editingReceipt.title} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-amount">Total Amount</Label>
                  <Input 
                    id="edit-amount" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingReceipt.amount} 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select name="category" defaultValue={editingReceipt.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-vendor">Vendor/Store</Label>
                  <Input 
                    id="edit-vendor" 
                    name="vendor" 
                    defaultValue={editingReceipt.vendor || ""} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-receipt_date">Receipt Date</Label>
                  <Input 
                    id="edit-receipt_date" 
                    name="receipt_date" 
                    type="date" 
                    defaultValue={editingReceipt.receipt_date ? 
                      new Date(editingReceipt.receipt_date).toISOString().split('T')[0] : ""} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-payment_method">Payment Method</Label>
                  <Select name="payment_method" defaultValue={editingReceipt.payment_method}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method.toLowerCase().replace(' ', '_')}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-tax_amount">Tax Amount</Label>
                  <Input 
                    id="edit-tax_amount" 
                    name="tax_amount" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingReceipt.tax_amount || ""} 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Short Description</Label>
                  <Input 
                    id="edit-description" 
                    name="description" 
                    defaultValue={editingReceipt.description || ""} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea 
                  id="edit-notes" 
                  name="notes" 
                  defaultValue={editingReceipt.notes || ""} 
                  rows={3} 
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateReceiptMutation.isPending}>
                  {updateReceiptMutation.isPending ? "Updating..." : "Update Receipt"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditReceipt(false)}
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