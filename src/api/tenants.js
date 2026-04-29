import apiClient from './client'

const MOCK_TENANTS = [
  {
    id: 'mock-tenant-1',
    name: 'Mock Tenant 1',
    locale: 'ru_RU',
    payment: 'acquiring',
    status: 'active',
  },
  {
    id: 'mock-tenant-2',
    name: 'Mock Tenant 2',
    locale: 'en_US',
    payment: 'invoice',
    status: 'active',
  }
]

// Получить список тенантов пользователя
export const getTenants = async () => {
  try {
    const response = await apiClient.get('/api/v1/tenant/')
    return response.data
  } catch (error) {
    console.warn('Using mock tenants due to error:', error)
    return MOCK_TENANTS
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
    return { ...data, id: `mock-${Math.random().toString(36).substr(2, 9)}` }
  }
}

// Получить тенант по ID
export const getTenant = async (tenantId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenant/${tenantId}`)
    return response.data
  } catch (error) {
    console.warn('Using mock getTenant due to error:', error)
    return MOCK_TENANTS.find(t => t.id === tenantId) || MOCK_TENANTS[0]
  }
}

// Обновить тенант
export const updateTenant = async (tenantId, data) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenant/${tenantId}`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock updateTenant due to error:', error)
    return { id: tenantId, ...data }
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
    return data
  }
}