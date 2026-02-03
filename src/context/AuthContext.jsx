import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, verify as apiVerify } from '../api/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Инициализация - проверяем есть ли токен в localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('user_email')
    
    if (savedToken) {
      setToken(savedToken)
      setUser(savedEmail ? { email: savedEmail } : null)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    setToken(data.access_token)
    setUser({ email })
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user_email', email)
    return data
  }

  const register = async (email, phone, password, ifsms) => {
    const data = await apiRegister(email, phone, password, ifsms)
    return data // Возвращаем токен для верификации
  }

  const verify = async (tempToken, code) => {
    const data = await apiVerify(tempToken, code)
    return data
  }

  // Новая функция для обновления токена (например, после switch-tenant)
  const updateToken = (newToken, newRefreshToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_email')
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verify,
    logout,
    updateToken,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}