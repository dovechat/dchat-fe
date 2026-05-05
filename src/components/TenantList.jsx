import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTenants, switchTenant } from '../api/tenants'
import { getMembers } from '../api/members'
import { useAuth } from '../context/AuthContext'
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
} from 'lucide-react'

function TenantList({ currentTenantId, onTenantClick, onCreateClick, onTenantSelected }) {
  const navigate = useNavigate()
  const { updateToken } = useAuth()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [switching, setSwitching] = useState(null)
  const [tab, setTab] = useState('companies')
  const [permTenantId, setPermTenantId] = useState('')
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)

  useEffect(() => {
    loadTenants()
  }, [])

  useEffect(() => {
    if (tenants.length && !permTenantId) {
      setPermTenantId(tenants[0].id)
    }
  }, [tenants, permTenantId])

  useEffect(() => {
    if (tab !== 'permissions' || !permTenantId) return
    let cancelled = false
    setMembersLoading(true)
    getMembers(permTenantId)
      .then((data) => {
        if (!cancelled) setMembers(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setMembers([])
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tab, permTenantId])

  const loadTenants = async () => {
    try {
      setLoading(true)
      const data = await getTenants()
      setTenants(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTenant = async (tenantId, e) => {
    e.stopPropagation()
    if (tenantId === currentTenantId) return

    try {
      setSwitching(tenantId)
      const data = await switchTenant(tenantId)
      updateToken(data.access_token, data.refresh_token)
      if (onTenantSelected) {
        onTenantSelected(tenantId)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSwitching(null)
    }
  }

  const roleLabel = (role) => {
    if (role === 'admin') return 'Администратор'
    if (role === 'member') return 'Сотрудник'
    return role || '—'
  }

  const initials = (m) => {
    const name = m.name || m.user?.email || m.email || ''
    const parts = name.split(/[\s@]+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase() || '?'
  }

  if (loading) {
    return (
      <div className="dc-fe-page">
        <p className="dc-muted">Загрузка компаний...</p>
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

  return (
    <div className="dc-fe-page dc-fe-stack">
      <div className="dc-fe-header">
        <div>
          <h1 className="dc-fe-title">Компании</h1>
          <p className="dc-fe-subtitle">
            Управление организациями и доступами сотрудников
          </p>
        </div>
        <div className="dc-fe-actions">
          <button type="button" className="dc-btn dc-btn-primary" onClick={onCreateClick}>
            <Plus size={18} />
            Добавить компанию
          </button>
        </div>
      </div>

      <div className="dc-tabs-list" role="tablist">
        <button
          type="button"
          role="tab"
          className={`dc-tab-btn ${tab === 'companies' ? 'is-active' : ''}`}
          onClick={() => setTab('companies')}
        >
          Компании
        </button>
        <button
          type="button"
          role="tab"
          className={`dc-tab-btn ${tab === 'permissions' ? 'is-active' : ''}`}
          onClick={() => setTab('permissions')}
        >
          Доступы
        </button>
      </div>

      {tab === 'companies' && (
        <div className="dc-tab-panel">
          {tenants.length === 0 ? (
            <div className="dc-card dc-empty">
              <p style={{ marginBottom: '1rem' }}>У вас пока нет компаний</p>
              <button type="button" className="dc-btn dc-btn-primary" onClick={onCreateClick}>
                <Plus size={18} />
                Создать первую компанию
              </button>
            </div>
          ) : (
            <div className="dc-company-grid">
              {tenants.map((tenant) => {
                const bd = tenant.banking_details || {}
                const isActive = tenant.id === currentTenantId
                return (
                  <div
                    key={tenant.id}
                    className="dc-card dc-card-pad dc-card-clickable"
                    onClick={() => onTenantClick(tenant)}
                    style={{ outline: isActive ? '2px solid #3b82f6' : undefined }}
                  >
                    <div className="dc-company-row">
                      <div style={{ display: 'flex', gap: '1rem', minWidth: 0, flex: 1 }}>
                        <div className="dc-icon-tile">
                          <Building2 size={22} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ marginBottom: '0.75rem' }}>
                            <h3 className="dc-company-title">{tenant.name}</h3>
                            <p className="dc-muted-xs" style={{ marginTop: '0.25rem' }}>
                              Локаль: {tenant.locale} · Оплата: {tenant.payment}
                              {isActive && (
                                <span className="dc-badge dc-badge-green" style={{ marginLeft: '0.5rem' }}>
                                  Активная
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="dc-field-grid">
                            <div>
                              <p className="dc-muted-xs">Адрес</p>
                              <p className="dc-strong">—</p>
                            </div>
                            <div>
                              <p className="dc-muted-xs">Телефон</p>
                              <p className="dc-strong">—</p>
                            </div>
                            <div>
                              <p className="dc-muted-xs">Email</p>
                              <p className="dc-strong">—</p>
                            </div>
                            <div>
                              <p className="dc-muted-xs">Сотрудники</p>
                              <p className="dc-strong" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Users size={14} style={{ color: '#3b82f6' }} />
                                —
                              </p>
                            </div>
                          </div>
                          <div className="dc-req-block">
                            <p className="dc-muted-xs" style={{ marginBottom: '0.5rem' }}>
                              Реквизиты
                            </p>
                            <div className="dc-req-grid">
                              <div>
                                <span className="dc-muted-xs">Банк: </span>
                                <span className="dc-strong">{bd.bank_name || '—'}</span>
                              </div>
                              <div>
                                <span className="dc-muted-xs">Р/С: </span>
                                <span className="dc-strong">{bd.account_number || '—'}</span>
                              </div>
                              <div>
                                <span className="dc-muted-xs">БИК: </span>
                                <span className="dc-strong">{bd.bic || '—'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            type="button"
                            className="dc-btn-ghost"
                            title="Редактировать"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/companies/${tenant.id}/edit`)
                            }}
                          >
                            <Edit size={18} style={{ color: '#2563eb' }} />
                          </button>
                          <button
                            type="button"
                            className="dc-btn-ghost dc-btn-ghost-danger"
                            title="Удалить"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.alert('Удаление компании через API пока не подключено.')
                            }}
                          >
                            <Trash2 size={18} style={{ color: '#dc2626' }} />
                          </button>
                        </div>
                        {!isActive && (
                          <button
                            type="button"
                            className="dc-btn-sm"
                            onClick={(e) => handleSelectTenant(tenant.id, e)}
                            disabled={switching === tenant.id}
                          >
                            {switching === tenant.id ? '…' : 'Активировать'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'permissions' && (
        <div className="dc-tab-panel">
          <div className="dc-card dc-card-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Shield size={22} style={{ color: '#2563eb' }} />
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Доступы сотрудников</h2>
            </div>

            {tenants.length === 0 ? (
              <p className="dc-muted">Сначала создайте компанию.</p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="dc-muted-xs" style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Компания
                  </label>
                  <select
                    className="dc-select"
                    value={permTenantId}
                    onChange={(e) => setPermTenantId(e.target.value)}
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="dc-btn dc-btn-primary"
                  style={{ marginBottom: '1.25rem' }}
                  onClick={() => navigate(`/companies/${permTenantId}`)}
                >
                  <Plus size={18} />
                  Добавить сотрудника
                </button>

                {membersLoading ? (
                  <p className="dc-muted">Загрузка…</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {members.length === 0 ? (
                      <p className="dc-muted">Нет сотрудников для выбранной компании.</p>
                    ) : (
                      members.map((m) => (
                        <div key={m.user_id || m.id} className="dc-perm-card">
                          <div className="dc-perm-employee">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="dc-avatar">{initials(m)}</div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>
                                  {m.user?.email || m.email || m.user_id}
                                </p>
                                <p className="dc-muted-xs" style={{ margin: '0.15rem 0 0' }}>
                                  {m.user?.email || '—'}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span className="dc-badge">{roleLabel(m.role)}</span>
                              <span
                                className={
                                  m.role === 'admin' ? 'dc-badge dc-badge-green' : 'dc-badge dc-badge-neutral'
                                }
                              >
                                {m.role === 'admin' ? 'Полный доступ' : 'Ограниченный'}
                              </span>
                              <button type="button" className="dc-btn-ghost" aria-label="Изменить">
                                <Edit size={14} />
                              </button>
                              <button type="button" className="dc-btn-ghost dc-btn-ghost-danger" aria-label="Удалить">
                                <Trash2 size={14} style={{ color: '#dc2626' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TenantList
