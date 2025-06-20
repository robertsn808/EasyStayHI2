import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Building, FileText, Calendar, Share2, Download, Mail, Link2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FinancialReportsTabProps {
  payments?: any[];
  receipts?: any[];
  buildings?: any[];
}

export function FinancialReportsTab({ payments = [], receipts = [], buildings = [] }: FinancialReportsTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareMethod, setShareMethod] = useState("email");
  
  const { toast } = useToast();

  // Fetch financial data
  const { data: expenseData = [] } = useQuery({
    queryKey: ["/api/admin/expenses"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  const { data: paymentsData = [] } = useQuery({
    queryKey: ["/api/admin/payments"],
    enabled: localStorage.getItem('admin-authenticated') === 'true',
  });

  // Sharing mutations
  const shareReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/reports/share", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Report Shared Successfully",
        description: shareMethod === "email" ? "Report sent to email" : "Share link generated",
      });
      if (shareMethod === "link" && data.shareUrl) {
        navigator.clipboard.writeText(data.shareUrl);
        toast({
          title: "Link Copied",
          description: "Share link copied to clipboard",
        });
      }
      setShowShareDialog(false);
      setShareEmail("");
      setShareMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Share Failed",
        description: error.message || "Failed to share report",
        variant: "destructive",
      });
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: async (format: string) => {
      const reportData = generateReportData();
      return await apiRequest("POST", "/api/admin/reports/export", {
        format,
        data: reportData,
        period: selectedPeriod,
        property: selectedProperty,
      });
    },
    onSuccess: (data) => {
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      toast({
        title: "Report Exported",
        description: "Report downloaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export report",
        variant: "destructive",
      });
    },
  });

  // Generate comprehensive report data for sharing/export
  const generateReportData = () => {
    const financials = calculateFinancials();
    return {
      period: selectedPeriod,
      property: selectedProperty,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: financials.totalRevenue,
        totalExpenses: financials.totalExpenses,
        netProfit: financials.netProfit,
        occupancyRate: financials.occupancyRate,
      },
      details: {
        revenue: financials.revenueByCategory,
        expenses: financials.expensesByCategory,
        monthlyTrends: financials.monthlyData,
        propertyComparison: financials.propertyComparison,
      },
      rawData: {
        payments: paymentsData,
        expenses: expenseData,
      }
    };
  };

  // Handle sharing functionality
  const handleShare = () => {
    const reportData = generateReportData();
    shareReportMutation.mutate({
      method: shareMethod,
      email: shareEmail,
      message: shareMessage,
      reportData,
    });
  };

  const handleQuickExport = (format: string) => {
    exportReportMutation.mutate(format);
  };

  const handleCopyReportLink = async () => {
    try {
      const reportData = generateReportData();
      const response = await apiRequest("POST", "/api/admin/reports/generate-link", {
        reportData,
        expiresIn: "7d", // Link expires in 7 days
      });
      
      if (response.shareUrl) {
        await navigator.clipboard.writeText(response.shareUrl);
        toast({
          title: "Link Copied",
          description: "Shareable report link copied to clipboard",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate shareable link",
        variant: "destructive",
      });
    }
  };

  // Calculate financial metrics
  const calculateFinancials = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter data by selected period
    const filterByPeriod = (data: any[], dateField: string) => {
      return data.filter(item => {
        const itemDate = new Date(item[dateField]);
        switch (selectedPeriod) {
          case "current-month":
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
          case "last-month":
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear;
          case "current-year":
            return itemDate.getFullYear() === currentYear;
          case "last-year":
            return itemDate.getFullYear() === currentYear - 1;
          default:
            return true;
        }
      });
    };

    const filteredPayments = filterByPeriod(Array.isArray(paymentsData) ? paymentsData : [], 'payment_date');
    const filteredExpenses = filterByPeriod(Array.isArray(expenseData) ? expenseData : [], 'receipt_date');

    // Calculate totals
    const totalRevenue = filteredPayments.reduce((sum, payment) => {
      const amount = payment.payment?.amount || payment.amount || 0;
      return sum + parseFloat(amount);
    }, 0);

    const totalExpenses = filteredExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.amount || 0);
    }, 0);

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      filteredPayments,
      filteredExpenses
    };
  };

  const financials = calculateFinancials();

  // Property revenue comparison data
  const getPropertyRevenueData = () => {
    const propertyRevenue = buildings.map(building => {
      const buildingPayments = paymentsData.filter(payment => {
        const room = payment.room || {};
        return room.buildingId === building.id;
      });
      
      const revenue = buildingPayments.reduce((sum, payment) => {
        const amount = payment.payment?.amount || payment.amount || 0;
        return sum + parseFloat(amount);
      }, 0);

      return {
        name: building.name || `Building ${building.id}`,
        revenue: revenue,
        address: building.address
      };
    });

    return propertyRevenue;
  };

  // Monthly trend data
  const getMonthlyTrendData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthPayments = paymentsData.filter(payment => {
        const paymentDate = new Date(payment.payment_date || payment.createdAt);
        return paymentDate.getMonth() === date.getMonth() && paymentDate.getFullYear() === date.getFullYear();
      });
      
      const monthExpenses = expenseData.filter(expense => {
        const expenseDate = new Date(expense.receipt_date || expense.createdAt);
        return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear();
      });
      
      const revenue = monthPayments.reduce((sum, payment) => {
        const amount = payment.payment?.amount || payment.amount || 0;
        return sum + parseFloat(amount);
      }, 0);
      
      const expenses = monthExpenses.reduce((sum, expense) => {
        return sum + parseFloat(expense.amount || 0);
      }, 0);
      
      months.push({
        month: monthName,
        revenue: revenue,
        expenses: expenses,
        profit: revenue - expenses
      });
    }
    
    return months;
  };

  // Expense breakdown by category
  const getExpenseBreakdown = () => {
    const categoryTotals = {};
    
    financials.filteredExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount || 0);
    });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
      percentage: ((amount / financials.totalExpenses) * 100).toFixed(1)
    }));
  };

  const propertyRevenueData = getPropertyRevenueData();
  const monthlyTrendData = getMonthlyTrendData();
  const expenseBreakdownData = getExpenseBreakdown();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Financial Reports</h3>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          {/* One-Click Sharing Actions */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyReportLink}
            className="flex items-center gap-2"
          >
            <Link2 className="h-4 w-4" />
            Copy Link
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickExport('pdf')}
            disabled={exportReportMutation.isPending}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exportReportMutation.isPending ? 'Exporting...' : 'PDF'}
          </Button>
          
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Financial Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shareMethod">Share Method</Label>
                  <Select value={shareMethod} onValueChange={setShareMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="link">Generate Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {shareMethod === 'email' && (
                  <>
                    <div>
                      <Label htmlFor="shareEmail">Email Address</Label>
                      <Input
                        id="shareEmail"
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shareMessage">Message (Optional)</Label>
                      <Textarea
                        id="shareMessage"
                        value={shareMessage}
                        onChange={(e) => setShareMessage(e.target.value)}
                        placeholder="Add a personal message..."
                        rows={3}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleShare}
                    disabled={shareReportMutation.isPending || (shareMethod === 'email' && !shareEmail)}
                  >
                    {shareReportMutation.isPending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        {shareMethod === 'email' ? <Mail className="h-4 w-4 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                        {shareMethod === 'email' ? 'Send Email' : 'Generate Link'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${financials.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${financials.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${financials.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${financials.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {financials.netProfit >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-600" /> : 
                <TrendingDown className="h-8 w-8 text-red-600" />
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className={`text-2xl font-bold ${financials.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financials.profitMargin.toFixed(1)}%
                </p>
              </div>
              <Badge variant={financials.profitMargin >= 0 ? "default" : "destructive"}>
                {financials.profitMargin >= 0 ? "Profitable" : "Loss"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Property Comparison</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit & Loss Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Revenue', amount: financials.totalRevenue, color: '#10B981' },
                    { name: 'Expenses', amount: financials.totalExpenses, color: '#EF4444' },
                    { name: 'Net Profit', amount: Math.abs(financials.netProfit), color: financials.netProfit >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill={(entry) => entry.color} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {[...financials.filteredPayments.slice(0, 5), ...financials.filteredExpenses.slice(0, 5)]
                    .sort((a, b) => new Date(b.payment_date || b.receipt_date || b.createdAt) - new Date(a.payment_date || a.receipt_date || a.createdAt))
                    .slice(0, 8)
                    .map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {transaction.title || transaction.vendor || `Payment #${transaction.id}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.payment_date || transaction.receipt_date || transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.vendor ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.vendor ? '-' : '+'}${parseFloat(transaction.amount || transaction.payment?.amount || 0).toFixed(2)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.vendor ? 'Expense' : 'Revenue'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Property</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={propertyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Financial Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseBreakdownData.map((category, index) => (
                    <div key={category.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${category.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}