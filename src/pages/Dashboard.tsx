import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import { Plus, BookOpen, Clock, FileText, ChevronRight, Search, CheckCircle2, MessageCircle } from 'lucide-react'
import '../styles/layout.css'
import '../styles/dashboard.css'

export default function Dashboard() {
    const [objections, setObjections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

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

    const filteredObjections = objections.filter(obj =>
        obj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.type?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="dashboard-container">
                    <header className="dashboard-header">
                        <div>
                            <div className="header-badge">
                                <BookOpen size={12} /> LIBRARY
                            </div>
                            <h1 className="luxury-text" style={{ fontSize: '2.8rem', marginBottom: '0.8rem' }}>Strategic Library</h1>
                            <p className="subtitle">Comprehensive objection strategy and expert coaching records.</p>
                        </div>

                        <div className="header-actions">
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
                    </header>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Analyzing your library...</span>
                        </div>
                    ) : filteredObjections.length === 0 ? (
                        <div className="empty-state glass">
                            <div className="empty-icon"><FileText size={48} /></div>
                            <h3 className="luxury-text">{searchQuery ? 'No Results Found' : 'No Projects Found'}</h3>
                            <p>{searchQuery ? `We couldn't find any objections matching "${searchQuery}".` : 'Launch your first objection strategy to unlock professional AI coaching and strategy guidance.'}</p>
                            {!searchQuery && (
                                <Link to="/objection/new" className="premium-btn">
                                    START YOUR OBJECTION
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="objection-grid">
                            {filteredObjections.map(objection => (
                                <Link
                                    key={objection.id}
                                    to={`/objection/${objection.id}`}
                                    className="objection-card glass"
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
                                        <span>View Details</span>
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
