import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminPanel } from './AdminPanel';

export function Header({ currentUser }) {
    const [showMenu, setShowMenu] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const { logout, currentUser: authUser } = useAuth();

    const handleLogout = () => {
        logout();
        setShowMenu(false);
    };

    const openAdmin = () => {
        setShowAdmin(true);
        setShowMenu(false);
    };

    return (
        <>
            <header className="header">
                <a href="/" className="logo">
                    <img src="/logo.svg" alt="Team Logo" className="logo-image" />
                </a>

                <div className="search-bar">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search for any keyword here..." />
                </div>

                <div className="user-profile-container">
                    <div
                        className="user-profile"
                        title={currentUser?.name || 'User'}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        {currentUser?.initials || 'U'}
                    </div>

                    {showMenu && (
                        <div className="profile-menu">
                            <div className="profile-menu-header">
                                <span className="profile-name">{currentUser?.name}</span>
                            </div>
                            {authUser?.isAdmin && (
                                <button className="profile-menu-item" onClick={openAdmin}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    Admin Panel
                                </button>
                            )}
                            <button className="profile-menu-item logout-btn" onClick={handleLogout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
        </>
    );
}
