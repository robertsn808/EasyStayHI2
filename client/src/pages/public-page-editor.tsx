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
import { Plus, Edit2, Trash2, Eye, Megaphone, Phone, MapPin, Mail, Settings, Home, ArrowLeft, User, Bell } from "lucide-react";
import backgroundImage from "@assets/image_1749351216300.png";

export default function PublicPageEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for dialogs
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState<any>(null);

  // State for public contact information
  const [publicContactInfo, setPublicContactInfo] = useState({
    phone: "(808) 219-6562",
    address: "Honolulu, Hawaii",
    email: "contact@easystayhi.com",
    cashapp: "$EasyStayHI"
  });

  // Fetch data
  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/admin/announcements"],
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
    onError: () => {
      toast({ title: "Error", description: "Failed to create announcement", variant: "destructive" });
    }
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
    onError: () => {
      toast({ title: "Error", description: "Failed to update announcement", variant: "destructive" });
    }
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
    onError: () => {
      toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
    }
  });

  // Form handlers
  const handleCreateAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type'),
      priority: formData.get('priority'),
      isActive: formData.get('isActive') === 'on',
      expiresAt: formData.get('expiresAt') || null,
    };
    createAnnouncementMutation.mutate(data);
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type'),
      priority: formData.get('priority'),
      isActive: formData.get('isActive') === 'on',
      expiresAt: formData.get('expiresAt') || null,
    };
    updateAnnouncementMutation.mutate({ id: isEditingAnnouncement.id, data });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeAnnouncements = Array.isArray(announcements) ? announcements.filter((a: any) => a.isActive) : [];
  const inactiveAnnouncements = Array.isArray(announcements) ? announcements.filter((a: any) => !a.isActive) : [];

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay for better readability */}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm"></div>
      
      {/* Navigation Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-base font-semibold text-gray-900">Public Page Editor</span>
                  <p className="text-xs text-gray-500">Manage public content & settings</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Public Content Management</h1>
              <p className="text-gray-600 mt-2">Manage announcements and contact information displayed to the public</p>
            </div>
          </div>

          <Tabs defaultValue="announcements" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="contacts">Public Contact Info</TabsTrigger>
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
                      <Badge variant="secondary">{Array.isArray(announcements) ? announcements.length : 0} total</Badge>
                      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Announcement
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
                              <Textarea id="content" name="content" required />
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
                              <Label htmlFor="isActive">Active</Label>
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
                  {!Array.isArray(announcements) || announcements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No announcements created. Create your first announcement above.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Active Announcements */}
                      {activeAnnouncements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Active Announcements ({activeAnnouncements.length})
                          </h4>
                          <div className="grid gap-4">
                            {activeAnnouncements.map((announcement: any) => (
                              <Card key={announcement.id} className="border-green-200">
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <CardTitle className="text-base text-gray-900">{announcement.title}</CardTitle>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary">
                                          {announcement.type}
                                        </Badge>
                                        <span className="text-xs text-gray-500">{announcement.priority} priority</span>
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
                                  <p className="text-gray-600 mb-3">{announcement.content}</p>
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

                      {/* Inactive Announcements */}
                      {inactiveAnnouncements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-500 mb-4">
                            Inactive Announcements ({inactiveAnnouncements.length})
                          </h4>
                          <div className="grid gap-4">
                            {inactiveAnnouncements.map((announcement: any) => (
                              <Card key={announcement.id} className="border-gray-200 opacity-75">
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <CardTitle className="text-base text-gray-600">{announcement.title}</CardTitle>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary">
                                          {announcement.type}
                                        </Badge>
                                        <span className="text-xs text-gray-400">{announcement.priority} priority</span>
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

            {/* Public Contact Information Tab */}
            <TabsContent value="contacts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Public Contact Information
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Footer Contact Info</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    This information appears in the footer of the public landing page
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="public-phone">Phone Number</Label>
                        <Input 
                          id="public-phone" 
                          value={publicContactInfo.phone}
                          onChange={(e) => setPublicContactInfo(prev => ({...prev, phone: e.target.value}))}
                          placeholder="(808) 219-6562"
                        />
                        <p className="text-xs text-gray-500 mt-1">This appears in the "Call Us" section</p>
                      </div>
                      <div>
                        <Label htmlFor="public-address">Address</Label>
                        <Input 
                          id="public-address" 
                          value={publicContactInfo.address}
                          onChange={(e) => setPublicContactInfo(prev => ({...prev, address: e.target.value}))}
                          placeholder="Honolulu, Hawaii"
                        />
                        <p className="text-xs text-gray-500 mt-1">This appears in the "Visit Us" section</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="public-email">Contact Email</Label>
                        <Input 
                          id="public-email" 
                          type="email"
                          value={publicContactInfo.email}
                          onChange={(e) => setPublicContactInfo(prev => ({...prev, email: e.target.value}))}
                          placeholder="contact@eaststayhi.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">For general inquiries</p>
                      </div>
                      <div>
                        <Label htmlFor="public-cashapp">CashApp Handle</Label>
                        <Input 
                          id="public-cashapp" 
                          value={publicContactInfo.cashapp}
                          onChange={(e) => setPublicContactInfo(prev => ({...prev, cashapp: e.target.value}))}
                          placeholder="$EasyStayHI"
                        />
                        <p className="text-xs text-gray-500 mt-1">For payment processing</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Preview - Public Landing Page Footer</h4>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="grid sm:grid-cols-2 gap-6 text-center">
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
                      {publicContactInfo.cashapp && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2">Payment Information:</h5>
                          <p className="text-sm text-blue-800">
                            Send payment to CashApp: <strong>{publicContactInfo.cashapp}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Save Public Contact Information
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Public Display Settings Tab */}
            <TabsContent value="public-info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Public Display Settings
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Additional settings for public page display
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input 
                          id="business-name" 
                          defaultValue="EasyStay HI"
                          placeholder="EasyStay HI"
                        />
                        <p className="text-xs text-gray-500 mt-1">Displayed in page headers</p>
                      </div>
                      <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input 
                          id="tagline" 
                          defaultValue="Your Home Away From Home"
                          placeholder="Your Home Away From Home"
                        />
                        <p className="text-xs text-gray-500 mt-1">Subtitle on landing page</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="show-availability" defaultChecked />
                        <Label htmlFor="show-availability">Show room availability</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="show-pricing" defaultChecked />
                        <Label htmlFor="show-pricing">Show pricing information</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Save Display Settings
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
        </div>
      </div>
    </div>
  );
}