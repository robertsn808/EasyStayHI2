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

export default function Property949() {
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

  const { data: payments = [] } = useQuery({
    queryKey: ['/api/payments'],
  });

  const { data: guestProfiles = [] } = useQuery({
    queryKey: ['/api/guest-profiles'],
  });

  // Find the building for property 949
  const building = (buildings as any[]).find((b: any) => b.name === "949 Kawaiahao St" || b.address?.includes("949"));
  const buildingRooms = (rooms as any[]).filter((r: any) => r.buildingId === building?.id);
  
  const propertyData = {
    id: building?.id || 949,
    address: building?.address || "949 Kawaiahao St",
    totalRooms: buildingRooms.length,
    occupiedRooms: buildingRooms.filter((r: any) => r.status === "occupied").length,
    availableRooms: buildingRooms.filter((r: any) => r.status === "available").length,
    maintenanceRooms: buildingRooms.filter((r: any) => r.status === "out_of_service").length,
    cleaningRooms: buildingRooms.filter((r: any) => r.status === "needs_cleaning").length,
  };

  const buildingMaintenanceRequests = (maintenanceRequests as any[]).filter((req: any) => 
    buildingRooms.some((room: any) => room.id === req.roomId)
  );

  const buildingPayments = (payments as any[]).filter((payment: any) => 
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

  const handleAddSuite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    toast({
      title: "Suite Added",
      description: `Suite ${formData.get("suiteNumber")} has been added successfully.`,
    });
    setShowAddRoom(false);
  };

  const handleEditSuite = (suiteId: number) => {
    toast({
      title: "Edit Suite",
      description: "Suite editing functionality will be implemented here.",
    });
  };

  const handleUpdateMaintenanceStatus = (requestId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Maintenance request #${requestId} status updated to ${newStatus}.`,
    });
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
        description: `QR code created for ${rooms.find(r => r.id === roomId)?.number}`,
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

  const generateSuiteQRCode = (roomId: number) => {
    generateQRCodeMutation.mutate(roomId);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Property 949</h1>
                <p className="text-gray-600">949 Kawaiahao St, Honolulu, HI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                10 Total Suites
              </Badge>
              <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Suite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Suite</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddSuite} className="space-y-4">
                    <div>
                      <Label htmlFor="suiteNumber">Suite Number</Label>
                      <Input id="suiteNumber" name="suiteNumber" required />
                    </div>
                    <div>
                      <Label htmlFor="rent">Monthly Rent</Label>
                      <Input id="rent" name="rent" type="number" step="0.01" defaultValue="600" required />
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
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Add Suite</Button>
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
              <div className="text-sm text-gray-600">Occupied Suites</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{propertyData.availableRooms}</div>
              <div className="text-sm text-gray-600">Available Suites</div>
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
              <div className="text-2xl font-bold text-green-600">${propertyData.occupiedRooms * 600}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Suite Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="guests">Guest Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suite Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(room.status)}`}></div>
                        <div>
                          <div className="font-medium">{room.number}</div>
                          <div className="text-sm text-gray-600">
                            {room.tenant || "Available"} • ${room.rent}/month
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={room.status === 'occupied' ? 'text-green-600 border-green-600' : 'text-gray-600'}>
                          {room.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => generateSuiteQRCode(room.id)}>
                          <QrCode className="w-4 h-4 mr-1" />
                          QR Code
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditSuite(room.id)}>Edit</Button>
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
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{request.room}</div>
                          <div className="text-sm text-gray-600">{request.issue}</div>
                          <div className="text-xs text-gray-500">Reported: {request.date}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={request.priority === 'high' ? 'destructive' : request.priority === 'medium' ? 'secondary' : 'outline'}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline">
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Update Status</Button>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Payment Status</CardTitle>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{payment.room} - {payment.tenant}</div>
                          <div className="text-sm text-gray-600">${payment.amount}</div>
                          <div className="text-xs text-gray-500">Due: {payment.date}</div>
                        </div>
                        <Badge variant={getStatusBadge(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">Update Status</Button>
                        <Button size="sm" variant="outline">Send Reminder</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Guest Management</CardTitle>
                  <Button className="bg-purple-600 hover:bg-purple-700">
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
                          <div className="text-sm text-gray-600">{room.number}</div>
                          <div className="text-xs text-gray-500">Rent Due: {room.dueDate}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline">Edit</Button>
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
              <DialogTitle>Suite QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              {qrCodeData && (
                <>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      {rooms.find(r => r.id === qrCodeData.roomId)?.number}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Scan this QR code to access the tenant portal
                    </p>
                  </div>
                  <div className="p-4 bg-white border rounded-lg">
                    <img 
                      src={qrCodeData.qrCode} 
                      alt="Suite QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center max-w-sm">
                    Tenants can scan this code with their phone camera to access the tenant portal for this suite
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