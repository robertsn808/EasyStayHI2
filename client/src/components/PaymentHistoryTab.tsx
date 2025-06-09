import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter, Download, FileSpreadsheet, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentHistoryTabProps {
  payments?: any[];
}

export function PaymentHistoryTab({ payments = [] }: PaymentHistoryTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  const { toast } = useToast();

  // Fetch payment data
  const { data: paymentsData = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  // Export mutations
  const exportPDFMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'excel') => {
      const response = await apiRequest("POST", "/api/admin/export/payments", {
        format,
        data: filteredPayments,
        filters: { searchTerm, statusFilter, dateFilter }
      });
      return response;
    },
    onSuccess: (data: any, format) => {
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        toast({
          title: "Export Successful",
          description: `Payment history ${format.toUpperCase()} has been generated and downloaded.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export payment history",
        variant: "destructive",
      });
    },
  });

  // Filter payments based on search and filters
  const filteredPayments = paymentsData.filter((payment: any) => {
    const paymentData = payment.payment || payment;
    const matchesSearch = searchTerm === "" || 
      (paymentData.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       paymentData.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       paymentData.method?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || paymentData.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all" && paymentData.payment_date) {
      const paymentDate = new Date(paymentData.payment_date);
      const now = new Date();
      switch (dateFilter) {
        case "today":
          matchesDate = paymentDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const getPaginationInfo = () => {
    const start = startIndex + 1;
    const end = Math.min(endIndex, filteredPayments.length);
    const total = filteredPayments.length;
    return `${start}-${end} of ${total}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Tenant", "Room", "Amount", "Method", "Status", "Description"];
    const csvData = filteredPayments.map((payment: any) => {
      const paymentData = payment.payment || payment;
      return [
        paymentData.payment_date ? new Date(paymentData.payment_date).toLocaleDateString() : "",
        paymentData.tenantName || "",
        paymentData.roomNumber || "",
        paymentData.amount || "",
        paymentData.method || "",
        paymentData.status || "",
        paymentData.description || ""
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payment-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payment History
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={() => exportPDFMutation.mutate('pdf')} 
              variant="outline"
              disabled={exportPDFMutation.isPending}
            >
              <File className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              onClick={() => exportPDFMutation.mutate('excel')} 
              variant="outline"
              disabled={exportPDFMutation.isPending}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tenant, room, or method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-muted-foreground">
                {filteredPayments.length} results
              </span>
            </div>
          </div>

          {/* Payment History List */}
          <div className="space-y-4">
            {currentPayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {paymentsData.length === 0 ? "No payment history available." : "No payments match your filters."}
              </p>
            ) : (
              <>
                <div className="grid gap-4">
                  {currentPayments.map((payment: any, index: number) => {
                    const paymentData = payment.payment || payment;
                    return (
                      <div key={payment.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">
                              {paymentData.tenantName || "Unknown Tenant"}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              Room {paymentData.roomNumber || "N/A"}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(paymentData.status)}>
                              {paymentData.status || "Unknown"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="font-medium">Amount:</span> ${paymentData.amount || "0.00"}
                            </div>
                            <div>
                              <span className="font-medium">Method:</span> {paymentData.method || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span>{" "}
                              {paymentData.payment_date 
                                ? new Date(paymentData.payment_date).toLocaleDateString()
                                : "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Building:</span> {paymentData.buildingName || "N/A"}
                            </div>
                          </div>
                          {paymentData.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Note:</span> {paymentData.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {getPaginationInfo()} payments
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}