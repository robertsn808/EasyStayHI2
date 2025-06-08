import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PaymentsTabProps {
  payments?: any[];
}

export function PaymentsTab({ payments = [] }: PaymentsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Payment Records</h3>
        <Badge variant="secondary">{payments.length} total</Badge>
      </div>
      
      {payments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No payment records available.
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
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">Update Status</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}