import { useState, useEffect } from 'react'
import { createLine } from '../api/lines'
import { getTariffs } from '../api/tariffs'
import Input from './ui/Input'
import Button from './ui/Button'

function CreateLine({ tenantId, onCreated, onCancel }) {
  const [tariffs, setTariffs] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingTariffs, setLoadingTariffs] = useState(true)
  const [error, setError] = useState('')
  
  const [values, setValues] = useState({
    name: '',
    channel_type: 'telegram_bot',
    subscription_period: 'month',
    is_demo: false,
  })
  
  const [selectedTariff, setSelectedTariff] = useState(null)

  useEffect(() => {
    loadTariffs()
  }, [])

  useEffect(() => {
    if (tariffs.length > 0 && values.channel_type) {
      const matchingTariff = tariffs.find(t => 
        t.channel_type === values.channel_type && 
        ((values.subscription_period === 'month' && t.period_days === 30) || 
         (values.subscription_period === 'year' && t.period_days === 365))
      )
      setSelectedTariff(matchingTariff || null)
    }
  }, [values.channel_type, values.subscription_period, tariffs])

  const loadTariffs = async () => {
    try {
      setLoadingTariffs(true)
      const data = await getTariffs()
      setTariffs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingTariffs(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedTariff) {
      setError('Выберите канал и период - будет рассчитана стоимость')
      return
    }
    
    setError('')
    setLoading(true)

    try {
      await createLine(tenantId, values)
      alert('Линия создана!')
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const channelTypes = [
    { value: 'telegram_bot', label: 'Telegram Bot', icon: '🤖' },
    { value: 'telegram_user', label: 'Telegram User', icon: '👤' },
    { value: 'whatsapp_green', label: 'WhatsApp Green', icon: '📲' },
    { value: 'whatsapp_business', label: 'WhatsApp Business', icon: '💼' },
    { value: 'vk', label: 'VK', icon: '👥' },
  ]

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Покупка линии</h2>

      <form onSubmit={onSubmit} autoComplete="off">
        <Input
          label="Название линии"
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
          placeholder="Моя линия поддержки"
        />

        <div className="form-group">
          <label>Тип канала</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {channelTypes.map((channel) => (
              <div
                key={channel.value}
                style={{
                  border: `2px solid ${values.channel_type === channel.value ? '#4A90E2' : '#e1e4e8'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  background: values.channel_type === channel.value ? '#f0f7ff' : 'white',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onClick={() => setValues({ ...values, channel_type: channel.value })}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{channel.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{channel.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Период подписки</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div
              style={{
                flex: 1,
                border: `2px solid ${values.subscription_period === 'month' ? '#4A90E2' : '#e1e4e8'}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                background: values.subscription_period === 'month' ? '#f0f7ff' : 'white',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onClick={() => setValues({ ...values, subscription_period: 'month' })}
            >
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>Месяц</div>
              <div style={{ fontSize: '13px', color: '#666' }}>30 дней</div>
            </div>
            <div
              style={{
                flex: 1,
                border: `2px solid ${values.subscription_period === 'year' ? '#4A90E2' : '#e1e4e8'}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                background: values.subscription_period === 'year' ? '#f0f7ff' : 'white',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onClick={() => setValues({ ...values, subscription_period: 'year' })}
            >
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>Год</div>
              <div style={{ fontSize: '13px', color: '#666' }}>365 дней</div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_demo"
              checked={values.is_demo}
              onChange={handleChange}
            />
            Демо-режим (бесплатно, с ограничениями)
          </label>
        </div>

        {/* Калькулятор стоимости */}
        {selectedTariff && !values.is_demo && (
          <div style={{
            background: '#f0f7ff',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #4A90E2'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Расчёт стоимости</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#666' }}>Тариф</div>
                <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedTariff.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#666' }}>Период</div>
                <div style={{ fontSize: '15px', fontWeight: '500' }}>
                  {values.subscription_period === 'month' ? '30 дней' : '365 дней'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#666' }}>Стоимость</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>
                  {parseFloat(selectedTariff.price).toFixed(2)} ₽
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#666' }}>Состояние</div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: selectedTariff.is_active ? '#27ae60' : '#e74c3c' }}>
                  {selectedTariff.is_active ? 'Тариф активен' : 'Тариф неактивен'}
                </div>
              </div>
            </div>
          </div>
        )}

        {values.is_demo && (
          <div style={{
            background: '#fff3cd',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ fontSize: '20px' }}>ℹ️</div>
              <div>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>Демо-режим</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  Линия будет работать бесплатно с ограничениями по функционалу и количеству сообщений.
                  Длительность демо-периода: 7 дней.
                </div>
              </div>
            </div>
          </div>
        )}

        {loadingTariffs && (
          <div style={{ marginBottom: '20px', color: '#666', textAlign: 'center' }}>
            Загрузка тарифов...
          </div>
        )}

        {!loadingTariffs && !selectedTariff && !values.is_demo && (
          <div style={{
            background: '#f8d7da',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            <div style={{ color: '#721c24', fontSize: '14px' }}>
              {tariffs.length === 0 
                ? 'Нет доступных тарифов для выбранного канала'
                : 'Выберите канал и период для расчёта стоимости'}
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            type="submit" 
            variant="success" 
            loading={loading}
            disabled={!values.is_demo && !selectedTariff}
            style={{ flex: 1 }}
          >
            {values.is_demo ? 'Создать демо-линию' : 'Купить линию'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateLine