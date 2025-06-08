import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package } from "lucide-react";
import { useState } from "react";

interface InventoryTabProps {
  items?: any[];
}

export function InventoryTab({ items = [] }: InventoryTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const createInventoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/inventory', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      toast({ title: "Success", description: "Inventory item created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create inventory item", variant: "destructive" });
    }
  });

  const handleCreateItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      quantity: parseInt(formData.get('quantity') as string),
      minQuantity: parseInt(formData.get('minQuantity') as string)
    };
    createInventoryMutation.mutate(data);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Inventory</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{items.length} items</Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning Supplies</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="linens">Linens</SelectItem>
                      <SelectItem value="amenities">Amenities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Current Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="minQuantity">Minimum Quantity</Label>
                    <Input id="minQuantity" name="minQuantity" type="number" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createInventoryMutation.isPending}>
                  {createInventoryMutation.isPending ? "Adding..." : "Add Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {item.name}
                  </CardTitle>
                  <Badge variant="secondary">{item.category || 'General'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {item.description && (
                    <p className="text-gray-600">{item.description}</p>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span>{item.quantity || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min. Quantity:</span>
                    <span>{item.minQuantity || 0}</span>
                  </div>
                  {item.quantity <= item.minQuantity && (
                    <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Update</Button>
                  <Button size="sm" variant="outline">Reorder</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}