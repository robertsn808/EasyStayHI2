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
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary">EasyStay Hawaii</h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#rooms" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium">
                    Room Availability
                  </a>
                  <a href="#announcements" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                    Announcements
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleLogin} className="bg-primary text-white hover:bg-blue-700">
                <LogIn className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-sm">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Quality Rooms Available for Rent</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comfortable, clean accommodations with flexible rental terms. Choose from daily, weekly, or monthly options to suit your needs.
          </p>
        </div>

        {/* Pricing Information */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Rental Rates</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">$100</div>
              <div className="text-gray-600">Daily Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-primary text-white">
              <div className="text-3xl font-bold mb-2">$500</div>
              <div className="text-blue-100">Weekly Rate</div>
              <div className="text-xs text-blue-200 mt-1">Best Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">$2000</div>
              <div className="text-gray-600">Monthly Rate</div>
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
