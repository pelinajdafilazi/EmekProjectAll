import React, { useState, useEffect } from 'react';
import PaymentOperationsModal from './PaymentOperationsModal';
import { PaymentService } from '../../../services/paymentService';

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

function PaymentTable({ payments, onOpenModal, loading, totalDebt: propTotalDebt }) {
  // Backend'den gelen toplam borç bilgisini kullan, yoksa hesapla
  const totalDebt = propTotalDebt !== undefined ? propTotalDebt : payments.reduce((sum, p) => {
    const debt = p.debt !== undefined ? p.debt : 0;
    return sum + debt;
  }, 0);
  
  if (loading) {
    return (
      <div className="payment-table">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="payment-table">
      <div className="payment-table__headers">
        <div className="payment-table__header">Ay / Yıl</div>
        <div className="payment-table__header">Ödeme Günü</div>
        <div className="payment-table__header">Ders Ücreti</div>
        <div className="payment-table__header">Malzeme Ücreti</div>
        <div className="payment-table__header">Yapılan Ödeme</div>
        <div className="payment-table__header">Borç</div>
        <div className="payment-table__header">Durum</div>
      </div>
      <div className="payment-table__body">
        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
            Ödeme kaydı bulunamadı
          </div>
        ) : (
          payments.map((payment, index) => {
            // Backend'den gelen borç bilgisini kullan
            const paid = payment.paid || 0;
            const debt = payment.debt !== undefined ? payment.debt : 0;
            const isUnpaid = !payment.isPaid || debt > 0;

          return (
            <div key={index} className={`payment-table__row ${isUnpaid ? 'payment-table__row--unpaid' : ''}`}>
              <div className="payment-table__cell">{payment.monthYear}</div>
              <div className="payment-table__cell">{payment.paymentDate}</div>
              <div className="payment-table__cell">{payment.fee.toLocaleString('tr-TR')},00</div>
              <div className="payment-table__cell">{payment.equipment.toLocaleString('tr-TR')},00</div>
              <div className="payment-table__cell">{paid.toLocaleString('tr-TR')},00</div>
              <div className="payment-table__cell">{debt.toLocaleString('tr-TR')},00</div>
              <div className="payment-table__cell">
                <span style={{ 
                  color: payment.isPaid ? '#10b981' : '#ef4444',
                  fontWeight: 600
                }}>
                  {payment.isPaid ? 'Ödendi' : 'Ödenmedi'}
                </span>
              </div>
            </div>
          );
        })
        )}
      </div>
      <div className="payment-table__footer">
        <div className="payment-table__total">
          Toplam Borç: <span className="payment-table__total-amount">{totalDebt.toLocaleString('tr-TR')},00 tl</span>
        </div>
        <button 
          type="button" 
          className="payment-action-btn" 
          onClick={(e) => {
            e.preventDefault();
            console.log('Button clicked!');
            onOpenModal();
          }}
        >
          Ödeme İşlemleri
        </button>
      </div>
    </div>
  );
}

export default function PaymentDetailsPanel({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDebt, setTotalDebt] = useState(0);
  
  const studentId = student?.id || student?._backendData?.id;
  
  // Tarih formatını dönüştür: Date -> "Kasım 2024"
  // Backend'den ay bilgisi 1-12 arası geliyor, JavaScript'te 0-11 arası
  function formatDateToMonthYear(date) {
    if (!date) return '';
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    // Date objesi ise getMonth() kullan (0-11 arası döner)
    if (date instanceof Date) {
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    // Eğer string veya obje ise parse et
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }
    return '';
  }
  
  // Tarih formatını dönüştür: Date -> "19.11.2024"
  function formatDateToDDMMYYYY(date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  // Ödeme detaylarını yükle
  const loadPaymentDetails = () => {
    if (studentId) {
      setLoading(true);
      PaymentService.getStudentPaymentDetails(studentId)
        .then(paymentData => {
          // Backend'den gelen veriyi frontend formatına dönüştür
          const formattedPayments = paymentData.debts.map(payment => {
            return {
              debtId: payment.debtId,
              monthYear: payment.dueDate ? formatDateToMonthYear(payment.dueDate) : '',
              paymentDate: payment.dateOfPayment ? formatDateToDDMMYYYY(payment.dateOfPayment) : '',
              fee: payment.fee || 0,
              equipment: payment.equipment || 0,
              paid: payment.paid || 0,
              debt: payment.debt || 0,
              isPaid: payment.isPaid || false,
              dueDate: payment.dueDate,
              dateOfPayment: payment.dateOfPayment
            };
          });
          setPayments(formattedPayments);
          setTotalDebt(paymentData.totalDebt || 0);
        })
        .catch(error => {
          console.error('Ödeme detayları yüklenirken hata:', error);
          setPayments([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPayments([]);
      setTotalDebt(0);
    }
  };

  // Öğrenci seçildiğinde backend'den ödeme detaylarını çek
  useEffect(() => {
    loadPaymentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // Ödeme güncellendiğinde detayları yenile
  useEffect(() => {
    const handlePaymentUpdated = () => {
      // Ödeme güncellendiğinde seçili öğrencinin detaylarını yenile
      if (studentId) {
        loadPaymentDetails();
      }
    };

    window.addEventListener('paymentUpdated', handlePaymentUpdated);
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

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

  return (
    <>
      <section className="dash-right dash-right--payment">
        <div className="group-header">Ödeme Bilgisi</div>

        <div className="dash-top">
          <ProfileAvatar photo={photo} name={name} />
          <div className="dash-top__info">
            <InfoGrid profile={student?.profile} />
          </div>
        </div>

        <PaymentTable payments={payments} onOpenModal={() => setIsModalOpen(true)} loading={loading} totalDebt={totalDebt} />
      </section>

      <PaymentOperationsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        student={student}
      />
    </>
  );
}
