import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReceiptsTabProps {
  receipts?: any[];
}

export function ReceiptsTab({ receipts = [] }: ReceiptsTabProps) {
  const { toast } = useToast();
  
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
                  <Button size="sm" variant="outline">View Receipt</Button>
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