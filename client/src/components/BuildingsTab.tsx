import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin, Home, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Building {
  id: number;
  name: string;
  address: string;
  description?: string;
  totalRooms?: number;
  dailyRate?: string;
  weeklyRate?: string;
  monthlyRate?: string;
  createdAt: string;
  updatedAt: string;
}

interface BuildingsTabProps {
  buildings?: Building[];
  rooms?: any[];
}

export function BuildingsTab({ buildings = [], rooms = [] }: BuildingsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: ""
  });

  // Get authenticated buildings data
  const { data: authBuildings } = useQuery({
    queryKey: ["/api/admin/buildings"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  const buildingsData = authBuildings || buildings;

  // Create building mutation
  const createBuildingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/buildings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "admin-authenticated"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create building");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Building Created",
        description: "New building has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buildings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buildings"] });
      setIsCreateDialogOpen(false);
      setFormData({ name: "", address: "", description: "", dailyRate: "", weeklyRate: "", monthlyRate: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update building mutation
  const updateBuildingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/buildings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "admin-authenticated"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update building");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Building Updated",
        description: "Building information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buildings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buildings"] });
      setIsEditDialogOpen(false);
      setEditingBuilding(null);
      setFormData({ name: "", address: "", description: "", dailyRate: "", weeklyRate: "", monthlyRate: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete building mutation
  const deleteBuildingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/buildings/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": "admin-authenticated"
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete building");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Building Deleted",
        description: "Building has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buildings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buildings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateBuilding = () => {
    if (!formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in required fields (name and address).",
        variant: "destructive",
      });
      return;
    }

    createBuildingMutation.mutate(formData);
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      address: building.address,
      description: building.description || "",
      dailyRate: building.dailyRate || "",
      weeklyRate: building.weeklyRate || "",
      monthlyRate: building.monthlyRate || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBuilding = () => {
    if (!editingBuilding || !formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in required fields (name and address).",
        variant: "destructive",
      });
      return;
    }

    updateBuildingMutation.mutate({
      id: editingBuilding.id,
      data: formData
    });
  };

  const handleDeleteBuilding = (id: number) => {
    if (confirm("Are you sure you want to delete this building? This action cannot be undone.")) {
      deleteBuildingMutation.mutate(id);
    }
  };

  const getRoomStats = (buildingId: number) => {
    if (!Array.isArray(rooms)) return { total: 0, available: 0, occupied: 0 };
    
    const buildingRooms = rooms.filter((room: any) => room.buildingId === buildingId);
    const total = buildingRooms.length;
    const available = buildingRooms.filter((room: any) => room.status === 'available').length;
    const occupied = buildingRooms.filter((room: any) => room.status === 'occupied').length;
    
    return { total, available, occupied };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Building Management</h2>
          <p className="text-gray-600">Manage your properties and their details</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Building
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Building</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Building Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 934 Kapahulu Ave"
                />
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., 934 Kapahulu Ave, Honolulu, HI"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Building description..."
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="dailyRate">Daily Rate</Label>
                  <Input
                    id="dailyRate"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="weeklyRate">Weekly Rate</Label>
                  <Input
                    id="weeklyRate"
                    value={formData.weeklyRate}
                    onChange={(e) => setFormData({ ...formData, weeklyRate: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyRate">Monthly Rate</Label>
                  <Input
                    id="monthlyRate"
                    value={formData.monthlyRate}
                    onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                    placeholder="2000"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateBuilding}
                  disabled={createBuildingMutation.isPending}
                  className="flex-1"
                >
                  {createBuildingMutation.isPending ? "Creating..." : "Create Building"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.isArray(buildingsData) && buildingsData.map((building: Building) => {
          const roomStats = getRoomStats(building.id);
          return (
            <Card key={building.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      {building.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {building.address}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditBuilding(building)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteBuilding(building.id)}
                      disabled={deleteBuildingMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {building.description && (
                    <p className="text-sm text-gray-700">{building.description}</p>
                  )}
                  
                  {/* Room Statistics */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Room Statistics</h4>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="p-2 bg-blue-50 rounded text-center">
                        <div className="font-semibold text-blue-800">{roomStats.total}</div>
                        <div className="text-blue-600">Total</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded text-center">
                        <div className="font-semibold text-green-800">{roomStats.available}</div>
                        <div className="text-green-600">Available</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded text-center">
                        <div className="font-semibold text-red-800">{roomStats.occupied}</div>
                        <div className="text-red-600">Occupied</div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  {(building.dailyRate || building.weeklyRate || building.monthlyRate) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Pricing
                      </h4>
                      <div className="flex gap-2 text-sm">
                        {building.dailyRate && (
                          <Badge variant="outline" className="bg-green-50">
                            Daily: ${building.dailyRate}
                          </Badge>
                        )}
                        {building.weeklyRate && (
                          <Badge variant="outline" className="bg-blue-50">
                            Weekly: ${building.weeklyRate}
                          </Badge>
                        )}
                        {building.monthlyRate && (
                          <Badge variant="outline" className="bg-purple-50">
                            Monthly: ${building.monthlyRate}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Building Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Building Name *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 934 Kapahulu Ave"
              />
            </div>
            <div>
              <Label htmlFor="editAddress">Address *</Label>
              <Input
                id="editAddress"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., 934 Kapahulu Ave, Honolulu, HI"
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Building description..."
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="editDailyRate">Daily Rate</Label>
                <Input
                  id="editDailyRate"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="editWeeklyRate">Weekly Rate</Label>
                <Input
                  id="editWeeklyRate"
                  value={formData.weeklyRate}
                  onChange={(e) => setFormData({ ...formData, weeklyRate: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="editMonthlyRate">Monthly Rate</Label>
                <Input
                  id="editMonthlyRate"
                  value={formData.monthlyRate}
                  onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                  placeholder="2000"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdateBuilding}
                disabled={updateBuildingMutation.isPending}
                className="flex-1"
              >
                {updateBuildingMutation.isPending ? "Updating..." : "Update Building"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}