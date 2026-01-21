import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    Target,
    ArrowUpRight,
    Users,
    Search,
    Plus,
    FileText,
    MessageCircle,
    ChevronRight,
    X
} from 'lucide-react'
import '../styles/layout.css'
import '../styles/dashboard.css'

export default function HomeDashboard() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        thisWeek: 0,
        purchaseCount: 0,
        sellCount: 0
    })
    const [objections, setObjections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    const filterType = searchParams.get('type')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) return

            const { data, error } = await supabase
                .from('objections')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setObjections(data)

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
            console.error('Error fetching data:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const clearFilter = () => {
        setSearchParams({})
    }

    const filteredObjections = objections.filter(obj => {
        const matchesSearch = obj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            obj.type?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = !filterType || obj.type === filterType
        return matchesSearch && matchesType
    })

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
                            <p className="subtitle">Real-time metrics and comprehensive objection library.</p>
                        </div>
                        
                    </header>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Loading dashboard...</span>
                        </div>
                    ) : (
                        <>
                            <div className="metrics-layout">
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
                                        <button className="category-btn" onClick={() => setSearchParams({ type: 'purchase' })}>FILTER PURCHASE</button>
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
                                        <button className="category-btn" onClick={() => setSearchParams({ type: 'sell' })}>FILTER SELL</button>
                                    </div>
                                </div>
                            </div>
                          
                            <div className="header-actions">
                            {filterType && (
                                <button className="clear-filter-btn" onClick={clearFilter}>
                                    <X size={14} /> Clear Filter
                                </button>
                            )}
                            <div className="search-bar glass">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search objections..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Link to="/objection/new" className="premium-btn new-project-btn">
                                <Plus size={16} /> NEW OBJECTION
                            </Link>
                        </div>
                            {/* Objections Library */}
                            {filteredObjections.length === 0 ? (
                                <div className="empty-state glass">
                                    <div className="empty-icon"><FileText size={48} /></div>
                                    <h3 className="luxury-text">{searchQuery || filterType ? 'No Results Found' : 'No Projects Found'}</h3>
                                    <p>
                                        {searchQuery || filterType
                                            ? `We couldn't find any objections matching your criteria.`
                                            : 'Launch your first objection strategy to unlock professional AI coaching and strategy guidance.'}
                                    </p>
                                    {!searchQuery && !filterType && (
                                        <Link to="/objection/new" className="premium-btn">
                                            START YOUR OBJECTION
                                        </Link>
                                    )}
                                    {(searchQuery || filterType) && (
                                        <button className="premium-btn" onClick={() => { setSearchQuery(''); clearFilter(); }}>
                                            SHOW ALL RECORDS
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="objection-grid">
                                    {filteredObjections.map(objection => (
                                        <Link
                                            key={objection.id}
                                            to={`/objection/${objection.id}`}
                                            className={`objection-card glass ${objection.type}`}
                                        >
                                            <div className="card-header">
                                                <span className={`card-type ${objection.type}`}>
                                                    {objection.type === 'purchase' ? 'Sales Strategy' : 'Negotiation'}
                                                </span>
                                                <div className={`status-badge ${objection.status || 'in_progress'}`}>
                                                    {objection.status === 'completed' ? (
                                                        <><CheckCircle2 size={10} /> COMPLETED</>
                                                    ) : (
                                                        <><Clock size={10} /> IN PROGRESS</>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="card-title">{objection.name}</h3>

                                            <div className="card-info">
                                                <div className="info-item">
                                                    <Clock size={12} />
                                                    <span>{new Date(objection.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="info-item">
                                                    <MessageCircle size={12} />
                                                    <span>{objection.chat_history?.length || 0} messages</span>
                                                </div>
                                            </div>

                                            <div className="card-footer-hover">
                                                <span>Open Objection</span>
                                                <ChevronRight size={14} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
