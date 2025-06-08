import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, QrCode, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface QRCodeData {
  roomId: number;
  roomNumber: string;
  qrCode: string;
}

interface BuildingQRCodes {
  buildingId: number;
  qrCodes: QRCodeData[];
}

export default function QRCodeManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);

  // Fetch buildings
  const { data: buildings } = useQuery({
    queryKey: ["/api/buildings"],
  });

  // Fetch QR codes for selected building
  const { data: qrData, isLoading: isLoadingQR } = useQuery({
    queryKey: ["/api/buildings", selectedBuilding, "qr-codes"],
    enabled: !!selectedBuilding,
  });

  const generateQRMutation = useMutation({
    mutationFn: async (buildingId: number) => {
      return apiRequest(`/api/buildings/${buildingId}/qr-codes`, {
        method: "GET",
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/buildings", selectedBuilding, "qr-codes"], data);
      toast({
        title: "QR Codes Generated",
        description: `Generated ${data.qrCodes.length} QR codes successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate QR codes",
        variant: "destructive",
      });
    },
  });

  const downloadQRCode = (qrCode: string, roomNumber: string) => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `room-${roomNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllQRCodes = () => {
    if (!qrData?.qrCodes) return;
    
    qrData.qrCodes.forEach((qr: QRCodeData) => {
      setTimeout(() => {
        downloadQRCode(qr.qrCode, qr.roomNumber);
      }, 100);
    });
    
    toast({
      title: "Download Started",
      description: `Downloading ${qrData.qrCodes.length} QR codes`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">QR Code Manager</h2>
        <div className="flex space-x-2">
          {qrData?.qrCodes && (
            <Button onClick={downloadAllQRCodes} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          )}
        </div>
      </div>

      {/* Building Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buildings?.map((building: any) => (
          <Card 
            key={building.id} 
            className={`cursor-pointer transition-colors ${
              selectedBuilding === building.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedBuilding(building.id)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {building.name}
                <Button
                  size="sm"
                  disabled={generateQRMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    generateQRMutation.mutate(building.id);
                  }}
                >
                  {generateQRMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4" />
                  )}
                  Generate QR
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{building.address}</p>
              <p className="text-sm font-medium mt-2">
                Click to view/generate QR codes for all rooms
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code Display */}
      {selectedBuilding && (
        <Card>
          <CardHeader>
            <CardTitle>
              QR Codes for {buildings?.find((b: any) => b.id === selectedBuilding)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingQR ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Generating QR codes...</p>
              </div>
            ) : qrData?.qrCodes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {qrData.qrCodes.map((qr: QRCodeData) => (
                  <div key={qr.roomId} className="border rounded-lg p-4 text-center">
                    <h3 className="font-semibold mb-2">Room {qr.roomNumber}</h3>
                    <div className="mb-3">
                      <img 
                        src={qr.qrCode} 
                        alt={`QR Code for Room ${qr.roomNumber}`}
                        className="w-32 h-32 mx-auto border"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQRCode(qr.qrCode, qr.roomNumber)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Click "Generate QR" to create QR codes for all rooms</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}