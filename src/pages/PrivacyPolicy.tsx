import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import '../styles/auth.css'

export default function PrivacyPolicy() {
    return (
        <div className="auth-container" style={{ alignItems: 'flex-start', padding: '5rem 2rem' }}>
            <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem', borderRadius: '12px' }}>
                <Link to="/signup" className="back-link" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
                    <ArrowLeft size={14} style={{ marginRight: '8px' }} /> BACK TO SIGNUP
                </Link>

                <h1 className="luxury-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Privacy Policy</h1>

                <div className="policy-content" style={{ color: 'var(--text-secondary)', lineHeight: '1.8', textAlign: 'left' }}>
                    <p style={{ marginBottom: '1.5rem' }}>Last updated: January 5, 2026</p>

                    <h3 style={{ color: 'var(--gold)', marginBottom: '1rem', marginTop: '2rem' }}>1. Information We Collect</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                        We collect information you provide directly to us, such as when you create an account, upload documents for analysis, or interact with our AI coach. This may include your name, email address, password, and any data contained within the files you upload.
                    </p>

                    <h3 style={{ color: 'var(--gold)', marginBottom: '1rem', marginTop: '2rem' }}>2. How We Use Your Information</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                        We use the information we collect to:
                        <ul>
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Process and analyze your sales objections and documents.</li>
                            <li>Communicate with you about your account and strategic guidance.</li>
                            <li>Protect the security and integrity of our platform.</li>
                        </ul>
                    </p>

                    <h3 style={{ color: 'var(--gold)', marginBottom: '1rem', marginTop: '2rem' }}>3. Data Storage and Security</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                        We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. Your data is stored securely using industry-standard encryption and security protocols provided by our infrastructure partners.
                    </p>

                    <h3 style={{ color: 'var(--gold)', marginBottom: '1rem', marginTop: '2rem' }}>4. AI and Document Analysis</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                        The documents you upload and the messages you send to the AI coach are processed to provide specific strategic advice. While we use these inputs to generate responses, your specific data is not shared with third parties for their own marketing purposes.
                    </p>

                    <h3 style={{ color: 'var(--gold)', marginBottom: '1rem', marginTop: '2rem' }}>5. Contact Us</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                        If you have any questions about this Privacy Policy, please contact us at privacy@objectioncoach.com.
                    </p>
                </div>
            </div>
        </div>
    )
}
