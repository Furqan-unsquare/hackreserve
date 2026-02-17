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
    Bell
} from 'lucide-react';
import api from '../../api/axios';

const Overview = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    const metrics = [
        { title: 'Total Clients', value: stats?.totalClients || 0, change: '+12.5%', icon: <Users />, gradient: 'from-blue-500 to-indigo-600' },
        { title: 'Active Filings', value: stats?.totalFiles || 0, change: '+8.2%', icon: <FileText />, gradient: 'from-emerald-500 to-teal-600' },
        { title: 'Pending Dues', value: `₹${(stats?.totalDue || 0).toLocaleString('en-IN')}`, change: '-2.4%', icon: <IndianRupee />, gradient: 'from-rose-500 to-pink-600' },
        { title: 'Total Revenue', value: `₹${(stats?.revenue || 0).toLocaleString('en-IN')}`, change: '+14.6%', icon: <TrendingUp />, gradient: 'from-amber-500 to-orange-600' },
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Practice Overview</h1>
                    <p className="text-gray-500 mt-1 font-medium">Welcome back! Here's what's happening today.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-2xl w-full md:w-64 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm relative text-gray-600">
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-10 w-px bg-gray-200 mx-2 hidden md:block"></div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 leading-tight">Admin User</p>
                            <p className="text-xs font-medium text-indigo-600">Senior Partner</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
                            AU
                        </div>
                    </div>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {metrics.map((item, i) => (
                    <div key={i} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden flex flex-col items-start">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500`}></div>

                        <div className={`mb-4 p-3 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                            {item.icon}
                        </div>

                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-black text-gray-900">{item.value}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {item.change}
                            </span>
                        </div>

                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{item.title}</p>

                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            View details <ArrowUpRight size={14} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Progress Chart Card */}
                <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 h-full flex flex-col items-start">
                    <div className="flex items-center justify-between w-full mb-10">
                        <div className="text-left">
                            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="text-indigo-600" />
                                Workflow Distribution
                            </h3>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">Live Status Tracking</p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white shadow-sm text-gray-900 transition-all">Today</button>
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-700 transition-all">This Month</button>
                        </div>
                    </div>

                    <div className="space-y-8 w-full">
                        {Object.entries(stats?.statusDistribution || {}).map(([status, count]: [string, any], idx) => {
                            const colors = ['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-600'];
                            const pct = stats.totalFiles > 0 ? (count / stats.totalFiles) * 100 : 0;

                            return (
                                <div key={status} className="group flex flex-col items-start">
                                    <div className="flex justify-between items-end w-full mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></div>
                                            <span className="text-sm font-bold text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-gray-900">{count}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">files</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-50 h-5 rounded-2xl border border-gray-100 p-1">
                                        <div
                                            className={`h-full ${colors[idx % colors.length]} rounded-xl shadow-sm transition-all duration-1000 ease-out`}
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 w-full flex items-center justify-between">
                        <div className="flex gap-8">
                            <div className="flex flex-col items-start">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Avg Efficiency</p>
                                <p className="text-lg font-black text-gray-900">94.2%</p>
                            </div>
                            <div className="flex flex-col items-start">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">SLA Compliance</p>
                                <p className="text-lg font-black text-gray-900">100%</p>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                            Detailed Analytics <ArrowUpRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Activity Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden h-full flex flex-col items-start">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full -translate-y-32 translate-x-16"></div>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-indigo-400" />
                            Recent Activity
                        </h3>

                        <div className="space-y-6 w-full flex-1">
                            {(stats?.recentActivity || []).length > 0 ? (
                                stats.recentActivity.map((act: any, i: number) => (
                                    <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                                        {i < (stats.recentActivity.length - 1) && <div className="absolute left-2.5 top-8 bottom-0 w-px bg-white/10"></div>}
                                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 border-4 border-gray-900 z-10 flex-shrink-0"></div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">{act.t}</p>
                                            <p className="text-sm font-bold text-white mb-0.5">{act.d}</p>
                                            <p className="text-[10px] text-white/50 font-medium">{new Date(act.time).toLocaleTimeString()} • {act.s}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/50 text-sm">No recent activity.</p>
                            )}
                        </div>

                        <button className="mt-8 w-full py-3 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                            See All Activity
                        </button>
                    </div>

                    {/* Quick Support Card */}
                    <div className="bg-indigo-50 p-8 rounded-[2.5rem] h-full flex flex-col items-start">
                        <div className="p-3 bg-white rounded-2xl text-indigo-600 mb-6 shadow-sm">
                            <IndianRupee size={22} />
                        </div>
                        <h4 className="text-lg font-extrabold text-gray-900 text-left">Revenue Goal</h4>
                        <p className="text-sm text-gray-600 mt-2 mb-6 text-left">You're at 85% of your monthly filing target. Keep going!</p>

                        <div className="w-full bg-white h-2 rounded-full overflow-hidden mb-6">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 w-[85%]"></div>
                        </div>

                        <button className="flex items-center gap-2 text-sm font-black text-indigo-700 hover:gap-3 transition-all">
                            Set New Target <ArrowUpRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
