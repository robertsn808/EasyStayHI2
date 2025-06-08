import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Landing() {
  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const { data: availableRooms } = useQuery({
    queryKey: ["/api/rooms/available"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to EasyStay Hawaii
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Premium accommodations in the heart of Honolulu. Find your perfect home away from home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.open('/inquiry', '_blank')}
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              >
                Make an Inquiry
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                onClick={() => {
                  document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Properties
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Property Cards */}
        <div id="properties" className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Property 934 */}
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-2xl font-bold text-gray-800">Property 934</h3>
                <p className="text-gray-600">934 Kapahulu Ave</p>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">934 Kapahulu Ave, Honolulu, HI</CardTitle>
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
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">$2,000</div>
                  <div className="text-xs text-orange-700">Monthly</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Rooms:</span>
                  <span className="font-semibold text-green-600">{availableRooms || 3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rooms:</span>
                  <span className="font-semibold">8</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('/inquiry?property=934', '_blank')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Inquire Now
                </Button>
                <Button 
                  onClick={() => window.open('/property-934', '_blank')} 
                  variant="outline" 
                  className="flex-1"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Property 949 */}
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="h-64 bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold text-gray-800">Property 949</h3>
                <p className="text-gray-600">949 Kawaiahao St</p>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">949 Kawaiahao St, Honolulu, HI</CardTitle>
              <CardDescription>
                Comfortable suites ideal for budget-conscious travelers and extended stays.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">$50</div>
                  <div className="text-xs text-purple-700">Daily</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-400">
                  <div className="text-2xl font-bold text-green-900">$200</div>
                  <div className="text-xs text-green-700">Weekly</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-900">$600</div>
                  <div className="text-xs text-orange-700">Monthly</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Suites:</span>
                  <span className="font-semibold text-green-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Suites:</span>
                  <span className="font-semibold">10</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('/inquiry?property=949', '_blank')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Inquire Now
                </Button>
                <Button 
                  onClick={() => window.open('/property-949', '_blank')} 
                  variant="outline" 
                  className="flex-1"
                >
                  View Details
                </Button>
              </div>
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