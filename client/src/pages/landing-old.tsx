import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { MapPin, Phone, Mail, Calendar, Users, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const { toast } = useToast();
  const [activeProperty, setActiveProperty] = useState<"934" | "949">("934");
  
  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const { data: availableRooms } = useQuery({
    queryKey: ["/api/rooms/available"],
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest({
        url: "/api/inquiries",
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent",
        description: "We'll get back to you within 24 hours.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInquirySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const inquiryData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
      property: activeProperty,
    };

    createInquiryMutation.mutate(inquiryData);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">EasyStay Hawaii</h1>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => window.location.href = "/tenant-portal"}>
                Tenant Portal
              </Button>
              <Button onClick={() => window.location.href = "/api/login"}>
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Premium Hawaiian Living
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the perfect blend of luxury and comfort at our two exclusive properties in beautiful Hawaii. 
            Choose from our cozy residential units or premium luxury suites.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              <span>Honolulu, Hawaii</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              <span>6 Available Units</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>

        {/* Property Cards */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Property 934 */}
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold text-gray-800">Property 934</h3>
                <p className="text-gray-600">934 Kapahulu Ave</p>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Comfortable Living Spaces</CardTitle>
              <CardDescription>
                Modern residential units perfect for long-term stays and monthly rentals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">$100</div>
                  <div className="text-xs text-blue-700">Daily</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-400">
                  <div className="text-2xl font-bold text-green-900">$500</div>
                  <div className="text-xs text-green-700">Weekly</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">$2,000</div>
                  <div className="text-xs text-purple-700">Monthly</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Fully furnished rooms
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Shared common areas
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Utilities included
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setActiveProperty("934")}
                variant={activeProperty === "934" ? "default" : "outline"}
              >
                Inquire About 934
              </Button>
            </CardContent>
          </Card>

          {/* Property 949 */}
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-64 bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-gray-800">Property 949</h3>
                <p className="text-gray-600">949 Kawaiahao St</p>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Premium Luxury Experience</CardTitle>
              <CardDescription>
                Upscale suites with premium amenities for the discerning traveler.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">$50</div>
                  <div className="text-xs text-blue-700">Daily</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                  <div className="text-2xl font-bold text-yellow-900">$200</div>
                  <div className="text-xs text-yellow-700">Weekly</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">$600</div>
                  <div className="text-xs text-purple-700">Monthly</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Luxury suite accommodations
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Premium amenities included
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Concierge services
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setActiveProperty("949")}
                variant={activeProperty === "949" ? "default" : "outline"}
              >
                Inquire About 949
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Inquiry Form Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Inquire About Property {activeProperty}
              </CardTitle>
              <CardDescription>
                {activeProperty === "934" 
                  ? "Get more information about our comfortable residential units"
                  : "Learn more about our luxury suite accommodations"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(808) 555-0123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder={`Tell us about your interest in Property ${activeProperty}...`}
                    rows={4}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createInquiryMutation.isPending}
                >
                  {createInquiryMutation.isPending ? "Sending..." : `Send Inquiry for Property ${activeProperty}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Announcements Section */}
        {announcements && announcements.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Latest Updates</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement: any) => (
                <Card key={announcement.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    {announcement.createdAt && (
                      <CardDescription>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Contact Us</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Phone</h3>
              <p className="text-gray-600">(808) 555-0123</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="text-gray-600">info@easystay-hawaii.com</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Hours</h3>
              <p className="text-gray-600">Daily 9 AM - 6 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}