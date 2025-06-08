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
import { Plus, Edit, Trash2, MapPin, Home, DollarSign, Building } from "lucide-react";
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

interface Room {
  id: number;
  number: string;
  buildingId: number;
  status: string;
  tenantName?: string;
  nextPaymentDue?: string;
  rentalRate?: string;
  rentalPeriod?: string;
  size?: string;
  floor?: number;
  lastCleaned?: string;
  createdAt: string;
}

interface PropertiesTabProps {
  buildings?: Building[];
  rooms?: Room[];
}

export function PropertiesTab({ buildings = [], rooms = [] }: PropertiesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBuildingDialogOpen, setIsBuildingDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  
  const [buildingForm, setBuildingForm] = useState({
    name: "",
    address: "",
    description: "",
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: ""
  });

  const [roomForm, setRoomForm] = useState({
    number: "",
    buildingId: "",
    size: "",
    floor: "",
    status: "available"
  });

  // Get authenticated data
  const { data: authBuildings } = useQuery({
    queryKey: ["/api/admin/buildings"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  const { data: authRooms } = useQuery({
    queryKey: ["/api/rooms"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  const buildingsData = authBuildings || buildings;
  const roomsData = authRooms || rooms;

  // Building mutations
  const createBuildingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/buildings", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Building created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buildings"] });
      setIsBuildingDialogOpen(false);
      setBuildingForm({
        name: "",
        address: "",
        description: "",
        dailyRate: "",
        weeklyRate: "",
        monthlyRate: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create building",
        variant: "destructive",
      });
    },
  });

  const updateBuildingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", `/api/admin/buildings/${editingBuilding?.id}`, data, {
        headers: { "x-admin-token": "admin-authenticated" }
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Building updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buildings"] });
      setIsEditDialogOpen(false);
      setEditingBuilding(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update building",
        variant: "destructive",
      });
    },
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/buildings/${id}`, undefined, {
        headers: { "x-admin-token": "admin-authenticated" }
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Building deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/buildings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete building",
        variant: "destructive",
      });
    },
  });

  // Room mutations
  const createRoomMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/rooms", data, {
        headers: { "x-admin-token": "admin-authenticated" }
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Room created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setIsRoomDialogOpen(false);
      setRoomForm({
        number: "",
        buildingId: "",
        size: "",
        floor: "",
        status: "available"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    },
  });

  const handleBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBuilding) {
      updateBuildingMutation.mutate(buildingForm);
    } else {
      createBuildingMutation.mutate(buildingForm);
    }
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoomMutation.mutate({
      ...roomForm,
      buildingId: parseInt(roomForm.buildingId),
      floor: roomForm.floor ? parseInt(roomForm.floor) : null
    });
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setBuildingForm({
      name: building.name,
      address: building.address,
      description: building.description || "",
      dailyRate: building.dailyRate || "",
      weeklyRate: building.weeklyRate || "",
      monthlyRate: building.monthlyRate || ""
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'needs_cleaning': return 'bg-orange-100 text-orange-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomsForBuilding = (buildingId: number) => {
    return Array.isArray(roomsData) ? roomsData.filter((room: Room) => room.buildingId === buildingId) : [];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties & Buildings</h2>
          <p className="text-gray-600">Manage buildings and rooms across all EasyStay properties</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isBuildingDialogOpen} onOpenChange={setIsBuildingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Building
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Building</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBuildingSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Building Name</Label>
                  <Input
                    id="name"
                    value={buildingForm.name}
                    onChange={(e) => setBuildingForm({...buildingForm, name: e.target.value})}
                    placeholder="e.g., 934 Kapahulu Ave"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={buildingForm.address}
                    onChange={(e) => setBuildingForm({...buildingForm, address: e.target.value})}
                    placeholder="Full property address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={buildingForm.description}
                    onChange={(e) => setBuildingForm({...buildingForm, description: e.target.value})}
                    placeholder="Property description"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dailyRate">Daily Rate</Label>
                    <Input
                      id="dailyRate"
                      value={buildingForm.dailyRate}
                      onChange={(e) => setBuildingForm({...buildingForm, dailyRate: e.target.value})}
                      placeholder="$100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weeklyRate">Weekly Rate</Label>
                    <Input
                      id="weeklyRate"
                      value={buildingForm.weeklyRate}
                      onChange={(e) => setBuildingForm({...buildingForm, weeklyRate: e.target.value})}
                      placeholder="$500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyRate">Monthly Rate</Label>
                    <Input
                      id="monthlyRate"
                      value={buildingForm.monthlyRate}
                      onChange={(e) => setBuildingForm({...buildingForm, monthlyRate: e.target.value})}
                      placeholder="$2000"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={createBuildingMutation.isPending}>
                  {createBuildingMutation.isPending ? "Creating..." : "Create Building"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRoomSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={roomForm.number}
                    onChange={(e) => setRoomForm({...roomForm, number: e.target.value})}
                    placeholder="e.g., 001, 002"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buildingSelect">Building</Label>
                  <select
                    id="buildingSelect"
                    value={roomForm.buildingId}
                    onChange={(e) => setRoomForm({...roomForm, buildingId: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a building</option>
                    {Array.isArray(buildingsData) && buildingsData.map((building: Building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="size">Room Size</Label>
                  <Input
                    id="size"
                    value={roomForm.size}
                    onChange={(e) => setRoomForm({...roomForm, size: e.target.value})}
                    placeholder="e.g., Studio, 1BR"
                  />
                </div>
                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({...roomForm, floor: e.target.value})}
                    placeholder="1"
                  />
                </div>
                <Button type="submit" disabled={createRoomMutation.isPending}>
                  {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Buildings Grid */}
      <div className="grid gap-6">
        {Array.isArray(buildingsData) && buildingsData.map((building: Building) => {
          const buildingRooms = getRoomsForBuilding(building.id);
          const availableRooms = buildingRooms.filter(r => r.status === 'available').length;
          const occupiedRooms = buildingRooms.filter(r => r.status === 'occupied').length;
          const needsCleaningRooms = buildingRooms.filter(r => r.status === 'needs_cleaning').length;

          return (
            <Card key={building.id} className="shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Building className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">{building.name}</CardTitle>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {building.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBuilding(building)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBuildingMutation.mutate(building.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Building Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{buildingRooms.length}</div>
                    <div className="text-sm text-gray-600">Total Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{occupiedRooms}</div>
                    <div className="text-sm text-gray-600">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{needsCleaningRooms}</div>
                    <div className="text-sm text-gray-600">Cleaning</div>
                  </div>
                </div>

                {/* Pricing Info */}
                {(building.dailyRate || building.weeklyRate || building.monthlyRate) && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Pricing
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {building.dailyRate && (
                        <div>
                          <span className="text-gray-600">Daily:</span>
                          <span className="font-semibold ml-2">${building.dailyRate}</span>
                        </div>
                      )}
                      {building.weeklyRate && (
                        <div>
                          <span className="text-gray-600">Weekly:</span>
                          <span className="font-semibold ml-2">${building.weeklyRate}</span>
                        </div>
                      )}
                      {building.monthlyRate && (
                        <div>
                          <span className="text-gray-600">Monthly:</span>
                          <span className="font-semibold ml-2">${building.monthlyRate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rooms Grid */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    Rooms ({buildingRooms.length})
                  </h4>
                  {buildingRooms.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {buildingRooms.map((room: Room) => (
                        <Card key={room.id} className="p-3 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold">Room {room.number}</div>
                            <Badge className={getStatusColor(room.status)}>
                              {room.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {room.size && <div>Size: {room.size}</div>}
                            {room.floor && <div>Floor: {room.floor}</div>}
                            {room.tenantName && <div>Tenant: {room.tenantName}</div>}
                            {room.rentalRate && <div>Rate: ${room.rentalRate}</div>}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No rooms in this building</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setSelectedBuildingId(building.id);
                          setRoomForm({...roomForm, buildingId: building.id.toString()});
                          setIsRoomDialogOpen(true);
                        }}
                      >
                        Add First Room
                      </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Building</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBuildingSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editName">Building Name</Label>
              <Input
                id="editName"
                value={buildingForm.name}
                onChange={(e) => setBuildingForm({...buildingForm, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="editAddress">Address</Label>
              <Input
                id="editAddress"
                value={buildingForm.address}
                onChange={(e) => setBuildingForm({...buildingForm, address: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={buildingForm.description}
                onChange={(e) => setBuildingForm({...buildingForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editDailyRate">Daily Rate</Label>
                <Input
                  id="editDailyRate"
                  value={buildingForm.dailyRate}
                  onChange={(e) => setBuildingForm({...buildingForm, dailyRate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editWeeklyRate">Weekly Rate</Label>
                <Input
                  id="editWeeklyRate"
                  value={buildingForm.weeklyRate}
                  onChange={(e) => setBuildingForm({...buildingForm, weeklyRate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editMonthlyRate">Monthly Rate</Label>
                <Input
                  id="editMonthlyRate"
                  value={buildingForm.monthlyRate}
                  onChange={(e) => setBuildingForm({...buildingForm, monthlyRate: e.target.value})}
                />
              </div>
            </div>
            <Button type="submit" disabled={updateBuildingMutation.isPending}>
              {updateBuildingMutation.isPending ? "Updating..." : "Update Building"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}