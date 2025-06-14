import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, CreditCard, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount_pence: number;
  currency: string;
  status: string;
  created_at: string;
  guardian: {
    first_name: string;
    last_name: string;
    email: string;
  };
  player: {
    first_name: string;
    last_name: string;
  };
}

interface BillingStats {
  total_revenue: number;
  active_subscriptions: number;
  failed_payments: number;
  monthly_recurring_revenue: number;
}

const AdminBillingDashboard = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadBillingData();
  }, [statusFilter, dateRange]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Calculate date filter
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(dateRange));

      // Load payments with guardian and player info
      let paymentsQuery = supabase
        .from('payments')
        .select(`
          *,
          subscriptions!inner(
            guardian_id,
            player_id,
            guardians!inner(first_name, last_name, email),
            players!inner(first_name, last_name)
          )
        `)
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        paymentsQuery = paymentsQuery.eq('status', statusFilter);
      }

      const { data: paymentsData, error: paymentsError } = await paymentsQuery;
      if (paymentsError) throw paymentsError;

      // Transform the data to flatten the nested structure
      const transformedPayments = paymentsData?.map(payment => ({
        ...payment,
        guardian: payment.subscriptions.guardians,
        player: payment.subscriptions.players
      })) || [];

      setPayments(transformedPayments);

      // Calculate stats
      const { data: activeSubsData } = await supabase
        .from('subscriptions')
        .select('count')
        .eq('status', 'active');

      const { data: failedPaymentsData } = await supabase
        .from('payments')
        .select('count')
        .eq('status', 'failed')
        .gte('created_at', fromDate.toISOString());

      const totalRevenue = transformedPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount_pence, 0);

      const monthlyRevenue = transformedPayments
        .filter(p => p.status === 'paid' && new Date(p.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, p) => sum + p.amount_pence, 0);

      setStats({
        total_revenue: totalRevenue,
        active_subscriptions: activeSubsData?.[0]?.count || 0,
        failed_payments: failedPaymentsData?.[0]?.count || 0,
        monthly_recurring_revenue: monthlyRevenue
      });
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: "Error",
        description: "Failed to load billing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportPayments = async () => {
    try {
      const csv = [
        ['Date', 'Guardian', 'Player', 'Amount', 'Currency', 'Status'].join(','),
        ...payments.map(payment => [
          format(new Date(payment.created_at), 'yyyy-MM-dd'),
          `"${payment.guardian.first_name} ${payment.guardian.last_name}"`,
          `"${payment.player.first_name} ${payment.player.last_name}"`,
          (payment.amount_pence / 100).toFixed(2),
          payment.currency,
          payment.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export payments",
        variant: "destructive",
      });
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.guardian.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.guardian.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.guardian.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.player.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing Dashboard</h2>
          <p className="text-muted-foreground">Monitor payments and subscription revenue</p>
        </div>
        <Button onClick={exportPayments}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{(stats.total_revenue / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Last {dateRange} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{(stats.monthly_recurring_revenue / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed_payments}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateRange('30');
            }}>
              Clear Filters
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.created_at), 'PPp')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {payment.guardian.first_name} {payment.guardian.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.guardian.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.player.first_name} {payment.player.last_name}
                  </TableCell>
                  <TableCell>
                    £{(payment.amount_pence / 100).toFixed(2)} {payment.currency.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found matching the current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBillingDashboard;