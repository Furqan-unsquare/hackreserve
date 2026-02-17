import React, { useState, useEffect } from 'react';
import ClientForm from '../../components/clients/ClientForm';
import ClientTable from '../../components/clients/ClientTable';
import ClientViewModal from '../../components/clients/ClientViewModal';
import { Plus } from 'lucide-react';
import api from '../../api/axios';

const ClientProfile = () => {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [viewingClient, setViewingClient] = useState<any>(null);

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

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this client? All associated files will also be removed.')) {
            try {
                await api.delete(`/api/clients/${id}`);
                setClients(clients.filter(c => c.id !== id));
            } catch (err) {
                console.error('Failed to delete client', err);
            }
        }
    };

    const handleView = (client: any) => {
        setViewingClient(client);
    };

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

            <ClientTable
                clients={clients}
                onUpdate={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
            />

            {(isFormOpen) && (
                <ClientForm
                    onClose={() => { setIsFormOpen(false); setSelectedClient(null); }}
                    onSubmit={handleAddOrUpdateClient}
                    initialData={selectedClient}
                />
            )}

            {viewingClient && (
                <ClientViewModal
                    client={viewingClient}
                    onClose={() => setViewingClient(null)}
                />
            )}
        </div>
    );
};

export default ClientProfile;
