import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AttendanceInfoModal({ isOpen, onClose, student, group, lesson }) {
  if (!isOpen) return null;

  // Mock attendance history data - replace with real data from backend
  const attendanceHistory = [
    { id: 1, groupName: 'Örnek Grup Adı', className: 'Grup Adı', date: '19.11.2001', period: 'Ders adı', count: '9' },
    { id: 2, groupName: 'Örnek Grup Adı', className: 'Grup Adı', date: '19.11.2001', period: 'Ders Tarih 9', count: '9' },
    { id: 3, groupName: 'Örnek Grup Adı', className: 'Grup Adı', date: '19.11.2001', period: 'Ders Tarih 9', count: '9' },
    { id: 4, groupName: 'Örnek Grup Adı', className: 'Grup Adı', date: '19.11.2001', period: 'Ders Tarih 9', count: '9' },
    { id: 5, groupName: 'Örnek Grup Adı', className: 'Grup Adı', date: '19.11.2001', period: 'Ders Tarih 9', count: '9' },
    { id: 6, groupName: 'Örnek Grup Adı', className: 'Grup Adı', date: '19.11.2001', period: 'Ders Tarih 9', count: '9' },
    { id: 7, groupName: 'Örnek Grup Adı', className: 'Grup Adı', date: '19.11.2001', period: 'Ders Tarih 9', count: '9' },
    { id: 8, groupName: 'Örnek Grup Adı', className: 'Grup Adı', date: '19.11.2001', period: 'Ders Tarih 9', count: '9' },
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const studentName = student?.name || '';
  const studentPhoto = student?.photo || '/avatars/student-1.svg';

  return (
    <div className="attendance-info-modal-overlay" onClick={handleBackdropClick}>
      <div className="attendance-info-modal">
        <button className="attendance-info-modal__close" onClick={onClose} aria-label="Close modal">
          <X style={{ width: '24px', height: '24px', color: '#5677fb' }} />
        </button>

        <h1 className="attendance-info-modal__title">Yoklama Bilgileri</h1>

        {/* Student Header */}
        <div className="attendance-info-modal__student">
          <div className="attendance-info-modal__avatar">
            <img src={studentPhoto} alt={studentName} />
          </div>
          <div className="attendance-info-modal__name">{studentName}</div>
          
          {/* Group and Lesson Info */}
          <div className="attendance-info-modal__info">
            <div className="attendance-info-modal__info-item">
              <span className="attendance-info-modal__info-label">Grup Adı:</span>
              <span className="attendance-info-modal__info-value">{group?.name || 'Örnek Grup Adı'}</span>
            </div>
            <div className="attendance-info-modal__info-item">
              <span className="attendance-info-modal__info-label">Ders Adı:</span>
              <span className="attendance-info-modal__info-value">{lesson?.name || 'Örnek Ders'}</span>
            </div>
          </div>

          <button className="attendance-info-modal__excel-btn">Excel Olarak İndir</button>
        </div>

        {/* Attendance History List */}
        <div className="attendance-info-modal__content">
          <div className="attendance-info-modal__list">
            {attendanceHistory.map((record) => (
              <div key={record.id} className="attendance-info-modal__row">
                <div className="attendance-info-modal__row-avatar">
                  <img src={studentPhoto} alt={studentName} />
                </div>
                <div className="attendance-info-modal__row-name">{studentName}</div>
                <div className="attendance-info-modal__row-meta">{record.className}</div>
                <div className="attendance-info-modal__row-meta">{record.date}</div>
                <div className="attendance-info-modal__row-meta">{record.period}</div>
                <div className="attendance-info-modal__row-meta">{record.count}</div>
                <div className="attendance-info-modal__row-indicator" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

