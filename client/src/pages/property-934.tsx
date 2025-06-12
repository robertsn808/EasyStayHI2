import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Users, Wrench, DollarSign, MessageCircle, Calendar, QrCode } from "lucide-react";
import { Link } from "wouter";

export default function Property934() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{roomId: number, qrCode: string} | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Fetch real data from database
  const { data: buildings = [] } = useQuery({
    queryKey: ['/api/buildings'],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/rooms'],
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['/api/maintenance-requests'],
  });

  const { data: guestProfiles = [] } = useQuery({
    queryKey: ['/api/guest-profiles'],
  });

  // Find the building for property 934
  const building = buildings.find((b: any) => b.name === "934 Kapahulu Ave" || b.address?.includes("934"));
  const buildingRooms = rooms.filter((r: any) => r.buildingId === building?.id);
  
  const propertyData = {
    id: building?.id || 934,
    address: building?.address || "934 Kapahulu Ave",
    totalRooms: buildingRooms.length,
    occupiedRooms: buildingRooms.filter((r: any) => r.status === "occupied").length,
    availableRooms: buildingRooms.filter((r: any) => r.status === "available").length,
    maintenanceRooms: buildingRooms.filter((r: any) => r.status === "out_of_service").length,
    cleaningRooms: buildingRooms.filter((r: any) => r.status === "needs_cleaning").length,
  };

  const buildingMaintenanceRequests = maintenanceRequests.filter((req: any) => 
    buildingRooms.some((room: any) => room.id === req.roomId)
  );

  const { data: payments = [] } = useQuery({
    queryKey: ['/api/payments'],
  });

  const buildingPayments = payments.filter((payment: any) => 
    buildingRooms.some((room: any) => room.id === payment.roomId)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied": return "bg-green-500";
      case "available": return "bg-gray-400";
      case "maintenance": return "bg-red-500";
      case "cleaning": return "bg-yellow-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "overdue": return "destructive";
      default: return "secondary";
    }
  };

  const handleAddRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    toast({
      title: "Room Added",
      description: `Room ${formData.get("roomNumber")} has been added successfully.`,
    });
    setShowAddRoom(false);
  };

  const handleEditRoom = (roomId: number) => {
    toast({
      title: "Edit Room",
      description: "Room editing functionality will be implemented here.",
    });
  };

  const handleUpdateMaintenanceStatus = (requestId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Maintenance request #${requestId} status updated to ${newStatus}.`,
    });
  };

  // QR Code generation mutation
  const generateQRCodeMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      if (!response.ok) throw new Error("Failed to generate QR code");
      return await response.json();
    },
    onSuccess: (data, roomId) => {
      setQrCodeData({ roomId, qrCode: data.qrCode });
      setShowQRModal(true);
      toast({
        title: "QR Code Generated",
        description: `QR code created for Room ${rooms.find(r => r.id === roomId)?.number}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateRoomQRCode = (roomId: number) => {
    generateQRCodeMutation.mutate(roomId);
  };

  const handleViewMaintenanceDetails = (requestId: number) => {
    toast({
      title: "View Details",
      description: `Viewing details for maintenance request #${requestId}.`,
    });
  };

  const handleRecordPayment = (paymentId: number) => {
    toast({
      title: "Payment Recorded",
      description: `Payment #${paymentId} has been recorded.`,
    });
  };

  const handleUpdatePaymentStatus = (paymentId: number) => {
    toast({
      title: "Payment Status Updated",
      description: `Payment #${paymentId} status has been updated.`,
    });
  };

  const handleSendReminder = (tenantName: string) => {
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent to ${tenantName}.`,
    });
  };

  const handleContactGuest = (tenantName: string) => {
    toast({
      title: "Contact Guest",
      description: `Opening contact form for ${tenantName}.`,
    });
  };

  const handleEditGuest = (tenantName: string) => {
    toast({
      title: "Edit Guest",
      description: `Editing information for ${tenantName}.`,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-slate-900 to-slate-700 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Elegant geometric overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-emerald-900/20" />
        
        {/* Luxury building silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-center w-full">
            <div className="mb-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 mb-6">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">EasyStay Downtown Plaza</h1>
            <p className="text-xl text-gray-200 mb-6">934 Kapahulu Ave • Sophisticated Urban Living</p>
            <div className="flex justify-center items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{propertyData.totalRooms}</div>
                <div className="text-sm text-gray-300">Premium Suites</div>
              </div>
              <div className="h-8 w-px bg-gray-400" />
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{propertyData.occupiedRooms}</div>
                <div className="text-sm text-gray-300">Occupied</div>
              </div>
              <div className="h-8 w-px bg-gray-400" />
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{propertyData.availableRooms}</div>
                <div className="text-sm text-gray-300">Available</div>
              </div>
            </div>
            <div className="mt-8">
              <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Premium Suite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Premium Suite</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddRoom} className="space-y-4">
                    <div>
                      <Label htmlFor="roomNumber">Suite Number</Label>
                      <Input id="roomNumber" name="roomNumber" required />
                    </div>
                    <div>
                      <Label htmlFor="rent">Monthly Rate</Label>
                      <Input id="rent" name="rent" type="number" step="0.01" defaultValue="2400" required />
                    </div>
                    <div>
                      <Label htmlFor="status">Initial Status</Label>
                      <Select name="status" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="needs_cleaning">Needs Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Add Suite</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Property Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{propertyData.occupiedRooms}</div>
              <div className="text-sm text-gray-600">Occupied Rooms</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{propertyData.availableRooms}</div>
              <div className="text-sm text-gray-600">Available Rooms</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
                <Wrench className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{maintenanceRequests.length}</div>
              <div className="text-sm text-gray-600">Maintenance Requests</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">${propertyData.occupiedRooms * 2000}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Room Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="guests">Guest Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Room Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {buildingRooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(room.status)}`}></div>
                        <div>
                          <div className="font-medium">Room {room.number}</div>
                          <div className="text-sm text-gray-600">
                            {room.tenantName || "Available"} • ${room.rentalRate || 0}/{room.rentalPeriod || 'month'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={room.status === 'occupied' ? 'text-green-600 border-green-600' : 'text-gray-600'}>
                          {room.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => generateRoomQRCode(room.id)}>
                          <QrCode className="w-4 h-4 mr-1" />
                          QR Code
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditRoom(room.id)}>Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Maintenance Requests</CardTitle>
                  <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setShowAddMaintenance(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buildingMaintenanceRequests.map((request) => {
                    const room = buildingRooms.find(r => r.id === request.roomId);
                    return (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Room {room?.number}</div>
                          <div className="text-sm text-gray-600">{request.title}</div>
                          <div className="text-xs text-gray-500">Reported: {new Date(request.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={request.priority === 'urgent' ? 'destructive' : 'secondary'}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline">
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => handleUpdateMaintenanceStatus(request.id, 'in_progress')}>Update Status</Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewMaintenanceDetails(request.id)}>View Details</Button>
                      </div>
                    </div>
                  )})}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Payment Status</CardTitle>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddPayment(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {buildingPayments.map((payment) => {
                    const room = buildingRooms.find(r => r.id === payment.roomId);
                    return (
                    <div key={payment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Room {room?.number} - {room?.tenantName}</div>
                          <div className="text-sm text-gray-600">${payment.amount}</div>
                          <div className="text-xs text-gray-500">Due: {new Date(payment.paymentDate).toLocaleDateString()}</div>
                        </div>
                        <Badge variant={getStatusBadge(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => handleUpdatePaymentStatus(payment.id)}>Update Status</Button>
                        <Button size="sm" variant="outline" onClick={() => handleSendReminder(room?.tenantName || '')}>Send Reminder</Button>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Guest Management</CardTitle>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddGuest(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Guest
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rooms.filter(room => room.status === 'occupied').map((room) => (
                    <div key={room.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{room.tenant}</div>
                          <div className="text-sm text-gray-600">Room {room.number}</div>
                          <div className="text-xs text-gray-500">Rent Due: {room.dueDate}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleContactGuest(room.tenant)}>
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditGuest(room.tenant)}>Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Room QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              {qrCodeData && (
                <>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Room {rooms.find(r => r.id === qrCodeData.roomId)?.number}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Scan this QR code to access the tenant portal
                    </p>
                  </div>
                  <div className="p-4 bg-white border rounded-lg">
                    <img 
                      src={qrCodeData.qrCode} 
                      alt="Room QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center max-w-sm">
                    Tenants can scan this code with their phone camera to access the tenant portal for this room
                  </p>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}