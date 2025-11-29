import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as db from './database.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
await db.initializeDatabase();

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('agent-login', (agentName) => {
        socket.agentName = agentName;
        console.log(`Agent ${agentName} logged in`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Broadcast new message to all connected clients
function broadcastNewMessage(message) {
    io.emit('new-message', message);
}

// Broadcast message update to all connected clients
function broadcastMessageUpdate(message) {
    io.emit('message-updated', message);
}

// API Routes

// Get all messages with optional filters
app.get('/api/messages', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            urgency: req.query.urgency,
            assignedTo: req.query.assignedTo,
            unassigned: req.query.unassigned === 'true'
        };
        const messages = await db.getAllMessages(filters);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get single message
app.get('/api/messages/:id', async (req, res) => {
    try {
        const message = await db.getMessage(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json(message);
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
});

// Create new message (from customer)
app.post('/api/messages', async (req, res) => {
    try {
        const { customerEmail, customerName, messageText, tier, accountBalance } = req.body;

        if (!customerEmail || !messageText) {
            return res.status(400).json({ error: 'Customer email and message text are required' });
        }

        // Find or create customer
        let customer = await db.getCustomerByEmail(customerEmail);
        if (!customer) {
            const customerId = await db.createCustomer(
                customerName || 'Unknown Customer',
                customerEmail,
                tier || 'standard',
                accountBalance || 0
            );
            customer = await db.getCustomer(customerId);
        }

        // Create message
        const messageId = await db.createMessage(customer.id, messageText);
        const message = await db.getMessage(messageId);

        // Broadcast to all connected agents
        broadcastNewMessage(message);

        res.status(201).json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

// Assign message to agent
app.post('/api/messages/:id/assign', async (req, res) => {
    try {
        const { agentId } = req.body;
        await db.assignMessage(req.params.id, agentId);
        const message = await db.getMessage(req.params.id);

        // Broadcast update
        broadcastMessageUpdate(message);

        res.json(message);
    } catch (error) {
        console.error('Error assigning message:', error);
        res.status(500).json({ error: 'Failed to assign message' });
    }
});

// Respond to message
app.post('/api/messages/:id/respond', async (req, res) => {
    try {
        const { responseText, agentId } = req.body;

        if (!responseText) {
            return res.status(400).json({ error: 'Response text is required' });
        }

        await db.respondToMessage(req.params.id, responseText, agentId);
        const message = await db.getMessage(req.params.id);

        // Broadcast update
        broadcastMessageUpdate(message);

        res.json(message);
    } catch (error) {
        console.error('Error responding to message:', error);
        res.status(500).json({ error: 'Failed to respond to message' });
    }
});

// Update message status
app.patch('/api/messages/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await db.updateMessageStatus(req.params.id, status);
        const message = await db.getMessage(req.params.id);

        // Broadcast update
        broadcastMessageUpdate(message);

        res.json(message);
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ error: 'Failed to update message status' });
    }
});

// Get all customers
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await db.getAllCustomers();
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Get single customer with message history
app.get('/api/customers/:id', async (req, res) => {
    try {
        const customer = await db.getCustomer(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const messages = await db.getCustomerMessages(req.params.id);
        res.json({ ...customer, messages });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// Get all agents
app.get('/api/agents', async (req, res) => {
    try {
        const agents = await db.getAllAgents();
        res.json(agents);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});

// Get all canned responses
app.get('/api/canned-responses', async (req, res) => {
    try {
        const responses = await db.getAllCannedResponses();
        res.json(responses);
    } catch (error) {
        console.error('Error fetching canned responses:', error);
        res.status(500).json({ error: 'Failed to fetch canned responses' });
    }
});

// Search messages and customers
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const results = await db.searchMessages(q);
        res.json(results);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: 'Failed to search' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('WebSocket server ready for real-time updates');
});
