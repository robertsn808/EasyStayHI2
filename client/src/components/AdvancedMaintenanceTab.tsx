import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, Filter, MoreHorizontal, Clock, User, 
  AlertTriangle, CheckCircle, XCircle, Calendar,
  Wrench, Home, TrendingUp, Users
} from "lucide-react";

interface MaintenanceRequest {
  id: string;
  requestId: string;
  property: string;
  assignedTo: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
}

export function AdvancedMaintenanceTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["/api/admin/maintenance"]
  });

  const mockRequests: MaintenanceRequest[] = [
    {
      id: "#651535",
      requestId: "#651535",
      property: "Barone LLC.",
      assignedTo: "Annette Black",
      status: "Pending",
      priority: "Medium",
      dueDate: "1 Feb, 2020"
    },
    {
      id: "#651536",
      requestId: "#651536", 
      property: "Big Kahuna Burger Ltd.",
      assignedTo: "Courtney Henry",
      status: "In Progress",
      priority: "Low",
      dueDate: "24 May, 2020"
    },
    {
      id: "#651537",
      requestId: "#651537",
      property: "Barone LLC.",
      assignedTo: "Jacob Jones",
      status: "Completed",
      priority: "High",
      dueDate: "22 Oct, 2020"
    },
    {
      id: "#651538",
      requestId: "#651538",
      property: "Abstergo Ltd.",
      assignedTo: "Ronald Richards",
      status: "Pending",
      priority: "Critical",
      dueDate: "8 Sep, 2020"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'In Progress':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Critical':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statsCards = [
    {
      title: "Total Requests",
      value: "150",
      subtitle: "open requests",
      icon: Wrench,
      color: "bg-blue-500"
    },
    {
      title: "Pending Requests", 
      value: "45",
      subtitle: "tasks pending",
      icon: Clock,
      color: "bg-orange-500"
    },
    {
      title: "In Progress",
      value: "30", 
      subtitle: "tasks on going",
      icon: AlertTriangle,
      color: "bg-yellow-500"
    },
    {
      title: "Completed",
      value: "75",
      subtitle: "tasks completed", 
      icon: CheckCircle,
      color: "bg-green-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600">Manage maintenance requests and schedules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by guest, reservation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Request ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Property</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Assigned To</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {mockRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{request.requestId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{request.property}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{request.assignedTo}</p>
                          <p className="text-xs text-gray-500">HVAC Specialist</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(request.status)} flex items-center space-x-1`}
                      >
                        {getStatusIcon(request.status)}
                        <span>{request.status}</span>
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant="secondary"
                        className={getPriorityColor(request.priority)}
                      >
                        {request.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{request.dueDate}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              1-25 of 654
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}