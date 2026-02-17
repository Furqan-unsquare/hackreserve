import React, { useState, useEffect } from 'react';
import ClientForm from '../../components/clients/ClientForm';
// import ClientTable from '../../components/clients/ClientTable';
// import ClientViewModal from '../../components/clients/ClientViewModal';
import ITRFileModal from '../../components/clients/ITRFileModal';
import { Plus, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import api from '../../api/axios';

const ClientProfile = () => {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    // const [viewingClient, setViewingClient] = useState<any>(null);
    const [filingClient, setFilingClient] = useState<any>(null);
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
    const [clientFiles, setClientFiles] = useState<Record<string, any[]>>({});

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/api/clients');
            setClients(response.data);
        } catch (err) {
            console.error('Failed to fetch clients', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientFiles = async (clientId: string) => {
        try {
            const response = await api.get(`/api/files/client/${clientId}`);
            setClientFiles(prev => ({ ...prev, [clientId]: response.data }));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleExpand = (clientId: string) => {
        if (expandedClientId === clientId) {
            setExpandedClientId(null);
        } else {
            setExpandedClientId(clientId);
            if (!clientFiles[clientId]) {
                fetchClientFiles(clientId);
            }
        }
    };

    const handleAddOrUpdateClient = async (clientData: any) => {
        try {
            if (selectedClient) {
                const response = await api.put(`/api/clients/${selectedClient.id}`, clientData);
                setClients(clients.map(c => c.id === selectedClient.id ? response.data : c));
            } else {
                const response = await api.post('/api/clients', clientData);
                setClients([...clients, response.data]);
            }
            setIsFormOpen(false);
            setSelectedClient(null);
        } catch (err) {
            console.error('Failed to save client', err);
        }
    };

    const handleEdit = (client: any) => {
        setSelectedClient(client);
        setIsFormOpen(true);
    };

    // const handleDelete = async (id: string) => {
    //     if (window.confirm('Are you sure you want to delete this client?')) {
    //         try {
    //             await api.delete(`/api/clients/${id}`);
    //             setClients(clients.filter(c => c.id !== id));
    //         } catch (err) {
    //             console.error('Failed to delete client', err);
    //         }
    //     }
    // };

    if (loading) return <div>Loading clients...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Client Management</h2>
                <button
                    className="btn btn-primary"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => { setSelectedClient(null); setIsFormOpen(true); }}
                >
                    <Plus size={20} />
                    Onboard Client
                </button>
            </div>

            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>History</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Email</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Telegram</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Category</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <React.Fragment key={client.id}>
                                <tr style={{ borderBottom: '1px solid var(--border)', cursor: 'default' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => toggleExpand(client.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            {expandedClientId === client.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{client.name}</td>
                                    <td style={{ padding: '1rem' }}>{client.email}</td>
                                    <td style={{ padding: '1rem', color: 'var(--primary)' }}>{client.telegramId || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge badge-${client.category.toLowerCase() === 'individual' ? 'blue' : 'green'}`}>
                                            {client.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                onClick={() => setFilingClient(client)}
                                                className="btn btn-primary"
                                                style={{ width: 'auto', padding: '4px 12px', fontSize: '0.75rem' }}
                                            >
                                                File ITR
                                            </button>
                                            <button onClick={() => handleEdit(client)} className="action-btn" title="Edit"><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedClientId === client.id && (
                                    <tr style={{ background: '#f8fafc' }}>
                                        <td colSpan={6} style={{ padding: '1rem' }}>
                                            <div style={{ paddingLeft: '2rem' }}>
                                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Filing History</h4>
                                                {clientFiles[client.id]?.length > 0 ? (
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                                        {clientFiles[client.id].map(file => (
                                                            <div key={file.id} style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <FileText size={16} color="var(--primary)" />
                                                                <div>
                                                                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{file.name}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(file.createdAt).toLocaleDateString()}</div>
                                                                </div>
                                                                <span className="status-dot" style={{ background: 'var(--success)', marginLeft: 'auto' }}></span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No filing history found.</div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {isFormOpen && (
                <ClientForm
                    onClose={() => { setIsFormOpen(false); setSelectedClient(null); }}
                    onSubmit={handleAddOrUpdateClient}
                    initialData={selectedClient}
                />
            )}

            {filingClient && (
                <ITRFileModal
                    client={filingClient}
                    onClose={() => setFilingClient(null)}
                    onSuccess={() => {
                        setFilingClient(null);
                        fetchClientFiles(filingClient.id);
                    }}
                />
            )}
        </div>
    );
};

export default ClientProfile;
