import apiClient from './client'

// ============ Notification Settings ============

// Получить все настройки уведомлений тенанта
export const getNotificationSettings = async (tenantId) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/notifications/settings`)
  return response.data
}

// Создать настройку уведомлений
export const createNotificationSettings = async (tenantId, data) => {
  const response = await apiClient.post(`/api/v1/tenants/${tenantId}/notifications/settings`, {
    notification_type: data.notification_type,
    channel: data.channel,
    target: data.target,
    enabled: data.enabled !== undefined ? data.enabled : true,
  })
  return response.data
}

// Получить настройку по ID
export const getNotificationSettingsById = async (tenantId, settingsId) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/notifications/settings/${settingsId}`)
  return response.data
}

// Обновить настройку
export const updateNotificationSettings = async (tenantId, settingsId, data) => {
  const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/notifications/settings/${settingsId}`, data)
  return response.data
}

// Удалить настройку
export const deleteNotificationSettings = async (tenantId, settingsId) => {
  const response = await apiClient.delete(`/api/v1/tenants/${tenantId}/notifications/settings/${settingsId}`)
  return response.data
}

// ============ Notification History ============

// Получить историю уведомлений
export const getNotificationHistory = async (tenantId, params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.limit) queryParams.append('limit', params.limit)
  if (params.offset) queryParams.append('offset', params.offset)
  if (params.notification_type) queryParams.append('notification_type', params.notification_type)
  
  const queryString = queryParams.toString()
  const url = `/api/v1/tenants/${tenantId}/notifications/history${queryString ? `?${queryString}` : ''}`
  
  const response = await apiClient.get(url)
  return response.data
}