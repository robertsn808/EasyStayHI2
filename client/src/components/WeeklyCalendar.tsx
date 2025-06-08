import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";

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

interface WeeklyCalendarProps {
  events?: CalendarEvent[];
}

export default function WeeklyCalendar({ events = [] }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      try {
        const eventDate = parseISO(event.date);
        return isSameDay(eventDate, day);
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
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-700">
          {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={index} className="space-y-2">
                <div className={`text-center p-2 rounded-lg ${
                  isToday 
                    ? 'bg-blue-100 text-blue-800 font-semibold' 
                    : 'text-gray-600'
                }`}>
                  <div className="text-sm font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg">
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-1 min-h-[200px]">
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
      </CardContent>
    </Card>
  );
}