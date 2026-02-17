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
    { id: 'onboarded', title: 'Onboarding', color: '#2563eb' },
    { id: 'documentation', title: 'Documentation', color: '#d97706' },
    { id: 'itr-filling', title: 'ITR Filling', color: '#16a34a' },
    { id: 'billed', title: 'Billed', color: '#7c3aed' }
];

const BillingProcess = () => {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [viewingFile, setViewingFile] = useState<any>(null);
    const [isAddingFile, setIsAddingFile] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
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
                    setFiles(prev => prev.map(f =>
                        f.id === active.id ? { ...f, status: newStatus } : f
                    ));

                    try {
                        await api.put(`/api/files/${active.id}/status`, { status: newStatus });
                    } catch (err) {
                        console.error('Failed to update file status', err);
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Billing Workflow (Kanban)</h2>
                <button
                    className="btn btn-primary"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => setIsAddingFile(true)}
                >
                    <Plus size={20} />
                    New Billing Item
                </button>
            </div>

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
