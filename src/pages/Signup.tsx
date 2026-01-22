import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react'
import '../styles/auth.css'

export default function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [agreedToPolicy, setAgreedToPolicy] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccessMessage(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        if (!agreedToPolicy) {
            setError('You must agree to the Privacy Policy to continue.')
            return
        }

        setLoading(true)

        try {
            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/login'
                }
            })

            if (signupError) {
                if (signupError.message.includes('already registered') || signupError.status === 422) {
                    setError('This email is already associated with an account. Please sign in or use a different email.')
                } else {
                    setError(signupError.message)
                }
                setLoading(false)
                return
            }

            // Supabase "Prevent Email Enumeration" logic:
            // If the user already exists, data.user will be returned but data.user.identities will be an empty array [].
            // If it's a new user, identities will contain the provider info.
            const identities = data?.user?.identities;
            const userAlreadyExists = identities !== undefined && Array.isArray(identities) && identities.length === 0;

            if (userAlreadyExists) {
                setError('This email is already associated with an account. Please sign in or use another email.');
                setLoading(false);
                return;
            }

            if (data?.user && data?.session === null) {
                setSuccessMessage('Registration successful! Please check your email for a verification link.')
                setLoading(false)
            } else if (data?.user && data?.session) {
                navigate('/dashboard')
            }
        } catch (err: any) {
            setError('An unexpected error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <h1 className="auth-title luxury-text">Create Account</h1>
                <p className="auth-subtitle">Join the professional strategic coaching platform.</p>

                {error && (
                    <div className="auth-message error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="auth-message success">
                        <Check size={16} />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label" htmlFor="email">Email</label>
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
                        <label className="form-label" htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
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

                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="policy-checkbox">
                        <input
                            type="checkbox"
                            id="policy-tick"
                            checked={agreedToPolicy}
                            onChange={(e) => setAgreedToPolicy(e.target.checked)}
                        />
                        <label htmlFor="policy-tick">
                            I agree to the <Link to="/privacy" className="auth-link-inline">Privacy Policy</Link> and <Link to="/terms" className="auth-link-inline">Terms of Service</Link>.
                        </label>
                    </div>

                    <button type="submit" className="premium-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'INITIATING...' : 'SIGN UP NOW'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Sign In</Link>
                </div>
            </div>
        </div>
    )
}
