import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, MapPin, Phone, Mail, FileText, AlertTriangle, Calendar as CalendarIcon, Users, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { format, differenceInDays, addDays } from "date-fns";

export default function InquiryPage() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rentalPeriod: "",
    message: "",
    contactPreference: "",
    numberOfGuests: 1,
    roomPreference: "",
  });
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [showAgreement, setShowAgreement] = useState(false);
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  
  // Calculate booking details
  const numberOfNights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;
  const ratePerNight = 100;
  const totalCost = numberOfNights * ratePerNight;

  // Get property from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const property = urlParams.get('property');
    if (property === '934' || property === '949') {
      setSelectedProperty(property);
    }
  }, []);

  const createInquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!hasReadAgreement) {
        throw new Error("Please read and agree to the rental agreement first.");
      }
      const response = await apiRequest("POST", "/api/inquiries", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully!",
        description: "We'll contact you soon about your rental inquiry.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        rentalPeriod: "",
        message: "",
        contactPreference: "",
      });
      setSelectedProperty("");
      setHasReadAgreement(false);
      setShowAgreement(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.contactPreference) {
      toast({
        title: "Error",
        description: "Please select a contact preference.",
        variant: "destructive",
      });
      return;
    }
    
    const propertyPrefix = selectedProperty === "934" ? "Property 934" : "Property 949";
    const roomType = selectedProperty === "934" ? "Room" : "Suite";
    
    const inquiryData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      message: `${propertyPrefix} - ${roomType}: Any available | Rental Period: ${formData.rentalPeriod || 'Not specified'}${formData.message ? ` | Message: ${formData.message}` : ''}`,
      contactPreference: formData.contactPreference,
    };
    
    createInquiryMutation.mutate(inquiryData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Property Inquiry</h1>
                <p className="text-gray-600">EasyStay Hawaii</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Property</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className={`cursor-pointer transition-all ${selectedProperty === "934" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-lg"}`}
              onClick={() => setSelectedProperty("934")}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-xl font-bold mb-2">Property 934</h3>
                  <p className="text-gray-600 mb-3">934 Kapahulu Ave, Honolulu, HI</p>
                  <div className="text-sm text-gray-500">
                    <div>8 Rooms Available</div>
                    <div>$2,000/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${selectedProperty === "949" ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-lg"}`}
              onClick={() => setSelectedProperty("949")}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className="text-xl font-bold mb-2">Property 949</h3>
                  <p className="text-gray-600 mb-3">949 Kawaiahao St, Honolulu, HI</p>
                  <div className="text-sm text-gray-500">
                    <div>10 Suites Available</div>
                    <div>$600/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inquiry Form */}
        {selectedProperty && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Inquiry for Property {selectedProperty}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(808) 555-0123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPreference">How would you like us to contact you? *</Label>
                  <Select onValueChange={(value) => handleInputChange("contactPreference", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="any">Any Method</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentalPeriod">Rental Period</Label>
                  <Select onValueChange={(value) => handleInputChange("rentalPeriod", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rental period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1day">1 Day</SelectItem>
                      <SelectItem value="2days">2 Days</SelectItem>
                      <SelectItem value="3days">3 Days</SelectItem>
                      <SelectItem value="4days">4 Days</SelectItem>
                      <SelectItem value="1week">1 Week</SelectItem>
                      <SelectItem value="2weeks+">2 Weeks+</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="2months+">2 Months+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder={`Tell us about your interest in Property ${selectedProperty}...`}
                    rows={4}
                  />
                </div>

                {/* Rental Agreement Section */}
                <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-yellow-900">Rental Agreement</h4>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAgreement(!showAgreement)}
                    className="mb-3 text-sm"
                  >
                    {showAgreement ? "Hide Agreement" : "Read Rental Agreement"}
                  </Button>

                  {showAgreement && (
                    <div className="bg-white p-4 rounded border max-h-60 overflow-y-auto text-sm text-gray-700 space-y-3">
                      <h5 className="font-semibold text-gray-900">EasyStay Hawaii Rental Terms & Conditions</h5>
                      
                      <div>
                        <strong>1. Property Rules:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• No smoking inside any part of the building</li>
                          <li>• Quiet hours: 10 PM - 7 AM daily</li>
                          <li>• Maximum occupancy must not exceed agreed amount</li>
                          <li>• No parties or large gatherings</li>
                          <li>• Guests must check in with management</li>
                        </ul>
                      </div>

                      <div>
                        <strong>2. Payment Terms:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Payment due before check-in via Cashapp: $selarazmami</li>
                          <li>• Security deposit: $100 + $50 per pet (refundable)</li>
                          <li>• Late payment fee: $25 per day after due date</li>
                          <li>• No refunds for early departure</li>
                        </ul>
                      </div>

                      <div>
                        <strong>3. Check-in/Check-out:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Check-in: 3:00 PM or later</li>
                          <li>• Check-out: 11:00 AM or earlier</li>
                          <li>• Room must be left clean and undamaged</li>
                          <li>• Lost keys/access cards: $50 replacement fee</li>
                        </ul>
                      </div>

                      <div>
                        <strong>4. Property Care:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Tenant responsible for any damages beyond normal wear</li>
                          <li>• Report maintenance issues immediately</li>
                          <li>• No alterations to room without permission</li>
                          <li>• Keep room clean and sanitary</li>
                        </ul>
                      </div>

                      <div>
                        <strong>5. Stay Extensions & Checkout:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Payment must be sent by 10 AM on checkout date to extend stay</li>
                          <li>• If extension is not made, renter must leave by 11 AM</li>
                          <li>• Contact management if items are left behind</li>
                          <li>• Room codes are changed upon checkout - no re-entry allowed</li>
                        </ul>
                      </div>

                      <div>
                        <strong>6. Cleanliness & Common Areas:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• CLEAN UP AFTER YOURSELVES - no maid service provided</li>
                          <li>• Keep all common areas clean (kitchen, bathrooms, laundry, hallways)</li>
                          <li>• Guests may NOT use common areas</li>
                          <li>• You are responsible for all guest behavior</li>
                        </ul>
                      </div>

                      <div>
                        <strong>7. Tenant Conduct & Security:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Respect other tenants - no stealing food or personal items</li>
                          <li>• Theft caught on video = deposit forfeiture + police report + ban</li>
                          <li>• No fighting - take problems outside the property</li>
                          <li>• Do NOT give front door code to anyone</li>
                          <li>• You must personally let guests in</li>
                        </ul>
                      </div>

                      <div>
                        <strong>8. Prohibited Items & Activities:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• No drugs or drug paraphernalia allowed</li>
                          <li>• No weapons of any kind</li>
                          <li>• No illegal activities</li>
                          <li>• Violation = loss of security deposit + police report</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center mt-3">
                    <Checkbox
                      id="agreement"
                      checked={hasReadAgreement}
                      onCheckedChange={(checked) => setHasReadAgreement(!!checked)}
                    />
                    <Label htmlFor="agreement" className="ml-2 text-sm font-medium">
                      I have read and agree to the rental terms and conditions
                    </Label>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Payment & Contact Information:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Management will contact you at <strong>(808) 219-6562</strong> to confirm your inquiry request</li>
                    <li>• <strong>Payment:</strong> Send payment to Cashapp: $selarazmami after management confirms</li>
                    <li>• You will receive the front door and room access codes after payment</li>
                    <li>• $100 security deposit required (+$50 per pet)</li>
                    <li>• Security deposit will be returned upon checkout</li>
                  </ul>
                </div>
                
                {!hasReadAgreement && (
                  <div className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-800">Please read and agree to the rental agreement before submitting your inquiry.</p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createInquiryMutation.isPending || !hasReadAgreement}
                >
                  {createInquiryMutation.isPending ? "Sending..." : `Send Inquiry for Property ${selectedProperty}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Contact Information</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <MapPin className="h-8 w-8 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">Honolulu, Hawaii</p>
            </div>
            <div>
              <Phone className="h-8 w-8 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">(808) 555-0123</p>
            </div>
            <div>
              <Mail className="h-8 w-8 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">info@easystay-hawaii.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}