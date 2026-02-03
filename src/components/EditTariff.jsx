import { useState } from 'react'
import { updateTariff } from '../api/tariffs'
import Input from './ui/Input'
import Button from './ui/Button'

function EditTariff({ tariff, onSaved, onCancel }) {
  const [values, setValues] = useState({
    price: tariff.price || '',
    is_active: tariff.is_active !== undefined ? tariff.is_active : true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : 
              name === 'price' ? parseFloat(value) || '' : value,
    })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await updateTariff(tariff.id, values)
      alert('Тариф обновлён!')
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Редактировать тариф</h2>
      
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
        Тариф: <strong>{tariff.name}</strong> ({tariff.channel_type}, {tariff.period_days} дней)
      </p>

      <form onSubmit={onSubmit} autoComplete="off">
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f7fa', borderRadius: '8px' }}>
          <div style={{ fontSize: '13px', color: '#666' }}>
            <div><strong>Название:</strong> {tariff.name}</div>
            <div><strong>Тип канала:</strong> {tariff.channel_type}</div>
            <div><strong>Период:</strong> {tariff.period_days} дней</div>
          </div>
        </div>

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
            Сохранить
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditTariff