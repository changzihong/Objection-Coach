import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    Trophy,
    Target,
    BarChart3,
    ArrowUpRight,
    Users
} from 'lucide-react'
import '../styles/layout.css'
import '../styles/dashboard.css'

export default function HomeDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        thisWeek: 0,
        purchaseCount: 0,
        sellCount: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) return

            const { data, error } = await supabase
                .from('objections')
                .select('*')
                .eq('user_id', session.user.id)

            if (error) throw error

            if (data) {
                const now = new Date()
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

                const completed = data.filter(obj => obj.status === 'completed')
                const weeklyCompleted = completed.filter(obj => new Date(obj.created_at) >= startOfWeek)
                const purchase = data.filter(obj => obj.type === 'purchase')
                const sell = data.filter(obj => obj.type === 'sell')

                setStats({
                    total: data.length,
                    completed: completed.length,
                    thisWeek: weeklyCompleted.length,
                    purchaseCount: purchase.length,
                    sellCount: sell.length
                })
            }
        } catch (error: any) {
            console.error('Error fetching stats:', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <div>
                            <div className="header-badge">
                                <TrendingUp size={12} /> PERFORMANCE OVERVIEW
                            </div>
                            <h1 className="luxury-text" style={{ fontSize: '2.8rem', marginBottom: '0.8rem' }}>Coach Dashboard</h1>
                            <p className="subtitle">Real-time metrics of your strategic professional growth.</p>
                        </div>
                        <Link to="/objection/new" className="premium-btn new-project-btn">
                            <ArrowUpRight size={16} /> QUICK START
                        </Link>
                    </header>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Calculating metrics...</span>
                        </div>
                    ) : (
                        <div className="metrics-layout">
                            {/* Main Progress Hero */}
                            <div className="hero-metric-card glass">
                                <div className="metric-content">
                                    <div className="metric-header">
                                        <Trophy className="metric-icon gold" />
                                        <span>WEEKLY PROGRESS</span>
                                    </div>
                                    <h2 className="metric-value">{stats.thisWeek}/10</h2>
                                    <p className="metric-desc">Objections completed this week</p>
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${Math.min((stats.thisWeek / 10) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-label">{Math.min((stats.thisWeek / 10) * 100, 100).toFixed(0)}% of target achievement</span>
                                </div>
                                <div className="metric-visual">
                                    <BarChart3 size={120} opacity={0.1} />
                                </div>
                            </div>

                            {/* Stat Grid */}
                            <div className="stats-grid-small">
                                <div className="mini-stat-card glass">
                                    <div className="mini-stat-header">
                                        <Target size={16} />
                                        <span>TOTAL CASES</span>
                                    </div>
                                    <div className="mini-stat-value">{stats.total}</div>
                                </div>
                                <div className="mini-stat-card glass">
                                    <div className="mini-stat-header">
                                        <CheckCircle2 size={16} className="text-green" />
                                        <span>COMPLETED</span>
                                    </div>
                                    <div className="mini-stat-value">{stats.completed}</div>
                                </div>
                                <div className="mini-stat-card glass">
                                    <div className="mini-stat-header">
                                        <Clock size={16} className="text-orange" />
                                        <span>IN PROGRESS</span>
                                    </div>
                                    <div className="mini-stat-value">{stats.total - stats.completed}</div>
                                </div>
                            </div>

                            {/* Category Performance */}
                            <div className="performance-row">
                                <div className="category-performance-card glass purchase">
                                    <div className="category-header">
                                        <div className="category-icon-wrapper">
                                            <Users size={20} />
                                        </div>
                                        <div className="category-info">
                                            <h3>Purchase Coach</h3>
                                            <p>{stats.purchaseCount} Objection records</p>
                                        </div>
                                    </div>
                                    <div className="category-track">
                                        <div className="track-segment" style={{ width: '100%' }}></div>
                                    </div>
                                    <button className="category-btn" onClick={() => navigate('/library?type=purchase')}>OPEN PURCHASE LIBRARY</button>
                                </div>

                                <div className="category-performance-card glass sell">
                                    <div className="category-header">
                                        <div className="category-icon-wrapper">
                                            <Target size={20} />
                                        </div>
                                        <div className="category-info">
                                            <h3>Sell Coach</h3>
                                            <p>{stats.sellCount} Negotiation records</p>
                                        </div>
                                    </div>
                                    <div className="category-track">
                                        <div className="track-segment" style={{ width: '100%' }}></div>
                                    </div>
                                    <button className="category-btn" onClick={() => navigate('/library?type=sell')}>OPEN SELL LIBRARY</button>
                                </div>
                            </div>

                            <div className="recent-activity-hint">
                                <Link to="/library" className="glass-link">
                                    Continue your latest objection strategy in the Strategic Library <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
