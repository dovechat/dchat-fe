import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MessageSquare,
  Smartphone,
  Package,
  Settings,
  RefreshCw,
  Power,
  CheckCircle,
} from 'lucide-react'
import { getLine, getChannelAccount } from '../api/lines'

const QR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIgY29kPC90ZXh0Pjwvc3ZnPg=='

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
      return 'Telegram'
    case 'whatsapp_green':
      return 'WhatsApp'
    case 'waba':
      return 'WhatsApp Business'
    default:
      return type || 'Канал'
  }
}

function uiPlatformKey(type) {
  if (type === 'whatsapp_green') return 'whatsapp'
  if (type === 'telegram_bot' || type === 'telegram_user') return 'telegram'
  if (type === 'waba') return 'waba'
  return 'other'
}

function PlatformIconBig({ kind }) {
  if (kind === 'whatsapp') {
    return (
      <div className="dc-platform-icon-wa" style={{ width: '2.5rem', height: '2.5rem' }}>
        <MessageSquare size={20} />
      </div>
    )
  }
  if (kind === 'telegram') {
    return (
      <div className="dc-platform-icon-tg" style={{ width: '2.5rem', height: '2.5rem' }}>
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.45 3.62-.52.36-.99.53-1.42.52-.47-.01-1.37-.27-2.03-.49-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.03-.74 4.02-1.75 6.7-2.91 8.05-3.47 3.84-1.61 4.64-1.89 5.16-1.9.11 0 .37.03.54.17.14.12.18.27.2.38.01.09.03.32.01.5z" />
        </svg>
      </div>
    )
  }
  if (kind === 'waba') {
    return (
      <div className="dc-platform-icon-waba" style={{ width: '2.5rem', height: '2.5rem' }}>
        <Smartphone size={20} />
      </div>
    )
  }
  return (
    <div className="dc-platform-icon-default" style={{ width: '2.5rem', height: '2.5rem' }}>
      <Package size={20} />
    </div>
  )
}

function LineSettings({ tenantId, companyName }) {
  const { lineId } = useParams()
  const navigate = useNavigate()
  const [line, setLine] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalChannel, setModalChannel] = useState(null)
  const [notifWa, setNotifWa] = useState(true)
  const [notifTg, setNotifTg] = useState(false)
  const [notifWaba, setNotifWaba] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const [lineData, accRaw] = await Promise.all([
          getLine(tenantId, lineId),
          getChannelAccount(tenantId, lineId).catch(() => null),
        ])
        if (cancelled) return
        setLine(lineData)
        setAccounts(normalizeAccounts(accRaw))
      } catch (e) {
        if (!cancelled) setError(e.message || 'Ошибка загрузки')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tenantId, lineId])

  const buildChannelRows = () => {
    if (!line) return []
    if (accounts.length) {
      return accounts.map((acc) => {
        const ct = acc.channel_type || line.channel_type
        const connected = acc.connection_status === 'connected'
        return {
          type: ct,
          ui: uiPlatformKey(ct),
          label: channelLabel(ct),
          identifier: acc.phone || line.connection_state?.phone || acc.external_id || '—',
          connected,
          instanceId: acc.id || acc.instance_id || `inst_${String(ct).slice(0, 6)}…`,
        }
      })
    }
    const ct = line.channel_type
    return [
      {
        type: ct,
        ui: uiPlatformKey(ct),
        label: channelLabel(ct),
        identifier: line.connection_state?.phone || line.name || '—',
        connected: line.connection_status === 'connected',
        instanceId: line.id,
      },
    ]
  }

  const channelRows = buildChannelRows()
  const uniqueUi = [...new Set(channelRows.map((c) => c.ui))]

  const formatExpiry = () => {
    if (!line?.expires_at) return '—'
    return new Date(line.expires_at).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const openConfigure = (ch) => {
    setModalChannel(ch)
  }

  const closeModal = () => setModalChannel(null)

  const goChannelForm = (ch) => {
    navigate(`/lines/${lineId}/channel/${ch.type}`)
  }

  if (loading) {
    return (
      <div className="dc-fe-page">
        <p className="dc-muted">Загрузка…</p>
      </div>
    )
  }

  if (error || !line) {
    return (
      <div className="dc-fe-page">
        <p className="error">{error || 'Линия не найдена'}</p>
        <button type="button" className="dc-btn dc-btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/lines')}>
          К списку линий
        </button>
      </div>
    )
  }

  return (
    <div className="dc-fe-page dc-fe-stack">
      <div className="dc-line-settings-breadcrumb">
        <button type="button" onClick={() => navigate('/lines')}>
          <ArrowLeft size={16} />
          Линии
        </button>
        <span>/</span>
        <span style={{ color: '#0f172a' }}>Настройки линии</span>
      </div>

      <h1 className="dc-fe-title">Настройки линии</h1>

      <div className="dc-line-settings-hero">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>{line.name}</h2>
                <p className="dc-muted-xs" style={{ margin: '0.25rem 0 0' }}>
                  ID: #{String(line.id).slice(0, 8)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {uniqueUi.filter((k) => k !== 'other').map((k) => (
                  <PlatformIconBig key={k} kind={k} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <p className="dc-muted-xs" style={{ margin: 0 }}>
                  Оплачено до
                </p>
                <p style={{ margin: '0.15rem 0 0', fontSize: '1.125rem', fontWeight: 600 }}>{formatExpiry()}</p>
              </div>
              <button
                type="button"
                className="dc-btn"
                style={{
                  background: 'linear-gradient(90deg, #f472b6, #c084fc)',
                  color: '#fff',
                  boxShadow: '0 8px 20px rgba(192, 132, 252, 0.35)',
                }}
                onClick={() => navigate(`/lines/${lineId}/renew`)}
              >
                Продлить
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dc-card">
        <div className="dc-card-pad">
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 600 }}>Каналы</h3>
          <p className="dc-muted-xs" style={{ margin: '0 0 1rem' }}>
            Подключённые мессенджеры и статус
          </p>
          <div className="dc-platform-list">
            {channelRows.map((ch, idx) => (
              <div key={`${ch.type}-${idx}`} className="dc-platform-row" style={{ background: '#f9fafb' }}>
                <div className="dc-platform-left">
                  <PlatformIconBig kind={ch.ui} />
                  <div className="dc-platform-meta">
                    <p className="dc-platform-label">{ch.label}</p>
                    <p className="dc-platform-id">{ch.identifier}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {ch.connected ? (
                    <span className="dc-badge dc-badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={14} />
                      Подключён
                    </span>
                  ) : (
                    <span className="dc-badge dc-badge-neutral">Не подключён</span>
                  )}
                  <button type="button" className="dc-btn-sm" onClick={() => openConfigure(ch)}>
                    <Settings size={14} />
                    Настроить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dc-card">
        <div className="dc-card-pad">
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 600 }}>Уведомления</h3>
          <p className="dc-muted-xs" style={{ margin: '0 0 1rem' }}>
            События по каналам (локально, без синхронизации с сервером)
          </p>
          <div style={{ borderBottom: '1px solid #f1f5f9', padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="dc-muted" style={{ fontSize: '0.875rem' }}>
              WhatsApp → смена статуса
            </span>
            <label className="dc-switch">
              <input type="checkbox" checked={notifWa} onChange={(e) => setNotifWa(e.target.checked)} />
              <span className="dc-switch-slider" />
            </label>
          </div>
          <div style={{ borderBottom: '1px solid #f1f5f9', padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="dc-muted" style={{ fontSize: '0.875rem' }}>
              Telegram → смена статуса
            </span>
            <label className="dc-switch">
              <input type="checkbox" checked={notifTg} onChange={(e) => setNotifTg(e.target.checked)} />
              <span className="dc-switch-slider" />
            </label>
          </div>
          <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="dc-muted" style={{ fontSize: '0.875rem' }}>
              WABA → минимальный баланс
            </span>
            <label className="dc-switch">
              <input type="checkbox" checked={notifWaba} onChange={(e) => setNotifWaba(e.target.checked)} />
              <span className="dc-switch-slider" />
            </label>
          </div>
        </div>
      </div>

      <div className="dc-card">
        <div className="dc-card-pad">
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 600 }}>Привязка к компании</h3>
          <p className="dc-muted-xs" style={{ margin: '0 0 0.75rem' }}>
            Линия работает в контексте текущей активной компании в консоли.
          </p>
          <label className="dc-muted-xs" style={{ display: 'block', marginBottom: '0.35rem' }}>
            Компания
          </label>
          <input
            type="text"
            readOnly
            className="dc-select"
            style={{ maxWidth: '28rem', cursor: 'default', color: '#0f172a' }}
            value={companyName || '—'}
          />
        </div>
      </div>

      {modalChannel && (
        <div className="dc-modal-backdrop" role="presentation" onClick={closeModal}>
          <div className="dc-modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
            <div className="dc-modal-header">
              <h2 className="dc-modal-title">
                <PlatformIconBig kind={modalChannel.ui} />
                Канал — {modalChannel.label}
              </h2>
            </div>
            <div className="dc-modal-body">
              {!modalChannel.connected ? (
                <div>
                  <p className="dc-muted-xs" style={{ marginBottom: '0.75rem' }}>
                    QR-код для привязки (демо)
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <img src={QR_PLACEHOLDER} alt="" style={{ width: 192, height: 192, borderRadius: 8, border: '4px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                    <p className="dc-muted" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8125rem' }}>
                      Отсканируйте в приложении или откройте форму настройки ниже.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p className="dc-muted-xs" style={{ marginBottom: '0.5rem' }}>
                      Статус
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '0.5rem',
                      }}
                    >
                      <CheckCircle size={24} style={{ color: '#16a34a' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#14532d' }}>Подключение активно</p>
                        <p className="dc-muted-xs" style={{ margin: '0.15rem 0 0' }}>
                          {modalChannel.identifier}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p className="dc-muted-xs" style={{ marginBottom: '0.5rem' }}>
                      Идентификатор
                    </p>
                    <code
                      style={{
                        display: 'block',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '0.5rem',
                        fontSize: '0.8125rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {modalChannel.instanceId}
                    </code>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="dc-btn-sm"
                      onClick={() => window.alert('Перезагрузка канала (демо).')}
                    >
                      <RefreshCw size={14} />
                      Перезагрузить
                    </button>
                    <button
                      type="button"
                      className="dc-btn-sm"
                      style={{ borderColor: '#fecaca', color: '#b91c1c' }}
                      onClick={() => {
                        if (window.confirm('Отключить канал?')) {
                          window.alert('Демо: вызов API отключения.')
                          closeModal()
                        }
                      }}
                    >
                      <Power size={14} />
                      Отключить
                    </button>
                  </div>
                </>
              )}
              <div style={{ marginTop: '1.25rem' }}>
                <button type="button" className="dc-btn dc-btn-primary" onClick={() => goChannelForm(modalChannel)}>
                  Открыть форму настройки канала
                </button>
              </div>
            </div>
            <div className="dc-modal-footer">
              <button type="button" className="dc-btn-sm" onClick={closeModal}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LineSettings
