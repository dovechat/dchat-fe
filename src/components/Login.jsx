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
      window.location.href = serviceUrl ? `${serviceUrl}?token=${data.access_token}` : '/'
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
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
      <div className="text-center">
        <button onClick={onSwitchToRegister} className="link-button">
          Нет аккаунта? Зарегистрироваться
        </button>
      </div>
    </div>
  )
}

export default Login