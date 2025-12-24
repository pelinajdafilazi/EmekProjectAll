import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

export default function PaymentOperationsModal({ isOpen, onClose, student }) {
  const [payments, setPayments] = useState([]);
  
  useEffect(() => {
    if (isOpen && student?.payments) {
      setPayments([...student.payments]);
    }
  }, [isOpen, student]);

  if (!isOpen) return null;

  const name = student?.name || '';
  const photo = student?.photo || '/avatars/profile-large.svg';

  const handleAddRow = () => {
    const newRow = {
      monthYear: '',
      paymentDate: '',
      fee: 0,
      equipment: 0,
      paid: 0
    };
    setPayments([...payments, newRow]);
  };

  const handleCellChange = (index, field, value) => {
    const updatedPayments = [...payments];
    
    if (field === 'fee' || field === 'equipment' || field === 'paid') {
      const numValue = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
      updatedPayments[index][field] = numValue;
    } else {
      updatedPayments[index][field] = value;
    }
    
    setPayments(updatedPayments);
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
            <div className="payment-table__header">Ücret</div>
            <div className="payment-table__header">Malzeme Ücreti</div>
            <div className="payment-table__header">Yapılan Ödeme</div>
            <div className="payment-table__header">Borç</div>
          </div>
          <div className="payment-modal__table-body">
            {payments.map((payment, index) => {
              const total = (payment.fee || 0) + (payment.equipment || 0);
              const paid = payment.paid || 0;
              const debt = total - paid;
              const isUnpaid = debt > 0;

              return (
                <div key={index} className={'payment-table__row ' + (isUnpaid ? 'payment-table__row--unpaid' : '')}>
                  <div className="payment-table__cell">
                    <input
                      type="text"
                      className="payment-table__input"
                      value={payment.monthYear || ''}
                      onChange={(e) => handleCellChange(index, 'monthYear', e.target.value)}
                      placeholder="Ay / Yıl"
                    />
                  </div>
                  <div className="payment-table__cell">
                    <input
                      type="text"
                      className="payment-table__input"
                      value={payment.paymentDate || ''}
                      onChange={(e) => handleCellChange(index, 'paymentDate', e.target.value)}
                      placeholder="Tarih"
                    />
                  </div>
                  <div className="payment-table__cell">
                    <input
                      type="text"
                      className="payment-table__input payment-table__input--number"
                      value={payment.fee ? payment.fee.toLocaleString('tr-TR') + ',00' : '0,00'}
                      onChange={(e) => handleCellChange(index, 'fee', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="payment-table__cell">
                    <input
                      type="text"
                      className="payment-table__input payment-table__input--number"
                      value={payment.equipment ? payment.equipment.toLocaleString('tr-TR') + ',00' : '0,00'}
                      onChange={(e) => handleCellChange(index, 'equipment', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="payment-table__cell">
                    <input
                      type="text"
                      className="payment-table__input payment-table__input--number"
                      value={paid ? paid.toLocaleString('tr-TR') + ',00' : '0,00'}
                      onChange={(e) => handleCellChange(index, 'paid', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="payment-table__cell payment-table__cell--debt">
                    {debt.toLocaleString('tr-TR')},00
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="payment-modal__actions">
          <button type="button" className="payment-modal__add-row-btn" onClick={handleAddRow}>
            <Plus size={20} />
            Yeni Satır Ekle
          </button>
          <button type="button" className="payment-modal__save-btn">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
