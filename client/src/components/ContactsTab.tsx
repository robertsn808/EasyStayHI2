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
      toast({ title: "Success", description: "Contact created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create contact", variant: "destructive" });
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contact Messages</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{contacts.length} total</Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateContact} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <Button type="submit" className="w-full" disabled={createContactMutation.isPending}>
                  {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {contacts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No contact messages available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact: any, index: number) => (
            <Card key={contact.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{contact.name}</CardTitle>
                  <Badge variant="secondary">{contact.category || 'General'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{contact.email}</span>
                  </div>
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.notes && (
                    <p className="text-gray-600 mt-2">{contact.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Reply</Button>
                  <Button size="sm" variant="outline">Archive</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}