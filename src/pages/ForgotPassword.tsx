import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AlertCircle, Check, ArrowLeft } from 'lucide-react'
import '../styles/auth.css'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Password reset link has been sent to your email.' })
        }
        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <Link to="/login" className="back-link" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
                    <ArrowLeft size={14} style={{ marginRight: '8px' }} /> BACK TO LOGIN
                </Link>

                <h1 className="auth-title luxury-text">Reset Password</h1>
                <p className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>

                {message && (
                    <div className={`auth-message ${message.type}`}>
                        {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                        <span>{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleReset} className="auth-form">
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="premium-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'SENDING...' : 'SEND RESET LINK'}
                    </button>
                </form>
            </div>
        </div>
    )
}
