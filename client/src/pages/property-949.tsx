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
                  <a href="/" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                    Property 934
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">949 - Quality Rooms Available for Rent</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comfortable, clean accommodations at property 949 with flexible rental terms. Choose from daily, weekly, or monthly options to suit your needs.
          </p>
        </div>

        {/* Pricing Information */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Rental Rates</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">$110</div>
              <div className="text-gray-600">Daily Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-primary text-white">
              <div className="text-3xl font-bold mb-2">$550</div>
              <div className="text-blue-100">Weekly Rate</div>
              <div className="text-xs text-blue-200 mt-1">Best Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">$2200</div>
              <div className="text-gray-600">Monthly Rate</div>
            </div>
          </div>
        </div>

        {/* Room Availability */}
        <div id="rooms">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">949 Property - Room Availability</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="border rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-gray-900 mb-2">Room {i + 1}</div>
                  <div className="text-sm text-gray-600 mb-2">Floor {Math.floor(i / 5) + 1}</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    i % 3 === 0 ? 'bg-green-100 text-green-800' : 
                    i % 3 === 1 ? 'bg-red-100 text-red-800' : 
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {i % 3 === 0 ? 'Available' : i % 3 === 1 ? 'Occupied' : 'Cleaning'}
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
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">949 Property Announcements</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-primary bg-blue-50 p-4 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Welcome to 949 Property</h4>
                  <span className="text-sm text-gray-500">Today</span>
                </div>
                <p className="text-gray-700">
                  Welcome to your new home at 949! We are excited to have you as part of our community. 
                  Our office hours are Monday-Friday 8AM-7PM, Saturday 9AM-5PM.
                </p>
              </div>
              
              <div className="border-l-4 border-green-400 bg-green-50 p-4 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">New Laundry Facility</h4>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <p className="text-gray-700">
                  We're pleased to announce the opening of our new on-site laundry facility! 
                  Located on the ground floor, it's available 24/7 for all residents.
                </p>
              </div>

              <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Elevator Maintenance</h4>
                  <span className="text-sm text-gray-500">1 week ago</span>
                </div>
                <p className="text-gray-700">
                  The elevator will be temporarily out of service for maintenance on January 20th from 9AM-3PM. 
                  We apologize for any inconvenience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}