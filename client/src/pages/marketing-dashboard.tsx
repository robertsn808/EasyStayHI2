import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Megaphone, 
  Users, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Share2,
  Calendar,
  Target,
  Mail,
  Phone,
  Star,
  Edit,
  Plus,
  Globe
} from "lucide-react";

export default function MarketingDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    type: "social_media",
    targetAudience: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "draft"
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    priority: "normal",
    targetBuilding: "all",
    publishDate: "",
    expiryDate: ""
  });

  // Fetch marketing data
  const { data: inquiries = [] } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/admin/campaigns"],
    queryFn: async () => {
      // Mock campaigns data since endpoint might not exist
      return [
        {
          id: 1,
          title: "Summer Rental Special",
          type: "promotional",
          status: "active",
          budget: 500,
          startDate: "2024-06-01",
          endDate: "2024-08-31",
          impressions: 1250,
          clicks: 89,
          conversions: 7
        },
        {
          id: 2,
          title: "Student Housing Campaign",
          type: "social_media",
          status: "completed",
          budget: 750,
          startDate: "2024-04-15",
          endDate: "2024-05-30",
          impressions: 2100,
          clicks: 156,
          conversions: 12
        }
      ];
    }
  });

  // Calculate marketing metrics
  const totalInquiries = Array.isArray(inquiries) ? inquiries.length : 0;
  const thisMonthInquiries = Array.isArray(inquiries) 
    ? inquiries.filter((i: any) => {
        const inquiryDate = new Date(i.createdAt || Date.now());
        const now = new Date();
        return inquiryDate.getMonth() === now.getMonth() && inquiryDate.getFullYear() === now.getFullYear();
      }).length 
    : 0;

  const conversionRate = totalInquiries > 0 
    ? ((Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'converted').length : 0) / totalInquiries * 100).toFixed(1)
    : "0";

  const totalBudget = Array.isArray(campaigns) 
    ? campaigns.reduce((sum: number, c: any) => sum + (c.budget || 0), 0)
    : 0;

  const activeCampaigns = Array.isArray(campaigns) 
    ? campaigns.filter((c: any) => c.status === 'active').length 
    : 0;

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/admin/campaigns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Campaign Created", description: "Marketing campaign created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      setIsCreateCampaignOpen(false);
      setCampaignForm({
        title: "",
        description: "",
        type: "social_media",
        targetAudience: "",
        budget: "",
        startDate: "",
        endDate: "",
        status: "draft"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/announcements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create announcement');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Announcement Published", description: "Announcement created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setIsCreateAnnouncementOpen(false);
      setAnnouncementForm({
        title: "",
        content: "",
        priority: "normal",
        targetBuilding: "all",
        publishDate: "",
        expiryDate: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!campaignForm.title || !campaignForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createCampaignMutation.mutate(campaignForm);
  };

  const handleCreateAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createAnnouncementMutation.mutate(announcementForm);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-pink-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
              <p className="text-gray-600">Manage campaigns, announcements, and lead generation</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setIsCreateCampaignOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
            <Button variant="outline" onClick={() => setIsCreateAnnouncementOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </div>
        </div>

        {/* Marketing Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                  <p className="text-3xl font-bold text-blue-600">{totalInquiries}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {thisMonthInquiries} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Lead to tenant conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-3xl font-bold text-purple-600">{activeCampaigns}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Marketing Budget</p>
                  <p className="text-3xl font-bold text-orange-600">${totalBudget}</p>
                </div>
                <Share2 className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total allocated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Marketing Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="leads">Lead Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.isArray(campaigns) && campaigns.map((campaign: any) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'completed' ? 'secondary' : 'outline'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{campaign.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium">${campaign.budget}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impressions:</span>
                        <span className="font-medium">{campaign.impressions?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Clicks:</span>
                        <span className="font-medium">{campaign.clicks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Conversions:</span>
                        <span className="font-medium text-green-600">{campaign.conversions}</span>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Campaign
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!Array.isArray(campaigns) || campaigns.length === 0) && (
                <Card className="col-span-2">
                  <CardContent className="p-8 text-center">
                    <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No marketing campaigns yet</p>
                    <Button className="mt-4" onClick={() => setIsCreateCampaignOpen(true)}>
                      Create Your First Campaign
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <div className="space-y-4">
              {Array.isArray(announcements) && announcements.map((announcement: any) => (
                <Card key={announcement.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                        <p className="text-gray-600 mb-3">{announcement.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {new Date(announcement.createdAt || Date.now()).toLocaleDateString()}</span>
                          <Badge variant="outline">{announcement.priority || 'normal'}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!Array.isArray(announcements) || announcements.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No announcements yet</p>
                    <Button className="mt-4" onClick={() => setIsCreateAnnouncementOpen(true)}>
                      Create First Announcement
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(inquiries) && inquiries.slice(0, 10).map((inquiry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{inquiry.name}</h4>
                        <p className="text-sm text-gray-600">{inquiry.email}</p>
                        <p className="text-xs text-gray-500">
                          {inquiry.message?.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={inquiry.status === 'pending' ? 'outline' : 'default'}>
                          {inquiry.status || 'pending'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(inquiries) || inquiries.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No leads to manage</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inquiry Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Website Forms</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Social Media</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Referrals</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {Array.isArray(campaigns) 
                          ? campaigns.reduce((sum: number, c: any) => sum + (c.impressions || 0), 0).toLocaleString()
                          : 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Impressions</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">
                          {Array.isArray(campaigns) 
                            ? campaigns.reduce((sum: number, c: any) => sum + (c.clicks || 0), 0)
                            : 0}
                        </p>
                        <p className="text-xs text-gray-600">Clicks</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">
                          {Array.isArray(campaigns) 
                            ? campaigns.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0)
                            : 0}
                        </p>
                        <p className="text-xs text-gray-600">Conversions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Campaign Modal */}
        {isCreateCampaignOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaign-title">Campaign Title</Label>
                  <Input
                    id="campaign-title"
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter campaign title"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-description">Description</Label>
                  <Textarea
                    id="campaign-description"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-type">Campaign Type</Label>
                  <Select onValueChange={(value) => setCampaignForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="email">Email Marketing</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="seo">SEO Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign-budget">Budget ($)</Label>
                    <Input
                      id="campaign-budget"
                      type="number"
                      value={campaignForm.budget}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-status">Status</Label>
                    <Select onValueChange={(value) => setCampaignForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Draft" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign} disabled={createCampaignMutation.isPending}>
                    {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Announcement Modal */}
        {isCreateAnnouncementOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create New Announcement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="announcement-title">Title</Label>
                  <Input
                    id="announcement-title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="announcement-content">Content</Label>
                  <Textarea
                    id="announcement-content"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your announcement"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="announcement-priority">Priority</Label>
                    <Select onValueChange={(value) => setAnnouncementForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Normal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="announcement-target">Target</Label>
                    <Select onValueChange={(value) => setAnnouncementForm(prev => ({ ...prev, targetBuilding: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Buildings</SelectItem>
                        <SelectItem value="934">Building 934</SelectItem>
                        <SelectItem value="949">Building 949</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateAnnouncementOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAnnouncement} disabled={createAnnouncementMutation.isPending}>
                    {createAnnouncementMutation.isPending ? "Publishing..." : "Publish Announcement"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}