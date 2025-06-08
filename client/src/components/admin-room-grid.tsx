import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, Calendar, Users, DollarSign, QrCode, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Room, InsertBuilding, InsertRoom } from "@shared/schema";
import { insertBuildingSchema, insertRoomSchema } from "@shared/schema";

interface AdminRoomGridProps {
  rooms: Room[];
}

export default function AdminRoomGrid({ rooms }: AdminRoomGridProps) {
  const { toast } = useToast();
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch buildings for room creation
  const { data: buildings = [] } = useQuery<any[]>({
    queryKey: ["/api/buildings"],
  });

  // Building form
  const buildingForm = useForm<InsertBuilding>({
    defaultValues: {
      name: "",
      address: "",
    },
  });

  // Room form
  const roomForm = useForm<InsertRoom>({
    defaultValues: {
      number: "",
      buildingId: undefined,
      status: "available",
      rentalRate: "0",
      rentalPeriod: "monthly",
      floor: 1,
    },
  });

  // Create building mutation
  const createBuildingMutation = useMutation({
    mutationFn: async (data: InsertBuilding) => {
      const response = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create building");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Building created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/buildings"] });
      setShowBuildingDialog(false);
      buildingForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create building",
        variant: "destructive",
      });
    },
  });

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (data: InsertRoom) => {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create room");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rooms"] });
      setShowRoomDialog(false);
      roomForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    },
  });

  // Update room status mutation
  const updateRoomMutation = useMutation({
    mutationFn: async ({ roomId, status }: { roomId: number; status: string }) => {
      const response = await fetch(`/api/admin/rooms/${roomId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-token": "admin-authenticated"
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update room status");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rooms"] });
      setShowEditDialog(false);
      setEditingRoom(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      });
    },
  });

  const handleBuildingSubmit = (data: InsertBuilding) => {
    createBuildingMutation.mutate(data);
  };

  const handleRoomSubmit = (data: InsertRoom) => {
    createRoomMutation.mutate(data);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowEditDialog(true);
  };

  const handleStatusUpdate = (status: string) => {
    if (editingRoom) {
      updateRoomMutation.mutate({ roomId: editingRoom.id, status });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "needs_cleaning":
        return "bg-orange-100 text-orange-800";
      case "out_of_service":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "occupied":
        return "Occupied";
      case "needs_cleaning":
        return "Needs Cleaning";
      case "out_of_service":
        return "Out of Service";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Room Status Overview</h3>
        <div className="flex space-x-2">
          <Dialog open={showBuildingDialog} onOpenChange={setShowBuildingDialog}>
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
              <form onSubmit={buildingForm.handleSubmit(handleBuildingSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Building Name</Label>
                  <Input
                    id="name"
                    {...buildingForm.register("name")}
                    placeholder="e.g., 934 Main Building"
                  />
                  {buildingForm.formState.errors.name && (
                    <p className="text-red-500 text-sm">{buildingForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...buildingForm.register("address")}
                    placeholder="e.g., 934 Main Street, Honolulu, HI"
                  />
                  {buildingForm.formState.errors.address && (
                    <p className="text-red-500 text-sm">{buildingForm.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowBuildingDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createBuildingMutation.isPending}
                    className="bg-primary text-white hover:bg-blue-700"
                  >
                    {createBuildingMutation.isPending ? "Creating..." : "Create Building"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
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
              <form onSubmit={roomForm.handleSubmit(handleRoomSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="buildingId">Building</Label>
                  <Select
                    value={roomForm.watch("buildingId")?.toString()}
                    onValueChange={(value) => roomForm.setValue("buildingId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                    <SelectContent>
                      {(buildings as any[]).map((building: any) => (
                        <SelectItem key={building.id} value={building.id.toString()}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {roomForm.formState.errors.buildingId && (
                    <p className="text-red-500 text-sm">{roomForm.formState.errors.buildingId.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="number">Room Number</Label>
                  <Input
                    id="number"
                    {...roomForm.register("number")}
                    placeholder="e.g., 101"
                  />
                  {roomForm.formState.errors.number && (
                    <p className="text-red-500 text-sm">{roomForm.formState.errors.number.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="rentalRate">Monthly Rent ($)</Label>
                  <Input
                    id="rentalRate"
                    type="number"
                    {...roomForm.register("rentalRate")}
                    placeholder="e.g., 2000"
                  />
                  {roomForm.formState.errors.rentalRate && (
                    <p className="text-red-500 text-sm">{roomForm.formState.errors.rentalRate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={roomForm.watch("status")}
                    onValueChange={(value) => roomForm.setValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="needs_cleaning">Needs Cleaning</SelectItem>
                      <SelectItem value="out_of_service">Out of Service</SelectItem>
                    </SelectContent>
                  </Select>
                  {roomForm.formState.errors.status && (
                    <p className="text-red-500 text-sm">{roomForm.formState.errors.status.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowRoomDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createRoomMutation.isPending}
                    className="bg-primary text-white hover:bg-blue-700"
                  >
                    {createRoomMutation.isPending ? "Creating..." : "Create Room"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Room Status Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Room {editingRoom?.number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-2">
                    <Badge className={`px-2 py-1 text-sm rounded-full ${getStatusColor(editingRoom?.status || '')}`}>
                      {getStatusText(editingRoom?.status || '')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Change Status To</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={editingRoom?.status === "available" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate("available")}
                      disabled={updateRoomMutation.isPending}
                    >
                      Available
                    </Button>
                    <Button
                      variant={editingRoom?.status === "occupied" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate("occupied")}
                      disabled={updateRoomMutation.isPending}
                    >
                      Occupied
                    </Button>
                    <Button
                      variant={editingRoom?.status === "needs_cleaning" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate("needs_cleaning")}
                      disabled={updateRoomMutation.isPending}
                    >
                      Needs Cleaning
                    </Button>
                    <Button
                      variant={editingRoom?.status === "out_of_service" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate("out_of_service")}
                      disabled={updateRoomMutation.isPending}
                    >
                      Out of Service
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Simplified Room Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEditRoom(room)}>
            <CardContent className="p-3">
              <div className="text-center">
                <h4 className="font-bold text-lg mb-2">{room.number}</h4>
                <Badge className={`px-2 py-1 text-xs rounded-full ${getStatusColor(room.status)} mb-2 block`}>
                  {getStatusText(room.status)}
                </Badge>
                {room.tenantName && (
                  <div className="text-xs text-gray-600 mb-1 truncate">
                    {room.tenantName}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  ${room.rentalRate || '2000'}/mo
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Room Statistics Summary */}
      <div className="mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {rooms.filter(r => r.status === 'available').length}
            </div>
            <div className="text-sm text-green-700">Available</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {rooms.filter(r => r.status === 'occupied').length}
            </div>
            <div className="text-sm text-red-700">Occupied</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {rooms.filter(r => r.status === 'needs_cleaning').length}
            </div>
            <div className="text-sm text-orange-700">Needs Cleaning</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {rooms.filter(r => r.status === 'out_of_service').length}
            </div>
            <div className="text-sm text-yellow-700">Maintenance</div>
          </div>
        </div>
      </div>
    </div>
  );
}