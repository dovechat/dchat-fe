import { NavLink, useLocation } from 'react-router-dom'
import {
  Building2,
  Network,
  CreditCard,
  Tags,
  Bell,
  Globe,
  LogOut,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/** Пункт «Чаты» — отдельно, выше остальных (как в mydesign). */
const primaryNavItems = [
  { key: 'chats', label: 'Чаты', path: '/chats', Icon: MessageSquare },
]

const navItems = [
  { key: 'companies', label: 'Компании', path: '/companies', Icon: Building2 },
  { key: 'lines', label: 'Линии', path: '/lines', Icon: Network },
  { key: 'billing', label: 'Биллинг', path: '/billing', Icon: CreditCard },
  { key: 'tariffs', label: 'Тарифы', path: '/tariffs', Icon: Tags },
  { key: 'notifications', label: 'Уведомления', path: '/notifications', Icon: Bell },
]

const allNavItems = [...primaryNavItems, ...navItems]

function emailInitials(email) {
  if (!email) return '?'
  const local = email.split('@')[0] || ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase() || '?'
}

function pathActive(pathname, path) {
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(`${path}/`)
}

function AppShell({ currentCompany, children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const pathname = location.pathname

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

        <nav className="app-nav" aria-label="Основное меню">
          {primaryNavItems.map(({ key, label, path, Icon }) => {
            const active = pathActive(pathname, path)
            return (
              <NavLink
                key={key}
                to={path}
                className={`app-nav-link app-nav-link--primary ${active ? 'active' : ''}`}
              >
                <Icon className="app-nav-icon" aria-hidden />
                <span>{label}</span>
              </NavLink>
            )
          })}
          <div className="app-nav-divider" aria-hidden />
          {navItems.map(({ key, label, path, Icon }) => {
            const active = pathActive(pathname, path)
            return (
              <NavLink
                key={key}
                to={path}
                className={`app-nav-link ${active ? 'active' : ''}`}
              >
                <Icon className="app-nav-icon" aria-hidden />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="app-sidebar-language">
          <div className="app-sidebar-language-label">
            <Globe className="app-nav-icon-sm" aria-hidden />
            <span>Язык</span>
          </div>
          <select className="app-lang-select" disabled title="Скоро">
            <option>Русский</option>
          </select>
        </div>

        <div className="app-sidebar-footer">
          {currentCompany && (
            <p className="app-company-label">
              Компания:{' '}
              <strong>{currentCompany.name || 'Без названия'}</strong>
            </p>
          )}

          <div className="app-user-block">
            <div className="app-user-avatar" aria-hidden>
              {emailInitials(user?.email)}
            </div>
            <div className="app-user-meta">
              <p className="app-user-name">Аккаунт</p>
              <p className="app-user-email">{user?.email}</p>
            </div>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `app-user-bell ${isActive ? 'active' : ''}`
              }
              title="Уведомления"
            >
              <Bell size={18} />
            </NavLink>
          </div>

          <button
            type="button"
            className="btn btn-danger app-logout-btn"
            onClick={onLogout}
          >
            <LogOut className="app-nav-icon-sm" aria-hidden />
            Выйти
          </button>
        </div>
      </aside>

      <nav className="app-mobile-nav" aria-label="Мобильное меню">
        <div className="app-mobile-nav-inner">
          {allNavItems.map(({ key, label, path, Icon }) => {
            const active = pathActive(pathname, path)
            return (
              <NavLink
                key={key}
                to={path}
                className={`app-mobile-nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      <main className="app-main">
        <div className="app-main-scroll">{children}</div>
      </main>
    </div>
  )
}

export default AppShell
