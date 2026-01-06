import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import kadoshLogo from './components/image/kadosh_ai_logo.jpeg';

export default function Landing() {
    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="landing-logo">OBJECTION COACH</div>
                <Link to="/login" className="premium-btn">Sign In</Link>
            </nav>

            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Navigate Every Objection with Precision.</h1>
                    <p className="hero-subtitle">
                        An intelligent advisor that analyzes your product, evaluates market competition, and crafts the perfect strategy to overcome any objection barrier.
                    </p>
                    <div className="hero-cta">
                        <Link to="/signup" className="premium-btn" style={{ padding: '1rem 3rem' }}>Get Started</Link>
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <div className="stat-item">
                    <span className="stat-value">Instant</span>
                    <span className="stat-label">Objection Review</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">Market</span>
                    <span className="stat-label">Comparison</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">Expert</span>
                    <span className="stat-label">Strategy</span>
                </div>
            </section>

            <section className="features-section">
                <div className="feature-card glass">
                    <div className="feature-icon">✧</div>
                    <h3 className="feature-title">Competitive Strategy</h3>
                    <p className="feature-desc">
                        Compare your offerings with industry benchmarks. Our AI identifies competitive advantages and helps you justify your value proposition.
                    </p>
                </div>
                <div className="feature-card glass">
                    <div className="feature-icon">✧</div>
                    <h3 className="feature-title">Strategic Insights</h3>
                    <p className="feature-desc">
                        Get step-by-step guidance on how to handle complex objections, with specific rebuttals tailored to your unique product details.
                    </p>
                </div>
                <div className="feature-card glass">
                    <div className="feature-icon">✧</div>
                    <h3 className="feature-title">Document Intelligence</h3>
                    <p className="feature-desc">
                        Upload product specs, whitepapers, or pricing sheets. The coach uses your specific documentation to provide hyper-relevant advice.
                    </p>
                </div>
            </section>

            <footer style={{ padding: '4rem', textAlign: 'center', borderTop: '1px solid var(--slate-700)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                &copy; 2026 OBJECTION COACH || KADOSH AI
            </footer>
        </div>
    );
}
