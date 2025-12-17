import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId, authUser = null) => {
        try {
            console.log('Fetching profile for user:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Profile fetch error:', error);
                // Fallback to auth user metadata if profile fetch fails
                if (authUser) {
                    console.log('Using auth metadata as fallback');
                    const metadata = authUser.user_metadata || {};
                    return {
                        id: userId,
                        firstName: metadata.first_name || 'User',
                        lastName: metadata.last_name || '',
                        initials: `${(metadata.first_name || 'U').charAt(0)}${(metadata.last_name || '').charAt(0) || 'U'}`.toUpperCase(),
                        email: authUser.email,
                        isAdmin: false
                    };
                }
                return null;
            }

            if (data) {
                console.log('Profile fetched successfully:', data);
                return {
                    id: data.id,
                    firstName: data.first_name || 'User',
                    lastName: data.last_name || '',
                    initials: `${(data.first_name || 'U').charAt(0)}${(data.last_name || '').charAt(0) || 'U'}`.toUpperCase(),
                    email: data.email,
                    isAdmin: data.is_admin || false
                };
            }
            return null;
        } catch (err) {
            console.error('Profile fetch exception:', err);
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;
        let isProcessingSession = false;

        const fetchProfileWithRetry = async (authUser, retries = 3) => {
            for (let i = 0; i < retries; i++) {
                // On last retry, pass authUser for fallback
                const profile = await fetchProfile(authUser.id, i === retries - 1 ? authUser : null);
                if (profile) return profile;
                // Wait before retrying (profile might not be created yet)
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            // Final fallback using auth metadata
            console.log('All retries failed, using auth metadata fallback');
            const metadata = authUser.user_metadata || {};
            return {
                id: authUser.id,
                firstName: metadata.first_name || 'User',
                lastName: metadata.last_name || '',
                initials: `${(metadata.first_name || 'U').charAt(0)}${(metadata.last_name || '').charAt(0) || 'U'}`.toUpperCase(),
                email: authUser.email,
                isAdmin: false
            };
        };

        const handleSession = async (session, eventName) => {
            if (isProcessingSession) {
                console.log('Already processing session, skipping:', eventName);
                return;
            }
            isProcessingSession = true;

            try {
                if (session?.user && isMounted) {
                    console.log(`Processing session (${eventName}) for:`, session.user.email);
                    const profile = await fetchProfileWithRetry(session.user);
                    if (profile && isMounted) {
                        profile.email = session.user.email;
                        setCurrentUser(profile);
                        console.log('User set successfully:', profile.firstName);
                    }
                } else if (isMounted) {
                    console.log('No session, setting currentUser to null');
                    setCurrentUser(null);
                }
            } finally {
                isProcessingSession = false;
                if (isMounted) setLoading(false);
            }
        };

        // Get initial session synchronously to avoid race conditions
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Session error:', error);
                if (isMounted) setLoading(false);
                return;
            }
            handleSession(session, 'INITIAL');
        });

        // Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);

            if (!isMounted) return;

            if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setLoading(false);
                return;
            }

            // Skip INITIAL_SESSION since we handle it above
            if (event === 'INITIAL_SESSION') {
                console.log('Skipping INITIAL_SESSION (handled by getSession)');
                return;
            }

            // Handle other auth events (SIGNED_IN, TOKEN_REFRESHED, etc.)
            await handleSession(session, event);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signup = async (firstName, lastName, email, password) => {
        try {
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
