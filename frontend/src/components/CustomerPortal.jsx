import { useState } from 'react';
import './CustomerPortal.css';

const API_URL = 'http://localhost:3000/api';

export default function CustomerPortal({ onBack }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        tier: 'standard'
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.message) {
            alert('Please fill in your email and message');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: formData.name || 'Anonymous',
                    customerEmail: formData.email,
                    messageText: formData.message,
                    tier: formData.tier,
                    accountBalance: 0
                })
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({
                    name: '',
                    email: '',
                    message: '',
                    tier: 'standard'
                });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                alert('Failed to submit ticket. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting ticket:', error);
            alert('Error submitting ticket. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="customer-portal-container">
            <div className="portal-bg-decoration"></div>

            <div className="customer-portal-content">
                <button className="btn btn-ghost btn-sm back-button" onClick={onBack}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Home
                </button>

                <div className="portal-header fade-in">
                    <div className="portal-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h1>Customer Support Portal</h1>
                    <p className="tagline">Submit a support ticket and we'll get back to you soon</p>
                </div>

                <div className="portal-main">
                    <div className="ticket-form-card card-glass fade-in">
                        <h2>Submit a Support Ticket</h2>
                        <p className="text-secondary">Our support team typically responds within 1-2 business hours</p>

                        {submitted && (
                            <div className="success-message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Your ticket has been submitted successfully! We'll get back to you soon.</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="ticket-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="input"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="input"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

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
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="input"
                                    placeholder="Describe your issue or question..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="8"
                                    required
                                />
                                <p className="text-xs text-tertiary">
                                    Please provide as much detail as possible to help us assist you better
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-large"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Submit Ticket
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="info-cards fade-in">
                        <div className="info-card card">
                            <div className="info-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <h3>Response Time</h3>
                            <p>Typical response within 1-2 hours during business hours</p>
                        </div>

                        <div className="info-card card">
                            <div className="info-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3>Support Team</h3>
                            <p>Our experienced agents are here to help you</p>
                        </div>

                        <div className="info-card card">
                            <div className="info-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <h3>Priority Support</h3>
                            <p>Urgent issues are automatically prioritized</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
