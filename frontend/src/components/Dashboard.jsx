import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import MessageList from './MessageList';
import MessageDetail from './MessageDetail';
import SearchBar from './SearchBar';
import './Dashboard.css';

const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

export default function Dashboard({ agent, onLogout }) {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to WebSocket
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            newSocket.emit('agent-login', agent.name);
        });

        newSocket.on('new-message', (message) => {
            console.log('New message received:', message);
            setMessages(prev => [message, ...prev]);
            showNotification('New message received', 'info');
        });

        newSocket.on('message-updated', (updatedMessage) => {
            console.log('Message updated:', updatedMessage);
            setMessages(prev => prev.map(msg =>
                msg.id === updatedMessage.id ? updatedMessage : msg
            ));
            if (selectedMessage && selectedMessage.id === updatedMessage.id) {
                setSelectedMessage(updatedMessage);
            }
        });

        fetchMessages();

        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        applyFilters();
    }, [messages, filter, searchQuery]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${API_URL}/messages`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...messages];

        // Apply status filter
        if (filter === 'urgent') {
            filtered = filtered.filter(m => m.urgency_level === 'high');
        } else if (filter === 'my-messages') {
            filtered = filtered.filter(m => m.assigned_to === agent.id);
        } else if (filter === 'unassigned') {
            filtered = filtered.filter(m => !m.assigned_to && m.status === 'new');
        } else if (filter === 'new') {
            filtered = filtered.filter(m => m.status === 'new');
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.message_text.toLowerCase().includes(query) ||
                m.customer_name.toLowerCase().includes(query) ||
                m.customer_email.toLowerCase().includes(query)
            );
        }

        setFilteredMessages(filtered);
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleMessageSelect = async (message) => {
        try {
            const response = await fetch(`${API_URL}/messages/${message.id}`);
            const data = await response.json();
            setSelectedMessage(data);
        } catch (error) {
            console.error('Error fetching message details:', error);
        }
    };

    const handleAssignMessage = async (messageId) => {
        try {
            const response = await fetch(`${API_URL}/messages/${messageId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: agent.id })
            });
            const updatedMessage = await response.json();
            setSelectedMessage(updatedMessage);
            showNotification('Message assigned to you', 'success');
        } catch (error) {
            console.error('Error assigning message:', error);
        }
    };

    const handleRespondToMessage = async (messageId, responseText) => {
        try {
            const response = await fetch(`${API_URL}/messages/${messageId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responseText, agentId: agent.id })
            });
            const updatedMessage = await response.json();
            setSelectedMessage(updatedMessage);
            showNotification('Response sent successfully', 'success');
        } catch (error) {
            console.error('Error responding to message:', error);
        }
    };

    const handleStatusUpdate = async (messageId, status) => {
        try {
            const response = await fetch(`${API_URL}/messages/${messageId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const updatedMessage = await response.json();
            setSelectedMessage(updatedMessage);
            showNotification('Status updated', 'success');
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const urgentCount = messages.filter(m => m.urgency_level === 'high').length;
    const newCount = messages.filter(m => m.status === 'new').length;
    const myMessagesCount = messages.filter(m => m.assigned_to === agent.id).length;

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header glass">
                <div className="header-left">
                    <div className="logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1>Agent Dashboard</h1>
                        <p className="text-sm text-secondary">Logged in as {agent.name}</p>
                    </div>
                </div>

                <div className="header-right">
                    <button className="btn btn-ghost btn-sm" onClick={onLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="stats-bar">
                <div className="stat-card">
                    <div className="stat-icon urgent">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-value">{urgentCount}</div>
                        <div className="stat-label">Urgent</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon new">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-value">{newCount}</div>
                        <div className="stat-label">New</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon mine">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div>
                        <div className="stat-value">{myMessagesCount}</div>
                        <div className="stat-label">My Messages</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Sidebar */}
                <aside className="sidebar">
                    <SearchBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    <div className="filters">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="4" y1="21" x2="4" y2="14" />
                                <line x1="4" y1="10" x2="4" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12" y2="3" />
                                <line x1="20" y1="21" x2="20" y2="16" />
                                <line x1="20" y1="12" x2="20" y2="3" />
                            </svg>
                            All Messages
                            <span className="count">{messages.length}</span>
                        </button>

                        <button
                            className={`filter-btn ${filter === 'urgent' ? 'active' : ''}`}
                            onClick={() => setFilter('urgent')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Urgent Only
                            <span className="count urgent">{urgentCount}</span>
                        </button>

                        <button
                            className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
                            onClick={() => setFilter('new')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            New Messages
                            <span className="count">{newCount}</span>
                        </button>

                        <button
                            className={`filter-btn ${filter === 'my-messages' ? 'active' : ''}`}
                            onClick={() => setFilter('my-messages')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            My Messages
                            <span className="count">{myMessagesCount}</span>
                        </button>

                        <button
                            className={`filter-btn ${filter === 'unassigned' ? 'active' : ''}`}
                            onClick={() => setFilter('unassigned')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                            </svg>
                            Unassigned
                            <span className="count">{messages.filter(m => !m.assigned_to && m.status === 'new').length}</span>
                        </button>
                    </div>

                    <MessageList
                        messages={filteredMessages}
                        selectedMessage={selectedMessage}
                        onMessageSelect={handleMessageSelect}
                        loading={loading}
                    />
                </aside>

                {/* Main Panel */}
                <main className="main-panel">
                    {selectedMessage ? (
                        <MessageDetail
                            message={selectedMessage}
                            currentAgent={agent}
                            onAssign={handleAssignMessage}
                            onRespond={handleRespondToMessage}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    ) : (
                        <div className="empty-state">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <h3>No message selected</h3>
                            <p className="text-secondary">Select a message from the list to view details and respond</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`notification notification-${notification.type}`}>
                    <strong>{notification.message}</strong>
                </div>
            )}
        </div>
    );
}
