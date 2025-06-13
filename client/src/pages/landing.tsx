import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, Phone, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useState } from "react";
import propertyImage from "@assets/image_1749809298715.png";

export default function Landing() {
  const [property934ImageOpen, setProperty934ImageOpen] = useState(false);
  const [property949ImageOpen, setProperty949ImageOpen] = useState(false);

  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements'],
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/rooms'],
  });

  // Calculate available rooms for each property
  const kapahulu934Available = Array.isArray(rooms) 
    ? rooms.filter((room: any) => room.buildingId === 10 && room.status === 'available').length 
    : 0;
  
  const kawaiahao949Available = Array.isArray(rooms) 
    ? rooms.filter((room: any) => room.buildingId === 11 && room.status === 'available').length 
    : 0;

  return (
    <div className="min-h-screen relative" style={{background: 'none'}}>
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://assets.mixkit.co/videos/4645/4645-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
            <div className="text-center">
              <h1 className="text-8xl sm:text-9xl md:text-[12rem] mb-8 sm:mb-12 animate-pulse" style={{ fontFamily: 'Great Vibes, cursive', textShadow: '0 0 30px rgba(255,255,255,0.5)' }}>
                Welcome
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 font-light tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
                To Your EasyStay Experience
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Button 
                  onClick={() => window.location.href = '/tenant'}
                  variant="ghost" 
                  size="lg" 
                  className="text-white border-2 border-white/50 hover:bg-white/20 hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold"
                >
                  Tenant Portal
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-white border-2 border-white/50 hover:bg-white/20 hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold"
                  onClick={() => window.location.href = '/admin'}
                >
                  Management Portal
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-white border-2 border-white/50 hover:bg-white/20 hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold"
                  onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
                >
                   Refresh
                </Button> </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Property Cards */}
          <div id="properties" className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 lg:mb-16 items-stretch">
            {/* Property 934 */}
            <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full group hover:scale-105 transform">
              <CardHeader className="pb-3 sm:pb-4 bg-blue-50">
                <CardTitle className="text-lg sm:text-xl"><span className="font-serif text-2xl font-extrabold text-blue-900 tracking-wider drop-shadow-sm">934</span> <span className="text-gray-700">Kapahulu Ave, Honolulu, HI</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 bg-blue-50 flex-grow flex flex-col">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="p-2 sm:p-3 bg-white rounded-lg border-2 border-blue-900">
                    <div className="text-lg sm:text-2xl font-bold text-gray-800">$100</div>
                    <div className="text-xs text-gray-600">Daily</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-white rounded-lg border-2 border-blue-900">
                    <div className="text-lg sm:text-2xl font-bold text-gray-800">$500</div>
                    <div className="text-xs text-gray-600">Weekly</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-white rounded-lg border-2 border-blue-900">
                    <div className="text-lg sm:text-2xl font-bold text-gray-800">$2,000</div>
                    <div className="text-xs text-gray-600">Monthly</div>
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
                
                {/* Collapsible Property Image */}
                <Collapsible open={property934ImageOpen} onOpenChange={setProperty934ImageOpen}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-blue-900 bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {property934ImageOpen ? 'Hide' : 'View'} Property Images
                      {property934ImageOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={propertyImage}
                        alt="934 Kapahulu Ave Property Details" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex gap-2 mt-auto">
                  <Button 
                    onClick={() => window.open('/inquiry?property=934', '_blank')}
                    variant="outline"
                    className="w-full border-2 border-gray-300 bg-white text-blue-700 hover:bg-gray-50"
                  >
                    Inquire Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property 949 */}
            <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full group hover:scale-105 transform">
              <CardHeader className="pb-3 sm:pb-4 bg-blue-50">
                <CardTitle className="text-lg sm:text-xl"><span className="font-serif text-2xl font-extrabold text-blue-900 tracking-wider drop-shadow-sm">949</span> <span className="text-gray-700">Kawaiahao St, Honolulu, HI</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 bg-blue-50 flex-grow flex flex-col">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="p-2 sm:p-3 bg-white rounded-lg border-2 border-blue-900">
                    <div className="text-lg sm:text-2xl font-bold text-gray-800">$50</div>
                    <div className="text-xs text-gray-600">Daily</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-white rounded-lg border-2 border-blue-900">
                    <div className="text-lg sm:text-2xl font-bold text-gray-800">$200</div>
                    <div className="text-xs text-gray-600">Weekly</div>
                  </div>
                  <div className="p-2 sm:p-3 bg-white rounded-lg border-2 border-blue-900">
                    <div className="text-lg sm:text-2xl font-bold text-gray-800">$600</div>
                    <div className="text-xs text-gray-600">Monthly</div>
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
                
                {/* Collapsible Property Image */}
                <Collapsible open={property949ImageOpen} onOpenChange={setProperty949ImageOpen}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-blue-900 bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {property949ImageOpen ? 'Hide' : 'View'} Property Images
                      {property949ImageOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={propertyImage}
                        alt="949 Kawaiahao St Property Details" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex gap-2 mt-auto">
                  <Button 
                    onClick={() => window.open('/inquiry?property=949', '_blank')}
                    variant="outline"
                    className="w-full border-2 border-gray-300 bg-white text-blue-700 hover:bg-gray-50"
                  >
                    Inquire Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements Section */}
          {announcements && announcements.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Latest Updates</h2>
              <div className="space-y-4">
                {announcements.slice(0, 3).map((announcement: any) => (
                  <div key={announcement.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">{announcement.title}</h3>
                    <p className="text-blue-800 text-sm">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-2 sm:p-3">
            <h2 className="text-lg font-bold text-center text-gray-900 mb-2">Contact Us</h2>
            <div className="grid sm:grid-cols-2 gap-2 text-center">
              <div>
                <MapPin className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                <p className="text-sm text-gray-600">Honolulu, Hawaii</p>
              </div>
              <div>
                <Phone className="h-4 w-4 mx-auto mb-1 text-green-600" />
                <p className="text-sm text-gray-600">(808) 219-6562</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}