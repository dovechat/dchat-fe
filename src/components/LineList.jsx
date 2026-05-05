import { useState, useEffect } from 'react'
import { getLines, getChannelAccount, updateLine } from '../api/lines'
import {
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  CheckCircle,
  Package,
  Smartphone,
} from 'lucide-react'

function normalizeAccounts(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.channels)) return raw.channels
  return [raw]
}

function channelLabel(type) {
  switch (type) {
    case 'telegram_bot':
      return 'Telegram Bot'
    case 'telegram_user':
      return 'Telegram User'
    case 'whatsapp_green':
      return 'WhatsApp'
    case 'waba':
      return 'WhatsApp Business'
    case 'vk':
      return 'VK'
    default:
      return type || 'Канал'
  }
}

function uiKind(type) {
  if (type === 'whatsapp_green') return 'whatsapp'
  if (type === 'telegram_bot' || type === 'telegram_user') return 'telegram'
  if (type === 'waba') return 'waba'
  return 'other'
}

function formatRelative(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин. назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч. назад`
  const days = Math.floor(h / 24)
  if (days === 1) return 'вчера'
  return `${days} дн. назад`
}

function PlatformIcon({ kind }) {
  if (kind === 'whatsapp') {
    return (
      <div className="dc-platform-icon-wa">
        <MessageSquare size={16} />
      </div>
    )
  }
  if (kind === 'telegram') {
    return (
      <div className="dc-platform-icon-tg">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.45 3.62-.52.36-.99.53-1.42.52-.47-.01-1.37-.27-2.03-.49-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.03-.74 4.02-1.75 6.7-2.91 8.05-3.47 3.84-1.61 4.64-1.89 5.16-1.9.11 0 .37.03.54.17.14.12.18.27.2.38.01.09.03.32.01.5z" />
        </svg>
      </div>
    )
  }
  if (kind === 'waba') {
    return (
      <div className="dc-platform-icon-waba">
        <Smartphone size={16} />
      </div>
    )
  }
  return (
    <div className="dc-platform-icon-default">
      <Package size={16} />
    </div>
  )
}

function statusBadge(status) {
  if (status === 'connected') {
    return (
      <span className="dc-badge dc-badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <CheckCircle size={12} />
        Подключён
      </span>
    )
  }
  if (status === 'pending') {
    return <span className="dc-badge dc-badge-amber">Ожидание</span>
  }
  return <span className="dc-badge dc-badge-red">Отключён</span>
}

function buildPlatforms(line, rawAccounts) {
  const accs = normalizeAccounts(rawAccounts).filter(Boolean)
  const phone = line.connection_state?.phone
  if (!accs.length) {
    const st =
      line.connection_status === 'connected'
        ? 'connected'
        : line.connection_status === 'connecting'
          ? 'pending'
          : 'disconnected'
    return [
      {
        kind: uiKind(line.channel_type),
        label: channelLabel(line.channel_type),
        identifier: phone || line.name || '—',
        status: st,
        messages: 0,
      },
    ]
  }
  return accs.map((acc) => {
    const ct = acc.channel_type || line.channel_type
    const st = acc.connection_status || line.connection_status || 'disconnected'
    const mapped =
      st === 'connected' ? 'connected' : st === 'connecting' || st === 'pending' ? 'pending' : 'disconnected'
    return {
      kind: uiKind(ct),
      label: channelLabel(ct),
      identifier: acc.phone || acc.external_id || acc.identifier || phone || ct,
      status: mapped,
      messages: acc.message_count ?? 0,
    }
  })
}

function LineList({ tenantId, companyName, onCreateClick, onLineClick }) {
  const [lines, setLines] = useState([])
  const [accountsByLineId, setAccountsByLineId] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    if (tenantId) {
      loadLines()
    }
  }, [tenantId])

  useEffect(() => {
    if (!tenantId || !lines.length) {
      setAccountsByLineId({})
      return
    }
    let cancelled = false
    ;(async () => {
      const map = {}
      await Promise.all(
        lines.map(async (line) => {
          try {
            const data = await getChannelAccount(tenantId, line.id)
            if (!cancelled) {
              map[line.id] = data
            }
          } catch {
            if (!cancelled) map[line.id] = null
          }
        }),
      )
      if (!cancelled) setAccountsByLineId(map)
    })()
    return () => {
      cancelled = true
    }
  }, [tenantId, lines])

  const loadLines = async () => {
    try {
      setLoading(true)
      const data = await getLines(tenantId)
      setLines(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activeCount = lines.filter((l) => l.status === 'active').length

  const handleToggleEnabled = async (e, line) => {
    e.stopPropagation()
    const next = line.status === 'active' ? 'disabled' : 'active'
    try {
      setTogglingId(line.id)
      await updateLine(tenantId, line.id, { status: next })
      await loadLines()
    } catch (err) {
      setError(err.message)
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="dc-fe-page">
        <p className="dc-muted">Загрузка линий...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dc-fe-page">
        <div className="error">{error}</div>
      </div>
    )
  }

  const companyBadge = companyName || 'Компания'

  return (
    <div className="dc-fe-page dc-fe-stack">
      <div className="dc-fe-header">
        <div>
          <h1 className="dc-fe-title">Линии мессенджеров</h1>
          <p className="dc-fe-subtitle">
            Подключённые каналы и активность по текущей компании
          </p>
        </div>
        <div className="dc-fe-actions">
          <button
            type="button"
            className="dc-btn dc-btn-outline"
            onClick={() =>
              window.alert(
                'Демо-режим: для теста всех каналов используйте покупку линии или обратитесь к администратору.',
              )
            }
          >
            <Sparkles size={18} />
            Демо-линия
          </button>
          <button type="button" className="dc-btn dc-btn-primary" onClick={onCreateClick}>
            <Plus size={18} />
            Добавить линию
          </button>
        </div>
      </div>

      <div className="dc-stat-card">
        <div className="dc-stat-inner">
          <div className="dc-stat-row">
            <div>
              <p className="dc-muted-xs" style={{ margin: 0 }}>
                Активных линий
              </p>
              <p className="dc-stat-value">{activeCount}</p>
            </div>
            <div className="dc-icon-tile" style={{ width: '3.5rem', height: '3.5rem' }}>
              <MessageSquare size={26} />
            </div>
          </div>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="dc-card dc-empty">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📱</div>
          <p className="dc-strong" style={{ marginBottom: '0.35rem' }}>
            Нет линий
          </p>
          <p className="dc-muted" style={{ marginBottom: '1rem' }}>
            Создайте первую линию для подключения мессенджеров
          </p>
          <button type="button" className="dc-btn dc-btn-primary" onClick={onCreateClick}>
            <Plus size={18} />
            Добавить линию
          </button>
        </div>
      ) : (
        <div className="dc-fe-stack">
          {lines.map((line) => {
            const platforms = buildPlatforms(line, accountsByLineId[line.id])
            const enabled = line.status === 'active'
            return (
              <div key={line.id} className="dc-card dc-card-pad">
                <div className="dc-line-card-head">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dc-line-title-row">
                      <h3 className="dc-line-name">{line.name}</h3>
                      <span className="dc-badge">{companyBadge}</span>
                      {line.is_demo && (
                        <span className="dc-badge dc-badge-amber">Демо</span>
                      )}
                    </div>
                    <p className="dc-muted-xs" style={{ margin: 0 }}>
                      Последняя активность: {formatRelative(line.updated_at || line.created_at)}
                    </p>
                  </div>
                  <div
                    className="dc-line-actions"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="presentation"
                  >
                    <label className="dc-switch" title={enabled ? 'Линия активна' : 'Линия отключена'}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        disabled={togglingId === line.id}
                        onChange={(e) => handleToggleEnabled(e, line)}
                      />
                      <span className="dc-switch-slider" />
                    </label>
                    <button
                      type="button"
                      className="dc-btn-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onLineClick(line)
                      }}
                    >
                      <Settings size={14} />
                      <span className="dc-hide-sm">Настроить</span>
                    </button>
                  </div>
                </div>

                <div className="dc-platform-list">
                  {platforms.map((p, idx) => (
                    <div key={`${line.id}-${idx}`} className="dc-platform-row">
                      <div className="dc-platform-left">
                        <PlatformIcon kind={p.kind} />
                        <div className="dc-platform-meta">
                          <p className="dc-platform-label">{p.label}</p>
                          <p className="dc-platform-id">{p.identifier}</p>
                        </div>
                      </div>
                      <div className="dc-platform-right">
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>
                          {p.messages}{' '}
                          <span className="dc-hide-sm" style={{ fontWeight: 400, color: '#6b7280' }}>
                            сообщ.
                          </span>
                        </p>
                        {statusBadge(p.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default LineList
