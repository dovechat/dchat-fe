import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from './ui/Input'
import Button from './ui/Button'

function Register({ onSwitchToLogin, onRegistered }) {
  const { register } = useAuth()
  const [values, setValues] = useState({
    email: '',
    phone: '+',
    password: '',
    ifsms: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    setError('')
    
    const phoneDigits = values.phone.replace(/\D/g, '')
    if (phoneDigits.length < 9) {
      setError('Телефон должен содержать минимум 9 цифр')
      return
    }
    
    setLoading(true)

    try {
      const result = await register(values.email, values.phone, values.password, values.ifsms)
      console.log('Результат регистрации:', result)
      onRegistered(values.email, result.access_token)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка регистрации')  // ← ИСПРАВИТЬ
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
    <div className="container" style={{ maxWidth: '26rem' }}>
      <h2>Регистрация</h2>

      <form onSubmit={onSubmit} autoComplete="off">
        <Input
          label="Email"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Телефон"
          type="tel"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          required
          pattern="\+[0-9]{9,}"
          placeholder="+79991234567"
        />

        <Input
          label="Пароль (минимум 8 символов)"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          required
          minLength="8"
          autoComplete="new-password"
        />

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="ifsms"
              checked={values.ifsms}
              onChange={handleChange}
            />
            Получить код подтверждения по SMS (вместо email)
          </label>
        </div>

        {error && <div className="error">{error}</div>}

        <Button type="submit" variant="success" loading={loading}>
          Зарегистрироваться
        </Button>
      </form>

      <div className="text-center">
        <button onClick={onSwitchToLogin} className="link-button">
          Уже есть аккаунт? Войти
        </button>
      </div>
    </div>
    </div>
  )
}

export default Register