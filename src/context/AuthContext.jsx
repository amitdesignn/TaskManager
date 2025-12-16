import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session on mount
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (err) {
                console.error('Session check error:', err);
            }
            setLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await fetchProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Profile fetch error:', error);
                // If profile doesn't exist, still allow user to proceed
                setCurrentUser(null);
                return;
            }

            if (data) {
                setCurrentUser({
                    id: data.id,
                    firstName: data.first_name || 'User',
                    lastName: data.last_name || '',
                    initials: `${(data.first_name || 'U').charAt(0)}${(data.last_name || '').charAt(0) || 'U'}`.toUpperCase(),
                    email: (await supabase.auth.getUser()).data.user?.email,
                    isAdmin: data.is_admin || false
                });
            }
        } catch (err) {
            console.error('Profile fetch exception:', err);
            setCurrentUser(null);
        }
    };

    const signup = async (firstName, lastName, email, password) => {
        try {
            // Sign up with Supabase Auth - pass names in metadata for trigger
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName
                    }
                }
            });

            if (authError) {
                return { success: false, error: authError.message };
            }

            if (!authData.user) {
                return { success: false, error: 'Sign up failed' };
            }

            // Profile is created automatically by database trigger
            // Set current user
            setCurrentUser({
                id: authData.user.id,
                firstName,
                lastName,
                initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
                email
            });

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                await fetchProfile(data.user.id);
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    const isAuthenticated = () => {
        return currentUser !== null;
    };

    if (loading) {
        return (
            <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            currentUser,
            isAuthenticated,
            signup,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
