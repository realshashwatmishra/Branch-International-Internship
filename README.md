# Customer Service Messaging Application

A full-stack real-time customer service messaging portal that enables teams of agents to efficiently manage and respond to customer inquiries with intelligent priority detection, search capabilities, and canned responses.

## 🌟 Features

### Core Functionality
- **Multi-Agent Support**: Multiple agents can log in simultaneously and work on different messages
- **Real-Time Updates**: WebSocket-powered live updates when new messages arrive or status changes occur
- **Priority Detection**: Automatic urgency scoring based on message content (loan approvals, disbursements, emergencies)
- **Search**: Search across message content, customer names, and email addresses
- **Canned Responses**: Pre-configured response templates for common scenarios
- **Customer Context**: View customer tier, account balance, and message history

### Agent Dashboard
- Filter messages by status (new, urgent, assigned to me, unassigned)
- Visual urgency indicators with color-coded badges
- Customer information sidebar
- Message assignment system
- Status tracking (new → in-progress → resolved)

### Customer Simulator
- Test interface to send messages as a customer
- Configurable customer tier and account balance
- Urgency keyword suggestions for testing priority detection

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- SQLite database
- Socket.io for WebSocket connections
- CSV parsing for data import

**Frontend:**
- React 18
- Vite for development and building
- Socket.io client for real-time updates
- Modern CSS with glassmorphism design

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Import sample customer messages from CSV
npm run import-csv

# Start the backend server
npm start
```

The backend server will run on `http://localhost:3000`

### 2. Frontend Setup

Open a **new terminal window** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Access the Application

1. Open your browser to `http://localhost:5173`
2. Select an agent from the dropdown (Sarah Johnson, Mike Chen, Emily Rodriguez, or David Kim)
3. Click "Access Dashboard"

## 💡 Usage Guide

### Agent Workflow

1. **View Messages**: Browse all customer messages in the left sidebar
2. **Filter Messages**: Use filter buttons to show urgent, new, or your assigned messages
3. **Search**: Type in the search bar to find specific messages or customers
4. **Select Message**: Click on a message to view full details and customer information
5. **Claim Message**: Click "Claim Message" to assign it to yourself
6. **Respond**: 
   - Type a response manually, OR
   - Click "Use Template" to select a canned response
   - Click "Send Response" to submit
7. **Update Status**: Change message status using the dropdown (New → In Progress → Resolved)

### Testing Real-Time Features

1. **Multi-Agent Testing**: 
   - Open the app in multiple browser windows/tabs
   - Log in as different agents
   - Claim a message in one window and watch it update in others

2. **Send Test Messages**:
   - Click "Show Customer Simulator" in the dashboard header
   - Fill in customer details and message
   - Try keywords like "urgent", "loan approval", or "disbursed" for high priority
   - Click "Send Message" and watch it appear in real-time

## 🎯 Priority Detection

The system automatically analyzes message content and assigns urgency levels:

### High Priority (Red Badge)
Keywords: urgent, emergency, immediately, asap, critical, loan approval, disbursed, disburse, disbursement, rejected, denied, freeze, frozen, locked out, can't access, cannot access, blocked

### Medium Priority (Orange Badge)
Keywords: application status, loan status, pending, update, change, modify, payment, document, verification

### Low Priority (Gray Badge)
General inquiries without urgency keywords

## 📊 Database Schema

- **customers**: Customer profiles (name, email, tier, account balance)
- **messages**: Customer messages with urgency scoring and status tracking
- **agents**: Agent profiles
- **canned_responses**: Pre-configured response templates

## 🔌 API Endpoints

### Messages
- `GET /api/messages` - List all messages (with optional filters)
- `GET /api/messages/:id` - Get message details
- `POST /api/messages` - Create new message (customer simulator)
- `POST /api/messages/:id/assign` - Assign message to agent
- `POST /api/messages/:id/respond` - Send response to message
- `PATCH /api/messages/:id/status` - Update message status

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer with message history

### Agents
- `GET /api/agents` - List all agents

### Canned Responses
- `GET /api/canned-responses` - List all canned response templates

### Search
- `GET /api/search?q=query` - Search messages and customers

## 🎨 Design Features

- **Dark Theme**: Professional dark color scheme with vibrant accents
- **Glassmorphism**: Modern frosted glass effects
- **Smooth Animations**: Micro-interactions and hover effects
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Semantic HTML and proper ARIA labels

## 📁 Project Structure

```
MAIL/
├── backend/
│   ├── server.js           # Express server with Socket.io
│   ├── database.js         # SQLite database layer
│   ├── import-csv.js       # CSV import script
│   ├── sample-messages.csv # Sample customer messages
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentLogin.jsx       # Agent selection screen
│   │   │   ├── Dashboard.jsx        # Main agent dashboard
│   │   │   ├── MessageList.jsx      # Message list sidebar
│   │   │   ├── MessageDetail.jsx    # Message detail view
│   │   │   ├── SearchBar.jsx        # Search component
│   │   │   ├── CannedMessages.jsx   # Canned response modal
│   │   │   └── CustomerSimulator.jsx # Customer message form
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css       # Design system & global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🧪 Testing Scenarios

1. **Urgent Message Flow**:
   - Send message with "loan approval urgent" text
   - Verify it appears at top with red "HIGH" badge
   - Multiple agents see it simultaneously

2. **Multi-Agent Assignment**:
   - Agent A claims a message
   - Agent B sees the message as "assigned"
   - Status updates propagate in real-time

3. **Canned Responses**:
   - Open message detail
   - Click "Use Template"
   - Select a template category
   - Choose template and verify it populates response field

4. **Search**:
   - Type customer name or keyword
   - Verify filtered results
   - Clear search to reset

5. **Customer History**:
   - Select a customer with multiple messages
   - View message history in sidebar
   - Verify customer tier and balance display

## 🔧 Customization

### Add New Canned Responses
Edit the `cannedResponses` array in `backend/database.js` before running the import

### Adjust Priority Keywords
Modify the `calculateUrgency()` function in `backend/database.js`

### Change Color Scheme
Update CSS variables in `frontend/src/index.css`

## 📝 Notes

- No authentication is implemented (demo mode) - agents select their name from a dropdown
- SQLite database file (`customer_service.db`) is created automatically
- All timestamps are stored in UTC
- WebSocket connection uses same origin policy

## 🐛 Troubleshooting

**Backend won't start:**
- Ensure port 3000 is not in use
- Check Node.js version (v16+)
- Delete `customer_service.db` and run import-csv again

**Frontend shows connection errors:**
- Verify backend is running on port 3000
- Check browser console for CORS errors
- Ensure Socket.io client matches server version

**Messages don't update in real-time:**
- Check WebSocket connection in browser dev tools (Network tab)
- Verify both clients are connected to the same backend
- Refresh the page to reconnect

## 📄 License

This is a demo application for customer service management.
