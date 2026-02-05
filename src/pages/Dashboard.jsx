import { useState, useEffect, useRef } from 'react';
import ManualExpenseForm from '../components/ManualExpenseForm';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_BASE = window.location.origin === 'http://localhost:5173' ? 'http://localhost:5000/api' : '/api';

function Dashboard() {
    const [users, setUsers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState({ transactions: [] });
    const [userName, setUserName] = useState('');
    const [aiText, setAiText] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [insights, setInsights] = useState(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const manualFormRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [uRes, eRes, bRes] = await Promise.all([
                fetch(`${API_BASE}/users`),
                fetch(`${API_BASE}/expenses`),
                fetch(`${API_BASE}/balances`)
            ]);
            const uData = await uRes.json();
            const eData = await eRes.json();
            const bData = await bRes.json();
            setUsers(Array.isArray(uData) ? uData : []);
            setExpenses(Array.isArray(eData) ? eData : []);
            setBalances(bData || { transactions: [] });
        } catch (err) {
            console.error("Error fetching data:", err);
            setUsers([]);
            setExpenses([]);
            setBalances({ transactions: [] });
        }
    };

    const addUser = async () => {
        if (!userName) return;
        try {
            await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userName })
            });
            setUserName('');
            await fetchData();
        } catch (err) {
            Swal.fire('Error', 'Failed to add person', 'error');
        }
    };

    const handleAiInput = async () => {
        if (!aiText) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/ai/parse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: aiText })
            });
            const data = await res.json();

            setAiSuggestion({
                ...data,
                timestamp: Date.now()
            });

            setAiText('');

            setTimeout(() => {
                manualFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

            Swal.fire({
                title: 'Form Pre-filled!',
                text: 'AI identified the details. Review the form below.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } catch (err) {
            console.error("AI Error:", err);
            Swal.fire('Parsing Error', 'AI failed to parse. Try manual entry.', 'error');
        }
        setLoading(false);
    };

    const generateInsights = async () => {
        setInsightLoading(true);
        try {
            const res = await fetch(`${API_BASE}/ai/insights`);
            const data = await res.json();
            setInsights(data);
            Swal.fire({
                title: 'Magic Calculated! ✨',
                text: 'Your group insights are ready.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Insights Error:", err);
            Swal.fire('Magic Failed', 'Could not conjure insights right now.', 'error');
        }
        setInsightLoading(false);
    };

    const deleteExpense = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
                await fetchData();
                Swal.fire('Deleted!', 'The expense has been removed.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Failed to delete expense', 'error');
            }
        }
    };

    const showExpenseDetails = (exp) => {
        if (!exp) return;
        const participants = (exp.Participants || []).map(p => p.User?.name || 'Unknown').join(', ');
        const statusText = exp.isPending ? '<span style="color:#f59e0b;font-weight:bold;">PENDING BILL</span>' : `Paid by <b>${exp.Payer?.name || 'Someone'}</b>`;

        Swal.fire({
            title: exp.description || 'Expense Details',
            html: `
        <div style="text-align: left; padding: 1rem; background: rgba(0,0,0,0.05); border-radius: 8px;">
          <p style="font-size: 1.5rem; margin-top: 0; color: #10b981;"><b>₹${exp.amount}</b></p>
          <p>${statusText}</p>
          <hr style="opacity: 0.1; margin: 1rem 0;">
          <p><b>Included People:</b><br/> ${participants || 'N/A'}</p>
          <p style="opacity: 0.6; font-size: 0.8rem; margin-top: 1rem;">Date: ${new Date(exp.date).toLocaleString()}</p>
        </div>
      `,
            showCancelButton: true,
            cancelButtonText: 'Close',
            confirmButtonText: 'Delete Expense',
            confirmButtonColor: '#ef4444'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteExpense(exp.id);
            }
        });
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--secondary))', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.05em' }}>
                        Smart Dashboard
                    </h1>
                    <p style={{ opacity: 0.7 }}>Track, split, and settle with AI magic</p>
                </div>
                <button className="btn btn-outline" onClick={() => navigate('/')}>Back Home</button>
            </header>

            {/* Magic Insights Section */}
            <section className="glass-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>✨</span> AI Magic Insights
                    </h2>
                    <button className="btn" onClick={generateInsights} disabled={insightLoading} style={{ padding: '0.5rem 1rem' }}>
                        {insightLoading ? 'Conjuring...' : 'Generate Magic'}
                    </button>
                </div>

                {insights ? (
                    <div className="magic-insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', animation: 'fadeIn 1s ease' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.25rem' }}>Spend Mood</div>
                            <div style={{ fontWeight: 600 }}>{insights.summary}</div>
                        </div>
                        <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.25rem' }}>Group Harmony</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ height: '8px', flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${insights.harmonyScore}%`, background: 'linear-gradient(to right, #6366f1, #a855f7)' }}></div>
                                </div>
                                <span style={{ fontWeight: 800 }}>{insights.harmonyScore}%</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.75rem' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.25rem' }}>Next Payer Meta</div>
                            <div style={{ fontWeight: 600, color: '#10b981' }}>{insights.nextPayerSuggestion || 'Anyone!'}</div>
                        </div>
                        <div style={{ gridColumn: 'span 3', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', gap: '2rem' }}>
                            <div>
                                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Praise: </span>
                                <span style={{ fontStyle: 'italic' }}>"{insights.praise}"</span>
                            </div>
                            <div>
                                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Nudge: </span>
                                <span style={{ fontStyle: 'italic' }}>"{insights.nudge}"</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Click to see spending patterns, harmony scores, and magical advice!</p>
                )}
            </section>

            <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <section className="glass-card">
                        <h3>Add Person</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="input"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Name"
                            />
                            <button className="btn" onClick={addUser}>Add</button>
                        </div>
                    </section>

                    <section className="glass-card">
                        <h3>People</h3>
                        {users.length === 0 ? <p style={{ opacity: 0.5 }}>No people added yet.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {users.map(u => (
                                    <div key={u.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', fontSize: '0.95rem' }}>
                                        {u.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </aside>

                <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <section className="glass-card">
                        <h3>AI Quick Add</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <textarea
                                className="input"
                                style={{ minHeight: '100px', resize: 'vertical', fontSize: '1rem' }}
                                value={aiText}
                                onChange={(e) => setAiText(e.target.value)}
                                placeholder='e.g., "I paid 1200 for dinner split between me, Rahul, and Neha"'
                            />
                            <button className="btn" onClick={handleAiInput} disabled={loading}>
                                {loading ? 'Analyzing Content...' : 'Identify Expense Details'}
                            </button>
                        </div>
                    </section>

                    <div ref={manualFormRef}>
                        <ManualExpenseForm
                            users={users}
                            prefillData={aiSuggestion}
                            onAdd={async (data) => {
                                setLoading(true);
                                try {
                                    const resp = await fetch(`${API_BASE}/expenses`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    if (!resp.ok) {
                                        const errData = await resp.json();
                                        throw new Error(errData.error || 'Save failed');
                                    }
                                    await fetchData();
                                    setAiSuggestion(null);
                                    Swal.fire({
                                        title: 'Success!',
                                        text: 'Expense recorded successfully',
                                        icon: 'success',
                                        toast: true,
                                        position: 'top-end',
                                        showConfirmButton: false,
                                        timer: 3000
                                    });
                                } catch (err) {
                                    console.error("Save Error:", err);
                                    Swal.fire('Error', `Failed to save expense: ${err.message}`, 'error');
                                }
                                setLoading(false);
                            }}
                        />
                    </div>

                    <div className="dashboard-sub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <section className="glass-card">
                            <h3>Settlements</h3>
                            {(balances.transactions || []).length === 0 ? <p style={{ opacity: 0.6 }}>Everything settled! No debts found.</p> :
                                balances.transactions.map((t, i) => (
                                    <div key={i} style={{ marginBottom: '1rem', padding: '1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', borderLeft: '4px solid #10b981' }}>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}><strong>{t.from}</strong> owes <strong>{t.to}</strong></div>
                                        <div style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: 800, marginTop: '0.25rem' }}>₹{t.amount}</div>
                                    </div>
                                ))
                            }
                        </section>

                        <section className="glass-card">
                            <h3>Recent History</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {expenses.length === 0 ? <p style={{ opacity: 0.5 }}>No expenses recorded yet.</p> : expenses.map(exp => (
                                    <div key={exp.id} onClick={() => showExpenseDetails(exp)} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: exp.isPending ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.03)',
                                        borderLeft: exp.isPending ? '4px solid #f59e0b' : '4px solid transparent',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        position: 'relative'
                                    }} className="history-item">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                                                {exp.description || 'Expense'}
                                                {exp.isPending && <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: '#000', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', verticalAlign: 'middle', fontWeight: 800 }}>PENDING</span>}
                                            </div>
                                            <small style={{ opacity: 0.5 }}>{exp.isPending ? 'Unpaid shared bill' : `by ${exp.Payer?.name || 'Someone'}`}</small>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{exp.amount}</div>
                                            <button
                                                className="btn"
                                                style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.75rem' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteExpense(exp.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            <footer style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.4, borderTop: '1px solid rgba(255,255,255,0.1)', padding: '2rem' }}>
                <p style={{ fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} Kadambari. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Dashboard;
