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