import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import PublicRoomDisplay from "@/components/public-room-display";
import InquiryForm from "@/components/inquiry-form";
import BulletinBoard from "@/components/bulletin-board";

export default function Landing() {
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
                  <a href="/949" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                    Property 949
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
            <span className="gold-accent">934</span> - Luxury Accommodations
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Exceptional, meticulously maintained accommodations at our prestigious 934 property. 
            Experience comfort and elegance with flexible rental terms designed for discerning guests.
          </p>
        </div>

        {/* Pricing Information */}
        <div className="luxury-card rounded-2xl shadow-2xl p-8 mb-12">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8 text-center">Premium Rental Rates</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="text-4xl font-bold text-gray-800 mb-3">$120</div>
              <div className="text-gray-600 text-lg">Daily Rate</div>
              <div className="text-sm text-gray-500 mt-2">Perfect for short stays</div>
            </div>
            <div className="text-center p-8 luxury-gradient rounded-xl border-2 border-yellow-400 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-3">$650</div>
              <div className="text-gray-700 text-lg font-medium">Weekly Rate</div>
              <div className="text-sm text-gray-600 mt-2">Best value for extended stays</div>
            </div>
            <div className="text-center p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
              <div className="text-4xl font-bold text-gray-800 mb-3">$2,400</div>
              <div className="text-gray-600 text-lg">Monthly Rate</div>
              <div className="text-sm text-gray-500 mt-2">Ideal for long-term residents</div>
            </div>
          </div>
        </div>

        {/* Room Availability */}
        <div id="rooms">
          <PublicRoomDisplay />
        </div>

        {/* Contact Form */}
        <div className="mt-8">
          <InquiryForm />
        </div>

        {/* Bulletin Board */}
        <div id="announcements" className="mt-8">
          <BulletinBoard />
        </div>
      </div>
    </div>
  );
}
