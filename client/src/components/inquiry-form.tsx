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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";

export default function InquiryForm() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const form = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertInquiry) => {
      await apiRequest("POST", "/api/inquiries", data);
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent!",
        description: "We'll contact you soon about your rental inquiry.",
      });
      form.reset();
      setSelectedPeriod("");
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
    const formData = {
      ...data,
      message: `${data.message || ''} | Rental Period: ${selectedPeriod}`,
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
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </Label>
            <Input
              id="name"
              {...form.register("name")}
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
              required
            />
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
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </Label>
            <Textarea
              id="message"
              {...form.register("message")}
              rows={4}
              placeholder="Tell us about your rental needs..."
              className="w-full"
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Payment & Contact Information:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Payment:</strong> Send payment to Cashapp: $selarazmami</li>
                <li>• Management will call or text the number listed once payment is confirmed</li>
                <li>• You will receive the front door and room access codes after payment</li>
                <li>• $100 security deposit required (+$50 per pet)</li>
                <li>• Security deposit will be returned upon checkout</li>
              </ul>
            </div>
            
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-primary text-white hover:bg-blue-700"
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
