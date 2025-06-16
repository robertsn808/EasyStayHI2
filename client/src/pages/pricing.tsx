import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Check, Star, ChevronDown, ChevronRight, MapPin, Wifi, Coffee, Building2, Heart, Share } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const [isOpen934, setIsOpen934] = useState(false);
  const [isOpen949, setIsOpen949] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing & Rates</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Flexible accommodation options designed for your comfort and convenience
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 934 Kapahulu Ave */}
          <Collapsible open={isOpen934} onOpenChange={setIsOpen934}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-emerald-600 text-white">Premium</Badge>
              </div>
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="pb-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <h2 className="text-3xl font-bold text-gray-900">934 Kapahulu Ave</h2>
                      {isOpen934 ? (
                        <ChevronDown className="h-6 w-6 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <p className="text-gray-600">Honolulu, HI</p>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Pricing Options */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 transition-colors">
                      <div className="text-2xl font-bold text-emerald-600">$100</div>
                      <div className="text-sm text-gray-600">Daily</div>
                    </div>
                    <div className="text-center p-4 border-2 border-emerald-500 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">$500</div>
                      <div className="text-sm text-gray-600">Weekly</div>
                      <Badge variant="secondary" className="mt-1 text-xs">Most Popular</Badge>
                    </div>
                    <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 transition-colors">
                      <div className="text-2xl font-bold text-emerald-600">$2,000</div>
                      <div className="text-sm text-gray-600">Monthly</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">What's Included:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">Fully furnished private rooms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">High-speed WiFi included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">Utilities included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">24/7 maintenance support</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-gray-600">Prime Kapahulu location</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">Current Availability:</span>
                      <Badge variant="secondary" className="text-emerald-600 border-emerald-600">0 Available</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Rooms: <span className="font-medium">0</span>
                    </div>
                  </div>

                  <Link href="/inquiry">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      Inquire Now
                    </Button>
                  </Link>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 949 Kawaiahao St */}
          <Collapsible open={isOpen949} onOpenChange={setIsOpen949}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-cyan-600 text-white">Shared</Badge>
              </div>
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="pb-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <h2 className="text-3xl font-bold text-gray-900">949 Kawaiahao St</h2>
                      {isOpen949 ? (
                        <ChevronDown className="h-6 w-6 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <p className="text-gray-600">Honolulu, HI</p>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Pricing Options */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-500 transition-colors">
                      <div className="text-2xl font-bold text-cyan-600">$50</div>
                      <div className="text-sm text-gray-600">Daily</div>
                    </div>
                    <div className="text-center p-4 border-2 border-cyan-500 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">$200</div>
                      <div className="text-sm text-gray-600">Weekly</div>
                      <Badge variant="secondary" className="mt-1 text-xs">Best Value</Badge>
                    </div>
                    <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-500 transition-colors">
                      <div className="text-2xl font-bold text-cyan-600">$600</div>
                      <div className="text-sm text-gray-600">Monthly</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">What's Included:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm text-gray-600">Spacious shared suites</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm text-gray-600">High-speed WiFi included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm text-gray-600">Utilities included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm text-gray-600">24/7 maintenance support</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm text-gray-600">Downtown Honolulu location</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">Current Availability:</span>
                      <Badge variant="secondary" className="text-cyan-600 border-cyan-600">0 Available</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Suites: <span className="font-medium">0</span>
                    </div>
                  </div>

                  <Link href="/inquiry">
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                      Inquire Now
                    </Button>
                  </Link>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Why Choose EasyStay HI?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Flexible Terms</h4>
                  <p className="text-sm text-gray-600">Choose from daily, weekly, or monthly stays based on your needs</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prime Locations</h4>
                  <p className="text-sm text-gray-600">Strategic locations in Honolulu for easy access to work and attractions</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">All-Inclusive</h4>
                  <p className="text-sm text-gray-600">No hidden fees - utilities, WiFi, and maintenance included</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Link href="/inquiry">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}