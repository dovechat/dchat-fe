import { useState, useEffect } from 'react'
import { getNotificationHistory } from '../api/notifications'
import Button from './ui/Button'

function NotificationHistory({ currentTenantId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [limit] = useState(50)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (currentTenantId) {
      loadHistory()
    }
  }, [currentTenantId, filter, offset])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const params = { limit, offset }
      if (filter) params.notification_type = filter
      
      const data = await getNotificationHistory(currentTenantId, params)
      setHistory(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const notificationTypeLabels = {
    line_expiration: 'Окончание срока линии',
    line_connection_error: 'Ошибка подключения',
    line_blocked: 'Блокировка линии',
    low_balance: 'Низкий баланс',
    payment_success: 'Успешная оплата',
  }

  const channelLabels = {
    email: 'Email',
    telegram: 'Telegram',
    sms: 'SMS',
    internal: 'Внутренние',
  }

  const statusLabels = {
    pending: '⏳ Ожидает',
    sent: '✅ Отправлено',
    failed: '❌ Ошибка',
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU')
  }

  if (loading) return <div className="dashboard">Загрузка истории...</div>
  if (error) return <div className="dashboard error">{error}</div>
  if (!currentTenantId) return <div className="dashboard">Выберите компанию</div>

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.05rem', color: '#0f172a' }}>
        История уведомлений
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Фильтр по типу события</label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setOffset(0)
          }}
          style={{ width: '300px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Все события</option>
          {Object.entries(notificationTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#666' }}>История уведомлений пуста</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e1e4e8',
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <strong>{notificationTypeLabels[item.notification_type] || item.notification_type}</strong>
                  <span style={{ marginLeft: '10px', color: '#666', fontSize: '13px' }}>
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p style={{ margin: '8px 0', color: '#333' }}>{item.message}</p>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  Канал: {channelLabels[item.channel]} → {item.target} • 
                  Статус: {statusLabels[item.status]}
                  {item.error_message && (
                    <span style={{ color: '#d73a4a', marginLeft: '10px' }}>
                      Ошибка: {item.error_message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button 
              variant="secondary" 
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              ← Назад
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setOffset(offset + limit)}
              disabled={history.length < limit}
            >
              Вперед →
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationHistory