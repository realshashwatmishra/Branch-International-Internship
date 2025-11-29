import { useState, useEffect } from 'react';
import './AgentLogin.css';

const API_URL = 'http://localhost:3000/api';

export default function AgentLogin({ onLogin, onBack }) {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await fetch(`${API_URL}/agents`);
            const data = await response.json();
            setAgents(data);
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedAgent) {
            const agent = agents.find(a => a.id === parseInt(selectedAgent));
            onLogin(agent);
        }
    };

    return (
        <div className="login-container">
            <div className="login-bg-decoration"></div>

            <div className="login-card card-glass fade-in">
                {onBack && (
                    <button className="btn btn-ghost btn-sm back-button" onClick={onBack}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Home
                    </button>
                )}

                <div className="login-header">
                    <div className="login-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h1>Agent Portal</h1>
                    <p className="text-secondary">Select your agent profile to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="agent-select">Agent Name</label>
                        <select
                            id="agent-select"
                            className="input select"
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Select an agent...</option>
                            {agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-large"
                        disabled={!selectedAgent || loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Loading...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                                </svg>
                                Access Dashboard
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="text-xs text-tertiary">
                        Demo mode - No authentication required
                    </p>
                </div>
            </div>
        </div>
    );
}
