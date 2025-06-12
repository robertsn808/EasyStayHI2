import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import backgroundImage from "@assets/image_1749351216300.png";

export default function Landing() {
  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements"],
  });

  // Fetch rooms data to calculate actual availability
  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
  });

  // Calculate available rooms for each building
  const kapahulu934Available = Array.isArray(rooms) 
    ? rooms.filter((room: any) => room.buildingId === 10 && room.status === 'available').length 
    : 0;
  
  const kawaiahao949Available = Array.isArray(rooms) 
    ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'available').length 
    : 0;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600/80 to-green-600/80 text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-8xl sm:text-9xl md:text-[12rem] mb-8 sm:mb-12" style={{ fontFamily: 'Great Vibes, cursive' }}>
              Welcome
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button 
                onClick={() => window.location.href = '/tenant'}
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 text-sm sm:text-base"
              >
                Tenant Portal
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-yellow-300 hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 text-sm sm:text-base"
                onClick={() => window.location.href = '/admin'}
              >
                Management Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* Property Cards */}
        <div id="properties" className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 lg:mb-16 items-stretch">
          {/* Property 934 */}
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
            <div className="relative h-40 sm:h-48 lg:h-64 bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-800 overflow-hidden">
              {/* Elegant geometric pattern */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              />
              {/* Luxury building silhouette */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="relative h-full flex items-center justify-center text-center">
                <div>
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-wider text-white">934</h3>
                </div>
              </div>
            </div>
            <CardHeader className="pb-3 sm:pb-4 bg-slate-50">
              <CardTitle className="text-lg sm:text-xl">934 Kapahulu Ave, Honolulu, HI</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Modern residential units perfect for long-term stays and monthly rentals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 bg-slate-50 flex-grow flex flex-col">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-blue-900">$100</div>
                  <div className="text-xs text-blue-700">Daily</div>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-lg border-2 border-green-400">
                  <div className="text-lg sm:text-2xl font-bold text-green-900">$500</div>
                  <div className="text-xs text-green-700">Weekly</div>
                </div>
                <div className="p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-orange-900">$2,000</div>
                  <div className="text-xs text-orange-700">Monthly</div>
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2 text-sm sm:text-base flex-grow">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Rooms:</span>
                  <span className="font-semibold text-green-600">{kapahulu934Available}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rooms:</span>
                  <span className="font-semibold">{Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10).length : 8}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button 
                  onClick={() => window.open('/inquiry?property=934', '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Inquire Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Property 949 */}
          <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
            <div className="relative h-40 sm:h-48 lg:h-64 bg-gradient-to-br from-cyan-900 via-blue-800 to-teal-800 overflow-hidden">
              {/* Tropical wave pattern */}
              <div 
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.12'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20zM0 20v20h20c0-11.046-8.954-20-20-20zM40 20c0 11.046-8.954 20-20 20v-20h20zM20 0v20h20c0-11.046-8.954-20-20-20z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
              />
              {/* Beach resort ambiance */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-teal-900/80 to-transparent" />
              <div className="relative h-full flex items-center justify-center text-center">
                <div>
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-wider text-white">949</h3>
                </div>
              </div>
            </div>
            <CardHeader className="pb-3 sm:pb-4 bg-teal-50">
              <CardTitle className="text-lg sm:text-xl">949 Kawaiahao St, Honolulu, HI</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Comfortable suites ideal for budget-conscious travelers and extended stays.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 bg-teal-50 flex-grow flex flex-col">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-purple-900">$50</div>
                  <div className="text-xs text-purple-700">Daily</div>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-lg border-2 border-green-400">
                  <div className="text-lg sm:text-2xl font-bold text-green-900">$200</div>
                  <div className="text-xs text-green-700">Weekly</div>
                </div>
                <div className="p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-orange-900">$600</div>
                  <div className="text-xs text-orange-700">Monthly</div>
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2 text-sm sm:text-base flex-grow">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Suites:</span>
                  <span className="font-semibold text-green-600">{kawaiahao949Available}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Suites:</span>
                  <span className="font-semibold">{Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11).length : 10}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button 
                  onClick={() => window.open('/inquiry?property=949', '_blank')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Inquire Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements Section */}
        {announcements && announcements.length > 0 && (
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4 sm:mb-6 lg:mb-8">Latest Updates</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {announcements.map((announcement: any) => (
                <Card key={announcement.id} className="shadow-lg">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">{announcement.title}</CardTitle>
                    {announcement.createdAt && (
                      <CardDescription className="text-sm">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base text-gray-600">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-4">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-3 sm:mb-4">Contact Us</h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-center">
            <div>
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1 text-sm">Visit Us</h3>
              <p className="text-sm text-gray-600">Honolulu, Hawaii</p>
            </div>
            <div>
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-green-600" />
              <h3 className="font-semibold mb-1 text-sm">Call Us</h3>
              <p className="text-sm text-gray-600">(808) 219-6562</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}