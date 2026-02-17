import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import { KanbanColumn, KanbanItem } from '../../components/billing/KanbanBoard';
import FileDetailModal from '../../components/billing/FileDetailModal';
import QuickAddBilling from '../../components/billing/QuickAddBilling';
import { Plus } from 'lucide-react';
import api from '../../api/axios';

const COLUMNS = [
    { id: 'onboarded', title: 'Onboarding', color: '#6366f1' },
    { id: 'documentation', title: 'KYC & Docs', color: '#f59e0b' },
    { id: 'itr-filing', title: 'ITR Filing', color: '#10b981' },
    { id: 'billed', title: 'Billed', color: '#8b5cf6' }
];

const BillingProcess = () => {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [viewingFile, setViewingFile] = useState<any>(null);
    const [isAddingFile, setIsAddingFile] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await api.get('/api/files');
            setFiles(response.data);
        } catch (err) {
            console.error('Failed to fetch files', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeFile = files.find(f => f.id === active.id);
            if (activeFile) {
                const isColumn = COLUMNS.some(col => col.id === over.id);
                const newStatus = isColumn ? (over.id as string) : (files.find(f => f.id === over.id)?.status);

                if (newStatus && newStatus !== activeFile.status) {
                    let payload: any = { status: newStatus };

                    if (newStatus === 'billed') {
                        const amount = window.prompt(`Enter Billing Amount for ${activeFile.name}:`, '0');
                        if (amount === null) return setActiveId(null); // Cancel drag
                        payload.billingAmount = parseFloat(amount) || 0;
                    }

                    setFiles(prev => prev.map(f =>
                        f.id === active.id ? { ...f, status: newStatus, billingAmount: payload.billingAmount || f.billingAmount } : f
                    ));

                    try {
                        await api.put(`/api/files/${active.id}/status`, payload);
                    } catch (err: any) {
                        const errorMsg = err.response?.data?.message || 'Failed to update status';
                        if (err.response?.status === 400) {
                            alert(`❌ ${errorMsg}`);
                        } else {
                            console.error('Failed to update file status', err);
                        }
                        // Revert local state on failure
                        fetchFiles();
                    }
                }
            }
        }
        setActiveId(null);
    };

    const handleView = (id: string) => {
        const file = files.find(f => f.id === id);
        setViewingFile(file);
    };

    const handleUpdate = () => {
        fetchFiles();
        setViewingFile(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                await api.delete(`/api/files/${id}`);
                setFiles(files.filter(f => f.id !== id));
                setViewingFile(null);
            } catch (err) {
                console.error('Failed to delete file', err);
            }
        }
    };

    const handleFollowUp = async (id: string) => {
        try {
            const response = await api.post(`/api/files/${id}/follow-up`);
            const updatedFiles = files.map(f => f.id === id ? { ...response.data, id: response.data._id || response.data.id } : f);
            setFiles(updatedFiles);
            if (viewingFile?.id === id) {
                setViewingFile(updatedFiles.find(f => f.id === id));
            }
        } catch (err) {
            console.error('Failed to send follow-up', err);
        }
    };

    const getFilesByStatus = (status: string) => {
        return files.filter(f => f.status === status);
    };

    const activeFile = activeId ? files.find(f => f.id === activeId) : null;

    if (loading) return <div>Loading workflow...</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Filing Workflow</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Drag and drop clients to manage their filing lifecycle.</p>
                </div>

                <button
                    className="flex items-center gap-2 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200"
                    onClick={() => setIsAddingFile(true)}
                >
                    <Plus size={20} />
                    New Billing Item
                </button>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-board">
                    {COLUMNS.map(column => (
                        <KanbanColumn key={column.id} id={column.id} title={column.title} color={column.color}>
                            {getFilesByStatus(column.id).map(file => (
                                <KanbanItem
                                    key={file.id}
                                    id={file.id}
                                    client={file}
                                    onView={handleView}
                                    onEdit={handleView} // Use shared modal for edit now
                                    onDelete={() => handleDelete(file.id)}
                                    onFollowUp={() => handleFollowUp(file.id)}
                                />
                            ))}
                        </KanbanColumn>
                    ))}
                </div>

                <DragOverlay>
                    {activeFile ? (
                        <KanbanItem
                            id={activeFile.id}
                            client={activeFile}
                            onView={handleView}
                            onEdit={handleView}
                            onDelete={() => handleDelete(activeFile.id)}
                            onFollowUp={() => handleFollowUp(activeFile.id)}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {viewingFile && (
                <FileDetailModal
                    file={viewingFile}
                    onClose={() => setViewingFile(null)}
                    onUpdate={handleUpdate}
                    onDelete={() => handleDelete(viewingFile.id)}
                    onFollowUp={() => handleFollowUp(viewingFile.id)}
                />
            )}

            {isAddingFile && (
                <QuickAddBilling
                    onClose={() => setIsAddingFile(false)}
                    onSuccess={() => {
                        setIsAddingFile(false);
                        fetchFiles();
                    }}
                />
            )}
        </div>
    );
};

export default BillingProcess;
