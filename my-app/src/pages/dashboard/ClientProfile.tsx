import React, { useState, useEffect } from 'react';
import ClientForm from '../../components/clients/ClientForm';
import ITRFileModal from '../../components/clients/ITRFileModal';
import { Plus, ChevronDown, ChevronUp, FileText, Edit } from 'lucide-react';
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Client Management</h2>
        <button
          onClick={() => {
            setSelectedClient(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus size={18} />
          Onboard New Client
        </button>
      </div>

      {/* Guide text */}
      {clients.length > 0 && (
        <p className="text-sm text-gray-500 italic">
          Tap any client row to view ITR filing history
        </p>
      )}

      {/* Clients Table / Cards */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {clients.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No clients yet</h3>
            <p className="text-gray-500 mb-6">Start by onboarding your first client</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            >
              <Plus size={18} />
              Add Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => {
                  const isExpanded = expandedClientId === client.id;
                  return (
                    <React.Fragment key={client.id}>
                      {/* Clickable Row */}
                      <tr
                        onClick={() => toggleExpand(client.id)}
                        className={`
                          cursor-pointer transition-colors duration-150
                          ${isExpanded ? 'bg-teal-50' : 'hover:bg-gray-50'}
                        `}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-gray-400">
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                            <span className="font-medium text-gray-900">{client.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{client.email}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {client.mobile || client.phone || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              client.category?.toLowerCase() === 'individual'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {client.category || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilingClient(client);
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md shadow-sm transition-all"
                            >
                              File ITR
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(client);
                              }}
                              className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                              title="Edit client"
                            >
                              <Edit size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0 bg-gray-50/70">
                            <div className="p-6 border-t border-gray-200">
                              <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-teal-600" />
                                ITR Filing History
                              </h4>

                              {clientFiles[client.id]?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {clientFiles[client.id].map((file) => (
                                    <div
                                      key={file.id}
                                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-start gap-3"
                                    >
                                      <FileText size={20} className="text-teal-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {new Date(file.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                          })}
                                        </p>
                                      </div>
                                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 flex-shrink-0 mt-1"></div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                                  <p className="text-gray-500 italic">
                                    No ITR filings found for this client yet.
                                  </p>
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