import apiClient from './client'

/** In-memory участники для mock / офлайна (по tenantId). */
const mockMembersByTenant = {
  'mock-tenant-1': [
    {
      user_id: 'demo-admin-1',
      role: 'admin',
      user: { email: 'owner@demo-torg.example' },
    },
    {
      user_id: 'demo-op-1',
      role: 'member',
      user: { email: 'operator@demo-torg.example' },
    },
  ],
  'mock-tenant-2': [],
}

function cloneMembers(tenantId) {
  const list = mockMembersByTenant[tenantId] || []
  return list.map((m) => ({ ...m, user: m.user ? { ...m.user } : undefined }))
}

// Получить список сотрудников тенанта
export const getMembers = async (tenantId) => {
  try {
    const response = await apiClient.get(`/api/v1/tenants/${tenantId}/members`)
    return response.data
  } catch (error) {
    console.warn('Using mock getMembers:', error?.message || error)
    return cloneMembers(tenantId)
  }
}

// Добавить сотрудника
export const addMember = async (tenantId, data) => {
  try {
    const response = await apiClient.post(`/api/v1/tenants/${tenantId}/members`, data)
    return response.data
  } catch (error) {
    console.warn('Using mock addMember:', error?.message || error)
    if (!mockMembersByTenant[tenantId]) mockMembersByTenant[tenantId] = []
    const email = (data.email || '').trim()
    const role = data.role === 'admin' ? 'admin' : 'member'
    const user_id = `mock-user-${Date.now()}`
    const row = { user_id, role, user: { email: email || `user-${user_id}@example.com` } }
    mockMembersByTenant[tenantId] = [...mockMembersByTenant[tenantId], row]
    return row
  }
}

// Удалить сотрудника
export const removeMember = async (tenantId, userId) => {
  try {
    const response = await apiClient.delete(`/api/v1/tenants/${tenantId}/members/${userId}`)
    return response.data
  } catch (error) {
    console.warn('Using mock removeMember:', error?.message || error)
    const list = mockMembersByTenant[tenantId]
    if (list) {
      mockMembersByTenant[tenantId] = list.filter((m) => m.user_id !== userId && m.id !== userId)
    }
    return { status: 'ok' }
  }
}
