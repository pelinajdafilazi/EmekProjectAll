import React, { useState, useEffect } from 'react';
import { Check, X, Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import tr from 'date-fns/locale/tr';
import 'react-datepicker/dist/react-datepicker.css';
import AttendanceInfoModal from './AttendanceInfoModal';
import { getLessonAttendances, bulkCreateAttendances, formatDateForBackend } from '../../../services/attendanceService';
import StudentImage from './StudentImage';

registerLocale('tr', tr);

export default function AttendanceDetailsPanel({ group, lesson, students }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(students && students.length > 0 ? students[0] : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Update selectedStudent when students change
  useEffect(() => {
    if (students && students.length > 0) {
      // If current selected student is not in the list, select the first one
      if (!selectedStudent || !students.find(s => s.id === selectedStudent.id)) {
        setSelectedStudent(students[0]);
      }
    }
  }, [students, selectedStudent]);
  
  // Parse initial date from lesson.date or lesson.day, or use today's date
  const parseAttendanceDate = (lessonData) => {
    if (!lessonData) return new Date();
    
    if (lessonData.date) {
      // If it's already a date object
      if (lessonData.date instanceof Date) return lessonData.date;
      // If it's a string, try to parse it
      const parsed = new Date(lessonData.date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    
    // If lesson.day is provided (like "Pazartesi"), use today's date as fallback
    // In a real app, you might want to find the next occurrence of that day
    return new Date();
  };
  
  // Use a default lesson if none provided (for mock data compatibility)
  const displayLesson = lesson || {
    name: 'Ders seçilmedi',
    day: '-',
    capacity: '-',
    date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
  };

  const [attendanceDate, setAttendanceDate] = useState(() => parseAttendanceDate(displayLesson));
  
  // Update attendance date when lesson changes
  useEffect(() => {
    const currentLesson = lesson || displayLesson;
    if (currentLesson) {
      const newDate = parseAttendanceDate(currentLesson);
      setAttendanceDate(newDate);
    }
  }, [lesson?.id, lesson?.date, lesson?.day, displayLesson?.date]);
  
  const handleAttendanceDateChange = (date) => {
    setAttendanceDate(date);
    // Here you can save the date to backend or update the lesson
    console.log('Attendance date changed:', date);
    // You might want to call an API here to update the lesson date
  };

  const handleToggleAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Load attendance data when lesson changes
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!lesson || !lesson.id) {
        // Reset attendance data if no lesson
        setAttendanceData({});
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const attendances = await getLessonAttendances(lesson.id);
        
        // Transform backend data to frontend format
        const attendanceMap = {};
        if (Array.isArray(attendances)) {
          attendances.forEach(attendance => {
            const studentId = attendance.studentId || attendance.student?.id;
            if (studentId) {
              attendanceMap[studentId] = attendance.isPresent !== undefined ? attendance.isPresent : true;
            }
          });
        }
        
        // Merge with existing data, defaulting to true if not in backend data
        const mergedData = {};
        if (students && students.length > 0) {
          students.forEach(student => {
            mergedData[student.id] = attendanceMap[student.id] !== undefined 
              ? attendanceMap[student.id] 
              : true; // Default to present if no data
          });
        }
        
        setAttendanceData(mergedData);
      } catch (err) {
        console.error('Yoklama verileri yüklenirken hata:', err);
        setError(err.message || 'Yoklama verileri yüklenirken bir hata oluştu');
        // On error, initialize with default values
        const defaultData = {};
        if (students && students.length > 0) {
          students.forEach(student => {
            defaultData[student.id] = true;
          });
        }
        setAttendanceData(defaultData);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceData();
  }, [lesson?.id, students]);

  const handleSaveAttendance = async () => {
    if (!lesson || !lesson.id) {
      setError('Ders seçilmedi');
      return;
    }

    if (!students || students.length === 0) {
      setError('Öğrenci listesi boş');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Format attendance date for backend
      const formattedDate = formatDateForBackend(attendanceDate);
      if (!formattedDate) {
        setError('Geçerli bir tarih seçiniz');
        setIsSaving(false);
        return;
      }

      // Prepare attendance data
      const attendances = students.map(student => ({
        studentId: student.id,
        isPresent: attendanceData[student.id] !== undefined ? attendanceData[student.id] : true
      }));

      const attendancePayload = {
        lessonId: lesson.id,
        attendanceDate: formattedDate,
        attendances: attendances
      };

      await bulkCreateAttendances(attendancePayload);
      
      // Success - could show a success message here
      console.log('Yoklama başarıyla kaydedildi');
      
    } catch (err) {
      console.error('Yoklama kaydedilirken hata:', err);
      setError(err.message || 'Yoklama kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  if (!group) {
    return (
      <section className="dash-right dash-right--attendance">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Grup seçiniz
        </div>
      </section>
    );
  }

  // Helper function to get age range from group (supports both old string format and new object format)
  const getAgeRange = (group) => {
    if (!group) return { minAge: null, maxAge: null };
    
    // Backend'den gelen yeni format (minAge, maxAge)
    if (group.minAge !== undefined && group.maxAge !== undefined) {
      return {
        minAge: group.minAge,
        maxAge: group.maxAge
      };
    }
    
    // Eski format (ageRange string) - backward compatibility
    if (group.ageRange) {
      const match = group.ageRange.match(/(\d+)\s*-\s*(\d+)/);
      if (match) {
        return {
          minAge: parseInt(match[1], 10),
          maxAge: parseInt(match[2], 10)
        };
      }
    }
    
    return { minAge: null, maxAge: null };
  };

  // Helper function to format age range for display
  const formatAgeRange = (group) => {
    const ageRange = getAgeRange(group);
    if (ageRange.minAge !== null && ageRange.maxAge !== null) {
      return `${ageRange.minAge} - ${ageRange.maxAge}`;
    }
    return '';
  };

  const presentCount = Object.values(attendanceData).filter(isPresent => isPresent).length;
  const totalCount = (students && students.length > 0) ? students.length : 0;

  return (
    <section className="dash-right dash-right--attendance">
      <div className="group-header">Grup Bilgisi</div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0.5rem 0rem',
        gap: '0rem',
        marginBottom: '1.5rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#5b7ce6', fontWeight: '500', whiteSpace: 'nowrap' }}>Grup Adı:</span>
          <span style={{ color: '#1f2937' }}>{group.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#5b7ce6', fontWeight: '500', whiteSpace: 'nowrap' }}>Yaş Aralığı:</span>
          <span style={{ color: '#1f2937' }}>{formatAgeRange(group)} Yaş</span>
        </div>
      </div>

      <div className="lesson-header">Ders Bilgisi</div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '1rem 0rem',
        gap: '0rem',
        marginBottom: '1.5rem',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
          <span style={{ color: '#5b7ce6', fontWeight: '500', whiteSpace: 'nowrap' }}>Ders Adı:</span>
          <span style={{ color: '#1f2937' }}>{displayLesson.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto', justifyContent: 'center' }}>
          <span style={{ color: '#5b7ce6', fontWeight: '500', whiteSpace: 'nowrap' }}>Ders Günü:</span>
          <span style={{ color: '#1f2937' }}>{displayLesson.day}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto', justifyContent: 'flex-end' }}>
          <span style={{ color: '#5b7ce6', fontWeight: '500', whiteSpace: 'nowrap' }}>Kapasite:</span>
          <span style={{ color: '#1f2937' }}>{displayLesson.capacity}</span>
        </div>
      </div>

      <div className="lesson-content-wrapper" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {/* Left Side - Student List */}
        <div style={{ flex: '0 0 480px', display: 'flex', flexDirection: 'column', maxHeight: '301px', minHeight: 0 }}>
          <h3 style={{ color: '#5b7ce6', fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '700' }}>
            Öğrenci Listesi
          </h3>
          
          {/* Search Bar */}
          <div className="dash-search-container dash-search-container--attendance">
            <input
              type="text"
              className="dash-search-input dash-search-input--attendance"
              placeholder="Sporcu ara.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="dash-search-icon dash-search-icon--attendance">
              <Search size={20} strokeWidth={2} />
            </div>
          </div>
          
          <div className="attendance-student-list" style={{ 
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: 'transparent',
            flex: '1',
            minHeight: 0,
            marginTop: '0.5rem'
          }}>
            {(students || [])
              .filter(student => student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((student) => {
              const isPresent = attendanceData[student.id];
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px 0px',
                    gap: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <StudentImage
                    student={student}
                    alt={student.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #5b7ce6'
                    }}
                  />
                  <span style={{ flex: '1', fontSize: '0.9rem', color: '#6b7280', fontWeight: '400' }}>
                    {student.name}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', minWidth: '25px' }}>
                    {student.age}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', minWidth: '85px' }}>
                    {student.team}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', minWidth: '70px' }}>
                    {student.birthDate}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', minWidth: '20px', textAlign: 'center' }}>
                    {student.jerseyNumber || '9'}
                  </span>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '3px',
                      backgroundColor: isPresent ? '#22c55e' : '#ef4444',
                      flexShrink: 0
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem', gap: '0.5rem' }}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                textAlign: 'center',
                width: '100%',
                maxWidth: '206px'
              }}>
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={isSaving || isLoading || !lesson || !lesson.id}
              style={{
                width: '206px',
                height: '40px',
                backgroundColor: isSaving || isLoading || !lesson || !lesson.id ? '#9ca3af' : '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isSaving || isLoading || !lesson || !lesson.id ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSaving || isLoading || !lesson || !lesson.id ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isSaving && !isLoading && lesson && lesson.id) {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }
              }}
              onMouseOut={(e) => {
                if (!isSaving && !isLoading && lesson && lesson.id) {
                  e.currentTarget.style.backgroundColor = '#22c55e';
                }
              }}
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Right Side - Attendance Tracking */}
        <div style={{ width: '419px', height: '331px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'nowrap' }}>
            <h3 style={{ color: '#5b7ce6', fontSize: '1.25rem', margin: 0, fontWeight: '700', whiteSpace: 'nowrap' }}>
              Yoklama Bilgisi
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#5b7ce6', fontWeight: '500', whiteSpace: 'nowrap' }}>
                Yoklama Tarihi:
              </span>
              <DatePicker
                selected={attendanceDate}
                onChange={handleAttendanceDateChange}
                locale="tr"
                dateFormat="dd.MM.yyyy"
                className="attendance-date-picker"
                placeholderText="Tarih seçin"
                showPopperArrow={false}
              />
            </div>
          </div>

          {selectedStudent && (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              backgroundColor: 'transparent',
              height: '100%'
            }}>
              {/* Student Profile - Horizontal Layout */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '1.5rem'
              }}>
                <img 
                  student={selectedStudent}
                  alt={selectedStudent.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #5b7ce6',
                    flexShrink: 0
                  }}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ 
                    color: '#5b7ce6', 
                    fontSize: '1.5rem', 
                    fontWeight: '700',
                    margin: 0
                  }}>
                    {selectedStudent.name}
                  </h4>

                  {/* Attendance Buttons - Side by Side */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(selectedStudent.id)}
                        style={{
                          padding: '0 24px',
                          backgroundColor: attendanceData[selectedStudent.id] ? '#22c55e' : '#f3f4f6',
                          color: attendanceData[selectedStudent.id] ? '#fff' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          width: '121px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        Katıldı
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(selectedStudent.id)}
                        style={{
                          padding: '0 24px',
                          backgroundColor: !attendanceData[selectedStudent.id] ? '#ef4444' : '#f3f4f6',
                          color: !attendanceData[selectedStudent.id] ? '#fff' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          width: '121px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        Katılmadı
                      </button>
                    </div>
                    
                    {/* Student Attendance Details Button */}
                    <button
                      type="button"
                      onClick={() => setIsAttendanceModalOpen(true)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#5677FB',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        width: '100%',
                        fontFamily: 'Montserrat, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Öğrenciye ait yoklama Bilgileri
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar Section - Extended Horizontal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <span style={{ color: '#5b7ce6', fontSize: '1rem', fontWeight: '500' }}>
                      Antrenman Katılımı %{totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}
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
                      width: `${totalCount > 0 ? (presentCount / totalCount) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: '#5b7ce6',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AttendanceInfoModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        student={selectedStudent}
        group={group}
        lesson={lesson}
      />
    </section>
  );
}
