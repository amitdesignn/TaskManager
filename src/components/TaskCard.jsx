import { useState, useRef, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';

export function TaskCard({ task }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const editInputRef = useRef(null);
    const { updateTask, deleteTask } = useTasks();

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditing]);

    const handleDragStart = (e) => {
        if (isEditing) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('taskId', task.id);
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setEditTitle(task.title);
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (editTitle.trim()) {
            updateTask(task.id, { title: editTitle.trim() });
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditTitle(task.title);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        deleteTask(task.id);
        setShowDeleteConfirm(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    // Format timestamp like Figma: "02:36 PM, 26th Sept 2025"
    const formatTimestamp = (isoString) => {
        const date = new Date(isoString);

        // Time: 02:36 PM
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = (hours % 12) || 12;
        const timeStr = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;

        // Date: 26th Sept 2025
        const day = date.getDate();
        const suffix = getDaySuffix(day);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${timeStr}, ${day}${suffix} ${month} ${year}`;
    };

    const getDaySuffix = (day) => {
        if (day >= 11 && day <= 13) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return (
        <div
            className={`task-card ${isDragging ? 'dragging' : ''} ${isEditing ? 'editing' : ''}`}
            draggable={!isEditing}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* Action buttons */}
            {!isEditing && !showDeleteConfirm && (
                <div className="task-actions">
                    <button className="task-action-btn edit-btn" onClick={handleEdit} title="Edit task">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button className="task-action-btn delete-btn" onClick={handleDelete} title="Delete task">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Delete confirmation */}
            {showDeleteConfirm && (
                <div className="delete-confirm">
                    <p>Delete this task?</p>
                    <div className="delete-confirm-actions">
                        <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                        <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Main content */}
            {!showDeleteConfirm && (
                <div className="task-card-content">
                    <div className="task-user">{task.user}</div>
                    {isEditing ? (
                        <div className="task-edit-form">
                            <textarea
                                ref={editInputRef}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="task-edit-input"
                                rows={2}
                            />
                            <div className="task-edit-actions">
                                <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>Save</button>
                                <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="task-title">{task.title}</div>
                    )}
                    <div className="task-timestamp">{formatTimestamp(task.timestamp)}</div>
                </div>
            )}
        </div>
    );
}
