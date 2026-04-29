import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8070'

// Создаём axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Автоматически добавляем токен к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если сервер не отвечает (Network Error), пробуем вернуть моковые данные в вызывающей функции
    // или здесь, если мы хотим глобальный мок. Но лучше в конкретных API методах.
    
    if (error.response?.status === 401) {
      // Токен невалидный - выкидываем на логин
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default apiClient