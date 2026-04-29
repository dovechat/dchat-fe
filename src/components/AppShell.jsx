import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { key: 'companies', label: 'Компании', path: '/companies' },
  { key: 'lines', label: 'Линии', path: '/lines' },
  { key: 'billing', label: 'Биллинг', path: '/billing' },
  { key: 'tariffs', label: 'Тарифы', path: '/tariffs' },
  { key: 'notifications', label: 'Уведомления', path: '/notifications' },
]

function AppShell({ currentCompany, children }) {
  const { user, logout } = useAuth()

  const onLogout = () => {
    logout()
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <h1>DoveChat</h1>
          <p>Business Console</p>
        </div>

        <nav className="app-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `app-nav-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          {currentCompany && (
            <p className="app-company-label">
              Компания: <strong>{currentCompany.name || 'Без названия'}</strong>
            </p>
          )}
          <p className="app-user-email">{user?.email}</p>
          <button type="button" className="btn btn-danger app-logout-btn" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  )
}

export default AppShell
