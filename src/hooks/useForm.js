import { useState } from 'react'

export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    })
    // Очистить ошибку при изменении поля
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (callback, validate) => {
    return async (e) => {
      e.preventDefault()
      setErrors({})

      // Валидация если есть
      if (validate) {
        const validationErrors = validate(values)
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors)
          return
        }
      }

      setLoading(true)
      try {
        await callback(values)
      } catch (error) {
        setErrors({ submit: error.message })
      } finally {
        setLoading(false)
      }
    }
  }

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setLoading,
    setErrors,
  }
}