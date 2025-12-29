import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getStudentLessonAttendances } from '../../../services/attendanceService';
import { exportAttendancesToExcel } from '../../../utils/exportUtils';
import StudentImage from './StudentImage';

export default function AttendanceInfoModal({ isOpen, onClose, student, group, lesson, attendancePercentage }) {
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
      // Get lesson ID - handle both direct id and _backendData.id
      const lessonId = lesson?.id || lesson?._backendData?.id;
      // Get student ID - handle various ID formats
      const studentId = student?.id || student?._backendData?.id;
      
      if (!isOpen || !lesson || !lessonId || !student || !studentId) {
        setAttendanceHistory([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Call the API endpoint: /api/Attendances/student/{studentId}/lesson/{lessonId}
        // Backend response: { student: {...}, lesson: {...}, attendances: [...] }
        const response = await getStudentLessonAttendances(studentId, lessonId);
        
        // Backend response bir obje, içinde attendances dizisi var
        let attendancesArray = [];
        if (response && typeof response === 'object') {
          // Eğer direkt attendances dizisi ise
          if (Array.isArray(response)) {
            attendancesArray = response;
          } 
          // Eğer obje içinde attendances dizisi varsa
          else if (response.attendances && Array.isArray(response.attendances)) {
            attendancesArray = response.attendances;
          }
        }
        
        // Transform API response to display format
        const studentAttendances = attendancesArray.map((att, index) => {
          return {
            id: att.id || `att-${index}`,
            attending: att.isPresent !== undefined ? att.isPresent : 
                      (att.attending !== undefined ? Boolean(att.attending) : null),
            name: att.name || '-',
            attendanceDate: att.attendanceDate || att.date || null
          };
        });

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
  }, [isOpen, lesson?.id, lesson?._backendData?.id, student?.id, student?._backendData?.id]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExportExcel = () => {
    try {
      exportAttendancesToExcel(attendanceHistory, student, group, lesson, 'yoklama-listesi.xlsx');
    } catch (error) {
      alert('Excel dosyası oluşturulurken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  if (!isOpen) return null;

  const studentName = student?.name || '';

  return (
    <div className="attendance-info-modal-overlay" onClick={handleBackdropClick}>
      <div className="attendance-info-modal">
        <button className="attendance-info-modal__close" onClick={onClose} aria-label="Close modal">
          <X style={{ width: '24px', height: '24px', color: '#ff7b00' }} />
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

          <button 
            className="attendance-info-modal__excel-btn" 
            onClick={handleExportExcel}
            disabled={isLoading || attendanceHistory.length === 0}
          >
            Excel Olarak İndir
          </button>
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
          {!isLoading && !error && attendanceHistory.length > 0 && (
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              marginTop: '1rem'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#ff7b00', 
                  color: '#fff',
                  borderBottom: '2px solid #ff7b00'
                }}>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Ad Soyad
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Grup Adı
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Ders Adı
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Yoklama Tarihi
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Katılım
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record) => {
                  // Get attendance status color
                  const getStatusColor = () => {
                    if (record.attending === true) return '#22c55e'; // Yeşil
                    if (record.attending === false) return '#ef4444'; // Kırmızı
                    return '#9ca3af'; // Gri (null veya undefined)
                  };

                  // Get attendance status text
                  const getStatusText = () => {
                    if (record.attending === true) return 'Katıldı';
                    if (record.attending === false) return 'Katılmadı';
                    return 'Belirtilmemiş';
                  };

                  // Format date for display
                  const displayDate = record.attendanceDate ? formatDate(record.attendanceDate) : '-';
                  
                  // Get student name from student prop or record
                  const studentName = student?.name || record.name || '-';
                  const groupName = group?.name || '-';
                  const lessonName = lesson?.name || '-';

                  return (
                    <tr 
                      key={record.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#fff'
                      }}
                    >
                      <td style={{ 
                        padding: '0.75rem 1rem',
                        color: '#1f2937',
                        fontSize: '0.9rem'
                      }}>
                        {studentName}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem',
                        color: '#1f2937',
                        fontSize: '0.9rem'
                      }}>
                        {groupName}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem',
                        color: '#1f2937',
                        fontSize: '0.9rem'
                      }}>
                        {lessonName}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem',
                        color: '#1f2937',
                        fontSize: '0.9rem'
                      }}>
                        {displayDate}
                      </td>
                      <td style={{ 
                        padding: '0.75rem 1rem',
                        color: '#1f2937',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(),
                            flexShrink: 0
                          }}
                        />
                        <span>{getStatusText()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          
          {/* Attendance Percentage Display */}
          {!isLoading && !error && attendanceHistory.length > 0 && attendancePercentage !== null && attendancePercentage !== undefined && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem', 
              alignSelf: 'flex-end', 
              width: '100%', 
              marginTop: '2rem',
              alignItems: 'flex-end'
            }}>
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ color: '#ff7b00', fontSize: '1rem', fontWeight: '500' }}>
                    Antrenman Katılımı %{attendancePercentage}
                  </span>
                </div>
                <div style={{ 
                  width: '240px', 
                  height: '12px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${attendancePercentage}%`,
                    height: '100%',
                    backgroundColor: '#ff7b00',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

