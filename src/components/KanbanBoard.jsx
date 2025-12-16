import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from './TaskCard';

const COLUMNS = [
    { id: 'upcoming', label: 'UPCOMING', className: 'upcoming' },
    { id: 'inprogress', label: 'ONGOING', className: 'inprogress' },
    { id: 'inreview', label: 'COMPLETED', className: 'inreview' },
    { id: 'done', label: 'ARCHIVED', className: 'done' }
];

// Column icons matching Figma
const ColumnIcon = ({ type }) => {
    const icons = {
        upcoming: (
            <svg viewBox="0 0 12 12" fill="currentColor">
                <path d="M10.5 1H9V0H8v1H4V0H3v1H1.5A1.5 1.5 0 0 0 0 2.5v8A1.5 1.5 0 0 0 1.5 12h9a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 10.5 1zM11 10.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V4h10v6.5z" />
            </svg>
        ),
        inprogress: (
            <svg viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 0a6 6 0 1 0 6 6A6 6 0 0 0 6 0zm2.8 6.5l-4 2.5a.5.5 0 0 1-.5 0 .5.5 0 0 1-.3-.5v-5a.5.5 0 0 1 .3-.45.5.5 0 0 1 .5 0l4 2.5a.5.5 0 0 1 0 .9z" />
            </svg>
        ),
        inreview: (
            <svg viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 0C2.7 0 0 2.7 0 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm3.3 4.3l-4 4c-.2.2-.5.2-.7 0l-2-2c-.2-.2-.2-.5 0-.7s.5-.2.7 0L5 7.3l3.6-3.6c.2-.2.5-.2.7 0s.2.5 0 .6z" />
            </svg>
        ),
        done: (
            <svg viewBox="0 0 12 12" fill="currentColor">
                <path d="M10.5 1h-9A1.5 1.5 0 0 0 0 2.5v1A.5.5 0 0 0 .5 4h11a.5.5 0 0 0 .5-.5v-1A1.5 1.5 0 0 0 10.5 1zM1 5v5.5A1.5 1.5 0 0 0 2.5 12h7a1.5 1.5 0 0 0 1.5-1.5V5H1zm4 4.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5zm0-2a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5z" />
            </svg>
        )
    };

    const colors = {
        upcoming: '#1d4ed8',
        inprogress: '#c2410c',
        inreview: '#1a7a42',
        done: '#6b7280'
    };

    return (
        <div className="column-indicator" style={{ color: colors[type] }}>
            {icons[type]}
        </div>
    );
};

export function KanbanBoard() {
    const { getTasksByStatus, moveTask, addTask } = useTasks();
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e, columnId) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            moveTask(taskId, columnId);
        }
        setDragOverColumn(null);
    };

    return (
        <div className="kanban-board">
            {COLUMNS.map(column => (
                <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={getTasksByStatus(column.id)}
                    isDragOver={dragOverColumn === column.id}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                    onAddTask={(title) => addTask(title, column.id)}
                />
            ))}
        </div>
    );
}

function KanbanColumn({ column, tasks, isDragOver, onDragOver, onDragLeave, onDrop, onAddTask }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            onAddTask(newTaskTitle.trim());
            setNewTaskTitle('');
            setIsAdding(false);
        }
    };

    const handleCancel = () => {
        setNewTaskTitle('');
        setIsAdding(false);
    };

    return (
        <div className={`kanban-column ${column.className}`}>
            <div className="column-header">
                <ColumnIcon type={column.id} />
                <span className="column-title">{column.label}</span>
            </div>

            {/* Add Task at the top */}
            {isAdding ? (
                <form className="add-task-form" onSubmit={handleSubmit}>
                    <textarea
                        autoFocus
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                            if (e.key === 'Escape') {
                                handleCancel();
                            }
                        }}
                    />
                    <div className="add-task-actions">
                        <button type="submit" className="btn btn-primary">Add Task</button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            ) : (
                <button className="add-task-btn" onClick={() => setIsAdding(true)}>
                    <span>+</span>
                    <span>Add Task</span>
                </button>
            )}

            <div
                className={`column-content ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}
