import { useState, useEffect } from 'react';
import './CannedMessages.css';

const API_URL = 'http://localhost:3000/api';

export default function CannedMessages({ onSelect, onClose }) {
    const [cannedMessages, setCannedMessages] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCannedMessages();
    }, []);

    const fetchCannedMessages = async () => {
        try {
            const response = await fetch(`${API_URL}/canned-responses`);
            const data = await response.json();
            setCannedMessages(data);
        } catch (error) {
            console.error('Error fetching canned messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', ...new Set(cannedMessages.map(m => m.category))];

    const filteredMessages = selectedCategory === 'all'
        ? cannedMessages
        : cannedMessages.filter(m => m.category === selectedCategory);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal canned-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Select Canned Response</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="category-filter">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="canned-list">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p className="text-secondary">Loading templates...</p>
                        </div>
                    ) : filteredMessages.length > 0 ? (
                        filteredMessages.map((message) => (
                            <div
                                key={message.id}
                                className="canned-item card"
                                onClick={() => onSelect(message)}
                            >
                                <div className="canned-header">
                                    <h3>{message.title}</h3>
                                    <span className="badge badge-low">{message.category}</span>
                                </div>
                                <p className="canned-preview text-sm text-secondary">
                                    {message.message_template}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-secondary">No templates found</p>
                    )}
                </div>
            </div>
        </div>
    );
}
