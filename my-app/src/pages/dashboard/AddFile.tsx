import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../../api/axios';

const FileForm = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState<any>(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const response = await api.get('/api/clients');
                const found = response.data.find((c: any) => c.id === clientId);
                setClient(found);
            } catch (err) {
                console.error(err);
            }
        };
        fetchClient();
    }, [clientId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/files', {
                clientId,
                name: fileName
            });
            navigate('/dashboard/billing');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!client) return <div>Loading...</div>;

    return (
        <div className="auth-container" style={{ minHeight: 'auto', paddingTop: '2rem' }}>
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Add File for {client.name}</h3>
                    <button onClick={() => navigate('/dashboard/client-profile')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">File Name / Description</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. ITR 2024, GST Return April"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => navigate('/dashboard/client-profile')}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create File'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FileForm;
