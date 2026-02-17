import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { FileText, User, Eye, Edit2, Trash2, Send } from 'lucide-react';

export const KanbanItem = ({
    id,
    client,
    onView,
    onEdit,
    onDelete,
    onFollowUp
}: {
    id: string,
    client: any,
    onView: (id: string) => void,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
    onFollowUp: (id: string) => void
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        zIndex: isDragging ? 100 : 1,
    } : undefined;

    // Stop propagation for action buttons so dragging doesn't trigger
    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="kanban-item"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{client.clientName}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                        className="action-btn"
                        onClick={(e) => handleAction(e, () => onView(id))}
                        title="View Details/Documents"
                    >
                        <Eye size={12} />
                    </button>
                    <button
                        className="action-btn"
                        onClick={(e) => handleAction(e, () => onEdit(id))}
                        title="Edit File"
                    >
                        <Edit2 size={12} />
                    </button>
                    <button
                        className="action-btn delete"
                        onClick={(e) => handleAction(e, () => onDelete(id))}
                        title="Delete File"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            <div style={{ fontSize: '0.8125rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                {client.name}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <FileText size={14} />
                    <span>{client.category}</span>
                </div>

                <button
                    className="followup-btn"
                    onClick={(e) => handleAction(e, () => onFollowUp(id))}
                    title="Send Follow-up"
                >
                    <Send size={12} />
                    <span>v{client.followUps?.length || 0}</span>
                </button>
            </div>
        </div>
    );
};

export const KanbanColumn = ({ id, title, children, color }: { id: string, title: string, children: React.ReactNode, color: string }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`kanban-column ${isOver ? 'over' : ''}`}
            style={{
                background: isOver ? '#f1f5f9' : '#f8fafc',
                borderTop: `4px solid ${color}`
            }}
        >
            <div className="kanban-column-header">
                <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {title}
                    <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
                        {React.Children.count(children)}
                    </span>
                </h4>
            </div>
            <div className="kanban-column-content">
                {children}
            </div>
        </div>
    );
};
