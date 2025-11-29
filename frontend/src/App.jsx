import { useState } from 'react';
import Home from './components/Home';
import AgentLogin from './components/AgentLogin';
import Dashboard from './components/Dashboard';
import CustomerPortal from './components/CustomerPortal';

function App() {
    const [view, setView] = useState('home'); // 'home', 'agent-login', 'agent-dashboard', 'customer'
    const [currentAgent, setCurrentAgent] = useState(null);

    const handleRoleSelection = (role) => {
        if (role === 'agent') {
            setView('agent-login');
        } else if (role === 'customer') {
            setView('customer');
        }
    };

    const handleAgentLogin = (agent) => {
        setCurrentAgent(agent);
        setView('agent-dashboard');
    };

    const handleLogout = () => {
        setCurrentAgent(null);
        setView('home');
    };

    const handleBackToHome = () => {
        setView('home');
    };

    return (
        <div className="app">
            {view === 'home' && (
                <Home onRoleSelection={handleRoleSelection} />
            )}
            {view === 'agent-login' && (
                <AgentLogin
                    onLogin={handleAgentLogin}
                    onBack={handleBackToHome}
                />
            )}
            {view === 'agent-dashboard' && (
                <Dashboard
                    agent={currentAgent}
                    onLogout={handleLogout}
                />
            )}
            {view === 'customer' && (
                <CustomerPortal onBack={handleBackToHome} />
            )}
        </div>
    );
}

export default App;
