import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Input from './ui/Input'
import Button from './ui/Button'

function VerifyEmail({ email, tempToken, onBack, onVerified }) {
  const { verify } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await verify(tempToken, code)
      onVerified()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>Подтверждение email</h2>
      <p>
        Код отправлен на: <strong>{email}</strong>
      </p>

      <form onSubmit={onSubmit} autoComplete="off">
        <Input
          label="Код подтверждения"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          placeholder="Введите код из письма"
        />

        {error && <div className="error">{error}</div>}

        <Button type="submit" loading={loading}>
          Подтвердить
        </Button>

        <Button type="button" variant="secondary" onClick={onBack}>
          Назад
        </Button>
      </form>
    </div>
  )
}

export default VerifyEmail