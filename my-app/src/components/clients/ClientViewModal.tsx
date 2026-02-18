import React from 'react';
import { X } from 'lucide-react';

interface ClientViewModalProps {
    client: any;
    onClose: () => void;
}

const ClientViewModal: React.FC<ClientViewModalProps> = ({ client, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">Client Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                        <div className="text-lg font-medium text-gray-900">{client.name}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                            <div className="text-sm text-gray-900 break-all">{client.email}</div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Telegram ID</label>
                            <div className="text-sm font-medium text-blue-600">{client.telegramId || 'N/A'}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                                {client.category}
                            </span>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Status</label>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                {client.status}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Details</label>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed">
                            {client.details || 'No additional details provided.'}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientViewModal;
