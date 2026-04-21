import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'

function Header({ currentTenant, onNavigate }) {
  const { user, logout } = useAuth()

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h3
            onClick={() => onNavigate('tenants')}>
          DoveChat
        </h3>
        <nav style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => onNavigate('tenants')} className="nav-button">
            Тенанты
          </button>
          <button onClick={() => onNavigate('lines')} className="nav-button">
            Линии
          </button>
          <button onClick={() => onNavigate('billing')} className="nav-button">
            Биллинг
          </button>
          <button onClick={() => onNavigate('tariffs')} className="nav-button">
            Тарифы
          </button>
          <button onClick={() => onNavigate('notifications')} className="nav-button">
            Уведомления
          </button>
        </nav>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {currentTenant && (
        <span style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap' }}>
          Тенант: <strong>{currentTenant.name || 'Без названия'}</strong>
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