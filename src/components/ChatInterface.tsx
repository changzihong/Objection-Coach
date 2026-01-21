import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Download, Trash2, Cpu, User, Play, Info, Lightbulb } from 'lucide-react'

interface Message {
    role: 'assistant' | 'user' | 'system';
    content: string;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (value: string) => void;
    onClearChat: () => void;
    onDownloadPDF: () => void;
    isTyping: boolean;
    mode: 'coach' | 'simulation';
    onToggleMode?: (mode: 'coach' | 'simulation') => void;
    suggestions?: string[];
}

export default function ChatInterface({
    messages,
    onSendMessage,
    onClearChat,
    onDownloadPDF,
    isTyping,
    mode,
    onToggleMode,
    suggestions = []
}: ChatInterfaceProps) {
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const handleSuggestionClick = (suggestion: string) => {
        onSendMessage(suggestion)
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || isTyping) return
        onSendMessage(inputValue)
        setInputValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <div className={`chat-interface-v2 ${mode === 'simulation' ? 'simulation-active' : ''}`}>
            <div className="chat-toolbar">
                <div className="toolbar-info">
                    {mode === 'simulation' ? (
                        <>
                            <Play size={16} className="text-gold" />
                            <span className="mode-badge simulation">SCENARIO SIMULATION ACTIVE</span>
                        </>
                    ) : (
                        <>
                            <Cpu size={16} className="text-gold" />
                            <span className="mode-badge coach">AI STRATEGIST ACTIVE</span>
                        </>
                    )}
                </div>

                <div className="toolbar-center-actions">
                    {onToggleMode && (
                        <div className="mini-mode-toggle">
                            <button
                                className={`mini-btn ${mode === 'coach' ? 'active' : ''}`}
                                onClick={() => onToggleMode('coach')}
                                title="Get strategic advice"
                            >
                                <Info size={12} /> Coach
                            </button>
                            <button
                                className={`mini-btn ${mode === 'simulation' ? 'active' : ''}`}
                                onClick={() => onToggleMode('simulation')}
                                title="Practice with AI persona"
                            >
                                <Play size={12} /> Simulation
                            </button>
                        </div>
                    )}
                </div>

                <div className="toolbar-actions">
                    <button onClick={onClearChat} className="toolbar-btn clear" title="Clear History">
                        <Trash2 size={14} /> CLEAR
                    </button>
                </div>
            </div>

            {mode === 'simulation' && (
                <div className="simulation-banner">
                    <p>The AI is now acting as your counterpart. Practice your pitch or negotiation!</p>
                </div>
            )}

            <div className="messages-viewport">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble-row ${msg.role}`}>
                        <div className="bubble-avatar">
                            {msg.role === 'assistant' ? (
                                mode === 'simulation' ? <User size={18} /> : <Cpu size={18} />
                            ) : (
                                <User size={18} />
                            )}
                        </div>
                        <div className="bubble-content-wrapper">
                            <div className="bubble-sender-name">
                                {msg.role === 'assistant'
                                    ? (mode === 'simulation' ? 'Simulation Persona' : 'Objection Coach')
                                    : 'You'}
                            </div>
                            <div className="bubble-text">
                                {msg.role === 'assistant' || msg.role === 'system' ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="chat-bubble-row assistant typing">
                        <div className="bubble-avatar">
                            {mode === 'simulation' ? <User size={18} /> : <Cpu size={18} />}
                        </div>
                        <div className="bubble-content-wrapper">
                            <div className="bubble-sender-name">
                                {mode === 'simulation' ? 'Persona is typing...' : 'Coach is reviewing...'}
                            </div>
                            <div className="typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {messages.length === 0 && suggestions.length > 0 && (
                <div className="suggestions-container">
                    <div className="suggestions-header">
                        <Lightbulb size={16} />
                        <span>Try asking about...</span>
                    </div>
                    <div className="suggestions-grid">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                className="suggestion-btn"
                                onClick={() => handleSuggestionClick(suggestion)}
                                type="button"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="chat-input-bar">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={mode === 'simulation' ? "Try your rebuttal here..." : "Ask the coach a question..."}
                    rows={1}
                />
                <button type="submit" disabled={!inputValue.trim() || isTyping}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}
