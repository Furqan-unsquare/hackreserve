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
    { id: 'onboarded', title: 'Onboarding', color: '#00A884' },
    { id: 'documentation', title: 'KYC & Docs', color: '#F59E0B' },
    { id: 'itr-filing', title: 'ITR Filing', color: '#00A884' },
    { id: 'billed', title: 'Billed', color: '#00A884' }
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
                        if (activeFile.billingAmount && activeFile.billingAmount > 0) {
                            payload.billingAmount = activeFile.billingAmount;
                        }
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
        </div>
    );

    return (
        <div className="p-6 mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Filing Kanban</h1>
                    <p className="text-sm text-gray-600 mt-1">Drag files between stages to update status.</p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-black transition-colors"
                    onClick={() => setIsAddingFile(true)}
                >
                    <Plus className="w-4 h-4" />
                    New File
                </button>
            </div>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {COLUMNS.map(column => (
                        <KanbanColumn key={column.id} id={column.id} title={column.title} color={column.color}>
                            {getFilesByStatus(column.id).map(file => (
                                <KanbanItem
                                    key={file.id}
                                    id={file.id}
                                    client={file}
                                    onView={handleView}
                                    onEdit={handleView}
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
