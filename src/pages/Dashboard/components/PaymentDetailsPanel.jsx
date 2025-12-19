import React from 'react';

function ProfileAvatar({ photo, name }) {
  return (
    <div className="dash-profile">
      <div className="dash-profile__avatar">
        <div className="dash-profile__avatarInner">
          <img 
            src={photo} 
            alt={name} 
            style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }} 
          />
        </div>
      </div>
      <div className="dash-profile__name">{name}</div>
    </div>
  );
}

function InfoGrid({ profile }) {
  const gridRows = [
    [
      { label: 'T.C. Kimlik No', value: profile?.tc || '—' },
      { label: 'Okul İsmi', value: profile?.school || '—' },
    ],
    [
      { label: 'Doğum Tarihi', value: profile?.dob || '—' },
      { label: 'Sınıf No', value: profile?.grade || '—' },
    ],
    [
      { label: 'Sporcu Cep', value: profile?.phone || '—' },
      { label: 'Branşı', value: profile?.branch || '—' },
    ],
  ];

  return (
    <div className="dash-info">
      {gridRows.map((rowPair, idx) => (
        <div key={idx} className="dash-info__grid-row">
          <div className="dash-info__label">{rowPair[0].label}</div>
          <div className="dash-info__value">{rowPair[0].value}</div>
          <div className="dash-info__label">{rowPair[1].label}</div>
          <div className="dash-info__value">{rowPair[1].value}</div>
        </div>
      ))}
      <div className="dash-info__address-row">
        <span className="dash-info__address-label">Adres</span>
        <span className="dash-info__address-value">{profile?.address || '—'}</span>
      </div>
    </div>
  );
}

function PaymentTable({ payments }) {
  const totalDebt = payments.reduce((sum, p) => sum + p.fee + p.equipment, 0);

  return (
    <div className="payment-table">
      <div className="payment-table__headers">
        <div className="payment-table__header">Ay / Yıl</div>
        <div className="payment-table__header">Ödeme Günü</div>
        <div className="payment-table__header">Ücret</div>
        <div className="payment-table__header">Malzeme</div>
      </div>
      <div className="payment-table__body">
        {payments.map((payment, index) => (
          <div key={index} className="payment-table__row">
            <div className="payment-table__cell">{payment.monthYear}</div>
            <div className="payment-table__cell">{payment.paymentDate}</div>
            <div className="payment-table__cell">{payment.fee.toLocaleString('tr-TR')}</div>
            <div className="payment-table__cell">{payment.equipment.toLocaleString('tr-TR')}</div>
          </div>
        ))}
      </div>
      <div className="payment-table__footer">
        <div className="payment-table__total">
          Toplam Borç: <span className="payment-table__total-amount">{totalDebt.toLocaleString('tr-TR')} tl</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentDetailsPanel({ student }) {
  if (!student) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>
          Öğrenci seçiniz
        </div>
      </section>
    );
  }

  const name = student?.name || '—';
  const photo = student?.photo || '/avatars/profile-large.svg';
  const payments = student?.payments || [];

  return (
    <section className="dash-right">
      <div className="payment-header">Ödeme Bilgisi</div>

      <div className="dash-top">
        <ProfileAvatar photo={photo} name={name} />
        <div className="dash-top__info">
          <InfoGrid profile={student?.profile} />
        </div>
      </div>

      <PaymentTable payments={payments} />

      <button type="button" className="payment-action-btn">
        Ödeme İşlemleri
      </button>
    </section>
  );
}
