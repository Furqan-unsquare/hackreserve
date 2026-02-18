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
    }).sort((a, b) => {
        const isPaidA = a.paymentStatus === 'paid';
        const isPaidB = b.paymentStatus === 'paid';

        if (isPaidA && !isPaidB) return 1;
        if (!isPaidA && isPaidB) return -1;

        if (!isPaidA) {
            const balanceA = (a.billingAmount || 0) - (a.receivedAmount || 0);
            const balanceB = (b.billingAmount || 0) - (b.receivedAmount || 0);
            return balanceB - balanceA;
        }

        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    const totalBilled = filteredFiles.reduce((sum, f) => sum + (f.billingAmount || 0), 0);
    const totalReceived = filteredFiles.reduce((sum, f) => sum + (f.receivedAmount || 0), 0);
    const totalDue = totalBilled - totalReceived;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
        </div>
    );

    return (
        <div className="p-6 mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage invoices, track payments and receivables.</p>
                </div>
                <button 
                    onClick={exportToCSV} 
                    className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-black transition-colors"
                >
                    <Download className="inline w-4 h-4 mr-2" /> Export CSV
                </button>
            </div>

            {/* Summary Cards - Simplified */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-2">Total Billed</div>
                    <div className="text-2xl font-bold text-gray-900">₹{totalBilled.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-2">Total Received</div>
                    <div className="text-2xl font-bold text-gray-900">₹{totalReceived.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-2">Outstanding</div>
                    <div className="text-2xl font-bold text-gray-900">₹{totalDue.toLocaleString('en-IN')}</div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Controls */}
                <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients or files..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md bg-gray-50">
                            <Filter className="w-3.5 h-3.5 text-gray-400" />
                            <select
                                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFiles.map((file) => {
                                const balance = (file.billingAmount || 0) - (file.receivedAmount || 0);
                                return (
                                    <tr key={file._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center text-xs font-semibold text-gray-700">
                                                    {(file.clientName || 'N/A')[0]}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{file.clientName || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{file.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {file.dueDate ? new Date(file.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">₹{file.billingAmount?.toLocaleString('en-IN') || 0}</div>
                                            {balance > 0 && (
                                                <div className="text-xs font-medium text-red-600">₹{balance.toLocaleString('en-IN')} due</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                file.paymentStatus === 'paid' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : file.paymentStatus === 'partial' 
                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                        : 'bg-red-100 text-red-800'
                                            }`}>
                                                {file.paymentStatus?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 space-x-reverse">
                                            <button
                                                onClick={() => openPaymentModal(file)}
                                                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                                title="Update Payment"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const response = await api.get(`/api/files/${file._id}/invoice`, { responseType: 'blob' });
                                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `Invoice-${file.name}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (err) {
                                                        console.error('Invoice download failed', err);
                                                        alert('Could not download invoice.');
                                                    }
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                                title="Download Invoice"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredFiles.length === 0 && !loading && (
                    <div className="p-12 text-center text-gray-500">
                        No billing records found
                    </div>
                )}
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
