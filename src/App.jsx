import { useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import VerifyEmail from './components/VerifyEmail'
import AppShell from './components/AppShell'
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
import ChannelAccount from './components/ChannelAccount'
import { getChannelAccount } from './api/lines'
import { useState } from 'react'

function App() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [pendingEmail, setPendingEmail] = useState(null)
  const [pendingToken, setPendingToken] = useState(null)
  const [currentTenant, setCurrentTenant] = useState(null)
  const [tenantLoading, setTenantLoading] = useState(() => !!localStorage.getItem('token'))

  useEffect(() => {
    if (!isAuthenticated) {
      if (!localStorage.getItem('token')) {
        setTenantLoading(false)
      }
      return
    }
    const token = localStorage.getItem('token')
    if (!token) {
      setTenantLoading(false)
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.tenant_id) {
        getTenant(payload.tenant_id)
          .then(tenantData => setCurrentTenant(tenantData))
          .catch(() => setCurrentTenant({ id: payload.tenant_id }))
          .finally(() => setTenantLoading(false))
      } else {
        setTenantLoading(false)
      }
    } catch (e) {
      console.error('Ошибка декодирования токена:', e)
      setTenantLoading(false)
    }
  }, [isAuthenticated])

  if (loading) return <div className="dashboard">Загрузка...</div>

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/verify" element={
          <VerifyEmail
            email={pendingEmail}
            tempToken={pendingToken}
            onBack={() => { setPendingEmail(null); setPendingToken(null); navigate('/login') }}
            onVerified={() => { setPendingEmail(null); setPendingToken(null); navigate('/login') }}
          />
        } />
        <Route path="/register" element={
          <Register
            onSwitchToLogin={() => navigate('/login')}
            onRegistered={(email, token) => { setPendingEmail(email); setPendingToken(token); navigate('/verify') }}
          />
        } />
        <Route path="/login" element={<Login onSwitchToRegister={() => navigate('/register')} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const handleTenantSelected = async (tenantId) => {
    try {
      const tenantData = await getTenant(tenantId)
      setCurrentTenant(tenantData)
    } catch {
      setCurrentTenant({ id: tenantId })
    }
  }

  return (
    <AppShell currentCompany={currentTenant}>
      <Routes>
        <Route path="/" element={<Navigate to="/companies" replace />} />

        <Route path="/companies" element={
          <TenantList
            currentTenantId={currentTenant?.id}
            onTenantClick={(tenant) => navigate(`/companies/${tenant.id}`)}
            onCreateClick={() => navigate('/companies/create')}
            onTenantSelected={handleTenantSelected}
          />
        } />
        <Route path="/companies/create" element={
          <CreateTenant
            onCreated={() => navigate('/companies')}
            onCancel={() => navigate('/companies')}
          />
        } />
        <Route path="/companies/:tenantId" element={
          <TenantDetailsWrapper onTenantSelected={handleTenantSelected} />
        } />
        <Route path="/companies/:tenantId/edit" element={
          <EditTenantWrapper />
        } />
        <Route path="/companies/:tenantId/banking" element={
          <BankingWrapper />
        } />
        <Route path="/tenants/*" element={<Navigate to="/companies" replace />} />

        <Route path="/tariffs" element={
          <TariffList
            onCreateClick={() => navigate('/tariffs/create')}
            onEditClick={(tariff) => navigate(`/tariffs/${tariff.id}/edit`, { state: { tariff } })}
          />
        } />
        <Route path="/tariffs/create" element={
          <CreateTariff
            onCreated={() => navigate('/tariffs')}
            onCancel={() => navigate('/tariffs')}
          />
        } />
        <Route path="/tariffs/:tariffId/edit" element={
          <EditTariffWrapper />
        } />

        <Route path="/billing" element={
          tenantLoading ? null : currentTenant?.id
            ? <BillingDashboard tenantId={currentTenant.id} />
            : <Navigate to="/companies" replace />
        } />

        <Route path="/lines" element={
          tenantLoading ? null : currentTenant?.id
            ? <LineList
                tenantId={currentTenant.id}
                companyName={currentTenant?.name || ''}
                onCreateClick={() => navigate('/lines/create')}
                onLineClick={(line) => navigate(`/lines/${line.id}`)}
              />
            : <Navigate to="/companies" replace />
        } />

        <Route path="/lines/create" element={
          tenantLoading ? null : currentTenant?.id
            ? <CreateLine
                tenantId={currentTenant.id}
                onCreated={() => navigate('/lines')}
                onCancel={() => navigate('/lines')}
              />
            : <Navigate to="/companies" replace />
        } />

        <Route path="/lines/:lineId" element={
          (() => { return tenantLoading ? null : currentTenant?.id
            ? <LineDetailsWrapper tenantId={currentTenant.id} />
            : <Navigate to="/companies" replace /> })()
        } />

        <Route path="/lines/:lineId/channel/:channelType" element={
          tenantLoading ? null : currentTenant?.id
            ? <ChannelAccountWrapper tenantId={currentTenant.id} />
            : <Navigate to="/companies" replace />
        } />

        <Route path="/lines/:lineId/renew" element={
          tenantLoading ? null : currentTenant?.id
            ? <RenewLineWrapper tenantId={currentTenant.id} />
            : <Navigate to="/companies" replace />
        } />

        <Route path="/lines/:lineId/add-channel" element={
          tenantLoading ? null : currentTenant?.id
            ? <AddChannelWrapper tenantId={currentTenant.id} />
            : <Navigate to="/companies" replace />
        } />


        <Route path="/notifications" element={
          <div className="dashboard">
            <header className="page-hero">
              <h1 className="page-title-gradient">Уведомления</h1>
              <p className="page-hero-sub">Настройки и история для текущей компании</p>
            </header>
            <div className="surface-card">
              <NotificationSettings currentTenantId={currentTenant?.id} />
            </div>
            <div className="surface-card">
              <NotificationHistory currentTenantId={currentTenant?.id} />
            </div>
          </div>
        } />

        <Route path="*" element={<Navigate to="/companies" replace />} />
      </Routes>
    </AppShell>
  )
}

function TenantDetailsWrapper({ onTenantSelected }) {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)

  useEffect(() => {
    getTenant(tenantId).then(t => { setTenant(t); onTenantSelected(tenantId) }).catch(() => {})
  }, [tenantId])

  if (!tenant) return <div className="dashboard">Загрузка...</div>
  return (
    <TenantDetails
      tenant={tenant}
      onEdit={() => navigate(`/companies/${tenantId}/edit`)}
      onEditBanking={() => navigate(`/companies/${tenantId}/banking`)}
      onBack={() => navigate('/companies')}
    />
  )
}

function EditTenantWrapper() {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)

  useEffect(() => {
    getTenant(tenantId).then(setTenant).catch(() => {})
  }, [tenantId])

  if (!tenant) return <div className="dashboard">Загрузка...</div>
  return (
    <EditTenant
      tenant={tenant}
      onSaved={() => navigate('/companies')}
      onCancel={() => navigate(`/companies/${tenantId}`)}
    />
  )
}

function BankingWrapper() {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)

  useEffect(() => {
    getTenant(tenantId).then(setTenant).catch(() => {})
  }, [tenantId])

  if (!tenant) return <div className="dashboard">Загрузка...</div>
  return (
    <BankingDetailsRu
      tenant={tenant}
      onSaved={() => navigate('/companies')}
      onCancel={() => navigate(`/companies/${tenantId}`)}
    />
  )
}

function EditTariffWrapper() {
  const { tariffId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()

  if (!state?.tariff) return <Navigate to="/tariffs" replace />
  return (
    <EditTariff
      tariff={state.tariff}
      onSaved={() => navigate('/tariffs')}
      onCancel={() => navigate('/tariffs')}
    />
  )
}

function LineDetailsWrapper({ tenantId }) {
  const { lineId } = useParams()
  const navigate = useNavigate()
  return (
    <LineDetails
      tenantId={tenantId}
      lineId={lineId}
      onBack={() => navigate('/lines')}
      onDeleted={() => navigate('/lines')}
    />
  )
}

function ChannelAccountWrapper({ tenantId }) {
  const { lineId, channelType } = useParams()
  const navigate = useNavigate()
  return (
    <ChannelAccount
      tenantId={tenantId}
      lineId={lineId}
      channelType={channelType}
      onBack={() => navigate(`/lines/${lineId}`)}
    />
  )
}



function RenewLineWrapper({ tenantId }) {
  const { lineId } = useParams()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    getChannelAccount(tenantId, lineId)
      .then(data => setAccounts(Array.isArray(data) ? data : [data]))
      .catch(() => {})
  }, [lineId])

  return (
    <CreateLine
      tenantId={tenantId}
      lineId={lineId}
      existingChannels={accounts}
      renewMode={true}
      onCreated={() => navigate(`/lines/${lineId}`)}
      onCancel={() => navigate(`/lines/${lineId}`)}
    />
  )
}

function AddChannelWrapper({ tenantId }) {
  const { lineId } = useParams()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    getChannelAccount(tenantId, lineId)
      .then(data => setAccounts(Array.isArray(data) ? data : [data]))
      .catch(() => {})
  }, [lineId])

  return (
    <CreateLine
      tenantId={tenantId}
      lineId={lineId}
      existingChannels={accounts}
      onCreated={() => navigate(`/lines/${lineId}`)}
      onCancel={() => navigate(`/lines/${lineId}`)}
    />
  )
}



export default App