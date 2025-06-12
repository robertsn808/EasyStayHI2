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
      if (!checkInDate || !checkOutDate) {
        throw new Error("Please select check-in and check-out dates.");
      }
      if (numberOfNights <= 0) {
        throw new Error("Check-out date must be after check-in date.");
      }
      
      const inquiryData = {
        ...data,
        property: selectedProperty,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        numberOfGuests: formData.numberOfGuests,
        roomPreference: formData.roomPreference,
        estimatedCost: totalCost,
      };
      
      const response = await apiRequest("POST", "/api/inquiries", inquiryData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Booking Inquiry Sent Successfully!",
        description: `Your inquiry for ${numberOfNights} nights ($${totalCost}) has been submitted. We'll contact you within 24 hours.`,
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        rentalPeriod: "",
        message: "",
        contactPreference: "",
        numberOfGuests: 1,
        roomPreference: "",
      });
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
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
              className={`cursor-pointer transition-all duration-500 overflow-hidden ${selectedProperty === "934" ? "ring-4 ring-emerald-500 shadow-2xl" : "hover:shadow-xl"}`}
              onClick={() => setSelectedProperty("934")}
            >
              <div className="relative h-32 bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-800 overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="relative h-full flex items-center justify-center text-center">
                  <div>
                    <h3 className="text-3xl font-light tracking-wider text-white">934</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-3 font-medium">934 Kapahulu Ave, Honolulu, HI</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="font-semibold">8 Premium Suites</div>
                    <div className="text-emerald-600 font-bold">$2,400/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-500 overflow-hidden ${selectedProperty === "949" ? "ring-4 ring-teal-500 shadow-2xl" : "hover:shadow-xl"}`}
              onClick={() => setSelectedProperty("949")}
            >
              <div className="relative h-32 bg-gradient-to-br from-cyan-900 via-blue-800 to-teal-800 overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.12'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20zM0 20v20h20c0-11.046-8.954-20-20-20zM40 20c0 11.046-8.954 20-20 20v-20h20zM20 0v20h20c0-11.046-8.954-20-20-20z'/%3E%3C/g%3E%3C/svg%3E")`
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-teal-900/80 to-transparent" />
                <div className="relative h-full flex items-center justify-center text-center">
                  <div>
                    <h3 className="text-3xl font-light tracking-wider text-white">949</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-3 font-medium">949 Kawaiahao St, Honolulu, HI</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="font-semibold">10 Tropical Suites</div>
                    <div className="text-teal-600 font-bold">$720/month</div>
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

                {/* Booking Details Section */}
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Booking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Date Selection */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Check-in Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !checkInDate && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkInDate ? format(checkInDate, "PPP") : "Select check-in date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkInDate}
                              onSelect={(date: Date | undefined) => {
                                setCheckInDate(date);
                                // Auto-set checkout to next day if not set
                                if (date && !checkOutDate) {
                                  setCheckOutDate(addDays(date, 1));
                                }
                              }}
                              disabled={(date: Date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Check-out Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !checkOutDate && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOutDate ? format(checkOutDate, "PPP") : "Select check-out date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkOutDate}
                              onSelect={setCheckOutDate}
                              disabled={(date: Date) => !checkInDate || date <= checkInDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Guest and Room Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numberOfGuests">Number of Guests *</Label>
                        <Select 
                          value={formData.numberOfGuests.toString()} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfGuests: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select guests" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Guest</SelectItem>
                            <SelectItem value="2">2 Guests</SelectItem>
                            <SelectItem value="3">3 Guests</SelectItem>
                            <SelectItem value="4">4 Guests</SelectItem>
                            <SelectItem value="5">5+ Guests</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="roomPreference">Room Preference</Label>
                        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, roomPreference: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any available room" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Available Room</SelectItem>
                            <SelectItem value="ocean-view">Ocean View</SelectItem>
                            <SelectItem value="quiet">Quiet Room</SelectItem>
                            <SelectItem value="ground-floor">Ground Floor</SelectItem>
                            <SelectItem value="balcony">Room with Balcony</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Booking Summary */}
                    {checkInDate && checkOutDate && numberOfNights > 0 && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Booking Summary</span>
                          <Badge variant="secondary">{numberOfNights} nights</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Check-in: 12:00 PM</span>
                            <span>Check-out: 10:00 AM</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Rate: $100/night
                            </span>
                            <span className="font-semibold text-lg">
                              Total: ${totalCost}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label htmlFor="rentalPeriod">Rental Period (Optional)</Label>
                  <Select onValueChange={(value) => handleInputChange("rentalPeriod", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select if extended stay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short-term">Short Term (1-7 days)</SelectItem>
                      <SelectItem value="1week">1 Week</SelectItem>
                      <SelectItem value="2weeks">2 Weeks</SelectItem>
                      <SelectItem value="month">1 Month</SelectItem>
                      <SelectItem value="2months+">2+ Months</SelectItem>
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