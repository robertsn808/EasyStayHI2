import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Announcement } from "@shared/schema";

export default function BulletinBoard() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/announcements"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">934 Property Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-4 border-gray-200 bg-gray-50 p-4 rounded-r-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case "warning":
        return "announcement-warning";
      case "success":
        return "announcement-success";
      default:
        return "announcement-info";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-900">934 Property Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements?.map((announcement: Announcement) => (
            <div
              key={announcement.id}
              className={`p-4 rounded-r-lg ${getAnnouncementStyle(announcement.type)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                <span className="text-sm text-gray-500">
                  {formatDate(announcement.createdAt!)}
                </span>
              </div>
              <p className="text-gray-700">{announcement.content}</p>
            </div>
          ))}
          {(!announcements || announcements.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No announcements at this time.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
