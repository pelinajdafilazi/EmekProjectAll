import React from 'react';
import { X } from 'lucide-react';

export default function PaymentOperationsModal({ isOpen, onClose, student }) {
  if (!isOpen) return null;

  const payments = student?.payments || [];
  const name = student?.name || '';
  const photo = student?.photo || '/avatars/profile-large.svg';

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
              const total = payment.fee + payment.equipment;
              const paid = payment.paid || 0;
              const debt = total - paid;
              const isUnpaid = debt > 0;

              return (
                <div key={index} className={'payment-table__row ' + (isUnpaid ? 'payment-table__row--unpaid' : '')}>
                  <div className="payment-table__cell">{payment.monthYear}</div>
                  <div className="payment-table__cell">{payment.paymentDate}</div>
                  <div className="payment-table__cell">{payment.fee.toLocaleString('tr-TR')},00</div>
                  <div className="payment-table__cell">{payment.equipment.toLocaleString('tr-TR')},00</div>
                  <div className="payment-table__cell">{paid.toLocaleString('tr-TR')},00</div>
                  <div className="payment-table__cell">{debt.toLocaleString('tr-TR')},00</div>
                </div>
              );
            })}
          </div>
        </div>

        <button type="button" className="payment-modal__save-btn">
          Kaydet
        </button>
      </div>
    </div>
  );
}
