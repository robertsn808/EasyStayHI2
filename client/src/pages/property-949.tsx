import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import PublicRoomDisplay from "@/components/public-room-display";
import InquiryForm from "@/components/inquiry-form";
import BulletinBoard from "@/components/bulletin-board";

export default function Property949() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="luxury-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gold-accent">EasyStay Hawaii</h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#rooms" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium">
                    Room Availability
                  </a>
                  <a href="#announcements" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                    Announcements
                  </a>
                  <a href="/" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                    Property 934
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleLogin} className="luxury-button text-white border-0">
                <LogIn className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 luxury-card rounded-2xl p-12 shadow-2xl">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="gold-accent">949</span> - Premium Residences
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Sophisticated living spaces at our distinguished 949 property featuring modern amenities 
            and exceptional service. Discover the perfect blend of luxury and convenience.
          </p>
        </div>

        {/* Pricing Information */}
        <div className="luxury-card rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Exclusive Rental Rates</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="text-2xl font-bold text-gray-800 mb-2">$130</div>
              <div className="text-gray-600">Daily Rate</div>
            </div>
            <div className="text-center p-4 luxury-gradient rounded-lg border-2 border-yellow-400 relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                Premium Choice
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">$750</div>
              <div className="text-gray-700 font-medium">Weekly Rate</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300">
              <div className="text-2xl font-bold text-gray-800 mb-2">$2,800</div>
              <div className="text-gray-600">Monthly Rate</div>
            </div>
          </div>
        </div>

        {/* Room Availability */}
        <div id="rooms">
          <div className="luxury-card rounded-2xl shadow-2xl p-8 mb-12">
            <h3 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
              <span className="gold-accent">949</span> Suite Availability
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="luxury-gradient border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
                  <div className="text-xl font-bold text-gray-900 mb-3">Suite {i + 1}</div>
                  <div className="text-sm text-gray-600 mb-3">Floor {Math.floor(i / 5) + 1}</div>
                  <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                    i % 3 === 0 ? 'bg-emerald-100 text-emerald-800' : 
                    i % 3 === 1 ? 'bg-rose-100 text-rose-800' : 
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {i % 3 === 0 ? 'Available' : i % 3 === 1 ? 'Occupied' : 'Housekeeping'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-8">
          <InquiryForm />
        </div>

        {/* Announcements */}
        <div id="announcements" className="mt-8">
          <div className="luxury-card rounded-2xl shadow-2xl p-8">
            <h3 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
              <span className="gold-accent">949</span> Community Updates
            </h3>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 bg-blue-50/50 p-6 rounded-r-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-semibold text-gray-900">Welcome to 949 Premium Residences</h4>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">Today</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to your distinguished residence at 949! We are delighted to have you join our exclusive community. 
                  Our concierge services are available Monday-Friday 8AM-7PM, Saturday 9AM-5PM.
                </p>
              </div>
              
              <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-6 rounded-r-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-semibold text-gray-900">Premium Laundry Services</h4>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">2 days ago</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Introducing our state-of-the-art laundry facility with premium washers and dryers. 
                  Located on the ground floor with 24/7 access and complimentary detergent service.
                </p>
              </div>

              <div className="border-l-4 border-amber-500 bg-amber-50/50 p-6 rounded-r-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-semibold text-gray-900">Elevator System Upgrade</h4>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">1 week ago</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Our elevator system will undergo premium upgrades on January 20th from 9AM-3PM. 
                  We appreciate your patience as we enhance your living experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}