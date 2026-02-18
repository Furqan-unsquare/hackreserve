import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Clock,
  IndianRupee,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Search,
  Bell,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../../api/axios';

const Overview = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationIndex, setNotificationIndex] = useState(0);

  const notifications = [
    "Income Tax Act, 1961 repealed 01.04.2026",
    "TDS/TCS corrections due by 31.03.2026", 
    "ITR Excel utilities now available",
  ];

  useEffect(() => {
    const lastDismissed = localStorage.getItem('taxNotificationDismissed');
    if (!lastDismissed) setShowNotification(true);

    const fetchStats = async () => {
      try {
        const res = await api.get('/api/files/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const dismissNotification = () => {
    localStorage.setItem('taxNotificationDismissed', 'true');
    setShowNotification(false);
  };

  const nextNotification = () => {
    setNotificationIndex((prev) => (prev + 1) % notifications.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  const metrics = [
    { title: 'Total Clients', value: stats?.totalClients || 0, icon: Users },
    { title: 'Active Filings', value: stats?.totalFiles || 0, icon: FileText },
    { title: 'Pending Dues', value: `₹${(stats?.totalDue || 0).toLocaleString('en-IN')}`, icon: IndianRupee },
    { title: 'Total Revenue', value: `₹${(stats?.revenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
  ];

  const areaChartData = [
    { name: 'Onboarded', value: stats?.statusDistribution?.onboarded || 0 },
    { name: 'KYC & Docs', value: stats?.statusDistribution?.documentation || 0 },
    { name: 'ITR Filing', value: stats?.statusDistribution['itr-filing'] || 0 },
    { name: 'Billed', value: stats?.statusDistribution?.billed || 0 },
  ];

  return (
    <div className="p-4 mx-auto space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice Overview</h1>
          <p className="text-xs text-gray-500">Key metrics at a glance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {showNotification && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate font-medium text-gray-900 max-w-[200px]">
                {notifications[notificationIndex]}
              </span>
              <button onClick={nextNotification} className="text-amber-700 text-xs p-0.5 hover:bg-amber-100 rounded">›</button>
              <button onClick={dismissNotification} className="ml-1 p-0.5 hover:bg-amber-100 rounded">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-md w-48 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          <button className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50">
            <Bell className="w-4 h-4 text-gray-600 relative">
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </Bell>
          </button>
        </div>
      </div>

      {/* Compact Metrics - 2 rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, i) => (
          <div key={i} className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-sm">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
              <item.icon className="w-5 h-5 text-gray-700" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{item.value}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Compact Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Compact Workflow Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Workflow Distribution
              </h3>
              <p className="text-xs text-gray-500">{stats?.totalFiles || 0} total files</p>
            </div>
            <div className="flex bg-gray-100 p-0.5 rounded">
              <button className="px-2 py-1 text-xs bg-white rounded text-gray-900 font-medium">Today</button>
            </div>
          </div>
          
          <div className="h-48 w-full mb-3">
            <ResponsiveContainer>
              <AreaChart data={areaChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis tickCount={3} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="text-xs">
              <p className="text-gray-500 uppercase tracking-wide">Billed</p>
              <p className="font-bold text-gray-900">{stats?.statusDistribution?.billed || 0}</p>
            </div>
            <button className="text-xs font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1">
              Details <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Compact Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(stats?.recentActivity || []).length > 0 ? (
              stats.recentActivity.slice(0, 4).map((act: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-gray-900 truncate">{act.d}</p>
                    <p className="text-gray-500">{new Date(act.time).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-xs">
                <Clock className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                No activity
              </div>
            )}
          </div>
          
          <button className="w-full py-1.5 px-3 text-xs border border-gray-200 rounded text-gray-700 hover:bg-gray-50">
            See All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
