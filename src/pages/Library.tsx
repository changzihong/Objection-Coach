import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Plus, BookOpen, Clock, FileText, ChevronRight, Search, CheckCircle2, MessageCircle, X } from 'lucide-react'
import '../styles/layout.css'
import '../styles/dashboard.css'

export default function Library() {
    const [objections, setObjections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchParams, setSearchParams] = useSearchParams()

    const filterType = searchParams.get('type')

    useEffect(() => {
        fetchObjections()
    }, [])

    const fetchObjections = async () => {
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
            setObjections(data || [])
        } catch (error: any) {
            console.error('Error fetching objections:', error.message)
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
                                <BookOpen size={12} /> {filterType ? `${filterType.toUpperCase()} COACH LIBRARY` : 'STRATEGIC LIBRARY'}
                            </div>
                            <h1 className="luxury-text" style={{ fontSize: '2.8rem', marginBottom: '0.8rem' }}>
                                {filterType ? (filterType === 'purchase' ? 'Purchase Coach' : 'Sell Coach') : 'Strategic Library'}
                            </h1>
                            <p className="subtitle">
                                {filterType
                                    ? `Showing all objection records for your ${filterType} strategy.`
                                    : 'Comprehensive objection and expert coaching records.'}
                            </p>
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
                                    placeholder="Search library..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Link to="/objection/new" className="premium-btn new-project-btn">
                                <Plus size={16} /> NEW OBJECTION
                            </Link>
                        </div>
                    </header>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Reviewing your library...</span>
                        </div>
                    ) : filteredObjections.length === 0 ? (
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
                </div>
            </main>
        </div>
    )
}
