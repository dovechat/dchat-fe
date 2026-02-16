import { useState, useEffect } from 'react'
import { getLine, updateLine, deleteLine, getChannelAccount } from '../api/lines'
import Button from './ui/Button'
import Input from './ui/Input'
import ChannelAccount from './ChannelAccount'

function LineDetails({ tenantId, lineId, onBack, onDeleted }) {
  const [line, setLine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [configuringChannel, setConfiguringChannel] = useState(false)
  const [accountData, setAccountData] = useState(null)

  useEffect(() => {
    loadLine()
  }, [tenantId, lineId])

  useEffect(() => {
  const loadAccount = async () => {
    if (!line?.id || !tenantId) return;
    
    if (!line.account_id) {
      console.log('Аккаунт ещё не создан, пропускаем запрос');
      setAccountData(null);  // ← было setAccount
      return;
    }
    
    try {
      setLoading(true);
      const data = await getChannelAccount(tenantId, line.id);
      setAccountData(data);  // ← было setAccount
    } catch (err) {
      if (err.response?.status === 404) {
        console.log('Аккаунт не найден (нормально для новой линии)');
        setAccountData(null);  // ← было setAccount
      } else {
        console.error('Ошибка загрузки аккаунта:', err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  loadAccount();
}, [tenantId, line?.id, line?.account_id]);


  const loadLine = async () => {
    try {
      setLoading(true)
      const data = await getLine(tenantId, lineId)
      console.log('>>> line.connection_state из API:', data.connection_state, typeof data.connection_state)
      setLine(data)
      setEditName(data.name)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!editName.trim()) return
    
    try {
      setUpdating(true)
      await updateLine(tenantId, lineId, { name: editName })
      setLine({ ...line, name: editName })
      setEditing(false)
      alert('Название обновлено!')
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту линию?')) return
    
    try {
      setDeleting(true)
      await deleteLine(tenantId, lineId)
      alert('Линия удалена!')
      onDeleted()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Не установлена'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'active': return { background: '#d4edda', color: '#155724' }
      case 'disabled': return { background: '#e2e3e5', color: '#383d41' }
      case 'expired': return { background: '#f8d7da', color: '#721c24' }
      default: return { background: '#e2e3e5', color: '#383d41' }
    }
  }

  const getChannelTypeLabel = (type) => {
    switch (type) {
      case 'telegram_bot': return 'Telegram Bot'
      case 'telegram_user': return 'Telegram User'
      case 'whatsapp_qr': return 'WhatsApp QR'
      case 'whatsapp_business': return 'WhatsApp Business'
      case 'vk': return 'VK'
      default: return type
    }
  }

  const getChannelIcon = (type) => {
    switch (type) {
      case 'telegram_bot': return '🤖'
      case 'telegram_user': return '👤'
      case 'whatsapp_qr': return '📱'
      case 'whatsapp_business': return '💼'
      case 'vk': return '👥'
      default: return '📞'
    }
  }


  const toggleLineStatus = async () => {
    const newStatus = line.status === 'active' ? 'disabled' : 'active'
    try {
      setUpdating(true)
      await updateLine(tenantId, lineId, { status: newStatus })
      setLine({ ...line, status: newStatus })
      alert(`Линия ${newStatus === 'active' ? 'включена' : 'отключена'}!`)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }




const handleConnectionToggle = async () => {
  let isConnected = false
  
  // DEBUG: что реально лежит в connection_state
  console.log('>>> typeof line.connection_state:', typeof line.connection_state)
  console.log('>>> line.connection_state:', line.connection_state)
  
  if (line.connection_state) {
    if (typeof line.connection_state === 'object' && line.connection_state.status === 'connected') {
      isConnected = true
    }
  }
  
  const newStatus = isConnected ? 'disconnected' : 'connected'
  const payload = { connection_state: { status: newStatus } }
  
  console.log('>>> Отправляем:', payload)
  
  try {
    setUpdating(true)
    await updateLine(tenantId, lineId, payload)
    setLine({ ...line, connection_state: { status: newStatus } })
    alert('Состояние обновлено!')
  } catch (err) {
    console.error('>>> Ошибка:', err.response?.data)
  } finally {
    setUpdating(false)
  }
}






  if (loading) return <div className="dashboard">Загрузка данных линии...</div>
  if (error) return <div className="dashboard error">{error}</div>
  if (!line) return <div className="dashboard">Линия не найдена</div>

  console.log('configuringChannel:', configuringChannel, 'line:', line)

  if (configuringChannel) {
    console.log('Рендерим LineDetails, accountData:', accountData)
    return (
        <ChannelAccount
          tenantId={tenantId}
          lineId={lineId}
          channelType={line.channel_type}
          onBack={() => setConfiguringChannel(false)}
        />
      )
    }

  return (
    <div className="dashboard">
      <div style={{ marginBottom: '20px' }}>
        <Button variant="secondary" onClick={onBack} style={{ marginBottom: '16px' }}>
          ← Назад к списку
        </Button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{getChannelIcon(line.channel_type)}</span>
              {editing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: '300px', margin: 0 }}
                  />
                  <Button variant="primary" onClick={handleUpdateName} loading={updating} size="small">
                    Сохранить
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(false)} size="small">
                    Отмена
                  </Button>
                </div>
              ) : (
                <h2>{line.name}</h2>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '600',
                ...getStatusBadgeStyle(line.status)
              }}>
                {line.status === 'active' ? 'Активна' :
                 line.status === 'disabled' ? 'Отключена' :
                 line.status === 'expired' ? 'Истекла' : line.status}
              </span>
              {line.is_demo && (
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: '#d0ebff',
                  color: '#0c63e4'
                }}>
                  Демо
                </span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={() => setEditing(true)}>
              Переименовать
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Удалить
            </Button>
          </div>
        </div>
      </div>

      {/* Основная информация */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid #e1e4e8', paddingBottom: '8px' }}>
          Основная информация
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Тип канала</div>
            <div style={{ fontSize: '15px', fontWeight: '500' }}>{getChannelTypeLabel(line.channel_type)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>ID линии</div>
            <div style={{ fontSize: '13px', fontFamily: 'monospace', background: '#f5f7fa', padding: '4px 8px', borderRadius: '4px' }}>
              {line.id}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Номер телефона</div>
            <div style={{ fontSize: '15px', fontWeight: '500' }}>
              {accountData?.phone || line.connection_state?.phone || 'Не указан'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Дата создания</div>
            <div style={{ fontSize: '15px' }}>{formatDate(line.created_at)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Дата окончания</div>
            <div style={{ fontSize: '15px', fontWeight: line.expires_at ? '500' : '400' }}>
              {formatDate(line.expires_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Состояние подключения */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid #e1e4e8', paddingBottom: '8px' }}>
          Состояние подключения
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Статус подключения</div>
            <div style={{ 
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'inline-block',
              background: line.connection_state ? '#d4edda' : '#f8d7da',
              color: line.connection_state ? '#155724' : '#721c24',
              fontWeight: '500'
            }}>
              {line.connection_state ? 'Подключено' : 'Не подключено'}
            </div>
          </div>
          
          {line.connection_state && (
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Данные подключения</div>
              <div style={{ 
                background: '#f5f7fa', 
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'monospace',
                maxHeight: '100px',
                overflow: 'auto'
              }}>
                {JSON.stringify(line.connection_state, null, 2)}
              </div>
            </div>
          )}
        </div>

        {/* Кнопки управления подключением */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={handleConnectionToggle} loading={updating}>
            {line.connection_state ? 'Переподключить' : 'Подключить'}
          </Button>
          <Button variant="secondary" onClick={() => setConfiguringChannel(true)}>
            Настроить канал
          </Button>
          <Button variant="secondary">
            Получить QR-код
          </Button>
        </div>

      </div>

      {/* Действия с линией */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid #e1e4e8', paddingBottom: '8px' }}>
          Действия с линией
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Button variant="primary">
            Продлить подписку
          </Button>
          <Button 
            variant={line.status === 'active' ? 'secondary' : 'success'}
            onClick={toggleLineStatus}
            loading={updating}
          >
            {line.status === 'active' ? 'Отключить' : 'Включить'}
          </Button>
          <Button variant="secondary">
            Экспорт диалогов
          </Button>
          <Button variant="secondary">
            Статистика
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LineDetails