
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Megaphone, Eye, EyeOff, Edit } from "lucide-react";

interface AnnouncementsTabProps {
  announcements?: any[];
}

export function AnnouncementsTab({ announcements = [] }: AnnouncementsTabProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] }); // Refresh public announcements too
      toast({ title: "Success", description: "Announcement created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create announcement", variant: "destructive" });
    }
  });

  const editAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PATCH', `/api/admin/announcements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Success", description: "Announcement updated successfully" });
      setIsEditDialogOpen(false);
      setEditingAnnouncement(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update announcement", variant: "destructive" });
    }
  });

  const toggleAnnouncementMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/admin/announcements/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Success", description: "Announcement updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update announcement", variant: "destructive" });
    }
  });

  const handleCreateAnnouncement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type'),
      priority: formData.get('priority'),
      isActive: formData.get('isActive') === 'on',
      expiresAt: formData.get('expiresAt') || null
    };
    createAnnouncementMutation.mutate(data);
  };

  const handleEditAnnouncement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type'),
      priority: formData.get('priority'),
      isActive: formData.get('isActive') === 'on',
      expiresAt: formData.get('expiresAt') || null
    };
    editAnnouncementMutation.mutate({ id: editingAnnouncement.id, data });
  };

  const handleToggleActive = (announcement: any) => {
    toggleAnnouncementMutation.mutate({
      id: announcement.id,
      isActive: !announcement.isActive
    });
  };

  const handleEditClick = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setIsEditDialogOpen(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const activeAnnouncements = announcements.filter(a => a.isActive);
  const inactiveAnnouncements = announcements.filter(a => !a.isActive);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Announcements</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {activeAnnouncements.length} active • {inactiveAnnouncements.length} inactive
          </Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
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
          
          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Announcement</DialogTitle>
              </DialogHeader>
              {editingAnnouncement && (
                <form onSubmit={handleEditAnnouncement} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Title</Label>
                    <Input 
                      id="edit-title" 
                      name="title" 
                      defaultValue={editingAnnouncement.title}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-content">Content</Label>
                    <Textarea 
                      id="edit-content" 
                      name="content" 
                      rows={4} 
                      defaultValue={editingAnnouncement.content}
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-type">Type</Label>
                      <Select name="type" defaultValue={editingAnnouncement.type} required>
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
                      <Select name="priority" defaultValue={editingAnnouncement.priority} required>
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
                      defaultValue={editingAnnouncement.expiresAt ? editingAnnouncement.expiresAt.split('T')[0] : ''}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="edit-isActive" 
                      name="isActive" 
                      defaultChecked={editingAnnouncement.isActive} 
                    />
                    <Label htmlFor="edit-isActive">Active</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={editAnnouncementMutation.isPending}>
                    {editAnnouncementMutation.isPending ? "Updating..." : "Update Announcement"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No announcements created. Create your first announcement above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Announcements */}
          {activeAnnouncements.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Active Announcements ({activeAnnouncements.length})
              </h4>
              <div className="space-y-3">
                {activeAnnouncements.map((announcement: any, index: number) => (
                  <Card key={announcement.id || index} className="border-l-4 border-l-green-400">
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
                              <Badge className={getPriorityColor(announcement.priority)}>
                                {announcement.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600">
                            Live
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(announcement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(announcement)}
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-3">{announcement.content}</p>
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
              <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                Inactive Announcements ({inactiveAnnouncements.length})
              </h4>
              <div className="space-y-3">
                {inactiveAnnouncements.map((announcement: any, index: number) => (
                  <Card key={announcement.id || index} className="border-l-4 border-l-gray-400 opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base text-gray-600">{announcement.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="opacity-60">
                                {announcement.type}
                              </Badge>
                              <Badge variant="outline" className="opacity-60">
                                {announcement.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Draft
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(announcement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(announcement)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{announcement.content}</p>
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
        </div>
      )}
    </div>
  );
}
