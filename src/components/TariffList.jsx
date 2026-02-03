import { useState, useEffect } from 'react'
import { getTariffs } from '../api/tariffs'
import Button from './ui/Button'

function TariffList({ onCreateClick, onEditClick }) {
  const [tariffs, setTariffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTariffs()
  }, [])

  const loadTariffs = async () => {
    try {
      setLoading(true)
      const data = await getTariffs()
      setTariffs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="dashboard">Загрузка тарифов...</div>
  if (error) return <div className="dashboard error">{error}</div>

  return (
    <div className="dashboard">
      <h2>Тарифы</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>Список всех доступных тарифов</p>
        <Button variant="success" onClick={onCreateClick}>
          + Создать тариф
        </Button>
      </div>

      {tariffs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Тарифы не найдены
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {tariffs.map((tariff) => (
            <div
              key={tariff.id}
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e1e4e8',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0' }}>{tariff.name}</h4>
                  <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>
                    Канал: {tariff.channel_type} • Период: {tariff.period_days} дней • 
                    Цена: {tariff.price} ₽ • Статус: {tariff.is_active ? 'Активен' : 'Неактивен'}
                  </p>
                </div>
                <Button variant="primary" onClick={() => onEditClick(tariff)}>
                  Редактировать
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TariffList