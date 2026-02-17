import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ClientFormProps {
    onClose: () => void;
    onSubmit: (client: any) => void;
    initialData?: any;
}

const ClientForm: React.FC<ClientFormProps> = ({ onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        phone: '',
        category: 'salaried',
        details: '',
        status: 'onboarded'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>{initialData ? 'Update Client' : 'Onboard New Client'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Client Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Telegram ID</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="@username"
                            value={formData.telegramId || ''}
                            onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-input"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="salaried">salaried</option>
                            <option value="small business">small business</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Additional Details</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '80px' }}
                            value={formData.details}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{initialData ? 'Save Changes' : 'Onboard Client'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;
