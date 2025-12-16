import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function AdminPanel({ onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setError('Failed to load users');
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const toggleAdmin = async (userId, currentStatus) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_admin: !currentStatus })
            .eq('id', userId);

        if (!error) {
            setUsers(users.map(u =>
                u.id === userId ? { ...u, is_admin: !currentStatus } : u
            ));
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            return;
        }

        // Delete from profiles (tasks will cascade delete due to foreign key)
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (!error) {
            setUsers(users.filter(u => u.id !== userId));
        } else {
            alert('Failed to delete user: ' + error.message);
        }
    };

    return (
        <div className="admin-overlay">
            <div className="admin-panel">
                <div className="admin-header">
                    <h2>Admin Panel</h2>
                    <button className="admin-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="admin-error">{error}</div>}

                {loading ? (
                    <div className="admin-loading">Loading users...</div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Created</th>
                                    <th>Admin</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.first_name} {user.last_name}</td>
                                        <td>{user.email || 'N/A'}</td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className={`admin-badge ${user.is_admin ? 'admin' : ''}`}
                                                onClick={() => toggleAdmin(user.id, user.is_admin)}
                                            >
                                                {user.is_admin ? 'Admin' : 'User'}
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="admin-delete-btn"
                                                onClick={() => deleteUser(user.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="admin-empty">No users found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
