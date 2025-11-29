import { useState, useEffect } from 'react';
import CannedMessages from './CannedMessages';
import './MessageDetail.css';

const API_URL = 'http://localhost:3000/api';

export default function MessageDetail({ message, currentAgent, onAssign, onRespond, onStatusUpdate }) {
    const [responseText, setResponseText] = useState('');
    const [customerHistory, setCustomerHistory] = useState([]);
    const [showCannedMessages, setShowCannedMessages] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (message) {
            fetchCustomerHistory();
            setResponseText('');
        }
    }, [message]);

    const fetchCustomerHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/customers/${message.customer_id}`);
            const data = await response.json();
            setCustomerHistory(data.messages || []);
        } catch (error) {
            console.error('Error fetching customer history:', error);
        }
    };

    const handleSendResponse = async () => {
        if (!responseText.trim()) return;

        setSending(true);
        try {
            await onRespond(message.id, responseText);
            setResponseText('');
        } finally {
            setSending(false);
        }
    };

    const handleCannedMessageSelect = (cannedMessage) => {
        setResponseText(cannedMessage.message_template);
        setShowCannedMessages(false);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const isAssignedToCurrentAgent = message.assigned_to === currentAgent.id;
    const isResolved = message.status === 'resolved';

    return (
        <div className="message-detail">
            <div className="message-detail-header">
                <div>
                    <h2>{message.customer_name}</h2>
                    <p className="text-sm text-secondary">{message.customer_email}</p>
                </div>
                <div className="message-detail-actions">
                    {!isAssignedToCurrentAgent && !isResolved && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onAssign(message.id)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Claim Message
                        </button>
                    )}
                    {message.status !== 'resolved' && (
                        <select
                            className="input select"
                            style={{ width: 'auto', minWidth: '140px' }}
                            value={message.status}
                            onChange={(e) => onStatusUpdate(message.id, e.target.value)}
                        >
                            <option value="new">New</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    )}
                </div>
            </div>

            <div className="message-detail-content">
                <div className="message-main">
                    <div className="message-card card-glass">
                        <div className="message-card-header">
                            <div className="message-badges">
                                <span className={`badge badge-${message.urgency_level}`}>
                                    {message.urgency_level} priority
                                </span>
                                <span className={`badge badge-${message.status}`}>
                                    {message.status}
                                </span>
                            </div>
                            <span className="text-xs text-tertiary">{formatDate(message.created_at)}</span>
                        </div>

                        <div className="message-text">
                            {message.message_text}
                        </div>

                        {message.assigned_to && (
                            <div className="message-assignment">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <span className="text-sm text-secondary">
                                    Assigned to <strong>{message.agent_name}</strong>
                                </span>
                            </div>
                        )}

                        {message.response_text && (
                            <div className="response-section">
                                <div className="response-header">
                                    <strong>Response</strong>
                                    <span className="text-xs text-tertiary">{formatDate(message.responded_at)}</span>
                                </div>
                                <div className="response-text">
                                    {message.response_text}
                                </div>
                            </div>
                        )}
                    </div>

                    {!isResolved && (
                        <div className="response-composer card-glass">
                            <div className="composer-header">
                                <h3>Send Response</h3>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setShowCannedMessages(true)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    Use Template
                                </button>
                            </div>
                            <textarea
                                className="input"
                                placeholder="Type your response here..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                rows="6"
                            />
                            <button
                                className="btn btn-success"
                                onClick={handleSendResponse}
                                disabled={!responseText.trim() || sending}
                            >
                                {sending ? (
                                    <>
                                        <span className="spinner"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Send Response
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <aside className="customer-sidebar card-glass">
                    <h3>Customer Information</h3>

                    <div className="customer-info-section">
                        <div className="info-item">
                            <span className="info-label">Tier</span>
                            <span className={`badge ${message.customer_tier === 'premium' ? 'badge-high' :
                                    message.customer_tier === 'gold' ? '' : 'badge-low'
                                }`} style={
                                    message.customer_tier === 'gold' ? {
                                        background: 'rgba(251, 191, 36, 0.15)',
                                        color: '#fbbf24',
                                        border: '1px solid rgba(251, 191, 36, 0.3)'
                                    } : {}
                                }>
                                {message.customer_tier}
                            </span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Account Balance</span>
                            <span className="info-value">${message.account_balance?.toLocaleString() || '0'}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value text-sm">{message.customer_email}</span>
                        </div>
                    </div>

                    <div className="customer-history">
                        <h4>Message History</h4>
                        {customerHistory.length > 0 ? (
                            <div className="history-list">
                                {customerHistory.slice(0, 5).map((msg) => (
                                    <div key={msg.id} className={`history-item ${msg.id === message.id ? 'current' : ''}`}>
                                        <div className="history-item-header">
                                            <span className={`badge badge-${msg.status} badge-sm`}>{msg.status}</span>
                                            <span className="text-xs text-tertiary">{formatDate(msg.created_at)}</span>
                                        </div>
                                        <p className="history-item-text text-sm">{msg.message_text}</p>
                                    </div>
                                ))}
                                {customerHistory.length > 5 && (
                                    <p className="text-xs text-tertiary">+ {customerHistory.length - 5} more messages</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-tertiary">No previous messages</p>
                        )}
                    </div>
                </aside>
            </div>

            {showCannedMessages && (
                <CannedMessages
                    onSelect={handleCannedMessageSelect}
                    onClose={() => setShowCannedMessages(false)}
                />
            )}
        </div>
    );
}
