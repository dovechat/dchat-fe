import { useState } from 'react'
import { updateTenant } from '../api/tenants'
import Input from './ui/Input'

function EditTenant({ tenant, onSaved, onCancel }) {
  const [values, setValues] = useState({
    name: tenant.name || '',
    locale: tenant.locale || 'ru_RU',
    payment: tenant.payment || 'acquiring',
    status: tenant.status || 'active',
    address: tenant.address || '',
    phone: tenant.phone || '',
    email: tenant.email || '',
    inn: tenant.inn || '',
    employee_count:
      tenant.employee_count != null && tenant.employee_count !== ''
        ? String(tenant.employee_count)
        : '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      name: values.name,
      locale: values.locale,
      payment: values.payment,
      status: values.status,
      address: values.address.trim() || null,
      phone: values.phone.trim() || null,
      email: values.email.trim() || null,
      inn: values.inn.trim() || null,
    }
    const ec = values.employee_count.trim()
    if (ec !== '') {
      const n = parseInt(ec, 10)
      if (!Number.isNaN(n) && n >= 0) payload.employee_count = n
    } else {
      payload.employee_count = null
    }

    try {
      const updated = await updateTenant(tenant.id, payload)
      alert('Компания обновлена!')
      onSaved(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dc-fe-page dc-fe-stack">
      <div className="dc-fe-header">
        <div>
          <h1 className="dc-fe-title">Редактировать компанию</h1>
          <p className="dc-fe-subtitle">Изменение параметров компании</p>
        </div>
      </div>

      <div className="dc-card dc-card-pad" style={{ maxWidth: '36rem' }}>
        <form onSubmit={onSubmit} autoComplete="off">
          <Input
            label="Название компании"
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            placeholder="Моя компания"
          />

          <Input label="Адрес" type="text" name="address" value={values.address} onChange={handleChange} placeholder="Город, улица, дом" />

          <div className="dc-field-grid">
            <Input label="Телефон" type="tel" name="phone" value={values.phone} onChange={handleChange} placeholder="+7 …" />
            <Input label="Email" type="email" name="email" value={values.email} onChange={handleChange} placeholder="mail@example.com" />
          </div>

          <div className="dc-field-grid">
            <Input label="ИНН" type="text" name="inn" value={values.inn} onChange={handleChange} placeholder="10 или 12 цифр" />
            <Input
              label="Число сотрудников"
              type="number"
              name="employee_count"
              min={0}
              value={values.employee_count}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="dc-muted-xs" style={{ display: 'block', marginBottom: '0.35rem' }}>
              Локаль
            </label>
            <select name="locale" value={values.locale} onChange={handleChange} className="dc-select" style={{ maxWidth: '100%' }}>
              <option value="ru_RU">Русский (ru_RU)</option>
              <option value="en_US">English (en_US)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="dc-muted-xs" style={{ display: 'block', marginBottom: '0.35rem' }}>
              Способ оплаты
            </label>
            <select name="payment" value={values.payment} onChange={handleChange} className="dc-select" style={{ maxWidth: '100%' }}>
              <option value="acquiring">Эквайринг</option>
              <option value="invoice">Счёт</option>
            </select>
          </div>

          <div className="form-group">
            <label className="dc-muted-xs" style={{ display: 'block', marginBottom: '0.35rem' }}>
              Статус
            </label>
            <select name="status" value={values.status} onChange={handleChange} className="dc-select" style={{ maxWidth: '100%' }}>
              <option value="active">Активный</option>
              <option value="inactive">Неактивный</option>
            </select>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="dc-detail-toolbar" style={{ marginTop: '1.25rem', borderTop: 'none', paddingTop: 0 }}>
            <button type="submit" className="dc-btn dc-btn-primary" disabled={loading}>
              {loading ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button type="button" className="dc-btn dc-btn-outline" onClick={onCancel} disabled={loading}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTenant
