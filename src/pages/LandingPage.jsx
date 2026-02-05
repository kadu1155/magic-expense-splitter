import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <nav className="nav-simple">
                <div className="logo-text">ExpenseSplitter.ai</div>
                <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Launch App</button>
            </nav>

            <main className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Split Expenses with <br />
                        <span className="text-gradient">Artificial Intelligence</span>
                    </h1>
                    <p className="hero-subtitle">
                        The smartest way to track group spending, calculate settlements, and maintain
                        financial harmony with the magic of AI.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-large" onClick={() => navigate('/dashboard')}>
                            Get Started for Free
                        </button>
                        <button className="btn btn-outline btn-large" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                            Learn how it works
                        </button>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="glass-card magic-box">
                        <div className="sparkle">✨</div>
                        <p>"I paid 1500 for lunch with Rahul and Aditi"</p>
                        <div className="ai-tag">AI Identifying...</div>
                    </div>
                </div>
            </main>

            <section className="features-grid">
                <div className="feature-card glass-card">
                    <div className="feature-icon">🧠</div>
                    <h3>AI Quick Add</h3>
                    <p>Just type a sentence. Our AI identifies people, amounts, and dates automatically.</p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon">⚖️</div>
                    <h3>Smart Settlements</h3>
                    <p>Minimize the number of transactions with our optimized debt-clearing engine.</p>
                </div>
                <div className="feature-card glass-card">
                    <div className="feature-icon">✨</div>
                    <h3>Magic Insights</h3>
                    <p>Get proactive advice and a "Group Harmony Score" to keep everyone smiling.</p>
                </div>
            </section>

            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Kadambari. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
