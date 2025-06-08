import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TodosTabProps {
  todos?: any[];
}

export function TodosTab({ todos = [] }: TodosTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Todo List</h3>
        <Badge variant="secondary">{todos.length} tasks</Badge>
      </div>
      
      {todos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No tasks available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {todos.map((todo: any, index: number) => (
            <Card key={todo.id || index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={todo.completed || false}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </h4>
                      <Badge variant={todo.priority === 'high' ? 'destructive' : todo.priority === 'medium' ? 'secondary' : 'outline'}>
                        {todo.priority || 'low'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Delete</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}