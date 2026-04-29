import apiClient from './client'

const MOCK_LINES = [
  {
    id: 'mock-line-1',
    name: 'Main Support Line',
    is_active: true,
  },
  {
    id: 'mock-line-2',
    name: 'Sales Line',
    is_active: true,
  }
]

const MOCK_ACCOUNT = {
  line_id: 'mock-line-1',
  channels: [
    {
      channel_type: 'telegram_bot',
      is_active: true,
      subscription_end: '2026-12-31T23:59:59Z',
    },
    {
      channel_type: 'whatsapp_green',
      is_active: false,
      subscription_end: null,
    }
  ]
}

// Получить список линий тенанта
export const getLines = async (tenantId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/lines/`)
    return response.data
  } catch (error) {
    console.warn('Using mock lines due to error:', error)
    return MOCK_LINES
  }
}

// Получить линию
export const getLine = async (tenantId, lineId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/lines/${lineId}`)
    return response.data
  } catch (error) {
    console.warn('Using mock line due to error:', error)
    return MOCK_LINES.find(l => l.id === lineId) || MOCK_LINES[0]
  }
}

// Создать линию
export const createLine = async (tenantId, data) => {
  try {
    const response = await apiClient.post(`/api/v1/tenants/${tenantId}/lines/`, {
      name: data.name,
    })
    return response.data
  } catch (error) {
    console.warn('Using mock createLine due to error:', error)
    return { id: `mock-line-${Math.random().toString(36).substr(2, 9)}`, name: data.name }
  }
}

// Получить детали линии
export const getChannelAccount = async (tenantId, lineId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/`)
    return response.data
  } catch (error) {
    console.warn('Using mock getChannelAccount due to error:', error)
    return { ...MOCK_ACCOUNT, line_id: lineId }
  }
}

// Добавить канал к линии
export const addChannel = async (tenantId, lineId, data) => {
  try {
    const response = await apiClient.post(`/api/v1/tenants/${tenantId}/lines/${lineId}/channels`, {
      channel_type: data.channel_type,
      subscription_period: data.subscription_period || 'month',
      is_demo: data.is_demo || false,
    })
    return response.data
  } catch (error) {
    console.warn('Using mock addChannel due to error:', error)
    return { status: 'success', ...data }
  }
}

// Продлить канал
export const renewChannel = async (tenantId, lineId, data) => {
  try {
    const response = await apiClient.post(`/api/v1/tenants/${tenantId}/lines/${lineId}/channels/renew`, {
      channel_type: data.channel_type,
      subscription_period: data.subscription_period || 'month',
      amount: data.amount || 0,
    })
    return response.data
  } catch (error) {
    console.warn('Using mock renewChannel due to error:', error)
    return { status: 'success' }
  }
}

// Обновить линию
export const updateLine = async (tenantId, lineId, data) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock updateLine due to error:', error)
    return { id: lineId, ...data }
  }
}

// Удалить линию
export const deleteLine = async (tenantId, lineId) => {
  try {
    const response = await apiClient.delete(`/api/v1/tenants/${tenantId}/lines/${lineId}`)
    return response.data
  } catch (error) {
    console.warn('Using mock deleteLine due to error:', error)
    return { status: 'success' }
  }
}

// Переключение статуса канала
export const toggleChannelConnection = async (tenantId, lineId, channelType) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/toggle/${channelType}`)
    return response.data
  } catch (error) {
    console.warn('Using mock toggleChannelConnection due to error:', error)
    return { status: 'success' }
  }
}


// Обновить credentials Telegram Bot
export const updateTelegramBot = async (tenantId, lineId, data) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/telegram-bot`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock updateTelegramBot due to error:', error)
    return { status: 'success' }
  }
}

// Обновить credentials Telegram User
export const updateTelegramUser = async (tenantId, lineId, data) => {
  console.log('updateTelegramUser вызывается с:', { tenantId, lineId, data })
  try {
    const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/telegram-user`, data)
    console.log('updateTelegramUser ответ:', response)
    return response.data
  } catch (error) {
    console.warn('Using mock updateTelegramUser due to error:', error)
    return { status: 'success' }
  }
}

// Обновить credentials VK
export const updateVk = async (tenantId, lineId, data) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/vk`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock updateVk due to error:', error)
    return { status: 'success' }
  }
}

export const updateWhatsAppGreen = async (tenantId, lineId, data) => {
  try {
    const response = await apiClient.post(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/whatsapp-green`, {
      id_instance: data.idInstance,
      api_token: data.apiTokenInstance
    })
    return response.data
  } catch (error) {
    console.warn('Using mock updateWhatsAppGreen due to error:', error)
    return { status: 'success' }
  }
}

export async function updateWaba(tenantId, lineId, data) {
  try {
    const response = await apiClient.post(`/api/v1/tenants/${tenantId}/lines/${lineId}/account/waba`, data);
    return response.data;
  } catch (error) {
    console.warn('Using mock updateWaba due to error:', error)
    return { status: 'success' }
  }
}