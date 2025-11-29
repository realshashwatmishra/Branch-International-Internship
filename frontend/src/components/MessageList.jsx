import './MessageList.css';

export default function MessageList({ messages, selectedMessage, onMessageSelect, loading }) {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor(diffInHours * 60);
            return `${minutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="message-list-loading">
                <div className="spinner"></div>
                <p className="text-secondary">Loading messages...</p>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="message-list-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-secondary">No messages found</p>
            </div>
        );
    }

    return (
        <div className="message-list">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                    onClick={() => onMessageSelect(message)}
                >
                    <div className="message-item-header">
                        <div className="message-customer">
                            <span className="customer-name">{message.customer_name}</span>
                            {message.urgency_level === 'high' && (
                                <span className="urgency-indicator high">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                </span>
                            )}
                            {message.urgency_level === 'medium' && (
                                <span className="urgency-indicator medium">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                </span>
                            )}
                        </div>
                        <span className="message-time text-xs text-tertiary">{formatTime(message.created_at)}</span>
                    </div>

                    <p className="message-preview">{message.message_text}</p>

                    <div className="message-item-footer">
                        <div className="message-badges">
                            <span className={`badge badge-${message.urgency_level}`}>
                                {message.urgency_level}
                            </span>
                            <span className={`badge badge-${message.status}`}>
                                {message.status}
                            </span>
                            {message.customer_tier !== 'standard' && (
                                <span className="badge" style={{
                                    background: 'rgba(251, 191, 36, 0.15)',
                                    color: '#fbbf24',
                                    border: '1px solid rgba(251, 191, 36, 0.3)'
                                }}>
                                    {message.customer_tier}
                                </span>
                            )}
                        </div>
                        {message.agent_name && (
                            <span className="assigned-to text-xs text-tertiary">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                {message.agent_name}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
