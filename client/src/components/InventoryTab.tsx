import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface InventoryTabProps {
  items?: any[];
}

export function InventoryTab({ items = [] }: InventoryTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PATCH', `/api/admin/inventory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      toast({ title: "Success", description: "Inventory item updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update inventory item", variant: "destructive" });
    }
  });

  const handleUpdateStock = (item: any) => {
    const newQuantity = prompt(`Enter new stock quantity for ${item.name}:`, item.quantity?.toString() || '0');
    if (newQuantity !== null && !isNaN(Number(newQuantity))) {
      updateInventoryMutation.mutate({ 
        id: item.id, 
        data: { quantity: parseInt(newQuantity) }
      });
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      updateInventoryMutation.mutate({ 
        id: editingItem.id, 
        data: {
          name: editingItem.name,
          description: editingItem.description,
          quantity: editingItem.quantity,
          location: editingItem.location
        }
      });
      setIsDialogOpen(false);
      setEditingItem(null);
    }
  };
  
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleUpdateStock(item)}
                    disabled={updateInventoryMutation.isPending}
                  >
                    Update Stock
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEditItem(item)}
                    disabled={updateInventoryMutation.isPending}
                  >
                    Edit Item
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