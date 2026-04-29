import { useState, useEffect } from 'react'
import { getTenants, switchTenant } from '../api/tenants'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'

function TenantList({ currentTenantId, onTenantClick, onCreateClick, onTenantSelected }) {
  const { updateToken } = useAuth()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [switching, setSwitching] = useState(null)

  useEffect(() => {
    loadTenants()
  }, [])

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
    e.stopPropagation() // Останавливаем всплытие, чтобы не сработал onClick карточки
    if (tenantId === currentTenantId) return // Уже активный

    console.log('Switching to tenant:', tenantId) // DEBUG
    
    try {
      setSwitching(tenantId)
      const data = await switchTenant(tenantId)
      console.log('Switch response:', data) // DEBUG
      
      // Обновляем токен через AuthContext
      updateToken(data.access_token, data.refresh_token)
      
      // Уведомляем родительский компонент об изменении активной компании
      if (onTenantSelected) {
        onTenantSelected(tenantId)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSwitching(null)
    }
  }

  if (loading) {
    return <div className="dashboard">Загрузка компаний...</div>
  }

  if (error) {
    return <div className="dashboard error">{error}</div>
  }

  return (
    <div className="dashboard">
      <h2 className="section-title">Ваши компании</h2>
      {tenants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            У вас пока нет ни одной компании
          </p>
          <Button variant="success" onClick={onCreateClick}>
            Создать первую компанию
          </Button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className={`tenant-card ${tenant.id === currentTenantId ? 'active' : ''}`}
                onClick={() => onTenantClick(tenant)}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4>
                    {tenant.name}
                    {tenant.id === currentTenantId && (
                      <span className="tenant-badge">АКТИВНЫЙ</span>
                    )}
                  </h4>
                  <p>
                    Локаль: {tenant.locale} • Оплата: {tenant.payment} • Статус: {tenant.status}
                  </p>
                </div>
                
                {/* Кнопка активации компании - показываем только для неактивных */}
                {tenant.id !== currentTenantId && (
                  <Button
                    variant="primary"
                    onClick={(e) => handleSelectTenant(tenant.id, e)}
                    disabled={switching === tenant.id}
                    style={{ whiteSpace: 'nowrap', padding: '8px 16px' }}
                  >
                    {switching === tenant.id ? 'Переключение...' : 'Активировать'}
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="success" onClick={onCreateClick}>
            + Создать новую компанию
          </Button>
        </>
      )}
    </div>
  )
}

export default TenantList
