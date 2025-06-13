import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building, MapPin, Calendar, Users, Mail, Phone,
  Send, CheckCircle, Star, Wifi, Car, Dumbbell,
  Waves, Utensils, Shield, Clock, DollarSign
} from "lucide-react";

export default function InquiryComplete() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    propertyType: "",
    moveInDate: "",
    budget: "",
    groupSize: "",
    duration: "",
    message: "",
    preferredContact: "email",
    amenities: [] as string[],
    source: "website"
  });

  const submitInquiry = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/inquiries', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      setStep(4);
      toast({
        title: "Inquiry submitted successfully",
        description: "We'll contact you within 24 hours with available options"
      });
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (inquiryForm.name && inquiryForm.email && inquiryForm.inquiryType) {
      submitInquiry.mutate(inquiryForm);
    } else {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setInquiryForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const properties = [
    {
      id: 1,
      name: "934 Kapahulu Ave",
      address: "934 Kapahulu Ave, Honolulu, HI 96815",
      type: "Premium Urban Suites",
      priceRange: "$2,200 - $2,800",
      monthlyRate: "$2,400",
      amenities: ["WiFi", "Parking", "Security", "Modern Appliances"],
      image: "/api/placeholder/400/300"
    },
    {
      id: 2,
      name: "949 Kawaiahao St",
      address: "949 Kawaiahao St, Honolulu, HI 96813",
      type: "Luxury Tropical Suites",
      priceRange: "$1,600 - $2,200",
      monthlyRate: "$1,800",
      amenities: ["WiFi", "Tropical Views", "Modern Design", "Security"],
      image: "/api/placeholder/400/300"
    }
  ];

  const amenityOptions = [
    { id: "wifi", label: "High-Speed WiFi", icon: Wifi },
    { id: "parking", label: "Parking", icon: Car },
    { id: "gym", label: "Fitness Center", icon: Dumbbell },
    { id: "pool", label: "Swimming Pool", icon: Waves },
    { id: "kitchen", label: "Full Kitchen", icon: Utensils },
    { id: "security", label: "24/7 Security", icon: Shield }
  ];

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your inquiry has been submitted successfully. Our team will contact you within 24 hours.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setStep(1);
                  setInquiryForm({
                    name: "",
                    email: "",
                    phone: "",
                    inquiryType: "",
                    propertyType: "",
                    moveInDate: "",
                    budget: "",
                    groupSize: "",
                    duration: "",
                    message: "",
                    preferredContact: "email",
                    amenities: [],
                    source: "website"
                  });
                }}
                variant="outline"
                className="w-full"
              >
                Submit Another Inquiry
              </Button>
              <Button 
                onClick={() => setLocation('/')}
                className="w-full"
              >
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EasyStay Hawaii</h1>
                <p className="text-sm text-gray-600">Premium Short-Term Rentals</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              Step {step} of 3
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Stay</h2>
              <p className="text-lg text-gray-600">Let us help you find the ideal accommodation in Hawaii</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Full Name *"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Email Address *"
                    type="email"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Phone Number"
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Select onValueChange={(value) => setInquiryForm(prev => ({ ...prev, preferredContact: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Preferred contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inquiry Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select onValueChange={(value) => setInquiryForm(prev => ({ ...prev, inquiryType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Inquiry Type *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short-term">Short-term Rental (1-30 days)</SelectItem>
                      <SelectItem value="extended">Extended Stay (1-6 months)</SelectItem>
                      <SelectItem value="long-term">Long-term Lease (6+ months)</SelectItem>
                      <SelectItem value="corporate">Corporate Housing</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(value) => setInquiryForm(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="1bed">1 Bedroom</SelectItem>
                      <SelectItem value="2bed">2 Bedroom</SelectItem>
                      <SelectItem value="3bed">3+ Bedroom</SelectItem>
                      <SelectItem value="any">Any Size</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Move-in Date"
                      type="date"
                      value={inquiryForm.moveInDate}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, moveInDate: e.target.value }))}
                    />
                    <Input
                      placeholder="Duration (days/months)"
                      value={inquiryForm.duration}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select onValueChange={(value) => setInquiryForm(prev => ({ ...prev, budget: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Budget Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000-1500">$1,000 - $1,500</SelectItem>
                        <SelectItem value="1500-2000">$1,500 - $2,000</SelectItem>
                        <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
                        <SelectItem value="3000-4000">$3,000 - $4,000</SelectItem>
                        <SelectItem value="4000+">$4,000+</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Group Size"
                      type="number"
                      value={inquiryForm.groupSize}
                      onChange={(e) => setInquiryForm(prev => ({ ...prev, groupSize: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={!inquiryForm.name || !inquiryForm.email || !inquiryForm.inquiryType}
                className="px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Preferences & Amenities</h2>
              <p className="text-lg text-gray-600">Help us find the perfect match for your needs</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Desired Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenityOptions.map(({ id, label, icon: Icon }) => (
                    <div key={id} className="flex items-center space-x-3">
                      <Checkbox
                        id={id}
                        checked={inquiryForm.amenities.includes(id)}
                        onCheckedChange={() => handleAmenityToggle(id)}
                      />
                      <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Tell us more about your needs, special requests, or any questions you have..."
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Properties</h2>
              <p className="text-lg text-gray-600">Here are some options that match your criteria</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <Building className="h-16 w-16 text-white" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{property.type}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">{property.priceRange}</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">4.8</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">Standard Rate: {property.monthlyRate}/month</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Review Your Inquiry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {inquiryForm.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {inquiryForm.email}
                  </div>
                  <div>
                    <span className="font-medium">Inquiry Type:</span> {inquiryForm.inquiryType}
                  </div>
                  <div>
                    <span className="font-medium">Property Type:</span> {inquiryForm.propertyType || "Any"}
                  </div>
                  <div>
                    <span className="font-medium">Move-in Date:</span> {inquiryForm.moveInDate || "Flexible"}
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span> {inquiryForm.budget || "Not specified"}
                  </div>
                </div>
                {inquiryForm.amenities.length > 0 && (
                  <div>
                    <span className="font-medium">Desired Amenities:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {inquiryForm.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenityOptions.find(a => a.id === amenity)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {inquiryForm.message && (
                  <div>
                    <span className="font-medium">Message:</span>
                    <p className="text-gray-600 mt-1">{inquiryForm.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={submitInquiry.isPending}
                className="px-8"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitInquiry.isPending ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>(808) 555-0123</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@easystayhi.com</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Properties</h3>
              <ul className="space-y-2 text-sm">
                <li>Downtown Apartments</li>
                <li>Waikiki Condos</li>
                <li>Extended Stay Options</li>
                <li>Corporate Housing</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Response</h3>
              <p className="text-sm text-gray-300">
                We typically respond to inquiries within 2 hours during business hours
                and within 24 hours on weekends.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}