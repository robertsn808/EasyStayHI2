import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ContactsTabProps {
  contacts?: any[];
}

export function ContactsTab({ contacts = [] }: ContactsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contact Messages</h3>
        <Badge variant="secondary">{contacts.length} total</Badge>
      </div>
      
      {contacts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No contact messages available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact: any, index: number) => (
            <Card key={contact.id || index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{contact.name}</CardTitle>
                  <Badge variant="secondary">{contact.subject || 'General'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{contact.email}</p>
                <p className="text-sm mb-3">{contact.message}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Reply</Button>
                  <Button size="sm" variant="outline">Archive</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}