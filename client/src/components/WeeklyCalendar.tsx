import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, CheckSquare } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  type: string;
  room_id?: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Todo {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: string;
  dueDate?: string;
}

interface WeeklyCalendarProps {
  events?: CalendarEvent[];
}

export default function WeeklyCalendar({ events = [] }: WeeklyCalendarProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Fetch todos data
  const { data: todos } = useQuery({
    queryKey: ["/api/admin/todos"],
  });

  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + (currentWeekOffset * 7));
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const weekDays = getWeekDays();

  const goToPreviousWeek = () => {
    setCurrentWeekOffset(currentWeekOffset - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset(currentWeekOffset + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekOffset(0);
  };

  const formatDate = (date: Date, format: string) => {
    if (format === 'EEE') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    if (format === 'd') {
      return date.getDate().toString();
    }
    return date.toLocaleDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      try {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === day.toDateString();
      } catch {
        return false;
      }
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'inspection':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'checkin':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'checkout':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'maintenance':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'training':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View All
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-700">
          {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isDayToday = isToday(day);
            
            return (
              <div key={index} className="space-y-2">
                <div className={`text-center p-2 rounded-lg ${
                  isDayToday 
                    ? 'bg-blue-100 text-blue-800 font-semibold' 
                    : 'text-gray-600'
                }`}>
                  <div className="text-sm font-medium">
                    {formatDate(day, 'EEE')}
                  </div>
                  <div className="text-lg">
                    {formatDate(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-1 min-h-[100px]">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-2 rounded border text-xs ${getEventTypeColor(event.type)} ${
                        event.is_completed ? 'opacity-60 line-through' : ''
                      }`}
                    >
                      <div className="font-medium truncate" title={event.title}>
                        {event.title}
                      </div>
                      {event.description && (
                        <div className="text-xs opacity-75 truncate" title={event.description}>
                          {event.description}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                        <Clock className="h-3 w-3" />
                        {event.type}
                      </div>
                    </div>
                  ))}
                  
                  {dayEvents.length === 0 && (
                    <div className="h-8 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      No events
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-2">Event Types</div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
              <span>Inspection</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
              <span>Check-in</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></div>
              <span>Check-out</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
              <span>Training</span>
            </div>
          </div>
        </div>

        {/* Todo List Section - Condensed */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Todo List
            </h3>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                View All
              </Button>
              <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            {Array.isArray(todos) && todos.slice(0, 2).map((todo: any) => (
              <div key={todo.id} className="flex items-center gap-2 p-1.5 rounded text-xs">
                <Checkbox 
                  checked={todo.isCompleted} 
                  className="shrink-0 h-3 w-3"
                />
                <div className="flex-1 min-w-0">
                  <div className={`${todo.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {todo.title}
                  </div>
                </div>
                <Badge 
                  variant={todo.priority === 'high' ? 'destructive' : todo.priority === 'medium' ? 'default' : 'secondary'}
                  className="shrink-0 text-xs px-1 py-0"
                >
                  {todo.priority}
                </Badge>
              </div>
            ))}
            {(!todos || !Array.isArray(todos) || todos.length === 0) && (
              <div className="text-xs text-gray-500 text-center py-2">
                No todos yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}