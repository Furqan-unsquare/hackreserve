import React, { useState } from 'react';
import { Upload, CheckCircle, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';

interface ITRFileModalProps {
    client: any;
    onClose: () => void;
    onSuccess: () => void;
}

const ITRFileModal: React.FC<ITRFileModalProps> = ({ client, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState(`${client.category} ITR - ${new Date().getFullYear()}`);
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [uploads, setUploads] = useState<Record<string, { label: string, url: string }>>({});

    const salariedDocs = [
        { id: 'pan', label: 'PAN Card' },
        { id: 'aadhar', label: 'Aadhaar Card' },
        { id: 'form16', label: 'Form 16' },
        { id: 'passbook', label: 'Passbook' }
    ];

    const businessDocs = [
        { id: 'bank_statement', label: 'Bank Statement (Annual)' },
        { id: 'tds_q', label: 'TDS Quarterly' },
        { id: 'tds_m', label: 'TDS Monthly Challan' },
        { id: 'gst', label: 'GST Return (Monthly/Annually)' },
        { id: 'income_stmt', label: 'Annual Income Statement' },
        { id: 'pnl', label: 'P&L Balance Sheet' }
    ];

    const docsToDisplay = client.category?.toLowerCase() === 'salaried' ? salariedDocs : businessDocs;

    const handleFileUpload = (docId: string, label: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploads(prev => ({
                    ...prev,
                    [docId]: { label, url: reader.result as string }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/api/files', {
                clientId: client.id,
                name: fileName,
                amount: amount || 0,
                dueDate
            });

            const fileId = response.data.id;

            // Upload all captured documents
            for (const [, data] of Object.entries(uploads)) {
                await api.post(`/api/files/${fileId}/documents`, {
                    name: data.label,
                    type: 'file',
                    url: data.url
                });
            }

            onSuccess();
        } catch (err) {
            console.error(err);
            alert('Failed to process filing. Please check file sizes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">File ITR for {client.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        {/* <X size={20} /> */} <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ITR Title / Year</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Charged (₹)</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-100 rounded-lg">
                            <span className="text-sm text-orange-700 font-medium">Billing Pending Amount:</span>
                            <span className="text-lg font-bold text-orange-600">
                                ₹{amount || '0'}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">
                                Upload Required Documents ({client.category})
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {docsToDisplay.map(doc => (
                                    <div key={doc.id} className={`
                                        p-3 rounded-xl border transition-all
                                        ${uploads[doc.id]
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white border-gray-200 hover:border-blue-200'
                                        }
                                    `}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-semibold ${uploads[doc.id] ? 'text-green-800' : 'text-gray-700'}`}>
                                                {doc.label}
                                            </span>
                                            {uploads[doc.id] && <CheckCircle size={14} className="text-green-600" />}
                                        </div>

                                        <label className={`
                                            cursor-pointer flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full
                                            ${uploads[doc.id]
                                                ? 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }
                                        `}>
                                            <Upload size={12} />
                                            {uploads[doc.id] ? 'Change File' : 'Upload'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(doc.id, doc.label, e)}
                                            />
                                        </label>

                                        {uploads[doc.id] && (
                                            <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                                <ImageIcon size={10} /> Image captured
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Initiating...' : 'Initiate Filing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ITRFileModal;
