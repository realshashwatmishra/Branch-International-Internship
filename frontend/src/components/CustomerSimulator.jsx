import { useState } from 'react';
import './CustomerSimulator.css';

const API_URL = 'http://localhost:3000/api';

export default function CustomerSimulator({ onMessageSent }) {
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        messageText: '',
        tier: 'standard',
        accountBalance: '0'
    });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customerEmail || !formData.messageText) {
            alert('Please fill in email and message');
            return;
        }

        setSending(true);
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: formData.customerName || 'Anonymous Customer',
                    customerEmail: formData.customerEmail,
                    messageText: formData.messageText,
                    tier: formData.tier,
                    accountBalance: parseFloat(formData.accountBalance) || 0
                })
            });

            if (response.ok) {
                setFormData({
                    customerName: '',
                    customerEmail: '',
                    messageText: '',
                    tier: 'standard',
                    accountBalance: '0'
                });
                onMessageSent();
            } else {
                alert('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message');
        } finally {
            setSending(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="customer-simulator">
            <div className="simulator-header">
                <div className="simulator-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <line x1="9" y1="10" x2="15" y2="10" />
                        <line x1="9" y1="14" x2="13" y2="14" />
                    </svg>
                </div>
                <div>
                    <h2>Customer Message Simulator</h2>
                    <p className="text-sm text-secondary">Send test messages to the agent portal</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="simulator-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="customerName">Customer Name</label>
                        <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            className="input"
                            placeholder="John Doe"
                            value={formData.customerName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="customerEmail">Customer Email *</label>
                        <input
                            type="email"
                            id="customerEmail"
                            name="customerEmail"
                            className="input"
                            placeholder="john@example.com"
                            value={formData.customerEmail}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="tier">Customer Tier</label>
                        <select
                            id="tier"
                            name="tier"
                            className="input select"
                            value={formData.tier}
                            onChange={handleChange}
                        >
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="gold">Gold</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="accountBalance">Account Balance</label>
                        <input
                            type="number"
                            id="accountBalance"
                            name="accountBalance"
                            className="input"
                            placeholder="0.00"
                            value={formData.accountBalance}
                            onChange={handleChange}
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="messageText">Message *</label>
                    <textarea
                        id="messageText"
                        name="messageText"
                        className="input"
                        placeholder="Type your message here..."
                        value={formData.messageText}
                        onChange={handleChange}
                        rows="6"
                        required
                    />
                    <p className="text-xs text-tertiary">
                        Try keywords like "loan approval", "disbursed", or "urgent" to trigger high priority detection
                    </p>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-large"
                    disabled={sending}
                >
                    {sending ? (
                        <>
                            <span className="spinner"></span>
                            Sending...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            Send Message
                        </>
                    )}
                </button>
            </form>

            <div className="simulator-info card">
                <h3>Quick Test Scenarios</h3>
                <ul className="scenario-list">
                    <li>
                        <strong>High Priority:</strong> Include words like "urgent", "loan approval", "disbursed", "emergency"
                    </li>
                    <li>
                        <strong>Medium Priority:</strong> Include words like "application status", "update", "payment"
                    </li>
                    <li>
                        <strong>Low Priority:</strong> General inquiries without urgency keywords
                    </li>
                </ul>
            </div>
        </div>
    );
}
