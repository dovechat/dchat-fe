import { useState, useEffect } from 'react'
import { getBalance, getBalanceHistory, getPayments } from '../api/billing'
import Button from './ui/Button'

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
      
      // Загружаем баланс
      const balanceData = await getBalance(tenantId)
      setBalance(balanceData)
      setLoading(prev => ({ ...prev, balance: false }))

      // Загружаем историю операций
      const historyData = await getBalanceHistory(tenantId)
      setHistory(historyData)
      setLoading(prev => ({ ...prev, history: false }))

      // Загружаем историю платежей
      const paymentsData = await getPayments(tenantId)
      setPayments(paymentsData)
      setLoading(prev => ({ ...prev, payments: false }))

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
      minute: '2-digit'
    })
  }

  if (error) {
    return <div className="dashboard error">{error}</div>
  }

  return (
    <div className="dashboard">
      <h2>Биллинг</h2>

      {/* Баланс */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #e1e4e8', paddingBottom: '8px' }}>
          Баланс
        </h3>
        
        {loading.balance ? (
          <div>Загрузка баланса...</div>
        ) : balance ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Основной баланс</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>
                {parseFloat(balance.main_balance).toFixed(2)} ₽
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Бонусный баланс</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#27ae60' }}>
                {parseFloat(balance.bonus_balance).toFixed(2)} ₽
              </div>
            </div>
          </div>
        ) : (
          <div>Нет данных о балансе</div>
        )}
      </div>

      {/* История операций */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #e1e4e8', paddingBottom: '8px' }}>
          История операций
        </h3>
        
        {loading.history ? (
          <div>Загрузка истории...</div>
        ) : history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e1e4e8' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', color: '#666' }}>Дата</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', color: '#666' }}>Сумма</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', color: '#666' }}>Тип</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', color: '#666' }}>Описание</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f5f7fa' }}>
                    <td style={{ padding: '12px 0', fontSize: '13px' }}>{formatDate(item.created_at)}</td>
                    <td style={{ padding: '12px 0', fontSize: '13px', color: parseFloat(item.amount) >= 0 ? '#27ae60' : '#e74c3c' }}>
                      {parseFloat(item.amount) >= 0 ? '+' : ''}{parseFloat(item.amount).toFixed(2)} ₽
                    </td>
                    <td style={{ padding: '12px 0', fontSize: '13px' }}>{item.balance_type}</td>
                    <td style={{ padding: '12px 0', fontSize: '13px', color: '#666' }}>{item.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>История операций пуста</div>
        )}
      </div>

      {/* История платежей */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', borderBottom: '1px solid #e1e4e8', paddingBottom: '8px' }}>
          История платежей
        </h3>
        
        {loading.payments ? (
          <div>Загрузка платежей...</div>
        ) : payments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e1e4e8' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', color: '#666' }}>Дата</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', color: '#666' }}>Сумма</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', color: '#666' }}>Статус</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', color: '#666' }}>Метод</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f5f7fa' }}>
                    <td style={{ padding: '12px 0', fontSize: '13px' }}>{formatDate(payment.created_at)}</td>
                    <td style={{ padding: '12px 0', fontSize: '13px' }}>{parseFloat(payment.amount).toFixed(2)} ₽</td>
                    <td style={{ padding: '12px 0', fontSize: '13px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: 
                          payment.status === 'paid' ? '#d4edda' :
                          payment.status === 'failed' ? '#f8d7da' :
                          payment.status === 'pending' ? '#fff3cd' : '#e2e3e5',
                        color: 
                          payment.status === 'paid' ? '#155724' :
                          payment.status === 'failed' ? '#721c24' :
                          payment.status === 'pending' ? '#856404' : '#383d41'
                      }}>
                        {payment.status === 'paid' ? 'Оплачен' :
                         payment.status === 'failed' ? 'Ошибка' :
                         payment.status === 'pending' ? 'Ожидание' : payment.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', fontSize: '13px', color: '#666' }}>{payment.payment_method || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>История платежей пуста</div>
        )}
      </div>
    </div>
  )
}

export default BillingDashboard