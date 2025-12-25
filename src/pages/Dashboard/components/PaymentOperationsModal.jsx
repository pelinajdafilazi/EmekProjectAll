import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import tr from 'date-fns/locale/tr';
import 'react-datepicker/dist/react-datepicker.css';
import { PaymentService } from '../../../services/paymentService';

registerLocale('tr', tr);

export default function PaymentOperationsModal({ isOpen, onClose, student }) {
  const [payments, setPayments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null); // {index, field}
  
  useEffect(() => {
    if (isOpen && student?.id) {
      // Backend'den öğrencinin ödeme detaylarını çek
      const studentId = student?.id || student?._backendData?.id;
      if (studentId) {
        PaymentService.getStudentPaymentDetails(studentId)
          .then(paymentData => {
            // Backend'den gelen veriyi frontend formatına dönüştür
            const debts = paymentData?.debts || [];
            const formattedPayments = debts.map(p => ({
              debtId: p.debtId || null,
              dueDate: p.dueDate, // Date objesi
              dateOfPayment: p.dateOfPayment, // Date objesi
              fee: p.fee || 0,
              equipment: p.equipment || 0,
              paid: p.paid || 0,
              debt: p.debt || 0 // Backend'den gelen borç
            }));
            setPayments(formattedPayments);
          })
          .catch(error => {
            console.error('Ödeme detayları yüklenirken hata:', error);
            setPayments([]);
          });
      } else {
        setPayments([]);
      }
    } else if (isOpen) {
      setPayments([]);
    }
    setError(null);
  }, [isOpen, student]);

  if (!isOpen) return null;

  const name = student?.name || '';
  const photo = student?.photo || '/avatars/profile-large.svg';
  const studentId = student?.id || student?._backendData?.id;

  // Date objesini ISO string'e çevir
  const dateToISO = (date) => {
    if (!date) return new Date().toISOString();
    if (date instanceof Date) {
      return date.toISOString();
    }
    return new Date().toISOString();
  };

  const handleAddRow = () => {
    const newRow = {
      dueDate: null, // Date objesi
      dateOfPayment: null, // Date objesi
      fee: 0,
      equipment: 0, // Malzeme ücreti (input olarak)
      paid: 0,
      debtId: null // Yeni satır için debtId yok
    };
    setPayments([...payments, newRow]);
  };

  const handleCellChange = (index, field, value) => {
    const updatedPayments = [...payments];
    
    if (field === 'fee' || field === 'equipment' || field === 'paid') {
      // Sadece rakamları al
      const numValue = value.replace(/[^0-9]/g, '');
      updatedPayments[index][field] = numValue === '' ? 0 : parseFloat(numValue);
    } else if (field === 'dueDate' || field === 'dateOfPayment') {
      // Date objesi olarak sakla
      updatedPayments[index][field] = value;
    } else {
      updatedPayments[index][field] = value;
    }
    
    setPayments(updatedPayments);
  };

  const formatCurrencyValue = (value, index, field) => {
    if (focusedInput && focusedInput.index === index && focusedInput.field === field) {
      // Focus durumunda raw değeri göster (sadece rakamlar)
      return value ? String(value).replace(/[^0-9]/g, '') : '';
    }
    // Blur durumunda formatlanmış değeri göster
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    return numValue.toLocaleString('tr-TR') + ',00';
  };
  
  // Backend'den gelen borç bilgisini göster (hesaplama yapmıyoruz)
  const getDebtDisplay = (payment) => {
    // Backend'den gelen borç bilgisi varsa onu göster
    if (payment.debt !== undefined && payment.debt !== null) {
      return payment.debt.toLocaleString('tr-TR') + ',00';
    }
    // Backend'den henüz gelmediyse "—" göster
    return '—';
  };

  const handleSave = async () => {
    if (!studentId) {
      setError('Öğrenci ID bulunamadı');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const promises = payments.map(async (payment) => {
        const paymentData = {
          studentId: studentId,
          dueDate: dateToISO(payment.dueDate),
          monthlyTuitionFee: payment.fee || 0,
          materialFee: payment.equipment || 0, // Malzeme ücreti backend'e gönderiliyor ama borç hesaplaması backend'de yapılacak
          amountPaid: payment.paid || 0,
          dateOfPayment: dateToISO(payment.dateOfPayment)
        };

        // Eğer debtId varsa PUT, yoksa POST
        if (payment.debtId) {
          paymentData.debtId = payment.debtId;
          return PaymentService.updatePayment(paymentData);
        } else {
          return PaymentService.createPayment(paymentData);
        }
      });

      await Promise.all(promises);
      
      // Başarılı olduğunda modal'ı kapat ve parent component'e bildir
      onClose();
      
      // Sayfayı yenilemek için event gönder
      window.dispatchEvent(new CustomEvent('paymentUpdated'));
      
    } catch (err) {
      console.error('Ödeme kaydedilirken hata:', err);
      setError(err.response?.data?.message || err.message || 'Ödeme kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-modal__close" onClick={onClose}>
          <X size={24} color="#5677FB" />
        </button>

        <h2 className="payment-modal__title">Ödeme İşlemleri</h2>

        <div className="payment-modal__student">
          <div className="payment-modal__avatar">
            <img src={photo} alt={name} />
          </div>
          <div className="payment-modal__name">{name}</div>
          <button className="payment-modal__excel-btn">Excel Olarak İndir</button>
        </div>

        <div className="payment-modal__table">
          <div className="payment-table__headers">
            <div className="payment-table__header">Ay / Yıl</div>
            <div className="payment-table__header">Ödeme Günü</div>
            <div className="payment-table__header">Ders Ücreti</div>
            <div className="payment-table__header">Malzeme Ücreti</div>
            <div className="payment-table__header">Yapılan Ödeme</div>
            <div className="payment-table__header">Borç</div>
          </div>
          <div className="payment-modal__table-body">
            {payments.map((payment, index) => {
              const paid = payment.paid || 0;
              // Borç hesaplaması yapmıyoruz, backend'den gelecek
              const debt = payment.debt !== undefined ? payment.debt : null;
              const isUnpaid = debt !== null && debt > 0;

              return (
                <div key={index} className={'payment-table__row ' + (isUnpaid ? 'payment-table__row--unpaid' : '')}>
                  <div className="payment-table__cell">
                    <DatePicker
                      selected={payment.dueDate}
                      onChange={(date) => handleCellChange(index, 'dueDate', date)}
                      locale="tr"
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      placeholderText="Ay / Yıl seçin"
                      className="payment-table__date-input"
                    />
                  </div>
                  <div className="payment-table__cell">
                    <DatePicker
                      selected={payment.dateOfPayment}
                      onChange={(date) => handleCellChange(index, 'dateOfPayment', date)}
                      locale="tr"
                      dateFormat="dd.MM.yyyy"
                      placeholderText="Tarih seçin"
                      className="payment-table__date-input"
                    />
                  </div>
                  <div className="payment-table__cell">
                    <input
                      type="text"
                      className="payment-table__input payment-table__input--number"
                      value={formatCurrencyValue(payment.fee, index, 'fee')}
                      onChange={(e) => handleCellChange(index, 'fee', e.target.value)}
                      onFocus={() => setFocusedInput({ index, field: 'fee' })}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="0"
                    />
                  </div>
                  <div className="payment-table__cell">
                    <input
                      type="text"
                      className="payment-table__input payment-table__input--number"
                      value={formatCurrencyValue(payment.equipment || 0, index, 'equipment')}
                      onChange={(e) => handleCellChange(index, 'equipment', e.target.value)}
                      onFocus={() => setFocusedInput({ index, field: 'equipment' })}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="0"
                    />
                  </div>
                  <div className="payment-table__cell">
                    <input
                      type="text"
                      className="payment-table__input payment-table__input--number"
                      value={formatCurrencyValue(paid, index, 'paid')}
                      onChange={(e) => handleCellChange(index, 'paid', e.target.value)}
                      onFocus={() => setFocusedInput({ index, field: 'paid' })}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="0"
                    />
                  </div>
                  <div className="payment-table__cell payment-table__cell--debt">
                    {getDebtDisplay(payment)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="payment-modal__error" style={{ 
            color: '#EF4444', 
            padding: '12px', 
            marginBottom: '16px', 
            backgroundColor: '#FEE2E2', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div className="payment-modal__actions">
          <button 
            type="button" 
            className="payment-modal__add-row-btn" 
            onClick={handleAddRow}
            disabled={isSaving}
          >
            <Plus size={20} />
            Yeni Satır Ekle
          </button>
          <button 
            type="button" 
            className="payment-modal__save-btn" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
