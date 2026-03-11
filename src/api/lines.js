import apiClient from './client'

// Получить список линий тенанта
export const getLines = async (tenantId) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/lines/`)
  return response.data
}

// Создать линию
export const createLine = async (tenantId, data) => {
  const response = await apiClient.post(`/api/v1/tenants/${tenantId}/lines/`, {
    name: data.name,
    channel_type: data.channel_type,
    subscription_period: data.subscription_period || 'month',
    is_demo: data.is_demo || false,
  })
  return response.data
}

// Получить детали линии
export const getLine = async (tenantId, lineId) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/lines/${lineId}`)
  return response.data
}

// Обновить линию
export const updateLine = async (tenantId, lineId, data) => {
  const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}`, data)
  return response.data
}

// Удалить линию
export const deleteLine = async (tenantId, lineId) => {
  const response = await apiClient.delete(`/api/v1/tenants/${tenantId}/lines/${lineId}`)
  return response.data
}



// Получить информацию об аккаунте канала
export const getChannelAccount = async (tenantId, lineId) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/`)
  return response.data
}

// Обновить credentials Telegram Bot
export const updateTelegramBot = async (tenantId, lineId, data) => {
  const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/telegram-bot`, data)
  return response.data
}

// Обновить credentials Telegram User
export const updateTelegramUser = async (tenantId, lineId, data) => {
  console.log('updateTelegramUser вызывается с:', { tenantId, lineId, data })
  const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/telegram-user`, data)
  console.log('updateTelegramUser ответ:', response)
  return response.data
}

// Обновить credentials VK
export const updateVk = async (tenantId, lineId, data) => {
  const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/vk`, data)
  return response.data
}

export const updateWhatsAppGreen = async (tenantId, lineId, data) => {
  const response = await apiClient.post(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/whatsapp-green`, {
    id_instance: data.idInstance,
    api_token: data.apiTokenInstance
  })
  return response.data
}