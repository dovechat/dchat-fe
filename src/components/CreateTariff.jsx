import { useState } from 'react'
import { createTariff } from '../api/tariffs'
import Input from './ui/Input'
import Button from './ui/Button'

function CreateTariff({ onCreated, onCancel }) {
  const [values, setValues] = useState({
    name: '',
    channel_type: 'telegram_bot',
    period_days: 30,
    price: '',
    is_active: true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : 
              name === 'period_days' ? parseInt(value) || 0 :
              name === 'price' ? parseFloat(value) || '' : value,
    })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await createTariff(values)
      alert('Тариф создан!')
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Создать тариф</h2>

      <form onSubmit={onSubmit} autoComplete="off">
        <Input
          label="Название тарифа"
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
          placeholder="Базовый тариф"
        />

        <div className="form-group">
          <label>Тип канала</label>
          <select
            name="channel_type"
            value={values.channel_type}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid #e1e4e8',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <option value="telegram_bot">Telegram Bot</option>
            <option value="telegram_user">Telegram User</option>
            <option value="whatsapp_green">WhatsApp Green API</option>
            <option value="whatsapp_business">WhatsApp Business</option>
            <option value="vk">VK</option>
          </select>
        </div>

        <Input
          label="Период (дней)"
          type="number"
          name="period_days"
          value={values.period_days}
          onChange={handleChange}
          required
          min="1"
        />

        <Input
          label="Цена (₽)"
          type="number"
          name="price"
          value={values.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          placeholder="0.00"
        />

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_active"
              checked={values.is_active}
              onChange={handleChange}
            />
            Активный тариф
          </label>
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="submit" variant="success" loading={loading} style={{ flex: 1 }}>
            Создать
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateTariff