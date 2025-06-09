import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit2, Trash2, Eye, Megaphone, Phone, MapPin, Mail, Settings } from "lucide-react";

export default function PublicPageEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for dialogs
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState<any>(null);
  const [isEditingContact, setIsEditingContact] = useState<any>(null);

  // Fetch data
  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/admin/announcements"],
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/admin/contacts"],
  });

  // Contact information state (for public display settings)
  const [publicContactInfo, setPublicContactInfo] = useState({
    phone: "(808) 219-6562",
    address: "Honolulu, Hawaii",
    cashapp: "$selarazmami",
    email: "info@easystayhi.com"
  });

  // Mutations for announcements
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Success", description: "Announcement created successfully" });
      setIsAnnouncementDialogOpen(false);
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PATCH', `/api/admin/announcements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Success", description: "Announcement updated successfully" });
      setIsEditingAnnouncement(null);
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Success", description: "Announcement deleted successfully" });
    },
  });

  // Mutations for contacts
  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/contacts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contacts'] });
      toast({ title: "Success", description: "Contact added successfully" });
      setIsContactDialogOpen(false);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PATCH', `/api/admin/contacts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contacts'] });
      toast({ title: "Success", description: "Contact updated successfully" });
      setIsEditingContact(null);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contacts'] });
      toast({ title: "Success", description: "Contact deleted successfully" });
    },
  });

  // Handlers
  const handleCreateAnnouncement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type'),
      priority: formData.get('priority'),
      expiresAt: formData.get('expiresAt') || null,
      isActive: formData.get('isActive') === 'on'
    };
    createAnnouncementMutation.mutate(data);
  };

  const handleUpdateAnnouncement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type'),
      priority: formData.get('priority'),
      expiresAt: formData.get('expiresAt') || null,
      isActive: formData.get('isActive') === 'on'
    };
    updateAnnouncementMutation.mutate({ id: isEditingAnnouncement.id, data });
  };

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

  const handleUpdateContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      category: formData.get('category'),
      notes: formData.get('notes')
    };
    updateContactMutation.mutate({ id: isEditingContact.id, data });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "success": return "bg-green-100 text-green-800 border-green-300";
      case "urgent": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeAnnouncements = announcements.filter((a: any) => a.isActive);
  const inactiveAnnouncements = announcements.filter((a: any) => !a.isActive);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Public Page Editor</h1>
          <p className="text-gray-600 mt-2">Manage announcements and contact information displayed to the public</p>
        </div>
      </div>

      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="contacts">Contact Directory</TabsTrigger>
          <TabsTrigger value="public-info">Public Display Settings</TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Announcements Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {activeAnnouncements.length} active • {inactiveAnnouncements.length} inactive
                  </Badge>
                  <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" name="title" required />
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea id="content" name="content" rows={4} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Select name="type" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="info">Information</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="expiresAt">Expiry Date (optional)</Label>
                          <Input id="expiresAt" name="expiresAt" type="date" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="isActive" name="isActive" defaultChecked />
                          <Label htmlFor="isActive">Publish immediately</Label>
                        </div>
                        <Button type="submit" className="w-full" disabled={createAnnouncementMutation.isPending}>
                          {createAnnouncementMutation.isPending ? "Creating..." : "Create Announcement"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No announcements created. Create your first announcement above.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active Announcements */}
                  {activeAnnouncements.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Active Announcements ({activeAnnouncements.length})
                      </h4>
                      <div className="space-y-3">
                        {activeAnnouncements.map((announcement: any) => (
                          <Card key={announcement.id} className="border-l-4 border-l-green-400">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Megaphone className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base">{announcement.title}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={getTypeColor(announcement.type)}>
                                        {announcement.type}
                                      </Badge>
                                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(announcement.priority)}`}></div>
                                      <span className="text-xs text-gray-500">{announcement.priority} priority</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsEditingAnnouncement(announcement)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700 mb-3">{announcement.content}</p>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Created: {formatDate(announcement.createdAt)}</span>
                                {announcement.expiresAt && (
                                  <span>Expires: {formatDate(announcement.expiresAt)}</span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inactive Announcements */}
                  {inactiveAnnouncements.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-500">
                        Inactive Announcements ({inactiveAnnouncements.length})
                      </h4>
                      <div className="space-y-3">
                        {inactiveAnnouncements.map((announcement: any) => (
                          <Card key={announcement.id} className="border-l-4 border-l-gray-300 opacity-60">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Megaphone className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base text-gray-600">{announcement.title}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary">
                                        {announcement.type}
                                      </Badge>
                                      <span className="text-xs text-gray-400">{announcement.priority} priority</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsEditingAnnouncement(announcement)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-500 mb-3">{announcement.content}</p>
                              <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>Created: {formatDate(announcement.createdAt)}</span>
                                {announcement.expiresAt && (
                                  <span>Expires: {formatDate(announcement.expiresAt)}</span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Directory Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Directory
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{contacts.length} contacts</Badge>
                  <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Contact
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
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
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No contacts available. Add your first contact above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contacts.map((contact: any) => (
                    <Card key={contact.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{contact.name}</CardTitle>
                            <Badge 
                              variant={contact.category === 'emergency' ? 'destructive' : 'secondary'} 
                              className="mt-1"
                            >
                              {contact.category}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsEditingContact(contact)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteContactMutation.mutate(contact.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{contact.phone}</span>
                            </div>
                          )}
                          {contact.notes && (
                            <p className="text-sm text-gray-600 mt-2">{contact.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => window.open(`mailto:${contact.email}`)}
                          >
                            Email
                          </Button>
                          {contact.phone && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => window.open(`tel:${contact.phone}`)}
                            >
                              Call
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Public Display Settings Tab */}
        <TabsContent value="public-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Public Contact Information
              </CardTitle>
              <p className="text-sm text-gray-600">
                This information is displayed on the public landing page and inquiry forms
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={publicContactInfo.phone}
                      onChange={(e) => setPublicContactInfo(prev => ({...prev, phone: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      value={publicContactInfo.address}
                      onChange={(e) => setPublicContactInfo(prev => ({...prev, address: e.target.value}))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cashapp">CashApp Handle</Label>
                    <Input 
                      id="cashapp" 
                      value={publicContactInfo.cashapp}
                      onChange={(e) => setPublicContactInfo(prev => ({...prev, cashapp: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={publicContactInfo.email}
                      onChange={(e) => setPublicContactInfo(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Preview - How this appears on the public page:</h4>
                <Card className="bg-gray-50">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-center mb-6">Contact Us</h3>
                    <div className="grid grid-cols-2 gap-6 text-center">
                      <div>
                        <MapPin className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                        <h4 className="font-semibold mb-2">Visit Us</h4>
                        <p className="text-gray-600">{publicContactInfo.address}</p>
                      </div>
                      <div>
                        <Phone className="h-8 w-8 mx-auto mb-4 text-green-600" />
                        <h4 className="font-semibold mb-2">Call Us</h4>
                        <p className="text-gray-600">{publicContactInfo.phone}</p>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">Payment Information:</h5>
                      <p className="text-sm text-blue-800">
                        Send payment to CashApp: <strong>{publicContactInfo.cashapp}</strong>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Button className="w-full">
                Save Public Contact Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Announcement Dialog */}
      {isEditingAnnouncement && (
        <Dialog open={!!isEditingAnnouncement} onOpenChange={() => setIsEditingAnnouncement(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateAnnouncement} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  name="title" 
                  defaultValue={isEditingAnnouncement.title}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea 
                  id="edit-content" 
                  name="content" 
                  rows={4} 
                  defaultValue={isEditingAnnouncement.content}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select name="type" defaultValue={isEditingAnnouncement.type} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select name="priority" defaultValue={isEditingAnnouncement.priority} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-expiresAt">Expiry Date (optional)</Label>
                <Input 
                  id="edit-expiresAt" 
                  name="expiresAt" 
                  type="date" 
                  defaultValue={isEditingAnnouncement.expiresAt ? isEditingAnnouncement.expiresAt.split('T')[0] : ''}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-isActive" 
                  name="isActive" 
                  defaultChecked={isEditingAnnouncement.isActive} 
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
              <Button type="submit" className="w-full" disabled={updateAnnouncementMutation.isPending}>
                {updateAnnouncementMutation.isPending ? "Updating..." : "Update Announcement"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Contact Dialog */}
      {isEditingContact && (
        <Dialog open={!!isEditingContact} onOpenChange={() => setIsEditingContact(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div>
                <Label htmlFor="edit-contact-name">Name</Label>
                <Input 
                  id="edit-contact-name" 
                  name="name" 
                  defaultValue={isEditingContact.name}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-contact-email">Email</Label>
                <Input 
                  id="edit-contact-email" 
                  name="email" 
                  type="email" 
                  defaultValue={isEditingContact.email}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-contact-phone">Phone</Label>
                <Input 
                  id="edit-contact-phone" 
                  name="phone" 
                  defaultValue={isEditingContact.phone}
                />
              </div>
              <div>
                <Label htmlFor="edit-contact-category">Category</Label>
                <Select name="category" defaultValue={isEditingContact.category} required>
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
                <Label htmlFor="edit-contact-notes">Notes</Label>
                <Textarea 
                  id="edit-contact-notes" 
                  name="notes" 
                  defaultValue={isEditingContact.notes}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateContactMutation.isPending}>
                {updateContactMutation.isPending ? "Updating..." : "Update Contact"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}