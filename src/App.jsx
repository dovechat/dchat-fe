import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import VerifyEmail from './components/VerifyEmail'
import Header from './components/Header'
import TenantList from './components/TenantList'
import TenantDetails from './components/TenantDetails'
import CreateTenant from './components/CreateTenant'
import { getTenant } from './api/tenants'
import EditTenant from './components/EditTenant'
import BankingDetailsRu from './components/BankingDetailsRu'
import TariffList from './components/TariffList'
import CreateTariff from './components/CreateTariff'
import EditTariff from './components/EditTariff'
import BillingDashboard from './components/BillingDashboard'
import LineList from './components/LineList'
import CreateLine from './components/CreateLine'
import LineDetails from './components/LineDetails'
import NotificationHistory from './components/NotificationHistory'
import NotificationSettings from './components/NotificationSettings'


function App() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [view, setView] = useState('login')
  const [pendingEmail, setPendingEmail] = useState(null)
  const [pendingToken, setPendingToken] = useState(null)
  const [currentTenant, setCurrentTenant] = useState(null)
  const [editingTenant, setEditingTenant] = useState(null)
  const [editingTariff, setEditingTariff] = useState(null)
  const [selectedLine, setSelectedLine] = useState(null)
  const [creatingLine, setCreatingLine] = useState(false)

useEffect(() => {
  if (isAuthenticated) {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.tenant_id) {
          // Запросим данные тенанта
          const fetchTenantData = async () => {
            try {
              const tenantData = await getTenant(payload.tenant_id)
              setCurrentTenant(tenantData)
            } catch (err) {
              console.error('Ошибка загрузки данных тенанта:', err)
              setCurrentTenant({ id: payload.tenant_id })
            }
          }
          fetchTenantData()
        }
      } catch (e) {
        console.error('Ошибка декодирования токена:', e)
      }
    }
    setView('tenants')
  }
}, [isAuthenticated])

  if (loading) {
    return <div className="dashboard">Загрузка...</div>
  }

  // === AUTH VIEWS ===
  if (!isAuthenticated) {
    const handleRegistered = (email, token) => {
      setPendingEmail(email)
      setPendingToken(token)
      setView('verify')
    }

    const handleVerified = () => {
      alert('Email подтверждён! Теперь можете войти.')
      setPendingEmail(null)
      setPendingToken(null)
      setView('login')
    }

    const handleBackToLogin = () => {
      setPendingEmail(null)
      setPendingToken(null)
      setView('login')
    }

    if (view === 'verify') {
      return (
        <VerifyEmail
          email={pendingEmail}
          tempToken={pendingToken}
          onBack={handleBackToLogin}
          onVerified={handleVerified}
        />
      )
    }

    if (view === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setView('login')}
          onRegistered={handleRegistered}
        />
      )
    }

    return <Login onSwitchToRegister={() => setView('register')} />
  }

  // === HANDLERS ===
  const handleNavigate = (section) => {
    setView(section)
    if (section === 'tenants' || section === 'tariffs' || section === 'notifications') {
      setEditingTenant(null)
      setEditingTariff(null)
    }
  }

  const handleTenantSelected = async (tenantId) => {
    try {
      const tenantData = await getTenant(tenantId)
      setCurrentTenant(tenantData)
    } catch (err) {
      setCurrentTenant({ id: tenantId })
    }
  }

  const handleTenantClick = (tenant) => {
    setEditingTenant(tenant)
    setView('view-tenant')
  }

  const handleEditTenant = (tenant, tab = 'main') => {
    setEditingTenant({ ...tenant, tab })
    setView('edit-tenant')
  }

  const handleTenantCreated = () => {
    setView('tenants')
  }

  // === MAIN APP ===
  return (
    <>
      <Header currentTenant={currentTenant} onNavigate={handleNavigate} />

      {view === 'tariffs' && (
        <>
          {editingTariff ? (
            editingTariff.mode === 'edit' ? (
              <EditTariff
                tariff={editingTariff}
                onSaved={() => {
                  setEditingTariff(null)
                  setView('tariffs')
                }}
                onCancel={() => {
                  setEditingTariff(null)
                  setView('tariffs')
                }}
              />
            ) : (
              <CreateTariff
                onCreated={() => {
                  setEditingTariff(null)
                  setView('tariffs')
                }}
                onCancel={() => {
                  setEditingTariff(null)
                  setView('tariffs')
                }}
              />
            )
          ) : (
            <TariffList
              onCreateClick={() => {
                setEditingTariff({ mode: 'create' })
                setView('tariffs')
              }}
              onEditClick={(tariff) => {
                setEditingTariff({ ...tariff, mode: 'edit' })
                setView('tariffs')
              }}
            />
          )}
        </>
      )}

      {view === 'create-tenant' && (
        <CreateTenant
          onCreated={handleTenantCreated}
          onCancel={() => setView('tenants')}
        />
      )}

      {view === 'tenants' && (
        <TenantList
          currentTenantId={currentTenant?.id}
          onTenantClick={handleTenantClick}
          onCreateClick={() => setView('create-tenant')}
          onTenantSelected={handleTenantSelected}
        />
      )}

      {view === 'view-tenant' && editingTenant && (
        <TenantDetails
          tenant={editingTenant}
          onEdit={() => {
            setView('edit-tenant')
            setEditingTenant({ ...editingTenant, tab: 'main' })
          }}
          onEditBanking={() => {
            setView('edit-tenant')
            setEditingTenant({ ...editingTenant, tab: 'banking' })
          }}
          onBack={() => setView('tenants')}
        />
      )}


      {view === 'edit-tenant' && editingTenant && (
        <>
          {editingTenant.tab === 'banking' ? (
            <BankingDetailsRu
              tenant={editingTenant}
              onSaved={() => setView('tenants')}
              onCancel={() => setView('tenants')}
            />
          ) : (
            <EditTenant
              tenant={editingTenant}
              onSaved={() => setView('tenants')}
              onCancel={() => setView('tenants')}
            />
          )}
        </>
      )}



      {view === 'billing' && currentTenant?.id && (
        <BillingDashboard tenantId={currentTenant.id} />
      )}


      {view === 'lines' && currentTenant?.id && (
        <>
          {selectedLine ? (
            <LineDetails
              tenantId={currentTenant.id}
              lineId={selectedLine.id}
              onBack={() => {
                setSelectedLine(null)
                setView('lines')
              }}
              onDeleted={() => {
                setSelectedLine(null)
                setView('lines')
              }}
            />
          ) : creatingLine ? (
            <CreateLine
              tenantId={currentTenant.id}
              onCreated={() => {
                setCreatingLine(false)
                setView('lines')
              }}
              onCancel={() => {
                setCreatingLine(false)
                setView('lines')
              }}
            />
          ) : (
            <LineList
              tenantId={currentTenant.id}
              onCreateClick={() => setCreatingLine(true)}
              onLineClick={(line) => setSelectedLine(line)}
            />
          )}
        </>
      )}

      {view === 'notifications' && (
        <div style={{ padding: '24px' }}>
          <NotificationSettings currentTenantId={currentTenant?.id} />
          <hr style={{ margin: '32px 0' }} />
          <NotificationHistory currentTenantId={currentTenant?.id} />
        </div>
      )}


    </>
  )
}

export default App
