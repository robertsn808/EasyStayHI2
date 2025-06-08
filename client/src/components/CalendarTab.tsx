import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CalendarTabProps {
  events?: any[];
}

export function CalendarTab({ events = [] }: CalendarTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Calendar Events</h3>
        <Badge variant="secondary">{events.length} total</Badge>
      </div>
      
      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No calendar events scheduled.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event: any, index: number) => (
            <Card key={event.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <Badge variant="outline">{event.type || 'Event'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(event.date || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span>{event.time || 'All day'}</span>
                  </div>
                </div>
                <p className="text-sm mt-2">{event.description}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="outline">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}