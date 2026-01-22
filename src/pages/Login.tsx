import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import '../styles/auth.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <h1 className="auth-title luxury-text">Welcome Back</h1>
                <p className="auth-subtitle">Continue your professional coaching journey.</p>

                {error && (
                    <div className="auth-message error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="auth-form">
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

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label" htmlFor="password">Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.6rem', textDecoration: 'none' }}>Forgot Password?</Link>
                        </div>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="premium-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
                    </button>
                </form>

                <div className="auth-footer">
                    New to Objection Coach?
                    <Link to="/signup" className="auth-link">Create Account</Link>
                </div>
            </div>
        </div>
    )
}
