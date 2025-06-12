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
    if (property) {
      setSelectedProperty(property);
    }
  }, []);

  const createInquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Submitted Successfully!",
        description: "We'll contact you soon with property details.",
      });
      // Reset form
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
      setHasReadAgreement(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProperty) {
      toast({
        title: "Please select a property",
        description: "Choose either Property 934 or Property 949 to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!hasReadAgreement) {
      toast({
        title: "Agreement Required",
        description: "Please read and agree to the rental agreement before submitting.",
        variant: "destructive",
      });
      return;
    }

    const propertyPrefix = selectedProperty === "934" ? "934 Kapahulu Ave" : "949 Kawaiahao St";
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
    <div className="min-h-screen relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://www.shutterstock.com/shutterstock/videos/11466428/preview/stock-footage-palm-trees-sunrise-lens-flare-through-palm-leaves-on-a-beautiful-blue-sky-background-instagram.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
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
            <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-lg">Choose Your Property</h2>
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
                <CardContent className="p-6 bg-slate-50">
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
                <div className="relative h-32 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800 overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="relative h-full flex items-center justify-center text-center">
                    <div>
                      <h3 className="text-3xl font-light tracking-wider text-white">949</h3>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 bg-slate-50">
                  <div className="text-center">
                    <p className="text-gray-600 mb-3 font-medium">949 Kawaiahao St, Honolulu, HI</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="font-semibold">10 Shared Suites</div>
                      <div className="text-teal-600 font-bold">$600/month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Inquiry Form */}
          {selectedProperty && (
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Send className="h-6 w-6" />
                  Property Inquiry Form
                </CardTitle>
                <p className="text-gray-600">
                  Fill out this form to inquire about Property {selectedProperty}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="required">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="required">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rentalPeriod">Preferred Rental Period</Label>
                      <Select onValueChange={(value) => handleInputChange('rentalPeriod', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rental period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily Rental</SelectItem>
                          <SelectItem value="weekly">Weekly Rental</SelectItem>
                          <SelectItem value="monthly">Monthly Rental</SelectItem>
                          <SelectItem value="long-term">Long-term (3+ months)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPreference">Preferred Contact Method</Label>
                    <Select onValueChange={(value) => handleInputChange('contactPreference', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="How would you like to be contacted?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="any">Any Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Message (Optional)</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us about your specific needs, move-in date, or any questions..."
                      rows={4}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Rental Agreement</h4>
                        <div className="text-sm text-gray-700 mb-3">
                          By submitting this inquiry, you acknowledge that you have read and agree to our rental terms and conditions.
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAgreement(!showAgreement)}
                          className="mb-3"
                        >
                          {showAgreement ? "Hide" : "View"} Rental Agreement
                        </Button>
                        {showAgreement && (
                          <div className="bg-white p-3 rounded border text-xs text-gray-600 max-h-32 overflow-y-auto mb-3">
                            <p className="mb-2"><strong>RENTAL AGREEMENT SUMMARY:</strong></p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Security deposit required ($100 + $50 per pet)</li>
                              <li>Payment due before move-in via Cashapp: $selarazmami</li>
                              <li>Access codes provided after payment confirmation</li>
                              <li>Respect for property and other tenants required</li>
                              <li>Security deposit returned upon satisfactory checkout</li>
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="agreement"
                            checked={hasReadAgreement}
                            onCheckedChange={setHasReadAgreement}
                          />
                          <Label htmlFor="agreement" className="text-sm">
                            I have read and agree to the rental agreement
                          </Label>
                        </div>
                      </div>
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
    </div>
  );
}