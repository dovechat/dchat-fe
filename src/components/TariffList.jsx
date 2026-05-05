import { useState, useEffect } from 'react'
import { getTariffs } from '../api/tariffs'
import { Tags, Plus, Pencil } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="dc-fe-page">
        <p className="dc-muted">Загрузка тарифов...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dc-fe-page">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="dc-fe-page dc-fe-stack">
      <div className="dc-fe-header">
        <div>
          <h1 className="dc-fe-title">Тарифы</h1>
          <p className="dc-fe-subtitle">Цены и периоды по типам каналов</p>
        </div>
        <div className="dc-fe-actions">
          <button type="button" className="dc-btn dc-btn-primary" onClick={onCreateClick}>
            <Plus size={18} />
            Создать тариф
          </button>
        </div>
      </div>

      {tariffs.length === 0 ? (
        <div className="dc-card dc-empty">
          <p className="dc-muted" style={{ marginBottom: '1rem' }}>
            Тарифы не найдены
          </p>
          <button type="button" className="dc-btn dc-btn-primary" onClick={onCreateClick}>
            <Plus size={18} />
            Создать первый тариф
          </button>
        </div>
      ) : (
        <div className="dc-company-grid">
          {tariffs.map((tariff) => (
            <div key={tariff.id} className="dc-card dc-card-pad">
              <div className="dc-company-row">
                <div style={{ display: 'flex', gap: '1rem', minWidth: 0, flex: 1 }}>
                  <div
                    className="dc-icon-tile"
                    style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}
                  >
                    <Tags size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="dc-company-title">{tariff.name}</h3>
                    <div className="dc-field-grid" style={{ marginTop: '0.75rem' }}>
                      <div>
                        <p className="dc-muted-xs">Канал</p>
                        <p className="dc-strong">{tariff.channel_type}</p>
                      </div>
                      <div>
                        <p className="dc-muted-xs">Период</p>
                        <p className="dc-strong">{tariff.period_days} дн.</p>
                      </div>
                      <div>
                        <p className="dc-muted-xs">Цена</p>
                        <p className="dc-strong">{tariff.price} ₽</p>
                      </div>
                      <div>
                        <p className="dc-muted-xs">Статус</p>
                        <p className="dc-strong">
                          {tariff.is_active ? (
                            <span className="dc-badge dc-badge-green">Активен</span>
                          ) : (
                            <span className="dc-badge dc-badge-neutral">Неактивен</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="dc-btn dc-btn-outline"
                  onClick={() => onEditClick(tariff)}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Pencil size={16} />
                  Изменить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TariffList
