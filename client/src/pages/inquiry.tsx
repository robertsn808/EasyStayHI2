import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, MapPin, Phone, Mail } from "lucide-react";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { Link } from "wouter";

export default function InquiryPage() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState("");

  const form = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roomNumber: "",
      rentalPeriod: "",
      message: "",
    },
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (data: InsertInquiry) => {
      const response = await apiRequest("POST", "/api/inquiries", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully!",
        description: "We'll contact you soon about your rental inquiry.",
      });
      form.reset();
      setSelectedProperty("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInquiry) => {
    const inquiryData = {
      ...data,
      roomNumber: selectedProperty === "934" ? `Property 934 - ${data.roomNumber || 'Any Room'}` : `Property 949 - ${data.roomNumber || 'Any Suite'}`,
    };
    createInquiryMutation.mutate(inquiryData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Property Inquiry</h1>
                <p className="text-gray-600">EasyStay Hawaii</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Property</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className={`cursor-pointer transition-all ${selectedProperty === "934" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-lg"}`}
              onClick={() => setSelectedProperty("934")}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-xl font-bold mb-2">Property 934</h3>
                  <p className="text-gray-600 mb-3">934 Kapahulu Ave, Honolulu, HI</p>
                  <div className="text-sm text-gray-500">
                    <div>8 Rooms Available</div>
                    <div>$2,000/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${selectedProperty === "949" ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-lg"}`}
              onClick={() => setSelectedProperty("949")}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏠</div>
                  <h3 className="text-xl font-bold mb-2">Property 949</h3>
                  <p className="text-gray-600 mb-3">949 Kawaiahao St, Honolulu, HI</p>
                  <div className="text-sm text-gray-500">
                    <div>10 Suites Available</div>
                    <div>$600/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inquiry Form */}
        {selectedProperty && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Inquiry for Property {selectedProperty}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="(808) 555-0123"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Preferred {selectedProperty === "934" ? "Room" : "Suite"}</Label>
                    <Input
                      id="roomNumber"
                      {...form.register("roomNumber")}
                      placeholder={`Any ${selectedProperty === "934" ? "room" : "suite"} available`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rentalPeriod">Rental Period</Label>
                    <Select onValueChange={(value) => form.setValue("rentalPeriod", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rental period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-month">1 Month</SelectItem>
                        <SelectItem value="3-months">3 Months</SelectItem>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="1-year">1 Year</SelectItem>
                        <SelectItem value="long-term">Long Term (1+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    {...form.register("message")}
                    placeholder={`Tell us about your interest in Property ${selectedProperty}...`}
                    rows={4}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createInquiryMutation.isPending}
                >
                  {createInquiryMutation.isPending ? "Sending..." : `Send Inquiry for Property ${selectedProperty}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Contact Information</h2>
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