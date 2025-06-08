import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Calendar, User, Building } from "lucide-react";

interface PaymentTrackerTabProps {
  payments?: any[];
  rooms?: any[];
  guests?: any[];
}

export function PaymentTrackerTab({ payments = [], rooms = [], guests = [] }: PaymentTrackerTabProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<"934" | "949">("934");

  // Get building-specific data
  const building934Rooms = rooms.filter(room => room.buildingId === 10);
  const building949Rooms = rooms.filter(room => room.buildingId === 11);
  
  const building934Guests = guests.filter(guest => 
    building934Rooms.some(room => room.id === guest.roomId)
  );
  const building949Guests = guests.filter(guest => 
    building949Rooms.some(room => room.id === guest.roomId)
  );

  const building934Payments = payments.filter(payment => 
    building934Rooms.some(room => room.id === payment.roomId)
  );
  const building949Payments = payments.filter(payment => 
    building949Rooms.some(room => room.id === payment.roomId)
  );

  const renderBuildingPayments = (buildingRooms: any[], buildingGuests: any[], buildingPayments: any[], color: "blue" | "purple") => {
    const colorClasses = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" }
    };

    return (
      <div className="space-y-4">
        {/* Room Placeholders Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Room Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {buildingRooms.map((room) => {
                const guest = buildingGuests.find(g => g.roomId === room.id);
                const hasOverduePayment = guest && guest.paymentStatus === 'overdue';
                const hasPendingPayment = guest && guest.paymentStatus === 'pending';
                const isPaid = guest && guest.paymentStatus === 'paid';
                
                return (
                  <div
                    key={room.id}
                    className={`
                      relative p-3 rounded-lg border-2 text-center cursor-pointer transition-all hover:scale-105
                      ${hasOverduePayment ? 'bg-red-50 border-red-300' : 
                        hasPendingPayment ? 'bg-yellow-50 border-yellow-300' : 
                        isPaid ? 'bg-green-50 border-green-300' : 
                        'bg-gray-50 border-gray-200'}
                    `}
                    title={`Room ${room.number}${guest ? ` - ${guest.guestName}` : ' - Available'}`}
                  >
                    <div className="font-medium text-sm mb-1">#{room.number}</div>
                    {guest ? (
                      <div className="space-y-1">
                        <div className="text-xs font-medium truncate">{guest.guestName}</div>
                        <Badge 
                          variant={isPaid ? 'default' : 'destructive'} 
                          className="text-xs px-1 py-0"
                        >
                          {guest.paymentStatus}
                        </Badge>
                        <div className="text-xs text-gray-600">${guest.paymentAmount}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Available</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={colorClasses[color].bg}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className={`w-8 h-8 ${colorClasses[color].text}`} />
                <div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                  <div className={`text-xl font-bold ${colorClasses[color].text}`}>
                    ${buildingPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-sm text-gray-600">Pending Payments</div>
                  <div className="text-xl font-bold text-yellow-700">
                    {buildingGuests.filter(g => g.paymentStatus === 'pending').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-sm text-gray-600">Overdue Payments</div>
                  <div className="text-xl font-bold text-red-700">
                    {buildingGuests.filter(g => g.paymentStatus === 'overdue').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {buildingPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No payment records</p>
            ) : (
              <div className="space-y-3">
                {buildingPayments.slice(0, 10).map((payment) => {
                  const room = buildingRooms.find(r => r.id === payment.roomId);
                  const guest = buildingGuests.find(g => g.roomId === payment.roomId);
                  
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded ${color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'} flex items-center justify-center text-white text-xs font-medium`}>
                          {room?.number}
                        </div>
                        <div>
                          <p className="font-medium">{guest?.guestName || 'Unknown Guest'}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${payment.amount}</p>
                        <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guests Requiring Attention */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Attention Required</CardTitle>
          </CardHeader>
          <CardContent>
            {buildingGuests.filter(g => g.paymentStatus !== 'paid').length === 0 ? (
              <p className="text-green-600 text-center py-4">All payments are up to date!</p>
            ) : (
              <div className="space-y-3">
                {buildingGuests
                  .filter(g => g.paymentStatus !== 'paid')
                  .map((guest) => {
                    const room = buildingRooms.find(r => r.id === guest.roomId);
                    const isOverdue = guest.paymentStatus === 'overdue';
                    
                    return (
                      <div key={guest.id} className={`flex items-center justify-between p-3 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded ${color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'} flex items-center justify-center text-white text-xs font-medium`}>
                            {room?.number}
                          </div>
                          <div>
                            <p className="font-medium">{guest.guestName}</p>
                            <p className="text-sm text-gray-600">
                              {guest.email || guest.phone}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${guest.paymentAmount}</p>
                          <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                            {guest.paymentStatus}
                          </Badge>
                          {guest.nextPaymentDue && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(guest.nextPaymentDue).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Tracker</h2>
          <p className="text-gray-600">Monitor rent payments and financial status across properties</p>
        </div>
      </div>

      <Tabs value={selectedBuilding} onValueChange={(value) => setSelectedBuilding(value as "934" | "949")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="934" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            934 Kapahulu Ave
          </TabsTrigger>
          <TabsTrigger value="949" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
            949 Kawaiahao St
          </TabsTrigger>
        </TabsList>

        <TabsContent value="934" className="mt-6">
          {renderBuildingPayments(building934Rooms, building934Guests, building934Payments, "blue")}
        </TabsContent>

        <TabsContent value="949" className="mt-6">
          {renderBuildingPayments(building949Rooms, building949Guests, building949Payments, "purple")}
        </TabsContent>
      </Tabs>
    </div>
  );
}