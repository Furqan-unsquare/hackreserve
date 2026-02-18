import React, { useState } from 'react';
import { Save, Trash2, Send, Calendar, User } from 'lucide-react';
import api from '../../api/axios';
import DocumentModal from './DocumentModal';

interface FileDetailModalProps {
    file: any;
    onClose: () => void;
    onUpdate: () => void;
    onDelete: () => void;
    onFollowUp: () => void;
}

const FileDetailModal: React.FC<FileDetailModalProps> = ({ file, onClose, onUpdate, onDelete, onFollowUp }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...file });
    const [loading, setLoading] = useState(false);
    const [showDocs, setShowDocs] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put(`/api/files/${file.id}`, formData);
            setIsEditing(false);
            onUpdate();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowUpClick = async () => {
        setLoading(true);
        try {
            await onFollowUp();
            // OnFollowUp in BillingProcess will refresh the files, which should update this modal's parent
            // but we might need to refresh local state if we want immediate feedback
        } finally {
            setLoading(false);
        }
    };

    if (showDocs) {
        return <DocumentModal fileId={file.id} name={file.name} onClose={() => setShowDocs(false)} />;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {isEditing ? 'Edit File' : 'File Details'}
                    </h3>
                    {/* <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button> */}
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Client Info Card */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <User size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-lg text-gray-900">{file.clientName}</div>
                                <div className="text-sm text-gray-500 capitalize">{file.category}</div>
                            </div>
                        </div>

                        {/* File Name Input/Display */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File Type / Name</label>
                            {isEditing ? (
                                <input
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            ) : (
                                <div className="text-gray-900 font-medium">{file.name}</div>
                            )}
                        </div>

                        {/* Status Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${file.status === 'billed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {file.status}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar size={14} />
                                    {new Date(file.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Sections: Docs & Follow-ups */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors bg-white">
                                <div>
                                    <div className="font-semibold text-sm text-gray-900">Documents</div>
                                    <div className="text-xs text-gray-500">{file.documents?.length || 0} files attached</div>
                                </div>
                                <button
                                    onClick={() => setShowDocs(true)}
                                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    Manage Docs
                                </button>
                            </div>

                            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors bg-white">
                                <div>
                                    <div className="font-semibold text-sm text-gray-900">Follow-ups</div>
                                    <div className="text-xs text-gray-500">Attempt version: v{file.followUps?.length || 0}</div>
                                </div>
                                <button
                                    onClick={handleFollowUpClick}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <Send size={14} />
                                    Send New
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit File
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all flex items-center gap-2 border border-red-100"
                                onClick={onDelete}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileDetailModal;
