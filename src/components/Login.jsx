import { useState } from 'react' // добавлен импорт useState
import { useAuth } from '../context/AuthContext'
import Input from './ui/Input'
import Button from './ui/Button'

function Login({ onSwitchToRegister }) {
  const { login } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
    if (error) setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(values.email, values.password)
      const serviceUrl = new URLSearchParams(window.location.search).get('service_url')
      window.location.href = serviceUrl ? `${serviceUrl}?token=${data.access_token}` : '/companies'
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  // Функция для быстрой авторизации в целях разработки
  const handleDevLogin = () => {
    localStorage.setItem('token', 'debug_token_payload.' + btoa(JSON.stringify({ tenant_id: 'debug' })))
    localStorage.setItem('user_email', 'dev@example.com')
    window.location.reload()
  }

  return (
    <div className="container">
      <h2>Вход</h2>
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
          label="Пароль"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
        {error && <div className="error">{error}</div>}
        <Button type="submit" loading={loading}>
          Войти
        </Button>
      </form>
      
      {/* Только для разработки */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>Инструменты разработки:</p>
          <Button type="button" onClick={handleDevLogin} style={{ backgroundColor: '#6c757d' }}>
            Войти без пароля (Bypass)
          </Button>
        </div>
      )}

      <div className="text-center">
        <button onClick={onSwitchToRegister} className="link-button">
          Нет аккаунта? Зарегистрироваться
        </button>
      </div>
    </div>
  )
}

export default Login