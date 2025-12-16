import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Auth() {
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup, login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (activeTab === 'signup') {
            if (!formData.firstName || !formData.lastName) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }

            const result = await signup(
                formData.firstName,
                formData.lastName,
                formData.email,
                formData.password
            );

            if (!result.success) {
                setError(result.error);
            }
        } else {
            const result = await login(formData.email, formData.password);
            if (!result.success) {
                setError(result.error);
            }
        }

        setLoading(false);
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setError('');
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <img src="/logo.svg" alt="Logo" className="auth-logo" />
                    <h1>Welcome</h1>
                    <p>{activeTab === 'login' ? 'Sign in to continue' : 'Create your account'}</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => switchTab('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => switchTab('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {activeTab === 'signup' && (
                        <div className="auth-row">
                            <div className="auth-field">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    autoComplete="given-name"
                                />
                            </div>
                            <div className="auth-field">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    autoComplete="family-name"
                                />
                            </div>
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                            minLength={6}
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
