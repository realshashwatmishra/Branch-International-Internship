import './Home.css';

export default function Home({ onRoleSelection }) {
    return (
        <div className="home-container">
            <div className="home-bg-decoration"></div>

            <div className="home-content">
                {/* Header */}
                <header className="home-header fade-in">
                    <div className="home-logo">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h1>Branch Support Portal</h1>
                    <p className="tagline">Manage customer conversations with speed and context</p>
                </header>

                {/* Feature Highlights */}
                <div className="feature-highlights fade-in">
                    <div className="feature-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        <span>Real-time ticket updates and customer context</span>
                    </div>
                    <div className="feature-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>Intelligent prioritization and canned responses</span>
                    </div>
                    <div className="feature-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>Shared workspace purpose-built for support teams</span>
                    </div>
                </div>

                {/* Role Selection Cards */}
                <div className="role-cards fade-in">
                    <div className="role-card card-glass" onClick={() => onRoleSelection('customer')}>
                        <div className="role-icon customer">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h2>I am a Customer</h2>
                        <p>Submit a support ticket or check your loan status</p>
                        <button className="btn btn-primary">
                            Continue
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    </div>

                    <div className="role-card card-glass" onClick={() => onRoleSelection('agent')}>
                        <div className="role-icon agent">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h2>I am an Agent</h2>
                        <p>Access the agent dashboard to assist customers</p>
                        <button className="btn btn-primary">
                            Login
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="home-footer">
                    <p className="text-sm text-tertiary">Powered by Branch AI • Real-time Customer Support</p>
                </footer>
            </div>
        </div>
    );
}
