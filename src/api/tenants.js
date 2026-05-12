import apiClient from './client'

/** Сессионные правки mock при офлайне (чтобы правки в формах отображались в списке и карточке). */
const mockTenantOverrides = {}

const MOCK_TENANTS = [
  {
    id: 'mock-tenant-1',
    name: 'ООО «Демо‑Торг»',
    locale: 'ru_RU',
    payment: 'acquiring',
    status: 'active',
    address: 'г. Москва, ул. Примерная, д. 1, оф. 101',
    phone: '+7 (495) 000-00-01',
    email: 'office@demo-torg.example',
    inn: '7700000000',
    employee_count: 2,
    banking_details: {
      bank_name: 'ПАО «Примербанк»',
      account_number: '40702810100000000001',
      bic: '044525225',
      corr_account: '30101810400000000225',
      kpp: '770001001',
      currency: 'RUB',
      is_primary: true,
    },
  },
  {
    id: 'mock-tenant-2',
    name: 'ИП Иванов',
    locale: 'en_US',
    payment: 'invoice',
    status: 'active',
    address: '',
    phone: '',
    email: '',
    inn: '',
    employee_count: 0,
    banking_details: null,
  },
]

function getMockTenantBase(id) {
  return MOCK_TENANTS.find((t) => t.id === id) || MOCK_TENANTS[0]
}

function getMockTenantMerged(tenantId) {
  const base = { ...getMockTenantBase(tenantId) }
  const ov = { ...(mockTenantOverrides[tenantId] || {}) }
  const merged = { ...base, ...ov }
  if (Object.prototype.hasOwnProperty.call(ov, 'banking_details')) {
    if (ov.banking_details === null) merged.banking_details = null
    else merged.banking_details = { ...(base.banking_details || {}), ...ov.banking_details }
  }
  return merged
}

function mockTenantListMerged() {
  return MOCK_TENANTS.map((t) => getMockTenantMerged(t.id))
}

// Получить список тенантов пользователя
export const getTenants = async () => {
  try {
    const response = await apiClient.get('/api/v1/tenant/')
    return response.data
  } catch (error) {
    console.warn('Using mock tenants due to error:', error)
    return mockTenantListMerged()
  }
}

// Создать тенант
export const createTenant = async (data) => {
  try {
    const response = await apiClient.post('/api/v1/tenant/create', {
      name: data.name,
      locale: data.locale || 'en_US',
      payment: data.payment || 'acquiring',
      status: data.status || 'active',
    })
    return response.data
  } catch (error) {
    console.warn('Using mock createTenant due to error:', error)
    return {
      ...data,
      id: `mock-${Math.random().toString(36).substr(2, 9)}`,
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      inn: data.inn || '',
      employee_count: data.employee_count != null ? data.employee_count : 0,
      banking_details: null,
    }
  }
}

// Получить тенант по ID
export const getTenant = async (tenantId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenant/${tenantId}`)
    return response.data
  } catch (error) {
    console.warn('Using mock getTenant due to error:', error)
    return getMockTenantMerged(tenantId)
  }
}

// Обновить тенант
export const updateTenant = async (tenantId, data) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenant/${tenantId}`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock updateTenant due to error:', error)
    mockTenantOverrides[tenantId] = { ...(mockTenantOverrides[tenantId] || {}), ...data }
    return getMockTenantMerged(tenantId)
  }
}

// Удалить тенант
export const deleteTenant = async (tenantId) => {
  try {
    const response = await apiClient.delete(`/api/v1/tenant/${tenantId}`)
    return response.data
  } catch (error) {
    console.warn('Using mock deleteTenant due to error:', error)
    return { status: 'success' }
  }
}

// Switch tenant (переключиться на тенант) - ИСПРАВЛЕНО
export const switchTenant = async (tenantId) => {
  console.log('switchTenant called with:', tenantId) // DEBUG
  
  try {
    // Используем query параметр вместо JSON тела
    const response = await apiClient.post(`/api/v1/auth/switch-tenant?tenant_id=${tenantId}`)
    console.log('Switch tenant response:', response.data) // DEBUG
    return response.data
  } catch (error) {
    console.warn('Using mock switchTenant due to error:', error)
    return { 
      status: 'success', 
      tenant_id: tenantId,
      access_token: localStorage.getItem('token') || 'mock-token',
      refresh_token: localStorage.getItem('refresh_token') || 'mock-refresh-token'
    }
  }
}

export const updateBankingRu = async (tenantId, data) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenant/${tenantId}/banking/ru`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock updateBankingRu due to error:', error)
    const prev = getMockTenantMerged(tenantId)
    mockTenantOverrides[tenantId] = {
      ...(mockTenantOverrides[tenantId] || {}),
      banking_details: { ...(prev.banking_details || {}), ...data },
    }
    return getMockTenantMerged(tenantId)
  }
}