require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { sequelize, User, Expense, Participant } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, '../dist')));

// Basic Health Check
app.get('/health', (req, res) => res.send('Backend is running.'));

// User Routes
app.post('/api/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Expense Routes
app.post('/api/expenses', async (req, res) => {
    console.log('POST /api/expenses received:', JSON.stringify(req.body, null, 2));
    const t = await sequelize.transaction();
    try {
        const { amount, description, category, payerId, participants, splitType } = req.body;

        // Create Expense
        const expense = await Expense.create({
            amount,
            description,
            category,
            payerId: payerId || null,
            splitType,
            isPending: !!req.body.isPending
        }, { transaction: t });

        // Create Participants (who owes)
        if (participants && participants.length > 0) {
            const participantDocs = participants.map(p => ({
                expenseId: expense.id,
                userId: p.userId,
                share: p.share
            }));
            await Participant.bulkCreate(participantDocs, { transaction: t });
        }

        await t.commit();
        res.json(expense);
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            include: [
                { model: User, as: 'Payer' },
                { model: Participant, as: 'Participants', include: [User] }
            ],
            order: [['date', 'DESC']]
        });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { minimizeTransactions } = require('./utils/settlement');

// Settlement Route
app.get('/api/balances', async (req, res) => {
    try {
        const users = await User.findAll();
        const expenses = await Expense.findAll({
            include: [{ model: Participant, as: 'Participants' }]
        });

        const balances = {};
        users.forEach(u => balances[u.id] = 0);

        expenses.forEach(exp => {
            if (exp.isPending) return; // Skip pending bills in balance calculation

            balances[exp.payerId] += exp.amount;
            exp.Participants.forEach(p => {
                balances[p.userId] -= p.share;
            });
        });

        const transactions = minimizeTransactions(balances);

        // Map IDs to Names for clarity
        const userMap = {};
        users.forEach(u => userMap[u.id] = u.name);

        const namedTransactions = transactions.map(t => ({
            from: userMap[t.from],
            to: userMap[t.to],
            amount: t.amount
        }));

        res.json({ balances, transactions: namedTransactions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { parseExpenseWithAI, generateMagicInsights } = require('./utils/ai');

// Delete Expense
app.delete('/api/expenses/:id', async (req, res) => {
    console.log(`DELETE request received for expense ID: ${req.params.id}`);
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const pCount = await Participant.destroy({ where: { expenseId: id }, transaction: t });
        const eCount = await Expense.destroy({ where: { id }, transaction: t });
        await t.commit();
        console.log(`Successfully deleted expense ID: ${id}. Removed ${pCount} participants and ${eCount} expense record.`);
        res.json({ message: 'Expense deleted successfully', deletedCount: eCount });
    } catch (err) {
        await t.rollback();
        console.error(`Error deleting expense ID: ${req.params.id}`, err);
        res.status(500).json({ error: err.message });
    }
});

// AI Insights Route
app.get('/api/ai/insights', async (req, res) => {
    try {
        const users = await User.findAll();
        const expenses = await Expense.findAll({
            include: [{ model: User, as: 'Payer' }],
            order: [['date', 'DESC']]
        });

        // Use settlement logic to get balances
        const bRes = await fetch(`http://localhost:${PORT}/api/balances`);
        const balances = await bRes.json();

        const insights = await generateMagicInsights(users, expenses, balances);
        res.json(insights);
    } catch (err) {
        console.error("Insights Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// AI Parsing Route
app.post('/api/ai/parse', async (req, res) => {
    try {
        const { text } = req.body;
        const users = await User.findAll();
        const parsed = await parseExpenseWithAI(text, users);

        // Convert names back to IDs
        const userMap = {};
        users.forEach(u => userMap[u.name.toLowerCase()] = u.id);

        const payerId = userMap[parsed.payerName.toLowerCase()];
        if (!payerId) throw new Error(`Payer "${parsed.payerName}" not found`);

        const participants = parsed.participants.map(p => ({
            userId: userMap[p.name.toLowerCase()],
            share: p.share
        })).filter(p => p.userId);

        res.json({ ...parsed, payerId, participants });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Final catch-all to serve index.html for any client-side routes (Express 5 compatible)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
