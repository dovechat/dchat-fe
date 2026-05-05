import { useState, useEffect } from 'react'
import { getBalance, getBalanceHistory, getPayments } from '../api/billing'
import { Wallet, Gift, Receipt } from 'lucide-react'

function BillingDashboard({ tenantId }) {
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState({ balance: true, history: true, payments: true })
  const [error, setError] = useState('')

  useEffect(() => {
    if (tenantId) {
      loadData()
    }
  }, [tenantId])

  const loadData = async () => {
    try {
      setError('')

      const balanceData = await getBalance(tenantId)
      setBalance(balanceData)
      setLoading((prev) => ({ ...prev, balance: false }))

      const historyData = await getBalanceHistory(tenantId)
      setHistory(historyData)
      setLoading((prev) => ({ ...prev, history: false }))

      const paymentsData = await getPayments(tenantId)
      setPayments(paymentsData)
      setLoading((prev) => ({ ...prev, payments: false }))
    } catch (err) {
      setError(err.message)
      setLoading({ balance: false, history: false, payments: false })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const paymentBadgeClass = (status) => {
    if (status === 'paid') return 'dc-badge dc-badge-green'
    if (status === 'failed') return 'dc-badge dc-badge-red'
    if (status === 'pending') return 'dc-badge dc-badge-amber'
    return 'dc-badge dc-badge-neutral'
  }

  const paymentLabel = (status) => {
    if (status === 'paid') return 'Оплачен'
    if (status === 'failed') return 'Ошибка'
    if (status === 'pending') return 'Ожидание'
    return status
  }

  if (error) {
    return (
      <div className="dc-fe-page">
        <div className="error">{error}</div>
      </div>
    )
  }

  const mainBal = balance ? parseFloat(balance.main_balance) : null
  const bonusBal = balance ? parseFloat(balance.bonus_balance) : null

  return (
    <div className="dc-fe-page dc-fe-stack">
      <div className="dc-fe-header">
        <div>
          <h1 className="dc-fe-title">Биллинг</h1>
          <p className="dc-fe-subtitle">Баланс, операции и платежи по компании</p>
        </div>
      </div>

      <div className="dc-billing-grid">
        <div className="dc-stat-card">
          <div className="dc-stat-inner">
            <div className="dc-stat-row">
              <div>
                <p className="dc-muted-xs" style={{ margin: 0 }}>
                  Основной баланс
                </p>
                <p className="dc-stat-value" style={{ fontSize: '1.75rem' }}>
                  {loading.balance ? '…' : mainBal != null ? `${mainBal.toFixed(2)} ₽` : '—'}
                </p>
              </div>
              <div className="dc-icon-tile">
                <Wallet size={22} />
              </div>
            </div>
          </div>
        </div>
        <div className="dc-stat-card">
          <div className="dc-stat-inner">
            <div className="dc-stat-row">
              <div>
                <p className="dc-muted-xs" style={{ margin: 0 }}>
                  Бонусный баланс
                </p>
                <p className="dc-stat-value" style={{ fontSize: '1.75rem', color: '#15803d' }}>
                  {loading.balance ? '…' : bonusBal != null ? `${bonusBal.toFixed(2)} ₽` : '—'}
                </p>
              </div>
              <div
                className="dc-icon-tile"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                <Gift size={22} />
              </div>
            </div>
          </div>
        </div>
        <div className="dc-stat-card">
          <div className="dc-stat-inner">
            <div className="dc-stat-row">
              <div>
                <p className="dc-muted-xs" style={{ margin: 0 }}>
                  Платежей в истории
                </p>
                <p className="dc-stat-value" style={{ fontSize: '1.75rem' }}>
                  {loading.payments ? '…' : payments.length}
                </p>
              </div>
              <div
                className="dc-icon-tile"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
              >
                <Receipt size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dc-card dc-card-pad">
        <h3
          style={{
            margin: '0 0 1rem',
            fontSize: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          Детализация баланса
        </h3>
        {loading.balance ? (
          <p className="dc-muted">Загрузка баланса...</p>
        ) : balance ? (
          <div className="dc-field-grid">
            <div>
              <p className="dc-muted-xs">Основной</p>
              <p className="dc-strong">{parseFloat(balance.main_balance).toFixed(2)} ₽</p>
            </div>
            <div>
              <p className="dc-muted-xs">Бонусный</p>
              <p className="dc-strong" style={{ color: '#15803d' }}>
                {parseFloat(balance.bonus_balance).toFixed(2)} ₽
              </p>
            </div>
          </div>
        ) : (
          <p className="dc-muted">Нет данных о балансе</p>
        )}
      </div>

      <div className="dc-card dc-card-pad">
        <h3
          style={{
            margin: '0 0 1rem',
            fontSize: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          История операций
        </h3>
        {loading.history ? (
          <p className="dc-muted">Загрузка истории...</p>
        ) : history.length > 0 ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Тип</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.created_at)}</td>
                    <td style={{ color: parseFloat(item.amount) >= 0 ? '#16a34a' : '#dc2626' }}>
                      {parseFloat(item.amount) >= 0 ? '+' : ''}
                      {parseFloat(item.amount).toFixed(2)} ₽
                    </td>
                    <td>{item.balance_type}</td>
                    <td className="dc-muted">{item.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dc-muted" style={{ textAlign: 'center', padding: '1.25rem' }}>
            История операций пуста
          </p>
        )}
      </div>

      <div className="dc-card dc-card-pad">
        <h3
          style={{
            margin: '0 0 1rem',
            fontSize: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          История платежей
        </h3>
        {loading.payments ? (
          <p className="dc-muted">Загрузка платежей...</p>
        ) : payments.length > 0 ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Метод</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.created_at)}</td>
                    <td>{parseFloat(payment.amount).toFixed(2)} ₽</td>
                    <td>
                      <span className={paymentBadgeClass(payment.status)}>
                        {paymentLabel(payment.status)}
                      </span>
                    </td>
                    <td className="dc-muted">{payment.payment_method || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dc-muted" style={{ textAlign: 'center', padding: '1.25rem' }}>
            История платежей пуста
          </p>
        )}
      </div>
    </div>
  )
}

export default BillingDashboard
