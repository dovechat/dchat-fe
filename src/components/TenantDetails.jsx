import Button from './ui/Button'
import MembersList from './MembersList'

function TenantDetails({ tenant, onEdit, onEditBanking, onBack }) {
  return (
    <div className="dashboard">
      <div className="page-hero" style={{ marginBottom: '1.25rem' }}>
        <Button variant="secondary" onClick={onBack} style={{ marginBottom: '12px' }}>
          ← Назад к списку
        </Button>
        <h1 className="page-title-gradient">{tenant.name}</h1>
        <p className="page-hero-sub">Карточка компании</p>
      </div>

      <div className="surface-card">
        <h3>Основная информация</h3>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <strong>Название:</strong> {tenant.name}
          </div>
          <div>
            <strong>ID:</strong> <code style={{ fontSize: '12px', background: '#f5f7fa', padding: '2px 6px', borderRadius: '4px' }}>{tenant.id}</code>
          </div>
          <div>
            <strong>Локаль:</strong> {tenant.locale}
          </div>
          <div>
            <strong>Способ оплаты:</strong> {tenant.payment}
          </div>
          <div>
            <strong>Статус:</strong> {tenant.status}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <Button variant="primary" onClick={onEdit}>
            Редактировать
          </Button>
        </div>
      </div>

      <div className="surface-card">
        <h3>Банковские реквизиты (RU)</h3>

        {tenant.banking_details ? (
          <>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
              <div>
                <strong>Банк:</strong> {tenant.banking_details.bank_name}
              </div>
              <div>
                <strong>Номер счёта:</strong> {tenant.banking_details.account_number}
              </div>
              <div>
                <strong>БИК:</strong> {tenant.banking_details.bic}
              </div>
              <div>
                <strong>Корр. счёт:</strong> {tenant.banking_details.corr_account}
              </div>
              <div>
                <strong>КПП:</strong> {tenant.banking_details.kpp}
              </div>
              <div>
                <strong>Валюта:</strong> {tenant.banking_details.currency}
              </div>
              <div>
                <strong>Основной счёт:</strong> {tenant.banking_details.is_primary ? 'Да' : 'Нет'}
              </div>
            </div>
            <Button variant="primary" onClick={onEditBanking}>
              Редактировать реквизиты
            </Button>
          </>
        ) : (
          <div>
            <p style={{ color: '#666', marginBottom: '16px' }}>Реквизиты не заполнены</p>
            <Button variant="success" onClick={onEditBanking}>
              Добавить реквизиты
            </Button>
          </div>
        )}
      </div>

      <div className="surface-card">
        <MembersList tenantId={tenant.id} />
      </div>
    </div>
  )
}

export default TenantDetails