import React from 'react';
import { X } from 'lucide-react';

interface ClientViewModalProps {
    client: any;
    onClose: () => void;
}

const ClientViewModal: React.FC<ClientViewModalProps> = ({ client, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Client Details</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Full Name</label>
                        <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{client.name}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email</label>
                            <div>{client.email}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Telegram ID</label>
                            <div style={{ color: 'var(--primary)' }}>{client.telegramId || 'N/A'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Category</label>
                            <div>{client.category}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Status</label>
                            <div style={{ textTransform: 'capitalize' }}>{client.status}</div>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Details</label>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{client.details || 'No additional details provided.'}</p>
                    </div>
                </div>

                <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ClientViewModal;
