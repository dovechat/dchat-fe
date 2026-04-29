import apiClient from './client'

const MOCK_NOTIFICATION_SETTINGS = [
  { id: 1, notification_type: 'balance_low', channel: 'email', target: 'admin@example.com', enabled: true },
  { id: 2, notification_type: 'new_message', channel: 'telegram', target: '@user', enabled: false },
]

const MOCK_NOTIFICATION_HISTORY = [
  { id: 1, notification_type: 'balance_low', message: 'Your balance is below $10', created_at: new Date().toISOString() },
  { id: 2, notification_type: 'payment_success', message: 'Payment of $50 confirmed', created_at: new Date().toISOString() },
]

// ============ Notification Settings ============

// Получить все настройки уведомлений тенанта
export const getNotificationSettings = async (tenantId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/notifications/settings`)
    return response.data
  } catch (error) {
    console.warn('Using mock notification settings due to error:', error)
    return MOCK_NOTIFICATION_SETTINGS
  }
}

// Создать настройку уведомлений
export const createNotificationSettings = async (tenantId, data) => {
  try {
    const response = await apiClient.post(`/api/v1/tenants/${tenantId}/notifications/settings`, {
      notification_type: data.notification_type,
      channel: data.channel,
      target: data.target,
      enabled: data.enabled !== undefined ? data.enabled : true,
    })
    return response.data
  } catch (error) {
    console.warn('Using mock createNotificationSettings due to error:', error)
    return { ...data, id: Math.floor(Math.random() * 1000) }
  }
}

// Получить настройку по ID
export const getNotificationSettingsById = async (tenantId, settingsId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/notifications/settings/${settingsId}`)
    return response.data
  } catch (error) {
    console.warn('Using mock getNotificationSettingsById due to error:', error)
    return MOCK_NOTIFICATION_SETTINGS.find(s => s.id === settingsId) || MOCK_NOTIFICATION_SETTINGS[0]
  }
}

// Обновить настройку
export const updateNotificationSettings = async (tenantId, settingsId, data) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/notifications/settings/${settingsId}`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock updateNotificationSettings due to error:', error)
    return { id: settingsId, ...data }
  }
}

// Удалить настройку
export const deleteNotificationSettings = async (tenantId, settingsId) => {
  try {
    const response = await apiClient.delete(`/api/v1/tenants/${tenantId}/notifications/settings/${settingsId}`)
    return response.data
  } catch (error) {
    console.warn('Using mock deleteNotificationSettings due to error:', error)
    return { status: 'success' }
  }
}

// ============ Notification History ============

// Получить историю уведомлений
export const getNotificationHistory = async (tenantId, params = {}) => {
  try {
    const queryParams = new URLSearchParams()
    
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.offset) queryParams.append('offset', params.offset)
    if (params.notification_type) queryParams.append('notification_type', params.notification_type)
    
    const queryString = queryParams.toString()
    const url = `/api/v1/tenants/${tenantId}/notifications/history${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.warn('Using mock notification history due to error:', error)
    return MOCK_NOTIFICATION_HISTORY
  }
}