import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { KeyRound, ShieldCheck, Mail, AlertCircle, Save, Lock } from 'lucide-react'
import '../styles/layout.css'
import '../styles/auth.css'

export default function Settings() {
    const [user, setUser] = useState<any>(null)
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })
    }, [])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' })
            return
        }

        if (oldPassword === newPassword) {
            setMessage({ type: 'error', text: 'New password cannot be the same as the old password.' })
            return
        }

        setLoading(true)

        try {
            // Step 1: Verify Old Password by trying to sign in
            // Supabase doesn't have a direct "verifyCurrentPassword" method for security reasons,
            // so we re-authenticate with the old password to confirm it's correct.
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: oldPassword,
            })

            if (signInError) {
                setMessage({ type: 'error', text: 'Incorrect current password. Authentication failed.' })
                setLoading(false)
                return
            }

            // Step 2: Update to New Password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                setMessage({ type: 'error', text: updateError.message })
            } else {
                setMessage({ type: 'success', text: 'Password updated successfully.' })
                setOldPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="detail-container" style={{ maxWidth: '700px' }}>
                    <div className="detail-header">
                        <div>
                            <h1 className="luxury-text" style={{ fontSize: '2.5rem' }}>Account Settings</h1>
                            <p className="subtitle" style={{ marginTop: '0.5rem' }}>Manage your professional profile and security.</p>
                        </div>
                    </div>

                    <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Profile Info Section */}
                        <div className="glass" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <Mail size={20} className="text-gold" />
                                <h3 className="luxury-text" style={{ margin: 0 }}>Login Identity</h3>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="text"
                                    value={user?.email || ''}
                                    disabled
                                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Your email address is managed via project authentication.
                                </p>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="glass" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <ShieldCheck size={20} className="text-gold" />
                                <h3 className="luxury-text" style={{ margin: 0 }}>Security & Credentials</h3>
                            </div>

                            {message && (
                                <div className={`auth-message ${message.type}`} style={{ marginBottom: '2rem' }}>
                                    {message.type === 'error' ? <AlertCircle size={16} /> : <Save size={16} />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            <form onSubmit={handleUpdatePassword} className="auth-form" style={{ padding: 0, gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Lock size={12} style={{ marginRight: '4px' }} /> Current Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter current password to verify"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }}></div>

                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Min 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="premium-btn" disabled={loading} style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                                    <KeyRound size={16} style={{ marginRight: '8px' }} />
                                    {loading ? 'VERIFYING...' : 'UPDATE PASSWORD'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
