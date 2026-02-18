import React, { useState, useEffect } from 'react';
import {
  X, FileText,
  Image as ImageIcon, ShieldCheck, Shield, RefreshCw,
  CheckCircle, AlertCircle, Plus, Terminal, Clock
} from 'lucide-react';
import api from '../../api/axios';

interface DocumentModalProps {
  fileId: string;
  name: string;
  onClose: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ fileId, name, onClose }) => {
  const [file, setFile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);
  const [uploadType] = useState<'file' | 'url'>('file');
  const [docName, setDocName] = useState('');
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !selectedFile) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      // Append file first as requested
      formData.append('file', selectedFile);
      formData.append('name', docName);
      formData.append('type', uploadType);

      await api.post(`/api/files/${fileId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocName('');
      setSelectedFile(null);
      setShowUploadForm(false);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to add document', err);
    } finally {
      setSubmitting(false);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Documents & KYC for {name}</h3>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-gray-500">
                  Category: <b className="text-gray-800 capitalize">{category || 'Not Set'}</b>
                </span>

                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${requiredList.length > 0 ? (uploadedNames.filter(n => requiredList.includes(n)).length / requiredList.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-600">
                    {requiredList.length > 0 ? Math.round((uploadedNames.filter(n => requiredList.includes(n)).length / requiredList.length) * 100) : 0}%
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                  ${isReady ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isReady ? 'READY FOR ITR FILING' : 'INCOMPLETE DOCUMENTS'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Requirements Checklist Sidebar */}
          <div className="w-72 border-r border-gray-100 bg-gray-50/30 p-6 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Clock size={16} /> Readiness Checklist
            </h4>
            <div className="space-y-3">
              {requiredList.length > 0 ? requiredList.map(reqName => {
                const isUploaded = uploadedNames.includes(reqName);
                return (
                  <div key={reqName} className="flex items-center gap-3 text-sm group">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                      ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600'}
                    `}>
                      {isUploaded ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    </div>
                    <span className={`font-medium transition-colors ${isUploaded ? 'text-green-800' : 'text-gray-500 group-hover:text-amber-800'}`}>
                      {reqName}
                    </span>
                  </div>
                );
              }) : (
                <p className="text-sm text-gray-500 italic">No requirements for this category.</p>
              )}
            </div>

            {isReady && (
              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm text-green-800 font-semibold leading-relaxed">
                  Perfect! All required documents gathered. You can now move to ITR Filing.
                </p>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-gray-800">Uploaded Documents</h4>
                {!showUploadForm && (
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Document
                  </button>
                )}
              </div>

              {showUploadForm && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900">Add New Document</h4>
                    <button onClick={() => setShowUploadForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          required
                        >
                          <option value="">Select document type</option>
                          {(REQUIRED_DOCS_MAP[category] || documentTypes).map(type => <option key={type} value={type}>{type}</option>)}
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUploadLocal}
                          required
                          className="w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                "
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setShowUploadForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm" disabled={submitting}>
                        {submitting ? 'Uploading...' : 'Upload Document'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => {
                  const isKYC = doc.name.toLowerCase().includes('pan') || doc.name.toLowerCase().includes('aadhar');
                  return (
                    <div key={doc._id} className="group border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          {getVerificationBadge(doc.verification)}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isKYC && isReady && (
                              <button
                                onClick={() => handleVerify(doc._id)}
                                disabled={verifyingMap[doc._id]}
                                className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"
                                title="Run OCR"
                              >
                                {verifyingMap[doc._id] ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedLogs({ name: doc.name, logs: doc.verification?.logs || [] })}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600"
                              title="Show Logs"
                            >
                              <Terminal size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${doc.name.toLowerCase().includes('pan') ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                            {doc.name.toLowerCase().includes('pan') ? <ImageIcon size={20} /> : <FileText size={20} />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate" title={doc.name}>{doc.name}</div>
                            <div className="text-xs text-gray-500">{new Date(doc.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {doc.verification?.extractedData?.name && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <div className="text-slate-400 font-semibold uppercase tracking-wider mb-1">Extracted Data</div>
                            <div className="font-medium text-slate-700">{doc.verification.extractedData.name}</div>
                            {doc.verification.extractedData.idNumber && (
                              <div className="font-mono text-slate-500 mt-1">{doc.verification.extractedData.idNumber}</div>
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
              <div className="w-80 border-l border-gray-200 bg-slate-900 text-slate-300 p-4 overflow-y-auto flex flex-col text-xs font-mono">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
                  <span className="font-bold text-sky-400">VERIFICATION LOGS</span>
                  <button onClick={() => setSelectedLogs(null)} className="text-slate-500 hover:text-white"><X size={14} /></button>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-500 mb-2">Target: {selectedLogs.name}</div>
                  {selectedLogs.logs.length > 0 ? selectedLogs.logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                      <span className={log.message.includes('ERROR') ? 'text-red-400' : 'text-slate-300'}>{log.message}</span>
                    </div>
                  )) : <div className="text-slate-600 italic">No logs available.</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={previewImage || ''} className="max-w-full max-h-full rounded-lg shadow-2xl" />
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentModal;