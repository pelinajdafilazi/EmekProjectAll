import React, { useState } from 'react';
import { Check, X, Search } from 'lucide-react';

export default function AttendanceDetailsPanel({ group, lesson, students }) {
  const [attendanceData, setAttendanceData] = useState(
    students.reduce((acc, student) => {
      acc[student.id] = student.isPresent !== undefined ? student.isPresent : true;
      return acc;
    }, {})
  );
  const [selectedStudent, setSelectedStudent] = useState(students[0] || null);
  const [timeFilter, setTimeFilter] = useState('Haftalık');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveAttendance = () => {
    console.log('Saving attendance:', attendanceData);
    // Here you would typically update the backend or state management
  };

  if (!group || !lesson) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Grup seçiniz
        </div>
      </section>
    );
  }

  // Helper function to format age range
  const formatAgeRange = (group) => {
    if (group.minAge !== undefined && group.maxAge !== undefined) {
      return `${group.minAge} - ${group.maxAge}`;
    }
    if (group.ageRange) {
      return group.ageRange;
    }
    return '';
  };

  const presentCount = Object.values(attendanceData).filter(isPresent => isPresent).length;
  const totalCount = students.length;

  return (
    <section className="dash-right">
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
          <span style={{ color: '#1f2937' }}>{lesson.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto', justifyContent: 'center' }}>
          <span style={{ color: '#5b7ce6', fontWeight: '500', whiteSpace: 'nowrap' }}>Tarih:</span>
          <span style={{ color: '#1f2937' }}>{lesson.day}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto', justifyContent: 'flex-end' }}>
          <span style={{ color: '#5b7ce6', fontWeight: '500', whiteSpace: 'nowrap' }}>Kapasite:</span>
          <span style={{ color: '#1f2937' }}>{lesson.capacity}</span>
        </div>
      </div>

      <div className="lesson-content-wrapper" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {/* Left Side - Student List */}
        <div style={{ flex: '0 0 575px', display: 'flex', flexDirection: 'column', maxHeight: '301px' }}>
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
          
          <div style={{ 
            overflow: 'hidden',
            backgroundColor: 'transparent'
          }}>
            {students
              .filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((student) => {
              const isPresent = attendanceData[student.id];
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 0px',
                    gap: '12px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <img 
                    src={student.photo} 
                    alt={student.name}
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #5b7ce6'
                    }}
                  />
                  <span style={{ flex: '1', fontSize: '0.95rem', color: '#6b7280', fontWeight: '400' }}>
                    {student.name}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', minWidth: '30px' }}>
                    {student.age}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', minWidth: '120px' }}>
                    {student.team}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', minWidth: '90px' }}>
                    {student.birthDate}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280', minWidth: '25px', textAlign: 'center' }}>
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

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={handleSaveAttendance}
              style={{
                width: '206px',
                height: '40px',
                backgroundColor: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
            >
              Kaydet
            </button>
          </div>
        </div>

        {/* Right Side - Attendance Tracking */}
        <div style={{ width: '419px', height: '331px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#5b7ce6', fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '700' }}>
            Yoklama Bilgisi
          </h3>

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
                  src={selectedStudent.photo} 
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
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleAttendance(selectedStudent.id)}
                      style={{
                        padding: '8px 24px',
                        backgroundColor: attendanceData[selectedStudent.id] ? '#22c55e' : '#f3f4f6',
                        color: attendanceData[selectedStudent.id] ? '#fff' : '#6b7280',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Katıldı
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAttendance(selectedStudent.id)}
                      style={{
                        padding: '8px 24px',
                        backgroundColor: !attendanceData[selectedStudent.id] ? '#ef4444' : '#f3f4f6',
                        color: !attendanceData[selectedStudent.id] ? '#fff' : '#6b7280',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Katılmadı
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
                      Antrenman Katılımı %{Math.round((presentCount / totalCount) * 100)}
                    </span>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '2px',
                      backgroundColor: '#5b7ce6',
                      transform: 'rotate(45deg)'
                    }} />
                  </div>
                  <div style={{ 
                    width: '240px', 
                    height: '12px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(presentCount / totalCount) * 100}%`,
                      height: '100%',
                      backgroundColor: '#5b7ce6',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Time Filter Toggle - Right Under Progress Bar */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ 
                    display: 'inline-flex',
                    backgroundColor: '#fff',
                    border: '1px solid #5b7ce6',
                    borderRadius: '16px',
                    padding: '2px',
                    gap: '2px'
                  }}>
                    {['Haftalık', 'Aylık', 'Yıllık'].map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setTimeFilter(filter)}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: timeFilter === filter ? '#5b7ce6' : 'transparent',
                          color: timeFilter === filter ? '#fff' : '#5b7ce6',
                          border: 'none',
                          borderRadius: '14px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
