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
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading clients...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
        <button
          onClick={() => {
            setSelectedClient(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus size={18} />
          Onboard Client
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  Expand
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Telegram
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <React.Fragment key={client.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpand(client.id)}
                        className="text-gray-400 hover:text-teal-600 focus:outline-none"
                      >
                        {expandedClientId === client.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-teal-600 font-medium">
                      {client.telegramId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.category.toLowerCase() === 'individual'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {client.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFilingClient(client)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                        >
                          File ITR
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedClientId === client.id && (
                    <tr>
                      <td colSpan={6} className="p-0 bg-gray-50">
                        <div className="p-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Filing History</h4>

                          {clientFiles[client.id]?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {clientFiles[client.id].map((file) => (
                                <div
                                  key={file.id}
                                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3 hover:shadow transition-shadow"
                                >
                                  <FileText size={20} className="text-teal-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(file.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No filing history found.
                            </p>
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

        {clients.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No clients found. Onboard your first client!
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