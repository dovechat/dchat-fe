import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'

function Header({ currentTenant, onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const go = (key) => {
    if (onNavigate) {
      onNavigate(key)
      return
    }
    const paths = {
      tenants: '/companies',
      lines: '/lines',
      billing: '/billing',
      tariffs: '/tariffs',
      notifications: '/profile?tab=notifications',
    }
    const p = paths[key]
    if (p) navigate(p)
  }

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h3 onClick={() => go('tenants')}>DoveChat</h3>
        <nav style={{ display: 'flex', gap: '16px' }}>
          <button type="button" onClick={() => go('tenants')} className="nav-button">
            Компании
          </button>
          <button type="button" onClick={() => go('lines')} className="nav-button">
            Линии
          </button>
          <button type="button" onClick={() => go('billing')} className="nav-button">
            Биллинг
          </button>
          <button type="button" onClick={() => go('tariffs')} className="nav-button">
            Тарифы
          </button>
          <button type="button" onClick={() => go('notifications')} className="nav-button">
            Уведомления
          </button>
        </nav>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {currentTenant && (
        <span className="tenant-label" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
          Компания: <strong>{currentTenant.name || 'Без названия'}</strong>
        </span>
        )}
        <span style={{ fontSize: '13px', color: '#666' }}>{user?.email}</span>
        <Button variant="danger" onClick={() => { logout(); navigate('/login') }} style={{ padding: '6px 12px', fontSize: '13px' }}>
          Выйти
        </Button>
      </div>
    </header>
  )
}

export default Header
