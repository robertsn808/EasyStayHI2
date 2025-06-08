import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Download, Eye } from "lucide-react";
import { useState } from "react";

interface ReceiptsTabProps {
  receipts?: any[];
}

export function ReceiptsTab({ receipts = [] }: ReceiptsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const downloadReceiptMutation = useMutation({
    mutationFn: async (receiptId: number) => {
      return apiRequest('GET', `/api/admin/receipts/${receiptId}/download`);
    },
    onSuccess: (data, receiptId) => {
      // Create downloadable link
      const link = document.createElement('a');
      link.href = data.downloadUrl || '#';
      link.download = `receipt-${receiptId}.pdf`;
      link.click();
      toast({ title: "Success", description: "Receipt downloaded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to download receipt", variant: "destructive" });
    }
  });

  const viewReceiptMutation = useMutation({
    mutationFn: async (receiptId: number) => {
      return apiRequest('GET', `/api/admin/receipts/${receiptId}/view`);
    },
    onSuccess: (data) => {
      window.open(data.viewUrl, '_blank');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to view receipt", variant: "destructive" });
    }
  });

  const handleDownloadReceipt = (receiptId: number) => {
    setDownloadingId(receiptId);
    downloadReceiptMutation.mutate(receiptId);
  };

  const handleViewReceipt = (receiptId: number) => {
    viewReceiptMutation.mutate(receiptId);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Receipt Management</h3>
        <Badge variant="secondary">{receipts.length} receipts</Badge>
      </div>
      
      {receipts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No receipts available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt: any, index: number) => (
            <Card key={receipt.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Receipt #{receipt.id || index + 1}</CardTitle>
                  <Badge variant="outline">{receipt.category || 'Expense'}</Badge>
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
                    <span>{new Date(receipt.date || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span>{receipt.vendor || 'N/A'}</span>
                  </div>
                </div>
                <p className="text-sm mt-2">{receipt.description}</p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleViewReceipt(receipt.id)}
                    disabled={viewReceiptMutation.isPending}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Receipt
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDownloadReceipt(receipt.id)}
                    disabled={downloadReceiptMutation.isPending || downloadingId === receipt.id}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {downloadingId === receipt.id ? 'Downloading...' : 'Download'}
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
import { Plus, Receipt, Download, Eye } from "lucide-react";

interface ReceiptsTabProps {
  receipts?: any[];
}

export function ReceiptsTab({ receipts = [] }: ReceiptsTabProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const createReceiptMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/receipts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/receipts'] });
      toast({ title: "Success", description: "Receipt added successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add receipt", variant: "destructive" });
    }
  });

  const handleCreateReceipt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      amount: parseFloat(formData.get('amount') as string),
      vendor: formData.get('vendor'),
      category: formData.get('category'),
      description: formData.get('description'),
      receiptDate: formData.get('receiptDate'),
      paymentMethod: formData.get('paymentMethod'),
      property: formData.get('property')
    };
    createReceiptMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'utilities': return 'bg-blue-100 text-blue-800';
      case 'supplies': return 'bg-green-100 text-green-800';
      case 'insurance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Receipt Management</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {receipts.length} receipts • $
            {receipts.reduce((sum, receipt) => sum + parseFloat(receipt.amount || 0), 0).toFixed(2)} total
          </Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Receipt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Receipt</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateReceipt} className="space-y-4">
                <div>
                  <Label htmlFor="title">Receipt Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="receiptDate">Date</Label>
                    <Input id="receiptDate" name="receiptDate" type="date" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor/Supplier</Label>
                  <Input id="vendor" name="vendor" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select name="paymentMethod">
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="debit">Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="property">Property</Label>
                  <Select name="property">
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="934">934 Kapahulu Ave</SelectItem>
                      <SelectItem value="949">949 Kawaiahao St</SelectItem>
                      <SelectItem value="both">Both Properties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <Button type="submit" className="w-full" disabled={createReceiptMutation.isPending}>
                  {createReceiptMutation.isPending ? "Adding..." : "Add Receipt"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {receipts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No receipts recorded. Add your first receipt above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt: any, index: number) => (
            <Card key={receipt.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{receipt.title || `Receipt #${receipt.id}`}</CardTitle>
                      <p className="text-sm text-gray-600">{receipt.vendor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${receipt.amount}</div>
                    <Badge className={getCategoryColor(receipt.category)}>
                      {receipt.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{formatDate(receipt.receiptDate || receipt.createdAt)}</span>
                  </div>
                  {receipt.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="capitalize">{receipt.paymentMethod}</span>
                    </div>
                  )}
                  {receipt.property && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span>Property {receipt.property}</span>
                    </div>
                  )}
                  {receipt.description && (
                    <p className="text-gray-600 mt-2">{receipt.description}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
