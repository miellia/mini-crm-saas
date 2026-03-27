import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { formatDate, getInitials, statusColors } from '@/lib/utils';
import {
  Users,
  UserPlus,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIPE_COLORS = ['#6366f1', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e'];

/**
 * DashboardPage Component
 * 
 * Serves as the primary landing page post-authentication.
 * Aggregates analytical data into charts, performance metrics, and a recent activity log.
 */
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/customers/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Welcome back! Here's an overview." />
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.total,
      icon: Users,
      color: 'text-primary-600 bg-primary-50',
      change: `+${stats.newThisMonth} this month`,
    },
    {
      title: 'Active Leads',
      value: stats.leads,
      icon: UserPlus,
      color: 'text-blue-600 bg-blue-50',
      change: 'In pipeline',
    },
    {
      title: 'Converted',
      value: stats.converted,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
      change: `${stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0}% rate`,
    },
    {
      title: 'Interactions',
      value: stats.interactionsThisMonth,
      icon: MessageSquare,
      color: 'text-amber-600 bg-amber-50',
      change: 'This month',
    },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back! Here's an overview." />

      <div className="p-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => (
            <div
              key={card.title}
              className="stat-card animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <div className={`rounded-xl p-2.5 ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="flex items-center text-xs font-medium text-gray-500">
                  {card.change}
                  <ArrowUpRight className="ml-0.5 h-3 w-3" />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Monthly Growth Chart */}
          <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlyGrowth}>
                    <defs>
                      <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,.05)',
                        padding: '10px 14px',
                        fontSize: '13px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="customers"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorCustomers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Breakdown */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pipelineData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.pipelineData
                        .filter((d) => d.value > 0)
                        .map((_, index) => (
                          <Cell key={index} fill={PIPE_COLORS[index % PIPE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        fontSize: '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {stats.pipelineData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PIPE_COLORS[i] }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Customers + Pipeline Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Customers */}
          <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent Customers</CardTitle>
              <Link
                to="/customers"
                className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">
                    No customers yet
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add your first customer to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentCustomers.map((customer) => (
                    <Link
                      key={customer._id}
                      to={`/customers/${customer._id}`}
                      className="flex items-center gap-4 rounded-xl p-3 -mx-1 transition-all duration-200 hover:bg-gray-50 group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 text-sm font-semibold">
                        {getInitials(customer.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {customer.company || customer.email}
                        </p>
                      </div>
                      <Badge className={statusColors[customer.status]}>
                        {customer.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline Bar Chart */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <CardHeader>
              <CardTitle>By Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.pipelineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={75}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        fontSize: '13px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 6, 6, 0]}
                      barSize={20}
                    >
                      {stats.pipelineData.map((_, index) => (
                        <Cell key={index} fill={PIPE_COLORS[index % PIPE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
