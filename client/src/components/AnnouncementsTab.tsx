import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, Trash2, Calendar } from "lucide-react";
import type { InsertAnnouncement, Announcement } from "@shared/schema";

interface AnnouncementsTabProps {
  announcements?: any[];
}

export function AnnouncementsTab({ announcements = [] }: AnnouncementsTabProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Form for creating/editing announcements
  const form = useForm<InsertAnnouncement>({
    defaultValues: {
      title: "",
      content: "",
      priority: "normal",
      isActive: true,
      property: "934",
    },
  });

  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: InsertAnnouncement) => {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create announcement");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAnnouncement> }) => {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update announcement");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setEditingAnnouncement(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete announcement");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertAnnouncement) => {
    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncement.id, data });
    } else {
      createAnnouncementMutation.mutate(data);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    form.reset({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      isActive: announcement.isActive,
      property: announcement.property || "934",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncementMutation.mutate(id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPropertyColor = (property: string) => {
    switch (property) {
      case "934":
        return "bg-green-100 text-green-800";
      case "949":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Property Announcements</h3>
        <Dialog open={showCreateDialog || !!editingAnnouncement} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingAnnouncement(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-primary text-white hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="property">Property</Label>
                <Select
                  value={form.watch("property")}
                  onValueChange={(value) => form.setValue("property", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="934">Property 934</SelectItem>
                    <SelectItem value="949">Property 949</SelectItem>
                    <SelectItem value="both">Both Properties</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.property && (
                  <p className="text-red-500 text-sm">{form.formState.errors.property.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register("title", { required: "Title is required" })}
                  placeholder="e.g., Welcome to Property 934"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  {...form.register("content", { required: "Content is required" })}
                  placeholder="Enter announcement content..."
                  rows={4}
                />
                {form.formState.errors.content && (
                  <p className="text-red-500 text-sm">{form.formState.errors.content.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(value) => form.setValue("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...form.register("isActive")}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active (visible to tenants)</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingAnnouncement(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
                  className="bg-primary text-white hover:bg-blue-700"
                >
                  {(createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending) 
                    ? "Saving..." 
                    : editingAnnouncement 
                      ? "Update Announcement" 
                      : "Create Announcement"
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No announcements found. Create your first announcement to get started.
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement: any) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-semibold text-gray-900">{announcement.title}</h4>
                    <Badge className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </Badge>
                    <Badge className={`px-2 py-1 text-xs rounded-full ${getPropertyColor(announcement.property)}`}>
                      {announcement.property === "both" ? "Both Properties" : `Property ${announcement.property}`}
                    </Badge>
                    {!announcement.isActive && (
                      <Badge variant="secondary" className="px-2 py-1 text-xs rounded-full">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                      disabled={deleteAnnouncementMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{announcement.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}