import React, { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import api from '../../api/axios';
import ClientForm from '../clients/ClientForm';

interface QuickAddBillingProps {
    onClose: () => void;
    onSuccess: () => void;
}

const QuickAddBilling: React.FC<QuickAddBillingProps> = ({ onClose, onSuccess }) => {
    const [clients, setClients] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [fileName, setFileName] = useState(`ITR ${new Date().getFullYear()}`);
    const [loading, setLoading] = useState(false);
    const [isAddingClient, setIsAddingClient] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/api/clients');
            setClients(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClientId) return alert('Please select a client');
        setLoading(true);
        try {
            await api.post('/api/files', {
                clientId: selectedClientId,
                name: fileName
            });
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClientCreated = (newClient: any) => {
        setClients([...clients, newClient]);
        setSelectedClientId(newClient.id);
        setIsAddingClient(false);
    };

    if (isAddingClient) {
        return <ClientForm onClose={() => setIsAddingClient(false)} onSubmit={handleClientCreated} />;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Quick Add Billing</h3>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Client Name</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search clients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search size={18} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>

                        <div style={{
                            marginTop: '0.5rem',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            border: '1px solid var(--border)',
                            borderRadius: '8px'
                        }}>
                            {filteredClients.length > 0 ? filteredClients.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => { setSelectedClientId(c.id); setSearch(c.name); }}
                                    style={{
                                        padding: '0.75rem',
                                        cursor: 'pointer',
                                        background: selectedClientId === c.id ? 'var(--bg-active)' : 'transparent',
                                        borderBottom: '1px solid #f1f5f9',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email} • {c.category}</div>
                                </div>
                            )) : (
                                <div style={{ padding: '1rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No client found</p>
                                    <button type="button" className="btn btn-primary" onClick={() => setIsAddingClient(true)}>
                                        <Plus size={16} /> Add New Client
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">ITR Particulars</label>
                        <input
                            type="text"
                            className="form-input"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !selectedClientId}>
                            {loading ? 'Adding...' : 'Add Billing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickAddBilling;
