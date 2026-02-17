import { useState, useEffect } from 'react';
import {
    Search,
    Download,
    IndianRupee,
    Edit,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    FileText,
    ArrowUpRight,
    Filter
} from 'lucide-react';
import api from '../../api/axios';
import PaymentModal from '../../components/billing/PaymentModal';

const BillingManagement = () => {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        const fetchBilledFiles = async () => {
            try {
                const res = await api.get('/api/files');
                // Include files with billed status OR any file that has a billing amount set
                setFiles(res.data.filter((f: any) => f.status === 'billed' || f.billingAmount > 0));
            } catch (err) {
                console.error('Error fetching billed files:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBilledFiles();
    }, []);

    const updatePayment = async (fileId: string, updates: any) => {
        try {
            const res = await api.put(`/api/files/${fileId}/status`, { ...updates });
            setFiles(prev => prev.map(f => f.id === fileId || f._id === fileId ? { ...f, ...res.data } : f));
        } catch (err) {
            console.error('Error updating payment:', err);
            alert('Failed to update payment status');
        }
    };

    const openPaymentModal = (file: any) => {
        setSelectedFile(file);
        setIsPaymentModalOpen(true);
    };

    const exportToCSV = () => {
        const headers = ['Client', 'File Name', 'Bill Date', 'Bill Amount', 'Received', 'Balance', 'Status'];
        const rows = filteredFiles.map(f => [
            f.clientName || 'N/A',
            f.name,
            f.billedAt ? new Date(f.billedAt).toLocaleDateString() : 'N/A',
            f.billingAmount || 0,
            f.receivedAmount || 0,
            (f.billingAmount || 0) - (f.receivedAmount || 0),
            f.paymentStatus || 'pending'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.body.appendChild(document.createElement("a"));
        link.href = URL.createObjectURL(blob);
        link.download = `billing_report_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        document.body.removeChild(link);
    };

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.clientName && f.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || f.paymentStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalBilled = filteredFiles.reduce((sum, f) => sum + (f.billingAmount || 0), 0);
    const totalReceived = filteredFiles.reduce((sum, f) => sum + (f.receivedAmount || 0), 0);
    const totalDue = totalBilled - totalReceived;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Billing & Receivables</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your invoices, payments and financial health.</p>
                </div>

                <div className="flex gap-4">
                    <button onClick={exportToCSV} className="flex items-center gap-2 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200">
                        <Download size={18} /> Export Records
                    </button>
                </div>
            </header>

            {/* Financial Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-all h-full flex flex-col items-start">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
                        <FileText size={22} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Billed</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-gray-900">₹{totalBilled.toLocaleString('en-IN')}</h2>
                        <span className="text-[10px] font-bold text-gray-400">Total volume</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-all h-full flex flex-col items-start">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-4">
                        <TrendingUp size={22} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Collected</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-emerald-600">₹{totalReceived.toLocaleString('en-IN')}</h2>
                        <span className="text-[10px] font-bold text-emerald-500">{(totalBilled > 0 ? (totalReceived / totalBilled) * 100 : 0).toFixed(1)}% efficiency</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-all h-full flex flex-col items-start">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl mb-4">
                        <IndianRupee size={22} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Outstanding Dues</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-rose-600">₹{totalDue.toLocaleString('en-IN')}</h2>
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">Immediate action</span>
                    </div>
                </div>
            </div>

            {/* Content Table Card */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find client or file title..."
                            className="w-full bg-gray-50/50 border border-gray-100 pl-12 pr-6 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 px-5 py-3 rounded-2xl">
                            <Filter size={18} className="text-gray-400" />
                            <select
                                className="bg-transparent focus:outline-none text-sm font-bold text-gray-700 cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="paid">PAID</option>
                                <option value="partial">PARTIAL</option>
                                <option value="pending">PENDING</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client Relationship</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Billing Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financials</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredFiles.map((file) => {
                                const balance = (file.billingAmount || 0) - (file.receivedAmount || 0);
                                return (
                                    <tr key={file._id} className="group hover:bg-gray-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-indigo-600 text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {(file.clientName || 'NA')[0]}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-extrabold text-gray-900 leading-tight mb-0.5">{file.clientName || 'Unknown Client'}</div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{file.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-left">
                                            <div className="flex items-center gap-1.5 text-xs font-black text-gray-800 leading-none mb-1.5">
                                                <Clock size={12} className="text-gray-400" />
                                                {file.billedAt ? new Date(file.billedAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">INVOICE DATE</div>
                                        </td>
                                        <td className="px-8 py-6 text-left">
                                            <div className="font-black text-gray-900 text-sm leading-tight mb-1">₹{(file.billingAmount || 0).toLocaleString()}</div>
                                            {balance > 0 ? (
                                                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest leading-none">₹{balance.toLocaleString()} PENDING</div>
                                            ) : (
                                                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">FULLY SETTLED</div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-left">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border transition-all ${file.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' :
                                                file.paymentStatus === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-rose-50 text-rose-700 border-rose-100 shadow-sm shadow-rose-100'
                                                }`}>
                                                {file.paymentStatus === 'paid' && <CheckCircle2 size={12} />}
                                                {file.paymentStatus === 'partial' && <Clock size={12} />}
                                                {file.paymentStatus === 'pending' && <XCircle size={12} />}
                                                {file.paymentStatus?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => openPaymentModal(file)}
                                                    className="p-3 bg-white border border-gray-100 rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="Update Payment"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:bg-white hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                                                    <ArrowUpRight size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredFiles.length === 0 && (
                        <div className="p-20 text-center text-gray-400 italic font-medium">
                            No matching billing records found. Try adjusting your filters.
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">End of ledger • Updated just now</p>
                </div>
            </div>

            {isPaymentModalOpen && selectedFile && (
                <PaymentModal
                    file={selectedFile}
                    onClose={() => { setIsPaymentModalOpen(false); setSelectedFile(null); }}
                    onUpdate={updatePayment}
                />
            )}
        </div>
    );
};

export default BillingManagement;
