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
import { Plus, Package, AlertTriangle } from "lucide-react";

interface InventoryTabProps {
  inventory?: any[];
}

export function InventoryTab({ inventory = [] }: InventoryTabProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const createInventoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/inventory', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      toast({ title: "Success", description: "Inventory item added successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add inventory item", variant: "destructive" });
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
      minQuantity: parseInt(formData.get('minQuantity') as string),
      unit: formData.get('unit'),
      cost: parseFloat(formData.get('cost') as string),
      supplier: formData.get('supplier'),
      location: formData.get('location')
    };
    createInventoryMutation.mutate(data);
  };

  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return { status: 'out-of-stock', color: 'bg-red-100 text-red-800' };
    if (quantity <= minQuantity) return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'in-stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inventory Management</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{inventory.length} items</Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
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
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="office">Office Supplies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" name="unit" placeholder="e.g., pieces, boxes" />
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost">Cost per Unit</Label>
                    <Input id="cost" name="cost" type="number" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input id="supplier" name="supplier" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Storage Location</Label>
                  <Input id="location" name="location" placeholder="e.g., Storage Room A, Basement" />
                </div>
                <Button type="submit" className="w-full" disabled={createInventoryMutation.isPending}>
                  {createInventoryMutation.isPending ? "Adding..." : "Add Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {inventory.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No inventory items tracked. Add your first item above.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item: any, index: number) => {
            const stockStatus = getStockStatus(item.quantity, item.minQuantity);
            return (
              <Card key={item.id || index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    {stockStatus.status !== 'in-stock' && (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <Badge className={stockStatus.color}>
                        {item.quantity} {item.unit}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min. Quantity:</span>
                      <span>{item.minQuantity} {item.unit}</span>
                    </div>
                    {item.cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost per Unit:</span>
                        <span>${item.cost}</span>
                      </div>
                    )}
                    {item.supplier && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supplier:</span>
                        <span>{item.supplier}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{item.location}</span>
                      </div>
                    )}
                    {item.description && (
                      <p className="text-gray-600 mt-2">{item.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">Update Stock</Button>
                    <Button size="sm" variant="outline">Reorder</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
