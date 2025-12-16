import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TaskContext = createContext();

export function TaskProvider({ children, currentUser }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch tasks from Supabase on mount and when user changes
    useEffect(() => {
        if (currentUser?.id) {
            fetchTasks();
        } else {
            setTasks([]);
            setLoading(false);
        }
    }, [currentUser?.id]);

    const fetchTasks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setTasks(data.map(task => ({
                id: task.id,
                title: task.title,
                status: task.status,
                timestamp: task.created_at,
                user: `${currentUser.firstName} ${currentUser.lastName}`.toUpperCase()
            })));
        }
        setLoading(false);
    };

    const addTask = async (title, status = 'upcoming') => {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                user_id: currentUser.id,
                title,
                status
            })
            .select()
            .single();

        if (!error && data) {
            const newTask = {
                id: data.id,
                title: data.title,
                status: data.status,
                timestamp: data.created_at,
                user: `${currentUser.firstName} ${currentUser.lastName}`.toUpperCase()
            };
            setTasks(prev => [newTask, ...prev]);
        }
    };

    const moveTask = async (taskId, newStatus) => {
        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId);

        if (!error) {
            setTasks(prev =>
                prev.map(task =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            );
        }
    };

    const updateTask = async (taskId, updates) => {
        const dbUpdates = {};
        if (updates.title) dbUpdates.title = updates.title;
        if (updates.status) dbUpdates.status = updates.status;

        const { error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', taskId);

        if (!error) {
            setTasks(prev =>
                prev.map(task =>
                    task.id === taskId ? { ...task, ...updates } : task
                )
            );
        }
    };

    const deleteTask = async (taskId) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (!error) {
            setTasks(prev => prev.filter(task => task.id !== taskId));
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    const user = currentUser ? {
        name: `${currentUser.firstName} ${currentUser.lastName}`.toUpperCase(),
        initials: currentUser.initials
    } : { name: 'GUEST', initials: 'G' };

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            currentUser: user,
            addTask,
            moveTask,
            updateTask,
            deleteTask,
            getTasksByStatus
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
