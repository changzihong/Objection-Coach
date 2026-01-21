import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { LayoutDashboard, PlusSquare, Settings, LogOut, User } from 'lucide-react'

export default function Sidebar() {
    const location = useLocation()
    const [session, setSession] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const isActive = (path: string) => location.pathname === path ? 'active' : ''

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                    OBJECTION COACH
                </Link>
            </div>

            <nav className="nav-links">
                <Link
                    to="/dashboard"
                    className={`nav-item ${isActive('/dashboard')}`}
                >
                    <LayoutDashboard size={18} />
                    <span>DASHBOARD</span>
                </Link>
                <Link
                    to="/objection/new"
                    className={`nav-item ${isActive('/objection/new')}`}
                >
                    <PlusSquare size={18} />
                    <span>NEW OBJECTION</span>
                </Link>
                <Link
                    to="/settings"
                    className={`nav-item ${isActive('/settings')}`}
                >
                    <Settings size={18} />
                    <span>ACCOUNT SETTINGS</span>
                </Link>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar-mini">
                        <User size={14} />
                    </div>
                    <span className="user-email">{session?.user?.email}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={14} />
                    SIGN OUT
                </button>
            </div>
        </aside>
    )
}
