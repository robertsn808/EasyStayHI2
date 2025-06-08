import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

interface TodosTabProps {
  todos?: any[];
}

export function TodosTab({ todos = [] }: TodosTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PATCH', `/api/admin/todos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/todos'] });
      toast({ title: "Success", description: "Todo updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update todo", variant: "destructive" });
    }
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/todos'] });
      toast({ title: "Success", description: "Todo deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete todo", variant: "destructive" });
    }
  });

  const createTodoMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/todos', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/todos'] });
      toast({ title: "Success", description: "Todo created successfully" });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create todo", variant: "destructive" });
    }
  });

  const handleToggleComplete = (todo: any) => {
    updateTodoMutation.mutate({ 
      id: todo.id, 
      data: { isCompleted: !todo.isCompleted }
    });
  };

  const handleEditTodo = (todo: any) => {
    setEditingTodo(todo);
    setIsDialogOpen(true);
  };

  const handleDeleteTodo = (todo: any) => {
    if (confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      deleteTodoMutation.mutate(todo.id);
    }
  };

  const handleSaveEdit = () => {
    if (editingTodo) {
      updateTodoMutation.mutate({ 
        id: editingTodo.id, 
        data: {
          title: editingTodo.title,
          description: editingTodo.description,
          priority: editingTodo.priority
        }
      });
      setIsDialogOpen(false);
      setEditingTodo(null);
    }
  };

  const handleCreateTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      isCompleted: false
    };
    createTodoMutation.mutate(data);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Todo List</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{todos.length} tasks</Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Todo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Todo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTodo} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createTodoMutation.isPending}>
                  {createTodoMutation.isPending ? "Adding..." : "Add Todo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                    onCheckedChange={() => handleToggleComplete(todo)}
                    disabled={updateTodoMutation.isPending}
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditTodo(todo)}
                        disabled={updateTodoMutation.isPending}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteTodo(todo)}
                        disabled={deleteTodoMutation.isPending}
                      >
                        Delete
                      </Button>
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