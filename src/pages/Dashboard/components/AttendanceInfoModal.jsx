import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getLessonAttendances } from '../../../services/attendanceService';
import StudentImage from './StudentImage';

export default function AttendanceInfoModal({ isOpen, onClose, student, group, lesson }) {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to format date as DD.MM.YYYY
  const formatDate = (date) => {
    if (!date) return '';
    let dateObj;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Try ISO format first (YYYY-MM-DD)
      if (date.includes('T')) {
        dateObj = new Date(date);
      } else if (date.includes('-')) {
        // YYYY-MM-DD format
        const parts = date.split('-');
        dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else if (date.includes('.')) {
        // DD.MM.YYYY format
        const parts = date.split('.');
        dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        dateObj = new Date(date);
      }
    } else {
      return '';
    }
    
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Load attendance history when modal opens and lesson/student is available
  useEffect(() => {
    const loadAttendanceHistory = async () => {
      if (!isOpen || !lesson || !lesson.id || !student || !student.id) {
        setAttendanceHistory([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const attendances = await getLessonAttendances(lesson.id);
        
        // Helper to parse date for sorting
        const parseDateForSort = (dateStr) => {
          if (!dateStr) return 0;
          const parts = dateStr.split('.');
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
          }
          return 0;
        };
        
        // Filter attendances for the selected student and transform to display format
        const studentAttendances = Array.isArray(attendances) 
          ? attendances
              .filter(att => {
                const attStudentId = att.studentId || att.student?.id || att.studentId;
                return attStudentId && String(attStudentId) === String(student.id);
              })
              .map((att, index) => ({
                id: att.id || att.attendanceId || `att-${index}`,
                groupName: group?.name || att.group?.name || att.groupName || '-',
                className: group?.name || att.group?.name || att.groupName || '-',
                date: formatDate(att.attendanceDate || att.date || att.createdAt),
                period: lesson?.name || att.lesson?.name || att.lessonName || 'Ders Adı',
                isPresent: att.isPresent !== undefined ? att.isPresent : true
              }))
              .sort((a, b) => {
                // Sort by date descending (newest first)
                const dateA = a.date ? parseDateForSort(a.date) : 0;
                const dateB = b.date ? parseDateForSort(b.date) : 0;
                return dateB - dateA;
              })
          : [];

        setAttendanceHistory(studentAttendances);
      } catch (err) {
        console.error('Yoklama geçmişi yüklenirken hata:', err);
        setError(err.message || 'Yoklama geçmişi yüklenirken bir hata oluştu');
        setAttendanceHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceHistory();
  }, [isOpen, lesson?.id, student?.id, group?.name]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const studentName = student?.name || '';

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
            <StudentImage student={student} alt={studentName} />
          </div>
          <div className="attendance-info-modal__name">{studentName}</div>
          
          {/* Group and Lesson Info */}
          <div className="attendance-info-modal__info">
            <div className="attendance-info-modal__info-item">
              <span className="attendance-info-modal__info-label">Grup Adı:</span>
              <span className="attendance-info-modal__info-value">{group?.name || attendanceHistory[0]?.groupName || attendanceHistory[0]?.className || '-'}</span>
            </div>
            <div className="attendance-info-modal__info-item">
              <span className="attendance-info-modal__info-label">Ders Adı:</span>
              <span className="attendance-info-modal__info-value">{lesson?.name || attendanceHistory[0]?.period || '-'}</span>
            </div>
          </div>

          <button className="attendance-info-modal__excel-btn">Excel Olarak İndir</button>
        </div>

        {/* Attendance History List */}
        <div className="attendance-info-modal__content">
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Yükleniyor...
            </div>
          )}
          {error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              margin: '1rem'
            }}>
              {error}
            </div>
          )}
          {!isLoading && !error && attendanceHistory.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Yoklama kaydı bulunamadı
            </div>
          )}
          <div className="attendance-info-modal__list">
            {attendanceHistory.map((record) => (
              <div key={record.id} className="attendance-info-modal__row">
                <div className="attendance-info-modal__row-avatar">
                  <StudentImage student={student} alt={studentName} />
                </div>
                <div className="attendance-info-modal__row-name">{studentName}</div>
                <div className="attendance-info-modal__row-meta">{record.className}</div>
                <div className="attendance-info-modal__row-meta">{record.date}</div>
                <div className="attendance-info-modal__row-meta">{record.period}</div>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '3px',
                    backgroundColor: record.isPresent ? '#22c55e' : '#ef4444',
                    flexShrink: 0
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

