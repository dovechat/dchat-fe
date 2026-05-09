import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Bell,
  Lock,
  Save,
  Camera,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NotificationSettings from './NotificationSettings'
import NotificationHistory from './NotificationHistory'

const T = {
  title: 'Настройки профиля',
  subtitle: 'Управление информацией учетной записи и настройками',
  changePassword: 'Изменить пароль',
  active: 'Активен',
  memberSince: 'Участник с',
  tabs: {
    general: 'Общие',
    notifications: 'Уведомления',
    security: 'Безопасность',
    preferences: 'Настройки',
  },
  general: {
    personalInfo: 'Персональная информация',
    personalInfoDesc: 'Обновите свои личные данные и контактную информацию',
    firstName: 'Имя',
    lastName: 'Фамилия',
    email: 'Электронная почта',
    phone: 'Телефон',
    location: 'Местоположение',
    bio: 'О себе',
    bioPlaceholder: 'Расскажите о себе...',
    companyInfo: 'Информация о компании',
    companyInfoDesc: 'Сведения о вашей организации',
    company: 'Название компании',
    role: 'Роль',
    department: 'Отдел',
    departments: {
      support: 'Поддержка клиентов',
      sales: 'Продажи',
      marketing: 'Маркетинг',
      engineering: 'Разработка',
    },
  },
  notifications: {
    title: 'Настройки уведомлений',
    description: 'Выберите способ получения уведомлений',
    newMessages: 'Новые сообщения',
    newMessagesDesc: 'Получать уведомления при получении нового сообщения',
    mentions: 'Упоминания',
    mentionsDesc: 'Получать уведомления, когда кто-то упоминает вас',
    automationAlerts: 'Оповещения автоматизации',
    automationAlertsDesc: 'Получать уведомления о выполнении правил автоматизации',
    emailDigest: 'Дайджест по электронной почте',
    emailDigestDesc: 'Получать ежедневные сводные электронные письма',
    desktopNotifications: 'Уведомления на рабочем столе',
    desktopNotificationsDesc: 'Показывать уведомления на рабочем столе для важных обновлений',
    cabinetTitle: 'Подписки и журнал',
    cabinetDesc: 'Настройки и история для текущей компании в кабинете',
  },
  security: {
    title: 'Настройки безопасности',
    description: 'Управление безопасностью и конфиденциальностью учетной записи',
    twoFactor: 'Двухфакторная аутентификация',
    twoFactorDesc: 'Добавьте дополнительный уровень безопасности для вашей учетной записи',
    enable: 'Включить',
    changePassword: 'Изменить пароль',
    changePasswordDesc: 'Регулярно обновляйте пароль для безопасности',
    change: 'Изменить',
    activeSessions: 'Активные сеансы',
    activeSessionsDesc: 'Просмотр и управление активными сеансами',
    manage: 'Управление',
  },
  preferences: {
    title: 'Настройки приложения',
    description: 'Настройте свой опыт',
    language: 'Язык',
    timezone: 'Часовой пояс',
    dateFormat: 'Формат даты',
    darkMode: 'Темная тема',
    darkModeDesc: 'Переключиться на темную тему',
    compactView: 'Компактный вид',
    compactViewDesc: 'Показывать больше контента в меньшем пространстве',
    languages: {
      en: 'Английский',
      ru: 'Русский',
      es: 'Испанский',
      fr: 'Французский',
      de: 'Немецкий',
    },
    timezones: {
      pst: 'Тихоокеанское время (PT)',
      mst: 'Горное время (MT)',
      cst: 'Центральное время (CT)',
      est: 'Восточное время (ET)',
    },
  },
  saveChanges: 'Сохранить изменения',
  savePreferences: 'Сохранить настройки',
}

const TAB_IDS = ['general', 'notifications', 'security', 'preferences']

function emailInitials(email) {
  if (!email) return '?'
  const local = email.split('@')[0] || ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase() || '?'
}

function DesignSwitch({ defaultChecked }) {
  const [on, setOn] = useState(!!defaultChecked)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`dc-prof-switch ${on ? 'dc-prof-switch--on' : ''}`}
      onClick={() => setOn(!on)}
    >
      <span className="dc-prof-switch-thumb" />
    </button>
  )
}

function NotifRow({ icon: Icon, title, description, defaultChecked }) {
  return (
    <div className="dc-prof-notif-row">
      <div className="dc-prof-notif-row-text">
        <div className="dc-prof-notif-row-title">
          <Icon className="dc-prof-notif-icon" aria-hidden />
          <span className="dc-prof-label-strong">{title}</span>
        </div>
        <p className="dc-prof-desc">{description}</p>
      </div>
      <DesignSwitch defaultChecked={defaultChecked} />
    </div>
  )
}

export default function Profile({ currentTenant }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const tabFromUrl = searchParams.get('tab')
  const initialTab = TAB_IDS.includes(tabFromUrl) ? tabFromUrl : 'general'
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    const t = searchParams.get('tab')
    if (TAB_IDS.includes(t)) setActiveTab(t)
    else if (!t) setActiveTab('general')
  }, [searchParams])

  const setTab = (id) => {
    setActiveTab(id)
    setSearchParams(id === 'general' ? {} : { tab: id }, { replace: true })
  }

  const currentTenantId = currentTenant?.id ?? null

  const userEmail = user?.email || 'admin@messengerhub.com'
  const rawName = (user?.name || '').trim()
  const nameParts = rawName ? rawName.split(/\s+/) : []
  const defaultFirst = nameParts[0] || userEmail.split('@')[0] || 'Admin'
  const defaultLast = nameParts.slice(1).join(' ') || 'User'
  const displayName = rawName || `${defaultFirst} ${defaultLast}`.trim()

  const memberLabel = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(new Date())

  return (
    <div className="dc-prof-page">
      <div className="dc-prof-inner">
        <div className="dc-prof-header-block">
          <h1 className="dc-prof-title">{T.title}</h1>
          <p className="dc-prof-subtitle">{T.subtitle}</p>
        </div>

        <div className="dc-prof-card dc-prof-card--hero">
          <div className="dc-prof-hero-inner">
            <div className="dc-prof-avatar-wrap">
              <div className="dc-prof-avatar">{emailInitials(userEmail)}</div>
              <button type="button" className="dc-prof-camera-btn" title="Фото" aria-label="Загрузить фото">
                <Camera className="dc-prof-camera-icon" />
              </button>
            </div>
            <div className="dc-prof-hero-meta">
              <h2 className="dc-prof-hero-name">{displayName}</h2>
              <p className="dc-prof-hero-email">{userEmail}</p>
              <div className="dc-prof-hero-badges">
                <span className="dc-prof-badge-active">
                  <span className="dc-prof-badge-dot" />
                  {T.active}
                </span>
                <span className="dc-prof-member">
                  {T.memberSince} {memberLabel}
                </span>
              </div>
            </div>
            <button type="button" className="dc-prof-btn-outline">
              {T.changePassword}
            </button>
          </div>
        </div>

        <div className="dc-prof-tabs-root">
          <div className="dc-prof-tabs-list" role="tablist" aria-label="Разделы настроек">
            {TAB_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                className={`dc-prof-tab ${activeTab === id ? 'dc-prof-tab--active' : ''}`}
                onClick={() => setTab(id)}
              >
                {T.tabs[id]}
              </button>
            ))}
          </div>

          {activeTab === 'general' && (
            <div className="dc-prof-tab-panels">
              <div className="dc-prof-stack">
                <div className="dc-prof-card dc-prof-card--section">
                  <div className="dc-prof-card-head">
                    <h3 className="dc-prof-card-title">{T.general.personalInfo}</h3>
                    <p className="dc-prof-card-desc">{T.general.personalInfoDesc}</p>
                  </div>
                  <div className="dc-prof-card-body">
                    <div className="dc-prof-grid-2">
                      <div className="dc-prof-field">
                        <label className="dc-prof-label" htmlFor="prof-firstName">
                          {T.general.firstName}
                        </label>
                        <input id="prof-firstName" className="dc-prof-input" type="text" defaultValue={defaultFirst} />
                      </div>
                      <div className="dc-prof-field">
                        <label className="dc-prof-label" htmlFor="prof-lastName">
                          {T.general.lastName}
                        </label>
                        <input id="prof-lastName" className="dc-prof-input" type="text" defaultValue={defaultLast} />
                      </div>
                    </div>
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-email">
                        {T.general.email}
                      </label>
                      <div className="dc-prof-input-icon-wrap">
                        <Mail className="dc-prof-input-icon" aria-hidden />
                        <input id="prof-email" className="dc-prof-input dc-prof-input--pl" type="email" defaultValue={userEmail} />
                      </div>
                    </div>
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-phone">
                        {T.general.phone}
                      </label>
                      <div className="dc-prof-input-icon-wrap">
                        <Phone className="dc-prof-input-icon" aria-hidden />
                        <input id="prof-phone" className="dc-prof-input dc-prof-input--pl" type="tel" defaultValue="+1 (555) 123-4567" />
                      </div>
                    </div>
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-location">
                        {T.general.location}
                      </label>
                      <div className="dc-prof-input-icon-wrap">
                        <MapPin className="dc-prof-input-icon" aria-hidden />
                        <input id="prof-location" className="dc-prof-input dc-prof-input--pl" type="text" defaultValue="San Francisco, CA" />
                      </div>
                    </div>
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-bio">
                        {T.general.bio}
                      </label>
                      <textarea id="prof-bio" className="dc-prof-textarea" placeholder={T.general.bioPlaceholder} rows={4} />
                    </div>
                    <div className="dc-prof-actions-end">
                      <button type="button" className="dc-prof-btn-gradient">
                        <Save className="dc-prof-btn-icon" />
                        {T.saveChanges}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="dc-prof-card dc-prof-card--section">
                  <div className="dc-prof-card-head">
                    <h3 className="dc-prof-card-title">{T.general.companyInfo}</h3>
                    <p className="dc-prof-card-desc">{T.general.companyInfoDesc}</p>
                  </div>
                  <div className="dc-prof-card-body">
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-company">
                        {T.general.company}
                      </label>
                      <input
                        id="prof-company"
                        className="dc-prof-input"
                        type="text"
                        defaultValue={currentTenant?.name || 'MessengerHub Inc.'}
                      />
                    </div>
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-role">
                        {T.general.role}
                      </label>
                      <input id="prof-role" className="dc-prof-input" type="text" defaultValue="Administrator" />
                    </div>
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-dept">
                        {T.general.department}
                      </label>
                      <select id="prof-dept" className="dc-prof-select" defaultValue="support">
                        <option value="support">{T.general.departments.support}</option>
                        <option value="sales">{T.general.departments.sales}</option>
                        <option value="marketing">{T.general.departments.marketing}</option>
                        <option value="engineering">{T.general.departments.engineering}</option>
                      </select>
                    </div>
                    <div className="dc-prof-actions-end">
                      <button type="button" className="dc-prof-btn-gradient">
                        <Save className="dc-prof-btn-icon" />
                        {T.saveChanges}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="dc-prof-tab-panels">
              <div className="dc-prof-stack">
                <div className="dc-prof-card dc-prof-card--section">
                  <div className="dc-prof-card-head">
                    <h3 className="dc-prof-card-title">{T.notifications.title}</h3>
                    <p className="dc-prof-card-desc">{T.notifications.description}</p>
                  </div>
                  <div className="dc-prof-card-body dc-prof-notif-list">
                    <NotifRow icon={Bell} title={T.notifications.newMessages} description={T.notifications.newMessagesDesc} defaultChecked />
                    <NotifRow icon={Bell} title={T.notifications.mentions} description={T.notifications.mentionsDesc} defaultChecked />
                    <NotifRow icon={Bell} title={T.notifications.automationAlerts} description={T.notifications.automationAlertsDesc} />
                    <NotifRow icon={Mail} title={T.notifications.emailDigest} description={T.notifications.emailDigestDesc} defaultChecked />
                    <NotifRow
                      icon={Bell}
                      title={T.notifications.desktopNotifications}
                      description={T.notifications.desktopNotificationsDesc}
                      defaultChecked
                    />
                  </div>
                </div>

                <div className="dc-prof-card dc-prof-card--section">
                  <div className="dc-prof-card-head">
                    <h3 className="dc-prof-card-title">{T.notifications.cabinetTitle}</h3>
                    <p className="dc-prof-card-desc">{T.notifications.cabinetDesc}</p>
                  </div>
                  <div className="dc-prof-card-body dc-prof-cabinet-stack">
                    {!currentTenantId ? (
                      <>
                        <p className="dc-prof-desc" style={{ margin: 0 }}>
                          Выберите компанию в сайдбаре, чтобы настроить уведомления.
                        </p>
                        <button type="button" className="dc-prof-btn-gradient" onClick={() => navigate('/companies')}>
                          К списку компаний
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="dc-prof-embed-card">
                          <NotificationSettings currentTenantId={currentTenantId} />
                        </div>
                        <div className="dc-prof-embed-card">
                          <NotificationHistory currentTenantId={currentTenantId} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="dc-prof-tab-panels">
              <div className="dc-prof-stack">
                <div className="dc-prof-card dc-prof-card--section">
                  <div className="dc-prof-card-head">
                    <h3 className="dc-prof-card-title">{T.security.title}</h3>
                    <p className="dc-prof-card-desc">{T.security.description}</p>
                  </div>
                  <div className="dc-prof-card-body dc-prof-security-list">
                    <div className="dc-prof-security-row dc-prof-security-row--border">
                      <div>
                        <div className="dc-prof-notif-row-title">
                          <Lock className="dc-prof-notif-icon" aria-hidden />
                          <span className="dc-prof-label-strong">{T.security.twoFactor}</span>
                        </div>
                        <p className="dc-prof-desc">{T.security.twoFactorDesc}</p>
                      </div>
                      <button type="button" className="dc-prof-btn-outline">
                        {T.security.enable}
                      </button>
                    </div>
                    <div className="dc-prof-security-row dc-prof-security-row--border">
                      <div>
                        <div className="dc-prof-notif-row-title">
                          <Lock className="dc-prof-notif-icon" aria-hidden />
                          <span className="dc-prof-label-strong">{T.security.changePassword}</span>
                        </div>
                        <p className="dc-prof-desc">{T.security.changePasswordDesc}</p>
                      </div>
                      <button type="button" className="dc-prof-btn-outline">
                        {T.security.change}
                      </button>
                    </div>
                    <div className="dc-prof-security-row">
                      <div>
                        <div className="dc-prof-notif-row-title">
                          <Lock className="dc-prof-notif-icon" aria-hidden />
                          <span className="dc-prof-label-strong">{T.security.activeSessions}</span>
                        </div>
                        <p className="dc-prof-desc">{T.security.activeSessionsDesc}</p>
                      </div>
                      <button type="button" className="dc-prof-btn-outline">
                        {T.security.manage}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="dc-prof-tab-panels">
              <div className="dc-prof-stack">
                <div className="dc-prof-card dc-prof-card--section">
                  <div className="dc-prof-card-head">
                    <h3 className="dc-prof-card-title">{T.preferences.title}</h3>
                    <p className="dc-prof-card-desc">{T.preferences.description}</p>
                  </div>
                  <div className="dc-prof-card-body">
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-lang">
                        {T.preferences.language}
                      </label>
                      <select id="prof-lang" className="dc-prof-select" defaultValue="ru">
                        <option value="en">{T.preferences.languages.en}</option>
                        <option value="ru">{T.preferences.languages.ru}</option>
                        <option value="es">{T.preferences.languages.es}</option>
                        <option value="fr">{T.preferences.languages.fr}</option>
                        <option value="de">{T.preferences.languages.de}</option>
                      </select>
                    </div>
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-tz">
                        {T.preferences.timezone}
                      </label>
                      <select id="prof-tz" className="dc-prof-select" defaultValue="pst">
                        <option value="pst">{T.preferences.timezones.pst}</option>
                        <option value="mst">{T.preferences.timezones.mst}</option>
                        <option value="cst">{T.preferences.timezones.cst}</option>
                        <option value="est">{T.preferences.timezones.est}</option>
                      </select>
                    </div>
                    <div className="dc-prof-field">
                      <label className="dc-prof-label" htmlFor="prof-df">
                        {T.preferences.dateFormat}
                      </label>
                      <select id="prof-df" className="dc-prof-select" defaultValue="mdy">
                        <option value="mdy">MM/DD/YYYY</option>
                        <option value="dmy">DD/MM/YYYY</option>
                        <option value="ymd">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="dc-prof-notif-row">
                      <div className="dc-prof-notif-row-text">
                        <span className="dc-prof-label-strong">{T.preferences.darkMode}</span>
                        <p className="dc-prof-desc">{T.preferences.darkModeDesc}</p>
                      </div>
                      <DesignSwitch />
                    </div>
                    <div className="dc-prof-notif-row">
                      <div className="dc-prof-notif-row-text">
                        <span className="dc-prof-label-strong">{T.preferences.compactView}</span>
                        <p className="dc-prof-desc">{T.preferences.compactViewDesc}</p>
                      </div>
                      <DesignSwitch />
                    </div>
                    <div className="dc-prof-actions-end">
                      <button type="button" className="dc-prof-btn-gradient">
                        <Save className="dc-prof-btn-icon" />
                        {T.savePreferences}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
