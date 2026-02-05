import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function ManualExpenseForm({ users, onAdd, prefillData }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [payerId, setPayerId] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [highlighted, setHighlighted] = useState(false);

    // Hydrate form when AI suggestion is received
    useEffect(() => {
        if (prefillData) {
            setDescription(prefillData.description || '');
            setAmount(prefillData.amount || '');
            setPayerId(prefillData.payerId || '');
            setIsPending(!!prefillData.isPending);

            if (prefillData.participants) {
                setSelectedParticipants(prefillData.participants.map(p => p.userId.toString()));
            }

            // Flash effect
            setHighlighted(true);
            const timer = setTimeout(() => setHighlighted(false), 2000);

            Swal.fire({
                title: 'Form Pre-filled!',
                text: 'AI identified the details. Review the form below.',
                icon: 'info',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000
            });
        }
    }, [prefillData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description) return Swal.fire('Error', 'Please enter a description (e.g., Pizza).', 'error');
        if (!amount || parseFloat(amount) <= 0) return Swal.fire('Error', 'Please enter a valid amount.', 'error');
        if (!isPending && !payerId) return Swal.fire('Error', 'Please select who paid for the expense, or mark it as Pending.', 'error');
        if (selectedParticipants.length === 0) return Swal.fire('Error', 'Please select at least one participant.', 'error');

        const share = parseFloat(amount) / selectedParticipants.length;
        const participants = selectedParticipants.map(id => ({
            userId: parseInt(id),
            share: parseFloat(share.toFixed(2))
        }));

        onAdd({
            description,
            amount: parseFloat(amount),
            payerId: isPending ? null : parseInt(payerId),
            participants,
            splitType: 'equal',
            isPending
        });

        // Reset
        setDescription('');
        setAmount('');
        setPayerId('');
        setIsPending(false);
        setSelectedParticipants([]);
    };

    const toggleParticipant = (id) => {
        if (selectedParticipants.includes(id)) {
            setSelectedParticipants(selectedParticipants.filter(p => p !== id));
        } else {
            setSelectedParticipants([...selectedParticipants, id]);
        }
    };

    const selectAll = () => {
        setSelectedParticipants(users.map(u => u.id.toString()));
    };

    return (
        <form
            className={`glass-card ${highlighted ? 'highlight-flash' : ''}`}
            onSubmit={handleSubmit}
            style={{
                transition: 'all 0.5s ease',
                border: highlighted ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.125)',
                boxShadow: highlighted ? '0 0 20px rgba(168, 85, 247, 0.4)' : '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
        >
            <h3>Manual Add Expense</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    className="input"
                    placeholder="Description (e.g., Pizza)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <input
                    className="input"
                    type="number"
                    placeholder="Amount (₹)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />

                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: 0.9 }}>
                        <input
                            type="checkbox"
                            checked={isPending}
                            onChange={e => setIsPending(e.target.checked)}
                        />
                        <strong>Mark as Pending</strong> (Nobody has paid yet)
                    </label>
                </div>

                {!isPending && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.7 }}>Who Paid?</label>
                        <select
                            className="input"
                            value={payerId}
                            onChange={e => setPayerId(e.target.value)}
                        >
                            <option value="">Select Payer</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ opacity: 0.7 }}>{isPending ? 'Who will contribute?' : 'Split Between:'}</label>
                        <button type="button" className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={selectAll}>Select All</button>
                    </div>
                    <div className="participants-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                        {users.map(u => (
                            <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedParticipants.includes(u.id.toString())}
                                    onChange={() => toggleParticipant(u.id.toString())}
                                />
                                {u.name}
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn">Add {isPending ? 'Pending Bill' : 'Expense'}</button>
            </div>
        </form>
    );
}
