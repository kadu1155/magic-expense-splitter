/**
 * Minimizes transactions using a greedy approach.
 * balances: Object { userId: amount } where + means they are owed, - means they owe.
 */
function minimizeTransactions(balances) {
    const creditors = [];
    const debtors = [];

    for (const [userId, balance] of Object.entries(balances)) {
        if (balance > 0.01) {
            creditors.push({ userId, amount: balance });
        } else if (balance < -0.01) {
            debtors.push({ userId, amount: -balance });
        }
    }

    const transactions = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const amount = Math.min(debtors[i].amount, creditors[j].amount);
        transactions.push({
            from: debtors[i].userId,
            to: creditors[j].userId,
            amount: parseFloat(amount.toFixed(2))
        });

        debtors[i].amount -= amount;
        creditors[j].amount -= amount;

        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }

    return transactions;
}

module.exports = { minimizeTransactions };
