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
                name: fileName
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
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '650px' }}>
                <div className="modal-header">
                    <h3>File ITR for {client.name}</h3>
                    {/* <button onClick={onClose} className="close-btn"><X size={20} /></button> */}
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label className="form-label">ITR Title / Year</label>
                        <input
                            type="text"
                            className="form-input"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            required
                        />
                    </div>

                    <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Upload Required Documents ({client.category})</h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {docsToDisplay.map(doc => (
                            <div key={doc.id} style={{
                                border: '1px solid var(--border)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                background: uploads[doc.id] ? '#f0fdf4' : 'white'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{doc.label}</span>
                                    {uploads[doc.id] && <CheckCircle size={16} color="#16a34a" />}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <label style={{
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        background: '#f1f5f9',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Upload size={14} />
                                        {uploads[doc.id] ? 'Change' : 'Upload Image'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileUpload(doc.id, doc.label, e)}
                                        />
                                    </label>
                                    {uploads[doc.id] && (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                            <ImageIcon size={12} style={{ marginRight: '2px' }} /> Image ready
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading || Object.keys(uploads).length === 0}>
                            {loading ? 'Filing...' : 'Initiate Filing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ITRFileModal;
