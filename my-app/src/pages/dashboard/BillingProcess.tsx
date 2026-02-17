import React, { useState, useEffect } from 'react';
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
import DocumentModal from '../../components/billing/DocumentModal';
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

    const handleEdit = (id: string) => {
        const newName = window.prompt('Enter new name for this file:');
        if (newName) {
            api.put(`/api/files/${id}`, { name: newName }).then(() => fetchFiles());
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                await api.delete(`/api/files/${id}`);
                setFiles(files.filter(f => f.id !== id));
            } catch (err) {
                console.error('Failed to delete file', err);
            }
        }
    };

    const handleFollowUp = async (id: string) => {
        try {
            const response = await api.post(`/api/files/${id}/follow-up`);
            setFiles(files.map(f => f.id === id ? response.data : f));
            alert('Follow-up recorded and status updated.');
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
            <h2 style={{ marginBottom: '1.5rem' }}>Billing Workflow (Kanban)</h2>

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
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onFollowUp={handleFollowUp}
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
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onFollowUp={handleFollowUp}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {viewingFile && (
                <DocumentModal
                    fileId={viewingFile.id}
                    name={viewingFile.name}
                    onClose={() => setViewingFile(null)}
                />
            )}
        </div>
    );
};

export default BillingProcess;
