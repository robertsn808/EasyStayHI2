import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Brain,
  Search,
  Star,
  TrendingUp,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Home,
  Wifi,
  Car,
  Mountain,
  Waves,
  Volume2,
  VolumeX
} from "lucide-react";

interface TenantPreferences {
  budgetRange?: {
    min: number;
    max: number;
  };
  preferredFloor?: string;
  quietRoom?: boolean;
  oceanView?: boolean;
  balcony?: boolean;
  accessibility?: boolean;
  petFriendly?: boolean;
  smokingAllowed?: boolean;
  stayDuration?: number;
  moveInDate?: string;
  specialRequests?: string[];
}

interface RecommendationScore {
  roomId: number;
  score: number;
  reasons: string[];
  concerns: string[];
  matchingFeatures: string[];
}

export default function RoomRecommendationSystem() {
  const [preferences, setPreferences] = useState<TenantPreferences>({});
  const [showResults, setShowResults] = useState(false);
  const [recommendationType, setRecommendationType] = useState<'standard' | 'personalized'>('standard');
  const { toast } = useToast();

  // Get admin token for authentication
  const adminToken = localStorage.getItem('admin-token') || 'admin-authenticated';

  // Get available rooms for context
  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/admin/rooms"],
    meta: {
      headers: {
        'x-admin-token': adminToken
      }
    }
  });

  // Get tenants for personalized recommendations
  const { data: tenants = [] } = useQuery({
    queryKey: ["/api/admin/tenants"],
    meta: {
      headers: {
        'x-admin-token': adminToken
      }
    }
  });

  // Room recommendation mutation
  const recommendationMutation = useMutation({
    mutationFn: async (data: { preferences: TenantPreferences; tenantProfile?: any }) => {
      const endpoint = recommendationType === 'personalized' 
        ? "/api/admin/personalized-recommendations"
        : "/api/admin/room-recommendations";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify(recommendationType === 'personalized' ? data : data.preferences),
      });
      
      if (!response.ok) throw new Error("Failed to get recommendations");
      return response.json();
    },
    onSuccess: () => {
      setShowResults(true);
      toast({
        title: "Recommendations Generated",
        description: "AI has analyzed available rooms and generated personalized recommendations.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    },
  });

  const handleGenerateRecommendations = () => {
    if (!preferences.budgetRange?.min && !preferences.budgetRange?.max) {
      toast({
        title: "Budget Required",
        description: "Please set a budget range to get accurate recommendations.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      preferences,
      ...(recommendationType === 'personalized' && tenants.length > 0 && {
        tenantProfile: tenants[0] // Use first tenant as example profile
      })
    };

    recommendationMutation.mutate(data);
  };

  const updateBudgetRange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setPreferences(prev => ({
      ...prev,
      budgetRange: {
        ...prev.budgetRange,
        [field]: numValue
      }
    }));
  };

  const togglePreference = (key: keyof TenantPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Poor Match";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Brain className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Room Recommendation System</h2>
          <p className="text-gray-600">Get intelligent room suggestions based on tenant preferences and historical data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferences Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Tenant Preferences</span>
            </CardTitle>
            <CardDescription>
              Set preferences to get personalized room recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recommendation Type */}
            <div>
              <Label className="text-sm font-medium">Recommendation Type</Label>
              <Select value={recommendationType} onValueChange={(value: 'standard' | 'personalized') => setRecommendationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (Preference-based)</SelectItem>
                  <SelectItem value="personalized">Personalized (AI Learning)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Budget Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="budgetMin" className="text-xs text-gray-500">Minimum</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="800"
                    value={preferences.budgetRange?.min || ''}
                    onChange={(e) => updateBudgetRange('min', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax" className="text-xs text-gray-500">Maximum</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="2000"
                    value={preferences.budgetRange?.max || ''}
                    onChange={(e) => updateBudgetRange('max', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Move-in Date */}
            <div>
              <Label htmlFor="moveInDate" className="text-sm font-medium">Preferred Move-in Date</Label>
              <Input
                id="moveInDate"
                type="date"
                value={preferences.moveInDate || ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, moveInDate: e.target.value }))}
              />
            </div>

            {/* Stay Duration */}
            <div>
              <Label htmlFor="stayDuration" className="text-sm font-medium">Expected Stay Duration (months)</Label>
              <Input
                id="stayDuration"
                type="number"
                placeholder="6"
                value={preferences.stayDuration || ''}
                onChange={(e) => setPreferences(prev => ({ ...prev, stayDuration: parseInt(e.target.value) || undefined }))}
              />
            </div>

            {/* Floor Preference */}
            <div>
              <Label className="text-sm font-medium">Preferred Floor</Label>
              <Select value={preferences.preferredFloor || ''} onValueChange={(value) => setPreferences(prev => ({ ...prev, preferredFloor: value || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="No preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No preference</SelectItem>
                  <SelectItem value="1">Ground Floor (1)</SelectItem>
                  <SelectItem value="2">Second Floor (2)</SelectItem>
                  <SelectItem value="3">Third Floor (3)</SelectItem>
                  <SelectItem value="4">Fourth Floor (4)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Feature Preferences */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Room Features</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quietRoom"
                    checked={preferences.quietRoom || false}
                    onCheckedChange={() => togglePreference('quietRoom')}
                  />
                  <VolumeX className="w-4 h-4 text-gray-500" />
                  <Label htmlFor="quietRoom" className="text-sm">Quiet room (away from street noise)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="oceanView"
                    checked={preferences.oceanView || false}
                    onCheckedChange={() => togglePreference('oceanView')}
                  />
                  <Waves className="w-4 h-4 text-blue-500" />
                  <Label htmlFor="oceanView" className="text-sm">Ocean view</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="balcony"
                    checked={preferences.balcony || false}
                    onCheckedChange={() => togglePreference('balcony')}
                  />
                  <Home className="w-4 h-4 text-green-500" />
                  <Label htmlFor="balcony" className="text-sm">Private balcony</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accessibility"
                    checked={preferences.accessibility || false}
                    onCheckedChange={() => togglePreference('accessibility')}
                  />
                  <Users className="w-4 h-4 text-purple-500" />
                  <Label htmlFor="accessibility" className="text-sm">Wheelchair accessible</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petFriendly"
                    checked={preferences.petFriendly || false}
                    onCheckedChange={() => togglePreference('petFriendly')}
                  />
                  <span className="text-lg">🐕</span>
                  <Label htmlFor="petFriendly" className="text-sm">Pet-friendly</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smokingAllowed"
                    checked={preferences.smokingAllowed || false}
                    onCheckedChange={() => togglePreference('smokingAllowed')}
                  />
                  <span className="text-lg">🚬</span>
                  <Label htmlFor="smokingAllowed" className="text-sm">Smoking allowed</Label>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <Label htmlFor="specialRequests" className="text-sm font-medium">Special Requests or Notes</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any additional preferences or requirements..."
                value={preferences.specialRequests?.join(', ') || ''}
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  specialRequests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
              />
            </div>

            <Button 
              onClick={handleGenerateRecommendations}
              disabled={recommendationMutation.isPending}
              className="w-full"
            >
              {recommendationMutation.isPending ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Rooms...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Recommendation Results</span>
            </CardTitle>
            <CardDescription>
              AI-generated room suggestions based on your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showResults && !recommendationMutation.isPending && (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Set your preferences and click "Get AI Recommendations" to see results</p>
              </div>
            )}

            {recommendationMutation.isPending && (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-pulse" />
                <p className="text-gray-600">AI is analyzing available rooms...</p>
                <div className="mt-4 space-y-2">
                  <div className="bg-gray-100 rounded p-2 text-sm text-gray-600">Checking room availability...</div>
                  <div className="bg-gray-100 rounded p-2 text-sm text-gray-600">Analyzing tenant preferences...</div>
                  <div className="bg-gray-100 rounded p-2 text-sm text-gray-600">Calculating compatibility scores...</div>
                </div>
              </div>
            )}

            {recommendationMutation.data && (
              <div className="space-y-4">
                {/* Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">AI Analysis</h4>
                  <p className="text-sm text-blue-800 whitespace-pre-line">
                    {recommendationMutation.data.explanation}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  {recommendationMutation.data.recommendations.map((rec: RecommendationScore, index: number) => {
                    const room = rooms.find(r => r.id === rec.roomId);
                    if (!room) return null;

                    return (
                      <Card key={rec.roomId} className={`border-l-4 ${index === 0 ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">Room {room.number}</h4>
                              <p className="text-gray-600">{room.building}</p>
                            </div>
                            <div className="text-right">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-white text-xs font-medium ${getScoreColor(rec.score)}`}>
                                {rec.score}% Match
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{getScoreText(rec.score)}</p>
                            </div>
                          </div>

                          {/* Matching Features */}
                          {rec.matchingFeatures.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {rec.matchingFeatures.map((feature, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reasons */}
                          {rec.reasons.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-green-700 mb-1 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Why this room is recommended:
                              </h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {rec.reasons.map((reason, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-green-500 mr-1">•</span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Concerns */}
                          {rec.concerns.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-orange-700 mb-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Things to consider:
                              </h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {rec.concerns.map((concern, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-orange-500 mr-1">•</span>
                                    {concern}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                ${room.rentalRate || '1200'}/mo
                              </span>
                              <span className="flex items-center">
                                <Home className="w-3 h-3 mr-1" />
                                {room.size || 'Standard'}
                              </span>
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {recommendationMutation.data.recommendations.length === 0 && (
                  <div className="text-center py-6">
                    <AlertCircle className="w-10 h-10 text-orange-400 mx-auto mb-2" />
                    <p className="text-gray-600">No rooms match your current preferences.</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your budget range or requirements.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      {showResults && recommendationMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Recommendation Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {recommendationMutation.data.totalFound}
                </div>
                <div className="text-sm text-gray-600">Rooms Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {recommendationMutation.data.recommendations.filter((r: RecommendationScore) => r.score >= 80).length}
                </div>
                <div className="text-sm text-gray-600">Excellent Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {rooms.filter(r => r.status === 'available').length}
                </div>
                <div className="text-sm text-gray-600">Available Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {recommendationType === 'personalized' ? 'AI' : 'Rule-based'}
                </div>
                <div className="text-sm text-gray-600">Algorithm Used</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}