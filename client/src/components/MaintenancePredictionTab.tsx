
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Brain, TrendingUp, DollarSign, Calendar, Wrench, Plus, Target, AlertCircle } from "lucide-react";

export default function MaintenancePredictionTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreatePrediction, setShowCreatePrediction] = useState(false);

  // Fetch data
  const { data: rooms } = useQuery({ queryKey: ["/api/rooms"] });
  const { data: predictions } = useQuery({ queryKey: ["/api/admin/maintenance-predictions"] });
  const { data: costAnalysis } = useQuery({ queryKey: ["/api/admin/maintenance-cost-analysis"] });

  // Create prediction
  const createPredictionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/maintenance-predictions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-authenticated"
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/maintenance-predictions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/maintenance-cost-analysis"] });
      setShowCreatePrediction(false);
      toast({
        title: "Prediction Created",
        description: "Maintenance prediction added successfully"
      });
    }
  });

  const handleCreatePrediction = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    createPredictionMutation.mutate({
      roomId: parseInt(formData.get("roomId") as string),
      itemType: formData.get("itemType"),
      itemName: formData.get("itemName"),
      currentCondition: parseInt(formData.get("currentCondition") as string),
      predictedFailureDate: formData.get("predictedFailureDate"),
      confidenceScore: parseFloat(formData.get("confidenceScore") as string) / 100,
      maintenanceType: formData.get("maintenanceType"),
      estimatedCost: parseFloat(formData.get("estimatedCost") as string),
      priority: formData.get("priority"),
      usageHours: parseInt(formData.get("usageHours") as string) || 0
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "orange";
      case "normal": return "blue";
      default: return "secondary";
    }
  };

  const getConditionColor = (condition: number) => {
    if (condition >= 8) return "text-green-600";
    if (condition >= 6) return "text-yellow-600";
    if (condition >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center">
          <Brain className="h-6 w-6 mr-2" />
          Maintenance Prediction AI
        </h2>
        <Dialog open={showCreatePrediction} onOpenChange={setShowCreatePrediction}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Prediction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Maintenance Prediction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePrediction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomId">Room</Label>
                  <Select name="roomId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms?.map((room: any) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          Room {room.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="itemType">Item Type</Label>
                  <Select name="itemType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ac_unit">AC Unit</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="appliance">Appliance</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input name="itemName" placeholder="e.g., Central AC Unit, Kitchen Sink" required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentCondition">Current Condition (1-10)</Label>
                  <Input name="currentCondition" type="number" min="1" max="10" required />
                </div>
                <div>
                  <Label htmlFor="confidenceScore">Confidence (%)</Label>
                  <Input name="confidenceScore" type="number" min="0" max="100" required />
                </div>
                <div>
                  <Label htmlFor="usageHours">Usage Hours</Label>
                  <Input name="usageHours" type="number" min="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="predictedFailureDate">Predicted Failure Date</Label>
                  <Input name="predictedFailureDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                  <Input name="estimatedCost" type="number" step="0.01" min="0" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Select name="maintenanceType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreatePrediction(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPredictionMutation.isPending}>
                  Create Prediction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="analysis">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions?.map((prediction: any) => (
              <Card key={prediction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Wrench className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold">{prediction.itemName}</span>
                          <Badge variant={getPriorityColor(prediction.priority)}>
                            {prediction.priority}
                          </Badge>
                          <Badge variant="outline">{prediction.maintenanceType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Room {prediction.roomId} • {prediction.itemType}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Condition: </span>
                            <span className={`font-medium ${getConditionColor(prediction.currentCondition)}`}>
                              {prediction.currentCondition}/10
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Confidence: </span>
                            <span className={`font-medium ${getConfidenceColor(prediction.confidenceScore)}`}>
                              {Math.round(prediction.confidenceScore * 100)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Est. Cost: </span>
                            <span className="font-medium text-green-600">
                              ${parseFloat(prediction.estimatedCost).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(prediction.predictedFailureDate).toLocaleDateString()}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {Math.ceil((new Date(prediction.predictedFailureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${costAnalysis?.totalEstimatedCost?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">Total Estimated Cost</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {costAnalysis?.urgentItems || 0}
                </div>
                <div className="text-sm text-gray-600">Urgent Items</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {costAnalysis?.preventiveItems || 0}
                </div>
                <div className="text-sm text-gray-600">Preventive Items</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Cost Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {costAnalysis?.suggestions?.length > 0 ? (
                <div className="space-y-4">
                  {costAnalysis.suggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">
                            {suggestion.type.replace('_', ' ').toUpperCase()}
                          </h4>
                          <p className="text-blue-700">{suggestion.message}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Save ${suggestion.savings}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No optimization suggestions available yet. Add more predictions to get AI-powered cost insights.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
