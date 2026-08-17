import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserConversations, subscribeToMessages, sendMessage } from '../data/firebaseApi'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Messages() {
  const { user } = useAuth()
  const { conversationId } = useParams()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const chatContainerRef = useRef(null)
  const unsubRef = useRef(null)

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.uid) return
      try {
        const convs = await getUserConversations(user.uid)
        setConversations(convs)
        // Auto-select conversation from URL param, or fallback to first
        if (conversationId) {
          const match = convs.find(c => c.id === conversationId)
          if (match) {
            setActiveConv(match)
          } else if (convs.length > 0 && !activeConv) {
            setActiveConv(convs[0])
          }
        } else if (convs.length > 0 && !activeConv) {
          setActiveConv(convs[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [user, conversationId])

  useEffect(() => {
    if (!activeConv) return
    if (unsubRef.current) unsubRef.current()

    unsubRef.current = subscribeToMessages(activeConv.id, (msgs) => {
      setMessages(msgs)
    })

    return () => { if (unsubRef.current) unsubRef.current() }
  }, [activeConv])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages.length, activeConv?.id])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv || sending) return
    setSending(true)
    try {
      const msg = await sendMessage(activeConv.id, user.uid, newMessage.trim())
      setMessages(prev => [...prev, msg])
      setNewMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const getOtherUser = (conv) => {
    return conv.participants?.find(p => p.uid !== user?.uid) || { name: 'Unknown', avatar: '' }
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--navbar-height))', overflow: 'hidden' }}>
      {/* Sidebar: Conversations List */}
      <div style={{
        width: 360, flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(17,24,39,0.5)',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Messages</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>💬</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No conversations yet</p>
            </div>
          ) : conversations.map(conv => {
            const other = getOtherUser(conv)
            const isActive = activeConv?.id === conv.id
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #7C3AED' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={other.avatar || `https://ui-avatars.com/api/?name=${other.name}&background=random`}
                    alt={other.name}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 12, height: 12, borderRadius: '50%',
                    background: '#10B981', border: '2px solid var(--bg-primary)',
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{other.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{formatTime(conv.updatedAt)}</span>
                  </div>
                  <p style={{
                    color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {conv.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!activeConv ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ fontSize: 64, marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: '0.5rem' }}>Select a conversation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Choose from your existing conversations to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(17,24,39,0.3)',
            }}>
              <img
                src={getOtherUser(activeConv).avatar || `https://ui-avatars.com/api/?name=${getOtherUser(activeConv).name}&background=random`}
                alt=""
                style={{ width: 40, height: 40, borderRadius: '50%' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{getOtherUser(activeConv).name}</div>
                <div style={{ fontSize: 12, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Online
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {messages.map((msg, i) => {
                const isMine = msg.sender === user?.uid
                return (
                  <div key={msg.id || i} style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine
                        ? 'linear-gradient(135deg, #7C3AED, #6D28D9)'
                        : 'rgba(255,255,255,0.05)',
                      border: isMine ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                    }}>
                      <div>{msg.content}</div>
                      <div style={{
                        fontSize: 10, color: isMine ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)',
                        textAlign: 'right', marginTop: 4,
                        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4,
                      }}>
                        {formatTime(msg.createdAt)}
                        {isMine && <span style={{ fontSize: 12 }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{
              display: 'flex', gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(17,24,39,0.3)',
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="form-input-styled"
                style={{ flex: 1, fontSize: 14, margin: 0 }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="btn btn-primary"
                style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, flexShrink: 0 }}
              >
                {sending ? '...' : 'Send →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
