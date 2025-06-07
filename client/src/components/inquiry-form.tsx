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
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
  });

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
      setSelectedRoom("");
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
      roomNumber: selectedRoom,
      rentalPeriod: selectedPeriod,
      moveInDate: data.moveInDate ? new Date(data.moveInDate as any).toISOString().split('T')[0] : undefined,
    };
    mutation.mutate(formData);
  };

  const availableRooms = rooms?.filter((room: any) => room.status === "available") || [];

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
              Interested Room
            </Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a room..." />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room: any) => (
                  <SelectItem key={room.id} value={room.number}>
                    Room {room.number} - Available
                  </SelectItem>
                ))}
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
                <SelectItem value="daily">Daily ($100/day)</SelectItem>
                <SelectItem value="weekly">Weekly ($500/week)</SelectItem>
                <SelectItem value="monthly">Monthly ($2000/month)</SelectItem>
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
