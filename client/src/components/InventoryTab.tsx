import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface InventoryTabProps {
  items?: any[];
}

export function InventoryTab({ items = [] }: InventoryTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inventory Management</h3>
        <Badge variant="secondary">{items.length} items</Badge>
      </div>
      
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No inventory items available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <Card key={item.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <Badge variant={item.quantity > 0 ? 'default' : 'destructive'}>
                    {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{item.quantity || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span>{item.category || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{item.location || 'Storage'}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Update Stock</Button>
                  <Button size="sm" variant="outline">Edit Item</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}