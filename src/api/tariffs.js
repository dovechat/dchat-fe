import apiClient from './client'

const MOCK_TARIFFS = [
  { id: 1, name: 'Basic Telegram', channel_type: 'telegram_bot', period: 30, price: 500, is_active: true },
  { id: 2, name: 'Pro WhatsApp', channel_type: 'whatsapp_green', period: 30, price: 1500, is_active: true },
]

export const getTariffs = async () => {
  try {
    const response = await apiClient.get('/api/v1/tariffs/')
    return response.data
  } catch (error) {
    console.warn('Using mock tariffs due to error:', error)
    return MOCK_TARIFFS
  }
}

export const createTariff = async (data) => {
  try {
    const response = await apiClient.post('/api/v1/tariffs/', {
      name: data.name,
      channel_type: data.channel_type,
      period: data.period_days,
      price: data.price,
      is_active: data.is_active !== undefined ? data.is_active : true,
    })
    return response.data
  } catch (error) {
    console.warn('Using mock createTariff due to error:', error)
    return { ...data, id: Math.floor(Math.random() * 1000) }
  }
}

export const updateTariff = async (tariffId, data) => {
  try {
    const response = await apiClient.patch(`/api/v1/tariffs/${tariffId}`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock updateTariff due to error:', error)
    return { id: tariffId, ...data }
  }
}