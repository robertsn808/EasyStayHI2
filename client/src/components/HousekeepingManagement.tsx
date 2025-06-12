import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, Filter, MoreVertical, Calendar, User, 
  Clock, MapPin, AlertCircle, CheckCircle2,
  Home, Users, TrendingUp, RefreshCw
} from "lucide-react";

interface HousekeepingTask {
  roomNumber: string;
  roomType: string;
  housekeepingStatus: 'Cleaning' | 'Change to' | 'Clean' | 'Dirty' | 'Due In' | 'Checked Out';
  priority: 'High' | 'Low';
  floor: number;
  reservationStatus: 'Due In' | 'Confirmed' | 'Vacant' | 'Checked Out';
  comments: string;
}

export function HousekeepingManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery({
    queryKey: ["/api/rooms"]
  });

  const updateRoomStatus = useMutation({
    mutationFn: async ({ roomId, status }: { roomId: number; status: string }) => {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-authenticated'
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update room status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    }
  });

  const housekeepingTasks: HousekeepingTask[] = [
    {
      roomNumber: "002",
      roomType: "Family Room (family)",
      housekeepingStatus: "Cleaning",
      priority: "High",
      floor: 1,
      reservationStatus: "Due In",
      comments: "Guest: Allergy to wool"
    },
    {
      roomNumber: "020",
      roomType: "Family Room (family)",
      housekeepingStatus: "Change to",
      priority: "High",
      floor: 1,
      reservationStatus: "Due In",
      comments: "Guest: Cleaning is required daily"
    },
    {
      roomNumber: "034",
      roomType: "Single Room (Single)",
      housekeepingStatus: "Clean",
      priority: "Low",
      floor: 1,
      reservationStatus: "Vacant",
      comments: "-"
    },
    {
      roomNumber: "050",
      roomType: "Single Room (Single)",
      housekeepingStatus: "Dirty",
      priority: "High",
      floor: 2,
      reservationStatus: "Confirmed",
      comments: "Guest: Daily cleaning"
    },
    {
      roomNumber: "100",
      roomType: "Double Room (Twin)",
      housekeepingStatus: "Cleaning",
      priority: "High",
      floor: 4,
      reservationStatus: "Confirmed",
      comments: "Guest: AC remote not working properly"
    },
    {
      roomNumber: "114",
      roomType: "Double Room (Twin)",
      housekeepingStatus: "Change to",
      priority: "High",
      floor: 5,
      reservationStatus: "Confirmed",
      comments: "Guest: TV sound problem"
    },
    {
      roomNumber: "131",
      roomType: "Hospitality lodge (Suite)",
      housekeepingStatus: "Dirty",
      priority: "High",
      floor: 5,
      reservationStatus: "Due In",
      comments: "Guest: Allergy to wool"
    },
    {
      roomNumber: "132",
      roomType: "Hospitality lodge (Suite)",
      housekeepingStatus: "Clean",
      priority: "Low",
      floor: 5,
      reservationStatus: "Vacant",
      comments: "-"
    },
    {
      roomNumber: "135",
      roomType: "Hospitality lodge (Suite)",
      housekeepingStatus: "Cleaning",
      priority: "High",
      floor: 5,
      reservationStatus: "Due In",
      comments: "Guest: Allergy to wool"
    },
    {
      roomNumber: "141",
      roomType: "Presidential suite (Suite)",
      housekeepingStatus: "Dirty",
      priority: "High",
      floor: 6,
      reservationStatus: "Checked Out",
      comments: "Guest: Allergy to wool"
    },
    {
      roomNumber: "149",
      roomType: "Presidential suite (Suite)",
      housekeepingStatus: "Cleaning",
      priority: "High",
      floor: 6,
      reservationStatus: "Confirmed",
      comments: "Guest: Daily change of bed"
    },
    {
      roomNumber: "150",
      roomType: "Double Room (Twin)",
      housekeepingStatus: "Clean",
      priority: "Low",
      floor: 6,
      reservationStatus: "Confirmed",
      comments: "Guest: Daily change of bed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cleaning':
        return 'bg-blue-100 text-blue-800';
      case 'Change to':
        return 'bg-orange-100 text-orange-800';
      case 'Clean':
        return 'bg-green-100 text-green-800';
      case 'Dirty':
        return 'bg-red-100 text-red-800';
      case 'Due In':
        return 'bg-purple-100 text-purple-800';
      case 'Checked Out':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'Due In':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Vacant':
        return 'bg-purple-100 text-purple-800';
      case 'Checked Out':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'High' ? (
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    ) : (
      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
    );
  };

  const handleStatusUpdate = (roomNumber: string, newStatus: string) => {
    const room = rooms.find((r: any) => r.number === roomNumber);
    if (room) {
      updateRoomStatus.mutate({ roomId: room.id, status: newStatus });
    }
  };

  const filteredTasks = housekeepingTasks.filter(task => {
    const matchesSearch = task.roomNumber.includes(searchTerm) || 
                         task.comments.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.housekeepingStatus === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesFloor = floorFilter === "all" || task.floor.toString() === floorFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesFloor;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping</h1>
          <p className="text-gray-600">Manage room cleaning and maintenance schedules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Clean">Clean</SelectItem>
                  <SelectItem value="Dirty">Dirty</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double">Double</SelectItem>
                  <SelectItem value="Suite">Suite</SelectItem>
                </SelectContent>
              </Select>
              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  <SelectItem value="1">Floor 1</SelectItem>
                  <SelectItem value="2">Floor 2</SelectItem>
                  <SelectItem value="4">Floor 4</SelectItem>
                  <SelectItem value="5">Floor 5</SelectItem>
                  <SelectItem value="6">Floor 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Housekeeping Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    <Checkbox className="mr-2" />
                    Room
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Room Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Housekeeping Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Floor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reservation Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Comments and notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => (
                  <tr key={task.roomNumber} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="font-medium text-gray-900">{task.roomNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{task.roomType}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Select 
                        value={task.housekeepingStatus}
                        onValueChange={(value) => handleStatusUpdate(task.roomNumber, value)}
                      >
                        <SelectTrigger className={`w-[120px] ${getStatusColor(task.housekeepingStatus)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cleaning">Cleaning</SelectItem>
                          <SelectItem value="Change to">Change to</SelectItem>
                          <SelectItem value="Clean">Clean</SelectItem>
                          <SelectItem value="Dirty">Dirty</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(task.priority)}
                        <span className="text-sm text-gray-900">{task.priority}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">{task.floor}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant="secondary"
                        className={getReservationStatusColor(task.reservationStatus)}
                      >
                        {task.reservationStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <span className="text-sm text-gray-600 truncate">{task.comments}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing: 1 - 25 of 150
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="text-gray-500">...</span>
              <Button variant="outline" size="sm">6</Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}