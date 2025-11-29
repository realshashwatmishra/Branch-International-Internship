import fs from 'fs';
import csv from 'csv-parser';
import * as db from './database.js';

console.log('Starting CSV import...');

// Initialize database first
await db.initializeDatabase();

const messages = [];

// Read CSV file
fs.createReadStream('./sample-messages.csv')
    .pipe(csv())
    .on('data', (row) => {
        messages.push(row);
    })
    .on('end', async () => {
        console.log(`Found ${messages.length} messages in CSV`);

        for (const msg of messages) {
            try {
                // Create or get customer
                let customer = await db.getCustomerByEmail(msg.customer_email);
                if (!customer) {
                    const customerId = await db.createCustomer(
                        msg.customer_name,
                        msg.customer_email,
                        msg.tier || 'standard',
                        parseFloat(msg.account_balance) || 0
                    );
                    customer = await db.getCustomer(customerId);
                }

                // Create message
                await db.createMessage(customer.id, msg.message_text);
                console.log(`✓ Imported message from ${msg.customer_name}`);
            } catch (error) {
                console.error(`✗ Error importing message from ${msg.customer_name}:`, error.message);
            }
        }

        console.log('\nImport complete!');
        console.log('Run "npm start" to start the server');
        process.exit(0);
    })
    .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        process.exit(1);
    });
