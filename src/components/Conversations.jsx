import { useState } from 'react'
import {
  Send,
  Paperclip,
  Smile,
  Search,
  Clock,
  CheckCheck,
  Sparkles,
} from 'lucide-react'

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: 'Иван Петров',
    lastMessage: 'Спасибо за помощь!',
    time: '10:30',
    unread: 2,
    platform: 'whatsapp',
    status: 'online',
  },
  {
    id: 2,
    name: 'Мария Сидорова',
    lastMessage: 'Пришлите, пожалуйста, документы',
    time: '9:45',
    unread: 0,
    platform: 'telegram',
    status: 'offline',
  },
  {
    id: 3,
    name: 'Алексей Смирнов',
    lastMessage: 'Отлично, буду ждать',
    time: 'Вчера',
    unread: 5,
    platform: 'whatsapp',
    status: 'online',
  },
  {
    id: 4,
    name: 'Ольга Ким',
    lastMessage: 'Договорились, до связи',
    time: 'Вчера',
    unread: 0,
    platform: 'telegram',
    status: 'offline',
  },
  {
    id: 5,
    name: 'Поддержка',
    lastMessage: 'Ваш запрос закрыт',
    time: '21 мар.',
    unread: 1,
    platform: 'whatsapp',
    status: 'online',
  },
]

const MOCK_MESSAGES = [
  { id: 1, text: 'Здравствуйте! Нужна помощь с заказом', sender: 'customer', time: '10:20', status: 'read' },
  { id: 2, text: 'Добрый день! Напишите номер заказа.', sender: 'agent', time: '10:21', status: 'read' },
  { id: 3, text: '№ 12345', sender: 'customer', time: '10:22', status: 'read' },
  { id: 4, text: 'Сейчас проверю, минуту.', sender: 'agent', time: '10:23', status: 'read' },
  { id: 5, text: 'Заказ в обработке, отправка завтра.', sender: 'agent', time: '10:25', status: 'read' },
  { id: 6, text: 'Спасибо за помощь!', sender: 'customer', time: '10:30', status: 'read' },
]

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Conversations() {
  const [selected, setSelected] = useState(MOCK_CONVERSATIONS[0])
  const [messageInput, setMessageInput] = useState('')
  const [glass, setGlass] = useState(false)

  const unreadTotal = MOCK_CONVERSATIONS.filter((c) => c.unread > 0).length

  return (
    <div className="dc-fe-page" style={{ paddingTop: 0 }}>
      <div className={`dc-conv-root ${glass ? 'glass' : ''}`}>
        {glass && (
          <div className="dc-conv-glass-deco" aria-hidden>
            <span />
            <span />
          </div>
        )}

        <div className="dc-conv-inner">
          <div className="dc-conv-list">
            <div className="dc-conv-list-head">
              <div className="dc-conv-list-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 className="dc-conv-list-title">Чаты</h2>
                  <span
                    className="dc-badge"
                    style={{
                      background: glass
                        ? 'linear-gradient(90deg, #bfdbfe, #e9d5ff)'
                        : 'linear-gradient(90deg, #3b82f6, #9333ea)',
                      color: glass ? '#1e3a8a' : '#fff',
                      border: 'none',
                    }}
                  >
                    {unreadTotal} нов.
                  </span>
                </div>
                <button
                  type="button"
                  className="dc-sparkle-btn"
                  title="Стеклянный режим"
                  onClick={() => setGlass(!glass)}
                >
                  <Sparkles size={16} />
                </button>
              </div>
              <div className="dc-conv-search-wrap">
                <Search className="dc-conv-search-icon" />
                <input
                  type="search"
                  className="dc-conv-search"
                  placeholder="Поиск по сообщениям"
                  aria-label="Поиск"
                />
              </div>
            </div>

            <div className="dc-conv-scroll">
              {MOCK_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  className={`dc-conv-item ${selected.id === conv.id ? 'active' : ''}`}
                  onClick={() => setSelected(conv)}
                >
                  <div className="dc-conv-item-inner">
                    <div className="dc-conv-avatar">
                      {initials(conv.name)}
                      <span
                        className={`dc-conv-dot ${conv.platform === 'whatsapp' ? 'wa' : 'tg'}`}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: '#0f172a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {conv.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', flexShrink: 0 }}>
                          {conv.time}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            color: '#4b5563',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {conv.lastMessage}
                        </span>
                        {conv.unread > 0 && (
                          <span
                            style={{
                              minWidth: '1.25rem',
                              height: '1.25rem',
                              borderRadius: '9999px',
                              background: 'linear-gradient(90deg, #3b82f6, #9333ea)',
                              color: '#fff',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 0.35rem',
                            }}
                          >
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="dc-conv-main">
            <div className="dc-conv-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="dc-conv-avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.75rem' }}>
                  {initials(selected.name)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                    {selected.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#2563eb' }}>
                    {selected.status === 'online' ? 'В сети' : 'Не в сети'}
                  </p>
                </div>
              </div>
            </div>

            <div className="dc-conv-messages">
              <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
                {MOCK_MESSAGES.map((msg) => (
                  <div
                    key={msg.id}
                    className={`dc-conv-msg-row ${msg.sender === 'agent' ? 'agent' : ''}`}
                  >
                    <div className={`dc-conv-bubble ${msg.sender === 'agent' ? 'agent' : 'customer'}`}>
                      <p style={{ margin: 0 }}>{msg.text}</p>
                      <div className="dc-conv-bubble-meta">
                        <Clock size={12} />
                        <span>{msg.time}</span>
                        {msg.sender === 'agent' && <CheckCheck size={14} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dc-conv-input-bar">
              <div className="dc-conv-input-row">
                <button type="button" className="dc-conv-icon-btn" aria-label="Вложение">
                  <Paperclip size={20} />
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    className="dc-conv-input"
                    placeholder="Написать сообщение…"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        setMessageInput('')
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="dc-conv-icon-btn"
                    style={{ position: 'absolute', right: '0.15rem', top: '50%', transform: 'translateY(-50%)' }}
                    aria-label="Эмодзи"
                  >
                    <Smile size={18} />
                  </button>
                </div>
                <button type="button" className="dc-conv-send" aria-label="Отправить">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="dc-muted-xs" style={{ marginTop: '0.75rem' }}>
        Демо-интерфейс: диалоги и сообщения примерные, интеграция с API чата подключается отдельно.
      </p>
    </div>
  )
}

export default Conversations
