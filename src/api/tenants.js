import apiClient from './client'

// Получить список тенантов пользователя
export const getTenants = async () => {
  const response = await apiClient.get('/api/v1/tenant/')
  return response.data
}

// Создать тенант
export const createTenant = async (data) => {
  const response = await apiClient.post('/api/v1/tenant/create', {
    name: data.name,
    locale: data.locale || 'en_US',
    payment: data.payment || 'acquiring',
    status: data.status || 'active',
  })
  return response.data
}

// Получить тенант по ID
export const getTenant = async (tenantId) => {
  const response = await apiClient.get(`/api/v1/tenant/${tenantId}`)
  return response.data
}

// Обновить тенант
export const updateTenant = async (tenantId, data) => {
  const response = await apiClient.patch(`/api/v1/tenant/${tenantId}`, data)
  return response.data
}

// Удалить тенант
export const deleteTenant = async (tenantId) => {
  const response = await apiClient.delete(`/api/v1/tenant/${tenantId}`)
  return response.data
}

// Switch tenant (переключиться на тенант) - ИСПРАВЛЕНО
export const switchTenant = async (tenantId) => {
  console.log('switchTenant called with:', tenantId) // DEBUG
  
  // Используем query параметр вместо JSON тела
  const response = await apiClient.post(`/api/v1/auth/switch-tenant?tenant_id=${tenantId}`)
  console.log('Switch tenant response:', response.data) // DEBUG
  return response.data
}

export const updateBankingRu = async (tenantId, data) => {
  const response = await apiClient.patch(`/api/v1/tenant/${tenantId}/banking/ru`, data)
  return response.data
}