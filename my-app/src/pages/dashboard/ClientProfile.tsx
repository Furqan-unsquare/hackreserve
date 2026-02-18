import React, { useState, useEffect } from 'react';
import ClientForm from '../../components/clients/ClientForm';
import ITRFileModal from '../../components/clients/ITRFileModal';
import { Plus, ChevronDown, ChevronUp, FileText, Edit, Upload } from 'lucide-react';
import api from '../../api/axios';

const ClientProfile = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
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
      setClientFiles((prev) => ({ ...prev, [clientId]: response.data }));
    } catch (err) {
      console.error('Failed to fetch files for client', clientId, err);
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
      let updatedClients;
      if (selectedClient) {
        const response = await api.put(`/api/clients/${selectedClient.id}`, clientData);
        updatedClients = clients.map((c) =>
          c.id === selectedClient.id ? response.data : c
        );
      } else {
        const response = await api.post('/api/clients', clientData);
        updatedClients = [...clients, response.data];
      }
      setClients(updatedClients);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
          <p className="text-xs text-gray-500">Manage your client database</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setSelectedClient(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md border border-green-500 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Client
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <Upload className="w-3.5 h-3.5" />
            Import JSON
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {clients.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No clients yet</h3>
            <p className="text-xs text-gray-500 mb-4">Start by adding your first client</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => {
                  const isExpanded = expandedClientId === client.id;
                  return (
                    <React.Fragment key={client.id}>
                      {/* Clickable Row */}
                      <tr
                        onClick={() => toggleExpand(client.id)}
                        className={`
                          cursor-pointer transition-colors hover:bg-gray-50 ${isExpanded ? 'bg-green-50' : ''}
                        `}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="text-gray-400 p-0.5">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{client.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{client.email}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium text-sm">
                          {client.mobile || client.phone || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            client.category?.toLowerCase() === 'individual'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {client.category || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilingClient(client);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-600 text-white text-xs font-medium rounded-md shadow-sm transition-all"
                            >
                              ITR
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(client);
                              }}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-all"
                              title="Edit client"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0 bg-gray-50/50">
                            <div className="p-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-green-600" />
                                ITR Filing History
                              </h4>

                              {clientFiles[client.id]?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {clientFiles[client.id].map((file) => (
                                    <div
                                      key={file.id}
                                      className="bg-white p-2.5 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-xs"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-gray-500">
                                          {new Date(file.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                      </div>
                                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6 bg-white/50 rounded-md border border-dashed border-gray-200">
                                  <p className="text-xs text-gray-500">No ITR filings yet</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isFormOpen && (
        <ClientForm
          onClose={() => {
            setIsFormOpen(false);
            setSelectedClient(null);
          }}
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
            if (filingClient?.id) fetchClientFiles(filingClient.id);
          }}
        />
      )}
    </div>
  );
};

export default ClientProfile;
