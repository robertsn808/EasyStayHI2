import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, FileText, AlertTriangle } from "lucide-react";
import { z } from "zod";

// Define a proper schema for client inquiries
const clientInquirySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  inquiryType: z.enum(["booking", "general", "pricing", "availability", "tour"]),
  propertyId: z.number().optional(),
  roomType: z.enum(["private", "shared", "any"]).optional(),
  moveInDate: z.string().optional(),
  budgetRange: z.string().optional(),
  message: z.string().min(1, "Please provide a message"),
});

type ClientInquiryData = z.infer<typeof clientInquirySchema>;

export default function InquiryForm() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [contactPreference, setContactPreference] = useState("");
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const form = useForm<ClientInquiryData>({
    resolver: zodResolver(clientInquirySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      inquiryType: "general",
      roomType: "any",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ClientInquiryData) => {
      if (!hasReadAgreement) {
        throw new Error("Please read and agree to the rental agreement first.");
      }
      const response = await fetch("/api/client-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit inquiry");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent!",
        description: "We'll contact you soon about your rental inquiry.",
      });
      form.reset();
      setSelectedPeriod("");
      setHasReadAgreement(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientInquiryData) => {
    if (!contactPreference) {
      toast({
        title: "Error",
        description: "Please select a contact preference.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = {
      ...data,
      message: `${data.message || ''}\n\nRental Period: ${selectedPeriod}\nContact Preference: ${contactPreference}`,
    };
    mutation.mutate(formData);
  };

  return (
    <Card className="shadow-sm" id="inquiry-form">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">Rental Inquiry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </Label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </Label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Inquiry Type
            </Label>
            <Select 
              value={form.watch("inquiryType")} 
              onValueChange={(value) => form.setValue("inquiryType", value as any)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inquiry type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking">Booking Inquiry</SelectItem>
                <SelectItem value="general">General Information</SelectItem>
                <SelectItem value="pricing">Pricing Information</SelectItem>
                <SelectItem value="availability">Availability Check</SelectItem>
                <SelectItem value="tour">Schedule Tour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Rental Period
            </Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select rental period..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="2days">2 Days</SelectItem>
                <SelectItem value="3days">3 Days</SelectItem>
                <SelectItem value="4days">4 Days</SelectItem>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="2weeks+">2 Weeks+</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="2months+">2 Months+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="moveInDate" className="block text-sm font-medium text-gray-700 mb-2">
              Move-in Date
            </Label>
            <Input
              id="moveInDate"
              type="date"
              {...form.register("moveInDate")}
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              How would you like us to contact you?
            </Label>
            <Select value={contactPreference} onValueChange={setContactPreference} required>
              <SelectTrigger>
                <SelectValue placeholder="Select contact method..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="text">Text Message</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="any">Any Method</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (Optional)
            </Label>
            <Textarea
              id="message"
              {...form.register("message")}
              rows={4}
              placeholder="Tell us about your rental needs, special requests, or any questions..."
              className="w-full"
            />
          </div>
          
          <div className="md:col-span-2">
            {/* Rental Agreement Section */}
            <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="font-semibold text-yellow-900">Rental Agreement</h4>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAgreement(!showAgreement)}
                className="mb-3 text-sm"
              >
                {showAgreement ? "Hide Agreement" : "Read Rental Agreement"}
              </Button>

              {showAgreement && (
                <div className="bg-white p-4 rounded border max-h-60 overflow-y-auto text-sm text-gray-700 space-y-3">
                  <h5 className="font-semibold text-gray-900">EasyStay Hawaii Rental Terms & Conditions</h5>
                  
                  <div>
                    <strong>1. Property Rules:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• No smoking inside any part of the building</li>
                      <li>• Quiet hours: 10 PM - 7 AM daily</li>
                      <li>• Maximum occupancy must not exceed agreed amount</li>
                      <li>• No parties or large gatherings</li>
                      <li>• Guests must check in with management</li>
                    </ul>
                  </div>

                  <div>
                    <strong>2. Payment Terms:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Payment due before check-in via Cashapp: $selarazmami</li>
                      <li>• Security deposit: $100 + $50 per pet (refundable)</li>
                      <li>• Late payment fee: $25 per day after due date</li>
                      <li>• No refunds for early departure</li>
                    </ul>
                  </div>

                  <div>
                    <strong>3. Check-in/Check-out:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Check-in: 3:00 PM or later</li>
                      <li>• Check-out: 11:00 AM or earlier</li>
                      <li>• Room must be left clean and undamaged</li>
                      <li>• Lost keys/access cards: $50 replacement fee</li>
                    </ul>
                  </div>

                  <div>
                    <strong>4. Property Care:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Tenant responsible for any damages beyond normal wear</li>
                      <li>• Report maintenance issues immediately</li>
                      <li>• No alterations to room without permission</li>
                      <li>• Keep room clean and sanitary</li>
                    </ul>
                  </div>

                  <div>
                    <strong>5. Stay Extensions & Checkout:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Payment must be sent by 10 AM on checkout date to extend stay</li>
                      <li>• If extension is not made, renter must leave by 11 AM</li>
                      <li>• Contact management if items are left behind</li>
                      <li>• Room codes are changed upon checkout - no re-entry allowed</li>
                    </ul>
                  </div>

                  <div>
                    <strong>6. Cleanliness & Common Areas:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• CLEAN UP AFTER YOURSELVES - no maid service provided</li>
                      <li>• Keep all common areas clean (kitchen, bathrooms, laundry, hallways)</li>
                      <li>• Guests may NOT use common areas</li>
                      <li>• You are responsible for all guest behavior</li>
                    </ul>
                  </div>

                  <div>
                    <strong>7. Tenant Conduct & Security:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Respect other tenants - no stealing food or personal items</li>
                      <li>• Theft caught on video = deposit forfeiture + police report + ban</li>
                      <li>• No fighting - take problems outside the property</li>
                      <li>• Do NOT give front door code to anyone</li>
                      <li>• You must personally let guests in</li>
                    </ul>
                  </div>

                  <div>
                    <strong>8. Prohibited Items & Activities:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• No drugs or drug paraphernalia allowed</li>
                      <li>• No weapons of any kind</li>
                      <li>• No illegal activities</li>
                      <li>• Violation = loss of security deposit + police report</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex items-center mt-3">
                <Checkbox
                  id="agreement"
                  checked={hasReadAgreement}
                  onCheckedChange={(checked) => setHasReadAgreement(!!checked)}
                />
                <Label htmlFor="agreement" className="ml-2 text-sm font-medium">
                  I have read and agree to the rental terms and conditions
                </Label>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Payment & Contact Information:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Management will contact you at <strong>(808) 219-6562</strong> to confirm your inquiry request</li>
                <li>• <strong>Payment:</strong> Send payment to Cashapp: $selarazmami after management confirms</li>
                <li>• You will receive the front door and room access codes after payment</li>
                <li>• $100 security deposit required (+$50 per pet)</li>
                <li>• Security deposit will be returned upon checkout</li>
              </ul>
            </div>
            
            {!hasReadAgreement && (
              <div className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">Please read and agree to the rental agreement before submitting your inquiry.</p>
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={mutation.isPending || !hasReadAgreement}
              className="bg-primary text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Sending..." : "Send Inquiry"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
