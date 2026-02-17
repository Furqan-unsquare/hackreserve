import React from 'react';

const AdminProfile = () => {
    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Admin Profile</h2>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '600px' }}>
                <form>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" defaultValue="CA Akshat" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" defaultValue="ca@example.com" disabled />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Practice Name</label>
                        <input type="text" className="form-input" defaultValue="Akshat & Associates" />
                    </div>
                    <button type="button" className="btn btn-primary" style={{ width: 'auto' }}>Update Profile</button>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;
