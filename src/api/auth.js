import apiClient from './client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8070'

export const register = async (email, phone, password, ifsms) => {
  const response = await apiClient.post('/api/v1/auth/register', {
    email,
    phone,
    password,
    ifsms,
  })
  return response.data
}

export const verify = async (token, code) => {
  // Для verify используем временный токен, не из localStorage
  const response = await apiClient.post(
    `/api/v1/auth/verify?code=${code}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}

export const login = async (username, password) => {
  // Login использует form-urlencoded, поэтому fetch
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Ошибка входа')
  }

  return await response.json()
}