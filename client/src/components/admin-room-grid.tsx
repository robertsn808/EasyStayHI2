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

  const handleBuildingSubmit = (data: InsertBuilding) => {
    createBuildingMutation.mutate(data);
  };

  const handleRoomSubmit = (data: InsertRoom) => {
    createRoomMutation.mutate(data);
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
        <h3 className="text-xl font-semibold text-gray-900">Room Management</h3>
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
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">Room {room.number}</h4>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="mb-3">
                <Badge className={`px-2 py-1 text-sm rounded-full ${getStatusColor(room.status)}`}>
                  {getStatusText(room.status)}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                <div>Last cleaned: {formatDate(room.lastCleaned)}</div>
                {room.tenantName && <div>Tenant: {room.tenantName}</div>}
                <div>Next payment: {formatDate(room.nextPaymentDue)}</div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1 bg-primary text-white hover:bg-blue-700">
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  {room.status === "available" ? "Clean" : "View"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}