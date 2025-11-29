import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./customer_service.db');

// Wrap database methods in promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database schema
export async function initializeDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      tier TEXT DEFAULT 'standard',
      account_balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      message_text TEXT NOT NULL,
      urgency_level TEXT DEFAULT 'low',
      urgency_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new',
      assigned_to INTEGER,
      response_text TEXT,
      responded_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (assigned_to) REFERENCES agents(id)
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      email TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS canned_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      message_template TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for faster queries
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_messages_urgency ON messages(urgency_level)`);
  await dbRun(`CREATE INDEX IF NOT EXISTS idx_messages_customer ON messages(customer_id)`);

  // Seed some default agents
  const agents = [
    { name: 'Sarah Johnson', email: 'sarah.j@company.com' },
    { name: 'Mike Chen', email: 'mike.c@company.com' },
    { name: 'Emily Rodriguez', email: 'emily.r@company.com' },
    { name: 'David Kim', email: 'david.k@company.com' }
  ];

  for (const agent of agents) {
    await dbRun(
      `INSERT OR IGNORE INTO agents (name, email) VALUES (?, ?)`,
      [agent.name, agent.email]
    );
  }

  // Seed canned responses
  const cannedResponses = [
    {
      title: 'Loan Application Status',
      category: 'loan',
      message: 'Thank you for checking on your loan application. Your application is currently under review. Our team will notify you within 24-48 hours with an update. If you have any additional documents to submit, please upload them through your account portal.'
    },
    {
      title: 'Account Information Update',
      category: 'account',
      message: 'To update your account information, please log into your account and navigate to Settings > Profile. You can update your personal details, contact information, and banking details there. If you need assistance, please let us know which specific information you\'d like to update.'
    },
    {
      title: 'Disbursement Timeline',
      category: 'loan',
      message: 'Once your loan is approved, funds are typically disbursed within 2-3 business days. You will receive an email and SMS notification when the disbursement is initiated. The funds will be deposited directly into the bank account you provided during application.'
    },
    {
      title: 'General Inquiry Response',
      category: 'general',
      message: 'Thank you for contacting us. We\'ve received your inquiry and our team will get back to you shortly. In the meantime, you can check our FAQ section for answers to common questions.'
    },
    {
      title: 'Document Upload Instructions',
      category: 'documents',
      message: 'To upload required documents, please log into your account and go to Documents section. Click "Upload New Document" and select the appropriate document type. Supported formats are PDF, JPG, and PNG. Maximum file size is 5MB per document.'
    },
    {
      title: 'Payment Issue Resolution',
      category: 'payment',
      message: 'We apologize for the payment issue you\'re experiencing. Our technical team is looking into this. Please provide us with the transaction ID or date of the payment attempt so we can investigate further and resolve this for you as quickly as possible.'
    }
  ];

  for (const response of cannedResponses) {
    await dbRun(
      `INSERT OR IGNORE INTO canned_responses (title, category, message_template) 
       VALUES (?, ?, ?)`,
      [response.title, response.category, response.message]
    );
  }

  console.log('Database initialized successfully');
}

// Calculate urgency score based on message content
export function calculateUrgency(messageText) {
  const text = messageText.toLowerCase();
  let score = 0;
  let level = 'low';

  // High urgency keywords
  const highUrgencyKeywords = [
    'urgent', 'emergency', 'immediately', 'asap', 'critical',
    'loan approval', 'disbursed', 'disburse', 'disbursement',
    'when will i get', 'waiting for loan', 'approved yet',
    'rejected', 'denied', 'freeze', 'frozen', 'locked out',
    'cant access', 'cannot access', 'blocked'
  ];

  // Medium urgency keywords
  const mediumUrgencyKeywords = [
    'application status', 'loan status', 'pending',
    'update', 'change', 'modify', 'payment',
    'document', 'verification', 'verify'
  ];

  // Check high urgency
  for (const keyword of highUrgencyKeywords) {
    if (text.includes(keyword)) {
      score += 10;
    }
  }

  // Check medium urgency
  for (const keyword of mediumUrgencyKeywords) {
    if (text.includes(keyword)) {
      score += 5;
    }
  }

  // Determine level based on score
  if (score >= 15) {
    level = 'high';
  } else if (score >= 5) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return { score, level };
}

// Customer operations
export async function createCustomer(name, email, tier = 'standard', accountBalance = 0) {
  const result = await dbRun(
    `INSERT INTO customers (name, email, tier, account_balance) VALUES (?, ?, ?, ?)`,
    [name, email, tier, accountBalance]
  );
  return result.lastID;
}

export async function getCustomer(customerId) {
  return await dbGet(`SELECT * FROM customers WHERE id = ?`, [customerId]);
}

export async function getCustomerByEmail(email) {
  return await dbGet(`SELECT * FROM customers WHERE email = ?`, [email]);
}

export async function getAllCustomers() {
  return await dbAll(`SELECT * FROM customers ORDER BY name`);
}

// Message operations
export async function createMessage(customerId, messageText) {
  const { score, level } = calculateUrgency(messageText);

  const result = await dbRun(
    `INSERT INTO messages (customer_id, message_text, urgency_level, urgency_score) 
     VALUES (?, ?, ?, ?)`,
    [customerId, messageText, level, score]
  );

  return result.lastID;
}

export async function getAllMessages(filters = {}) {
  let query = `
    SELECT m.*, c.name as customer_name, c.email as customer_email, 
           c.tier as customer_tier, c.account_balance,
           a.name as agent_name
    FROM messages m
    JOIN customers c ON m.customer_id = c.id
    LEFT JOIN agents a ON m.assigned_to = a.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.status) {
    query += ` AND m.status = ?`;
    params.push(filters.status);
  }

  if (filters.urgency) {
    query += ` AND m.urgency_level = ?`;
    params.push(filters.urgency);
  }

  if (filters.assignedTo) {
    query += ` AND m.assigned_to = ?`;
    params.push(filters.assignedTo);
  }

  if (filters.unassigned) {
    query += ` AND m.assigned_to IS NULL`;
  }

  query += ` ORDER BY m.urgency_score DESC, m.created_at DESC`;

  return await dbAll(query, params);
}

export async function getMessage(messageId) {
  return await dbGet(
    `SELECT m.*, c.name as customer_name, c.email as customer_email,
            c.tier as customer_tier, c.account_balance,
            a.name as agent_name
     FROM messages m
     JOIN customers c ON m.customer_id = c.id
     LEFT JOIN agents a ON m.assigned_to = a.id
     WHERE m.id = ?`,
    [messageId]
  );
}

export async function assignMessage(messageId, agentId) {
  await dbRun(
    `UPDATE messages SET assigned_to = ?, status = 'in-progress' WHERE id = ?`,
    [agentId, messageId]
  );
}

export async function respondToMessage(messageId, responseText, agentId) {
  await dbRun(
    `UPDATE messages 
     SET response_text = ?, responded_at = CURRENT_TIMESTAMP, 
         status = 'resolved', assigned_to = ?
     WHERE id = ?`,
    [responseText, agentId, messageId]
  );
}

export async function updateMessageStatus(messageId, status) {
  await dbRun(`UPDATE messages SET status = ? WHERE id = ?`, [status, messageId]);
}

export async function getCustomerMessages(customerId) {
  return await dbAll(
    `SELECT * FROM messages WHERE customer_id = ? ORDER BY created_at DESC`,
    [customerId]
  );
}

// Agent operations
export async function getAllAgents() {
  return await dbAll(`SELECT * FROM agents WHERE active = 1 ORDER BY name`);
}

export async function getAgent(agentId) {
  return await dbGet(`SELECT * FROM agents WHERE id = ?`, [agentId]);
}

// Canned responses
export async function getAllCannedResponses() {
  return await dbAll(`SELECT * FROM canned_responses ORDER BY category, title`);
}

// Search functionality
export async function searchMessages(query) {
  const searchTerm = `%${query}%`;
  return await dbAll(
    `SELECT m.*, c.name as customer_name, c.email as customer_email,
            c.tier as customer_tier, a.name as agent_name
     FROM messages m
     JOIN customers c ON m.customer_id = c.id
     LEFT JOIN agents a ON m.assigned_to = a.id
     WHERE m.message_text LIKE ? OR c.name LIKE ? OR c.email LIKE ?
     ORDER BY m.urgency_score DESC, m.created_at DESC`,
    [searchTerm, searchTerm, searchTerm]
  );
}

export { db };
