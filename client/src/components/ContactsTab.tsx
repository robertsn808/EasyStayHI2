import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Phone, Mail } from "lucide-react";
import { useState } from "react";

interface ContactsTabProps {
  contacts?: any[];
}

export function ContactsTab({ contacts = [] }: ContactsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/contacts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contacts'] });
      toast({ title: "Success", description: "Contact added successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add contact", variant: "destructive" });
    }
  });

  const handleCreateContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      category: formData.get('category'),
      notes: formData.get('notes')
    };
    createContactMutation.mutate(data);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Contacts</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{contacts.length} contacts</Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateContact} className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm">Name</Label>
                  <Input id="name" name="name" required className="h-8" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input id="email" name="email" type="email" required className="h-8" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">Phone</Label>
                  <Input id="phone" name="phone" className="h-8" />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm">Notes</Label>
                  <Textarea id="notes" name="notes" className="min-h-16" />
                </div>
                <Button type="submit" className="w-full h-8 text-xs" disabled={createContactMutation.isPending}>
                  {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {contacts.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-gray-500 text-sm">
            No contacts available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact: any, index: number) => (
            <Card key={contact.id || index} className="p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium">{contact.name}</h4>
                <Badge 
                  variant={contact.category === 'emergency' ? 'destructive' : 'secondary'} 
                  className="text-xs px-1 py-0"
                >
                  {contact.category}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-600">{contact.email}</p>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-600">{contact.phone}</p>
                  </div>
                )}
                {contact.notes && <p className="text-xs mt-1">{contact.notes}</p>}
              </div>
              <div className="flex gap-1 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-6 px-2"
                  onClick={() => window.open(`mailto:${contact.email}`)}
                >
                  Email
                </Button>
                {contact.phone && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-6 px-2"
                    onClick={() => window.open(`tel:${contact.phone}`)}
                  >
                    Call
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}