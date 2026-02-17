import React, { useState, useEffect } from 'react';
import { X, Upload, Link, FileText, Trash2, ExternalLink } from 'lucide-react';
import api from '../../api/axios';

interface DocumentModalProps {
    fileId: string;
    name: string;
    onClose: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ fileId, name, onClose }) => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
    const [docName, setDocName] = useState('');
    const [url, setUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [fileId]);

    const fetchDocuments = async () => {
        try {
            const response = await api.get(`/api/files/${fileId}/documents`);
            setDocuments(response.data);
        } catch (err) {
            console.error('Failed to fetch documents', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post(`/api/files/${fileId}/documents`, {
                name: docName,
                type: uploadType,
                url: uploadType === 'url' ? url : 'mock-file-path' // Simplified for mock
            });
            setDocName('');
            setUrl('');
            fetchDocuments();
        } catch (err) {
            console.error('Failed to add document', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3>Documents for {name}</h3>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Add New Document</h4>
                        <div className="form-group">
                            <label className="form-label">Document Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Pan Card, Signed Form"
                                value={docName}
                                onChange={(e) => setDocName(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" checked={uploadType === 'file'} onChange={() => setUploadType('file')} />
                                <span style={{ fontSize: '0.875rem' }}>File Upload</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" checked={uploadType === 'url'} onChange={() => setUploadType('url')} />
                                <span style={{ fontSize: '0.875rem' }}>URL / Link</span>
                            </label>
                        </div>

                        {uploadType === 'url' ? (
                            <div className="form-group">
                                <label className="form-label">URL</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="https://example.com/doc"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={submitting}>
                                        Add
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">Choose File</label>
                                <div style={{ border: '2px dashed var(--border)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <Upload size={24} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to upload or drag and drop</div>
                                    <input type="file" style={{ display: 'none' }} id="file-upload" />
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{ background: 'white', marginTop: '0.5rem', width: 'auto' }}
                                        onClick={handleSubmit} // Simplified mock
                                        disabled={submitting}
                                    >
                                        Upload Mock File
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="document-list">
                        <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Uploaded Documents</h4>
                        {loading ? (
                            <p>Loading documents...</p>
                        ) : documents.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No documents uploaded yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {documents.map(doc => (
                                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                                                {doc.type === 'url' ? <Link size={18} /> : <FileText size={18} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doc.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Added on {new Date(doc.timestamp).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {doc.type === 'url' && (
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="action-btn">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            <button className="action-btn delete"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentModal;
