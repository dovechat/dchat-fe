import apiClient from './client'

// Получить список сотрудников компании
export const getMembers = async (tenantId) => {
  const response = await apiClient.get(`/api/v1/tenants/${tenantId}/members`)
  return response.data
}

// Добавить сотрудника
export const addMember = async (tenantId, data) => {
  const response = await apiClient.post(`/api/v1/tenants/${tenantId}/members`, data)
  return response.data
}

// Удалить сотрудника
export const removeMember = async (tenantId, userId) => {
  const response = await apiClient.delete(`/api/v1/tenants/${tenantId}/members/${userId}`)
  return response.data
}