import React, { useState, useEffect } from 'react';
import {
  X, Upload, Link, FileText, Trash2, ExternalLink,
  Image as ImageIcon, ShieldCheck, Shield, RefreshCw,
  CheckCircle, AlertCircle, Plus, Terminal, Clock
} from 'lucide-react';
import api from '../../api/axios';

interface DocumentModalProps {
  fileId: string;
  name: string;
  onClose: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ fileId, name }) => {
  const [file, setFile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [docName, setDocName] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyingMap, setVerifyingMap] = useState<Record<string, boolean>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<{ name: string, logs: any[] } | null>(null);

  const REQUIRED_DOCS_MAP: Record<string, string[]> = {
    'salaried': ['PAN Card', 'Aadhaar Card', 'Form 16', 'Passbook'],
    'small business': [
      'Bank Statement (Annual)',
      'TDS Quarterly',
      'TDS Monthly Challan',
      'GST Return (Monthly/Annually)',
      'Annual Income Statement',
      'P&L Balance Sheet'
    ]
  };

  const documentTypes = [
    'PAN Card', 'Aadhaar Card', 'Form 16', 'Form 26AS', 'Passbook',
    'Bank Statement (Annual)', 'TDS Quarterly', 'TDS Monthly Challan',
    'GST Return (Monthly/Annually)', 'Annual Income Statement', 'P&L Balance Sheet',
    'Salary Slip', 'Identity Proof', 'Other'
  ];

  useEffect(() => {
    fetchDocuments();
  }, [fileId]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/api/files`); // Need to find our file for overall status
      const currentFile = response.data.find((f: any) => f.id === fileId);
      if (currentFile) {
        setFile(currentFile);
        setDocuments(currentFile.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (docId: string) => {
    setVerifyingMap(prev => ({ ...prev, [docId]: true }));
    try {
      await api.post(`/api/files/${fileId}/documents/${docId}/verify`);
      fetchDocuments();
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setVerifyingMap(prev => ({ ...prev, [docId]: false }));
    }
  };

  const handleFileUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    setSubmitting(true);
    try {
      await api.post(`/api/files/${fileId}/documents`, {
        name: docName,
        type: uploadType,
        url: url || 'mock-file-path'
      });
      setDocName('');
      setUrl('');
      setShowUploadForm(false);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to add document', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId: string) => {
    setDocuments(prev => prev.filter(d => d._id !== docId));
  };

  const getVerificationBadge = (v: any) => {
    if (!v || v.status === 'pending') return <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Pending</span>;
    if (v.status === 'verified') return <span className="badge badge-green" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px' }}><CheckCircle size={10} /> Verified</span>;
    if (v.status === 'flagged') return <span className="badge badge-yellow" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px' }}><AlertCircle size={10} /> Flagged</span>;
    return <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Failed</span>;
  };

  const category = file?.category?.toLowerCase() || '';
  const requiredList = REQUIRED_DOCS_MAP[category] || [];
  const uploadedNames = documents.map(d => d.name);
  const isReady = requiredList.length > 0 && requiredList.every(name => uploadedNames.includes(name));

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1100px', width: '95%', maxHeight: '90vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheck size={28} color="var(--primary)" />
            <div>
              <h3 style={{ margin: 0 }}>Documents & KYC for {name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Category: <b style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{category || 'Not Set'}</b>
                </span>
                <div style={{ flex: 1, minWidth: '150px', maxWidth: '200px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${requiredList.length > 0 ? (uploadedNames.filter(n => requiredList.includes(n)).length / requiredList.length) * 100 : 0}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                  {requiredList.length > 0 ? Math.round((uploadedNames.filter(n => requiredList.includes(n)).length / requiredList.length) * 100) : 0}%
                </span>
                <span className={`badge badge-${isReady ? 'green' : 'yellow'}`} style={{ fontSize: '0.7rem' }}>
                  {isReady ? 'READY FOR ITR FILING' : 'INCOMPLETE DOCUMENTS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr' + (selectedLogs ? ' 300px' : ''), gap: '1.5rem' }}>

          {/* Requirements Checklist */}
          <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} /> Readiness Checklist
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requiredList.length > 0 ? requiredList.map(reqName => {
                const isUploaded = uploadedNames.includes(reqName);
                return (
                  <div key={reqName} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: isUploaded ? '#dcfce7' : '#fefce8',
                      color: isUploaded ? '#166534' : '#854d0e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isUploaded ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    </div>
                    <span style={{ color: isUploaded ? '#166534' : '#475569', fontWeight: isUploaded ? 500 : 400 }}>{reqName}</span>
                  </div>
                );
              }) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No requirements for this category.</p>
              )}
            </div>

            {isReady && (
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                  Perfect! All required documents gathered. You can now move to ITR Filing.
                </p>
              </div>
            )}
          </div>
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              {!showUploadForm && (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '0.5rem 1rem' }}
                >
                  <Plus size={18} style={{ marginRight: '0.5rem' }} />
                  Add Document
                </button>
              )}
            </div>

            {showUploadForm && (
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Add New Document</h4>
                  <button onClick={() => setShowUploadForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Document Type</label>
                    <select className="form-input" value={docName} onChange={(e) => setDocName(e.target.value)} required>
                      <option value="">Select document type</option>
                      {(REQUIRED_DOCS_MAP[category] || documentTypes).map(type => <option key={type} value={type}>{type}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleFileUploadLocal} required />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setShowUploadForm(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Uploading...' : 'Upload'}</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {documents.map(doc => {
                const isKYC = doc.name.toLowerCase().includes('pan') || doc.name.toLowerCase().includes('aadhar');
                return (
                  <div key={doc._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ padding: '0.75rem', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        {getVerificationBadge(doc.verification)}
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {isKYC && isReady && (
                            <button onClick={() => handleVerify(doc._id)} disabled={verifyingMap[doc._id]} className="action-btn" title="Run OCR">
                              {verifyingMap[doc._id] ? <RefreshCw size={12} className="spin" /> : <Shield size={12} />}
                            </button>
                          )}
                          <button onClick={() => setSelectedLogs({ name: doc.name, logs: doc.verification?.logs || [] })} className="action-btn" title="Show Logs">
                            <Terminal size={12} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '6px', background: '#f1f5f9', borderRadius: '6px' }}>
                          {doc.name.toLowerCase().includes('pan') ? <ImageIcon size={16} color="#3b82f6" /> : <FileText size={16} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(doc.timestamp).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {doc.verification?.extractedData?.name && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Extracted Name</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc.verification.extractedData.name}</div>
                          {doc.verification.extractedData.dob && (
                            <>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textTransform: 'uppercase' }}>DOB</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc.verification.extractedData.dob}</div>
                            </>
                          )}
                          {doc.verification.extractedData.idNumber && (
                            <>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textTransform: 'uppercase' }}>ID Number</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc.verification.extractedData.idNumber}</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedLogs && (
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '1rem', color: '#f8fafc', fontSize: '0.75rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: '#38bdf8' }}>VERIFICATION LOGS</span>
                <button onClick={() => setSelectedLogs(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={14} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>Analyzing: {selectedLogs.name}</div>
                {selectedLogs.logs.length > 0 ? selectedLogs.logs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#334155' }}>[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                    <span style={{ color: log.message.includes('ERROR') ? '#ef4444' : '#f8fafc' }}>{log.message}</span>
                  </div>
                )) : <div style={{ color: '#475569', fontStyle: 'italic' }}>No logs available for this session.</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)} style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ background: 'none', border: 'none', boxShadow: 'none' }} onClick={e => e.stopPropagation()}>
            <img src={previewImage} style={{ maxWidth: '90vw', maxHeight: '90vh' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentModal;