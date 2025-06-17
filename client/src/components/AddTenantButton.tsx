import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";

interface TenantForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roomId: string;
  monthlyRent: string;
  leaseStart: string;
  leaseEnd: string;
}

interface AddTenantButtonProps {
  rooms: any[];
}

export default function AddTenantButton({ rooms }: AddTenantButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TenantForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roomId: "",
    monthlyRent: "",
    leaseStart: "",
    leaseEnd: ""
  });

  const queryClient = useQueryClient();

  const createTenantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/tenants", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to create tenant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tenants"] });
      setShowModal(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        roomId: "",
        monthlyRent: "",
        leaseStart: "",
        leaseEnd: ""
      });
    }
  });

  return (
    <>
      <button
        onClick={() => {
          console.log("NEW BUTTON CLICKED!");
          setShowModal(true);
        }}
        className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-md text-sm font-medium transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Tenant (NEW)
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Tenant</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone,
                roomId: form.roomId ? parseInt(form.roomId) : null,
                monthlyRent: form.monthlyRent ? parseFloat(form.monthlyRent) : null,
                leaseStart: form.leaseStart || null,
                leaseEnd: form.leaseEnd || null
              };
              createTenantMutation.mutate(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({...form, firstName: e.target.value})}
                    placeholder="John"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({...form, lastName: e.target.value})}
                    placeholder="Doe"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="john.doe@example.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="(808) 555-0123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Room *</label>
                <select 
                  value={form.roomId} 
                  onChange={(e) => setForm({...form, roomId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a room</option>
                  {(rooms || []).filter(room => room.status === 'available').map((room: any) => (
                    <option key={room.id} value={room.id.toString()}>
                      Room {room.number} - {room.size} (${room.rentalRate}/month)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Rent *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.monthlyRent}
                  onChange={(e) => setForm({...form, monthlyRent: e.target.value})}
                  placeholder="1200.00"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Lease Start</label>
                  <input
                    type="date"
                    value={form.leaseStart}
                    onChange={(e) => setForm({...form, leaseStart: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lease End</label>
                  <input
                    type="date"
                    value={form.leaseEnd}
                    onChange={(e) => setForm({...form, leaseEnd: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createTenantMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createTenantMutation.isPending ? "Adding..." : "Add Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}