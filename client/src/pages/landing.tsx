import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Star, Heart, Share, Wifi, Car, Coffee, Utensils, ShoppingBag, Camera, Building2 } from "lucide-react";

export default function Landing() {
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
          <div id="properties" className="grid lg:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
            {/* Property 934 - Premium */}
            <Card className="overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0">
              <div className="relative">
                <div className="relative h-80 overflow-hidden rounded-t-2xl">
                  <img 
                    src="/attached_assets/IMG_3985_1750110934140.jpeg" 
                    alt="934 Kapahulu Ave Property" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
                  
                  {/* Top Action Buttons */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <Badge className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 text-xs font-semibold">
                      PREMIUM
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 h-8 w-8">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 h-8 w-8">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Property Number Overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="text-white">
                      <h2 className="text-3xl font-bold tracking-tight">934</h2>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.9</span>
                        <span className="text-sm text-white/80">(124)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Location and Title */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Premium Downtown Studio
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">934 Kapahulu Ave, Honolulu, HI</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 10).length : 8} rooms</span>
                      <span>•</span>
                      <span className="text-green-600 font-medium">{kapahulu934Available} available</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Wifi className="h-4 w-4" />
                      <span className="text-xs">WiFi</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Car className="h-4 w-4" />
                      <span className="text-xs">Parking</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span className="text-xs">Elevator</span>
                    </div>
                  </div>

                  {/* Nearby Attractions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Nearby</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Coffee className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Starbucks - 2 min</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <ShoppingBag className="h-3 w-3 text-blue-600" />
                        </div>
                        <span>Ala Moana - 5 min</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <Utensils className="h-3 w-3 text-orange-600" />
                        </div>
                        <span>Duke's Waikiki - 3 min</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <Camera className="h-3 w-3 text-purple-600" />
                        </div>
                        <span>Diamond Head - 8 min</span>
                      </div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="property-934" className="border-none">
                      <AccordionTrigger className="text-left hover:no-underline py-3 text-sm font-medium text-gray-700">
                        View pricing and details
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="space-y-4">
                          {/* Pricing Grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-gray-50 rounded-xl border">
                              <div className="text-lg font-bold text-gray-900">$100</div>
                              <div className="text-xs text-gray-600">per night</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl border">
                              <div className="text-lg font-bold text-gray-900">$500</div>
                              <div className="text-xs text-gray-600">per week</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl border">
                              <div className="text-lg font-bold text-gray-900">$2,000</div>
                              <div className="text-xs text-gray-600">per month</div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <Button 
                              onClick={() => window.open('/inquiry?property=934', '_blank')}
                              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-3 font-medium"
                            >
                              Reserve
                            </Button>
                            <Button 
                              onClick={() => window.open('/pricing', '_blank')}
                              variant="outline"
                              className="flex-1 border-gray-300 rounded-xl py-3 font-medium"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </Card>

            {/* Property 949 - Shared */}
            <Card className="overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0">
              <div className="relative">
                <div className="relative h-80 overflow-hidden rounded-t-2xl">
                  <img 
                    src="/attached_assets/IMG_3992_1750111055373.jpeg" 
                    alt="949 Kawaiahao St Property" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
                  
                  {/* Top Action Buttons */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <Badge className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 text-xs font-semibold">
                      SHARED LIVING
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 h-8 w-8">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 h-8 w-8">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Property Number Overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="text-white">
                      <h2 className="text-3xl font-bold tracking-tight">949</h2>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-sm text-white/80">(89)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Location and Title */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Modern Shared Suites
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">949 Kawaiahao St, Honolulu, HI</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{Array.isArray(rooms) ? rooms.filter((room: any) => room.buildingId === 11).length : 10} suites</span>
                      <span>•</span>
                      <span className="text-green-600 font-medium">{kawaiahao949Available} available</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Wifi className="h-4 w-4" />
                      <span className="text-xs">WiFi</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Coffee className="h-4 w-4" />
                      <span className="text-xs">Kitchen</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span className="text-xs">Common Area</span>
                    </div>
                  </div>

                  {/* Nearby Attractions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Nearby</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <Utensils className="h-3 w-3 text-red-600" />
                        </div>
                        <span>Chinatown - 4 min</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-3 w-3 text-indigo-600" />
                        </div>
                        <span>Downtown - 2 min</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Coffee className="h-3 w-3 text-green-600" />
                        </div>
                        <span>Coffee Bean - 1 min</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Camera className="h-3 w-3 text-yellow-600" />
                        </div>
                        <span>Iolani Palace - 3 min</span>
                      </div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="property-949" className="border-none">
                      <AccordionTrigger className="text-left hover:no-underline py-3 text-sm font-medium text-gray-700">
                        View pricing and details
                      </AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div className="space-y-4">
                          {/* Pricing Grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-gray-50 rounded-xl border">
                              <div className="text-lg font-bold text-gray-900">$50</div>
                              <div className="text-xs text-gray-600">per night</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl border">
                              <div className="text-lg font-bold text-gray-900">$200</div>
                              <div className="text-xs text-gray-600">per week</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl border">
                              <div className="text-lg font-bold text-gray-900">$600</div>
                              <div className="text-xs text-gray-600">per month</div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <Button 
                              onClick={() => window.open('/inquiry?property=949', '_blank')}
                              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl py-3 font-medium"
                            >
                              Reserve
                            </Button>
                            <Button 
                              onClick={() => window.open('/pricing', '_blank')}
                              variant="outline"
                              className="flex-1 border-gray-300 rounded-xl py-3 font-medium"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </Card>
          </div>

          {/* Announcements Section */}
          {Array.isArray(announcements) && announcements.length > 0 && (
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