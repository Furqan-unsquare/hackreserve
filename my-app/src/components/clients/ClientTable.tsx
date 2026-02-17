import { Edit2, Trash2, Eye, FilePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientTableProps {
    clients: any[];
    onUpdate: (client: any) => void;
    onDelete: (id: string) => void;
    onView: (client: any) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, onUpdate, onDelete, onView }) => {
    const navigate = useNavigate();
    return (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Email</th>
                        <th style={{ padding: '1rem' }}>Category</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No clients found.</td>
                        </tr>
                    ) : (
                        clients.map((client) => (
                            <tr key={client.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem' }}>{client.name}</td>
                                <td style={{ padding: '1rem' }}>{client.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontSize: '0.75rem' }}>
                                        {client.category}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: client.status === 'onboarded' ? '#dcfce7' : '#f1f5f9',
                                        color: client.status === 'onboarded' ? '#166534' : '#475569',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize'
                                    }}>
                                        {client.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => onView(client)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="View">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => navigate(`/dashboard/add-file/${client.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }} title="Add File">
                                            <FilePlus size={18} />
                                        </button>
                                        <button onClick={() => onUpdate(client)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => onDelete(client.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ClientTable;
