import apiClient from './client'

// Получить баланс
export const getBalance = async (tenantId) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/billing/balance`)
  return response.data
}

// Получить историю операций
export const getBalanceHistory = async (tenantId, skip = 0, limit = 100) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/billing/balance/history`, {
    params: { skip, limit }
  })
  return response.data
}

// Получить историю платежей
export const getPayments = async (tenantId, skip = 0, limit = 100) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/billing/payments`, {
    params: { skip, limit }
  })
  return response.data
}

// Скорректировать баланс (админ)
export const adjustBalance = async (tenantId, data) => {
  const response = await apiClient.post(`/api/v1/tenants/${tenantId}/billing/balance/adjust`, data)
  return response.data
}

// Обновить статус платежа (админ)
export const updatePaymentStatus = async (tenantId, paymentId, status) => {
  const response = await apiClient.patch(`/api/v1/tenants/${tenantId}/billing/payments/${paymentId}`, {
    status
  })
  return response.data
}