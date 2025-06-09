import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, Filter, Star, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BillPaymentTrackerProps {
  guests?: any[];
  rooms?: any[];
  buildings?: any[];
}

interface PaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string) => void;
  guestName: string;
  amount: string;
}

interface MoveOutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  guestName: string;
  roomNumber: string;
}

function PaymentMethodDialog({ isOpen, onClose, onConfirm, guestName, amount }: PaymentMethodDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleConfirm = () => {
    if (paymentMethod) {
      onConfirm(paymentMethod);
      setPaymentMethod("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Received - {guestName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Amount: <span className="font-medium">${amount}</span>
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">How was the payment made?</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cashapp">CashApp</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={!paymentMethod}>
              Generate Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MoveOutConfirmDialog({ isOpen, onClose, onConfirm, guestName, roomNumber }: MoveOutConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Guest Move-Out</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to mark <span className="font-medium">{guestName}</span> from Room <span className="font-medium">{roomNumber}</span> as moved out?
          </p>
          <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
            This action will remove the guest from the payment tracker and automatically set the room status to "needs cleaning".
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} variant="destructive">
              Confirm Move-Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BillPaymentTracker({ guests = [], rooms = [], buildings = [] }: BillPaymentTrackerProps) {
  // Fetch latest guest data
  const { data: fetchedGuests = [], isLoading: guestsLoading } = useQuery({
    queryKey: ["/api/admin/guests"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  const { data: fetchedRooms = [] } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: fetchedBuildings = [] } = useQuery({
    queryKey: ["/api/buildings"],
  });

  // Use fetched data if available, otherwise fall back to props
  const activeGuests = (fetchedGuests as any[])?.length > 0 ? fetchedGuests as any[] : guests;
  const activeRooms = (fetchedRooms as any[])?.length > 0 ? fetchedRooms as any[] : rooms;
  const activeBuildings = (fetchedBuildings as any[])?.length > 0 ? fetchedBuildings as any[] : buildings;
  const [selectedBuilding, setSelectedBuilding] = useState<"934" | "949">("934");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    guestId: number;
    guestName: string;
    amount: string;
  }>({
    isOpen: false,
    guestId: 0,
    guestName: "",
    amount: "",
  });

  const [moveOutDialog, setMoveOutDialog] = useState<{
    isOpen: boolean;
    guestId: number;
    guestName: string;
    roomNumber: string;
    roomId: number;
  }>({
    isOpen: false,
    guestId: 0,
    guestName: "",
    roomNumber: "",
    roomId: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's date and this week's date range
  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);

  // Filter guests for payments due this week
  const getPaymentsDueThisWeek = (buildingGuests: any[]) => {
    return buildingGuests.filter(guest => {
      if (guest.hasMovedOut || !guest.isActive) return false;
      
      const nextPaymentDue = new Date(guest.nextPaymentDue);
      return nextPaymentDue >= startOfWeek && nextPaymentDue <= endOfWeek;
    });
  };

  // Get building-specific data
  const building934 = activeBuildings.find(b => b.name === "934 Kapahulu Ave") || { id: 10 };
  const building949 = activeBuildings.find(b => b.name === "949 Kawaiahao St") || { id: 11 };

  const building934Rooms = activeRooms.filter(room => room.buildingId === building934.id);
  const building949Rooms = activeRooms.filter(room => room.buildingId === building949.id);
  
  const building934Guests = activeGuests.filter(guest => 
    building934Rooms.some(room => room.id === guest.roomId)
  );
  const building949Guests = activeGuests.filter(guest => 
    building949Rooms.some(room => room.id === guest.roomId)
  );

  // Mutations for guest actions
  const markMovedOutMutation = useMutation({
    mutationFn: async ({ guestId, roomId }: { guestId: number; roomId: number }) => {
      // First mark guest as moved out
      const guestResponse = await apiRequest("PATCH", `/api/admin/guests/${guestId}`, {
        hasMovedOut: true,
        moveOutDate: new Date().toISOString().split('T')[0],
        isActive: false
      });
      
      // Then update room status to needs_cleaning
      const roomResponse = await apiRequest("PATCH", `/api/admin/rooms/${roomId}`, {
        status: "needs_cleaning",
        tenantName: null,
        tenantPhone: null
      });
      
      return { guest: guestResponse, room: roomResponse };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({
        title: "Guest Moved Out",
        description: "Guest has been marked as moved out and room status updated to needs cleaning.",
      });
    },
  });

  const markPaymentReceivedMutation = useMutation({
    mutationFn: async ({ guestId, paymentMethod }: { guestId: number; paymentMethod: string }) => {
      return await apiRequest("POST", `/api/admin/guests/${guestId}/payment`, {
        paymentMethod
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guests"] });
      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded and invoice generated.",
      });
    },
  });

  const handleMoveOut = (guestId: number, guestName: string, roomId: number, roomNumber: string) => {
    setMoveOutDialog({
      isOpen: true,
      guestId,
      guestName,
      roomNumber,
      roomId,
    });
  };

  const confirmMoveOut = () => {
    markMovedOutMutation.mutate({ 
      guestId: moveOutDialog.guestId, 
      roomId: moveOutDialog.roomId 
    });
    setMoveOutDialog({ ...moveOutDialog, isOpen: false });
  };

  const handlePaymentReceived = (guestId: number, guestName: string, amount: string) => {
    console.log('Payment received clicked:', { guestId, guestName, amount });
    setPaymentDialog({
      isOpen: true,
      guestId,
      guestName,
      amount,
    });
  };

  const handlePaymentMethodConfirm = (paymentMethod: string) => {
    markPaymentReceivedMutation.mutate({
      guestId: paymentDialog.guestId,
      paymentMethod,
    });
  };

  const renderBuildingPayments = (buildingGuests: any[], buildingName: string, color: "blue" | "purple") => {
    const paymentsDue = getPaymentsDueThisWeek(buildingGuests);
    const filteredPayments = paymentsDue.filter(guest =>
      guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rooms.find(r => r.id === guest.roomId)?.number.includes(searchTerm)
    );

    const colorClasses = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", button: "bg-blue-600 hover:bg-blue-700" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", button: "bg-purple-600 hover:bg-purple-700" }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bill Payment Tracker</h2>
            <p className="text-gray-600">Manage your billing and payment details</p>
          </div>
          <div className="flex gap-3">
            <Button className={colorClasses[color].button}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
          </div>
        </div>

        {/* Building tabs and search */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={selectedBuilding === "934" ? "default" : "outline"}
              onClick={() => setSelectedBuilding("934")}
              className={selectedBuilding === "934" ? colorClasses.blue.button : ""}
            >
              934
            </Button>
            <Button
              variant={selectedBuilding === "949" ? "default" : "outline"}
              onClick={() => setSelectedBuilding("949")}
              className={selectedBuilding === "949" ? colorClasses.purple.button : ""}
            >
              949
            </Button>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by invoice number, name, amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Overview section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Overview</span>
              <div className="flex gap-2">
                <Button
                  variant={selectedBuilding === "934" ? "default" : "outline"}
                  size="sm"
                  className={selectedBuilding === "934" ? colorClasses.blue.button : ""}
                >
                  934
                </Button>
                <Button
                  variant={selectedBuilding === "949" ? "default" : "outline"}
                  size="sm"
                  className={selectedBuilding === "949" ? colorClasses.purple.button : ""}
                >
                  949
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Due This Week Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Due This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-8 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
                <div>MoveOut</div>
                <div>Renter</div>
                <div>BILLING DATE</div>
                <div>STATUS</div>
                <div>AMOUNT</div>
                <div>Send Receipt</div>
                <div>Paid</div>
                <div></div>
              </div>

              {/* Payment Rows */}
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payments due this week for {buildingName}
                </div>
              ) : (
                filteredPayments.map((guest) => {
                  const room = rooms.find(r => r.id === guest.roomId);
                  const roomNumber = room?.number || 'N/A';
                  const billingDate = new Date(guest.nextPaymentDue).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: '2-digit'
                  });
                  const isOverdue = new Date(guest.nextPaymentDue) < today;
                  const isPaid = guest.paymentStatus === 'paid';

                  return (
                    <div key={guest.id} className="grid grid-cols-8 gap-4 py-3 items-center">
                      {/* MoveOut Checkbox */}
                      <div>
                        <Checkbox
                          checked={guest.hasMovedOut}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleMoveOut(guest.id, guest.guestName, guest.roomId, roomNumber);
                            }
                          }}
                          disabled={markMovedOutMutation.isPending}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {roomNumber}/2023
                        </div>
                      </div>

                      {/* Renter */}
                      <div>
                        <div className="font-medium">{guest.guestName}</div>
                      </div>

                      {/* Billing Date */}
                      <div>
                        <div className="text-sm">{billingDate}</div>
                      </div>

                      {/* Status */}
                      <div>
                        <Badge variant={isPaid ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                          {isPaid ? 'Paid' : isOverdue ? 'Unpaid' : 'Paid'}
                        </Badge>
                      </div>

                      {/* Amount */}
                      <div>
                        <div className="font-medium">${guest.paymentAmount}</div>
                      </div>

                      {/* Send Receipt / View Receipt */}
                      <div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-3 py-1"
                        >
                          View Receipt
                        </Button>
                      </div>

                      {/* Paid Status */}
                      <div className="flex items-center gap-2">
                        {isPaid ? (
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        ) : (
                          <Checkbox
                            checked={isPaid}
                            onCheckedChange={() => handlePaymentReceived(guest.id, guest.guestName, guest.paymentAmount)}
                            disabled={markPaymentReceivedMutation.isPending}
                          />
                        )}
                      </div>

                      {/* Payment Status Badge */}
                      <div>
                        {isPaid ? (
                          <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs px-2 py-1">
                            Due
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Dialog */}
        <PaymentMethodDialog
          isOpen={paymentDialog.isOpen}
          onClose={() => setPaymentDialog({ ...paymentDialog, isOpen: false })}
          onConfirm={handlePaymentMethodConfirm}
          guestName={paymentDialog.guestName}
          amount={paymentDialog.amount}
        />

        {/* Move Out Confirmation Dialog */}
        <MoveOutConfirmDialog
          isOpen={moveOutDialog.isOpen}
          onClose={() => setMoveOutDialog({ ...moveOutDialog, isOpen: false })}
          onConfirm={confirmMoveOut}
          guestName={moveOutDialog.guestName}
          roomNumber={moveOutDialog.roomNumber}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedBuilding} onValueChange={(value) => setSelectedBuilding(value as "934" | "949")}>
        <TabsContent value="934">
          {renderBuildingPayments(building934Guests, "934 Kapahulu Ave", "blue")}
        </TabsContent>

        <TabsContent value="949">
          {renderBuildingPayments(building949Guests, "949 Kawaiahao St", "purple")}
        </TabsContent>
      </Tabs>
    </div>
  );
}