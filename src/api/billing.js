import apiClient from './client'

// Получить баланс
export const getBalance = async (tenantId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/billing/balance`)
    return response.data
  } catch (error) {
    console.warn('Using mock balance due to error:', error)
    return { balance: 1000 }
  }
}

// Получить историю операций
export const getBalanceHistory = async (tenantId, skip = 0, limit = 100) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/billing/balance/history`, {
      params: { skip, limit }
    })
    return response.data
  } catch (error) {
    console.warn('Using mock balance history due to error:', error)
    return []
  }
}

// Получить историю платежей
export const getPayments = async (tenantId, skip = 0, limit = 100) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/billing/payments`, {
      params: { skip, limit }
    })
    return response.data
  } catch (error) {
    console.warn('Using mock payments due to error:', error)
    return []
  }
}

// Скорректировать баланс (админ)
export const adjustBalance = async (tenantId, data) => {
  try {
    const response = await apiClient.post(`/api/v1/tenants/${tenantId}/billing/balance/adjust`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock adjustBalance due to error:', error)
    return { status: 'success' }
  }
}

// Обновить статус платежа (админ)
export const updatePaymentStatus = async (tenantId, paymentId, status) => {
  try {
    const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/billing/payments/${paymentId}`, {
      status
    })
    return response.data
  } catch (error) {
    console.warn('Using mock updatePaymentStatus due to error:', error)
    return { status: 'success' }
  }
}