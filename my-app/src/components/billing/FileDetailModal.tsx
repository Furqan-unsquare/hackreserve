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

const FileDetailModal: React.FC<FileDetailModalProps> = ({ file, onUpdate, onDelete, onFollowUp }) => {
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
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '550px' }}>
                <div className="modal-header">
                    <h3>{isEditing ? 'Edit File' : 'File Details'}</h3>
                    {/* <button onClick={onClose} className="close-btn"><X size={20} /></button> */}
                </div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <User size={24} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{file.clientName}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{file.category}</div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">File Type / Name</label>
                            {isEditing ? (
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            ) : (
                                <div style={{ fontWeight: 500 }}>{file.name}</div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <span className={`badge badge-${file.status === 'billed' ? 'green' : 'blue'}`} style={{ width: 'fit-content' }}>
                                    {file.status}
                                </span>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Created At</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <Calendar size={14} />
                                    {new Date(file.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Documents</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.documents?.length || 0} files attached</div>
                            </div>
                            <button
                                onClick={() => setShowDocs(true)}
                                className="btn btn-primary"
                                style={{ width: 'auto', padding: '6px 16px', fontSize: '0.8125rem' }}
                            >
                                Manage Docs
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Follow-ups</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attempt version: v{file.followUps?.length || 0}</div>
                            </div>
                            <button
                                onClick={handleFollowUpClick}
                                className="btn"
                                style={{ width: 'auto', padding: '6px 16px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                disabled={loading}
                            >
                                <Send size={14} />
                                Send New
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            {isEditing ? (
                                <>
                                    <button className="btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                                        <Save size={16} /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn" onClick={() => setIsEditing(true)}>Edit File</button>
                                    <button className="btn delete" style={{ background: '#fee2e2', color: '#dc2626' }} onClick={onDelete}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileDetailModal;
