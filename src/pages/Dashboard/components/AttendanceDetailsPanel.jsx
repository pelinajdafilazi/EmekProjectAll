import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function AttendanceDetailsPanel({ lesson, students }) {
  const [attendanceData, setAttendanceData] = useState(
    students.reduce((acc, student) => {
      acc[student.id] = student.isPresent !== undefined ? student.isPresent : true;
      return acc;
    }, {})
  );

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

  if (!lesson) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Ders seçiniz
        </div>
      </section>
    );
  }

  const presentCount = Object.values(attendanceData).filter(isPresent => isPresent).length;
  const totalCount = students.length;

  return (
    <section className="dash-right">
      <div className="lesson-header">Yoklama Bilgisi</div>

      <div className="lesson-content-wrapper">
        <div className="lesson-info">
          <h2 className="lesson-info__title">Ders Bilgileri</h2>
          <div className="lesson-info__details">
            <div className="lesson-info__row">
              <div className="lesson-info__label">Ders Adı:</div>
              <div className="lesson-info__value">{lesson.name}</div>
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Grup Adı:</div>
              <div className="lesson-info__value">{lesson.groupName}</div>
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Tarih:</div>
              <div className="lesson-info__value">{lesson.day}</div>
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Saat:</div>
              <div className="lesson-info__value">{lesson.time}</div>
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Katılım:</div>
              <div className="lesson-info__value attendance-stats">
                {presentCount}/{totalCount}
              </div>
            </div>
          </div>
        </div>

        <div className="lesson-students">
          <div className="lesson-students__header">
            <h2 className="lesson-students__title">Öğrenci Yoklama Listesi</h2>
            <div className="lesson-students__count">{presentCount}/{totalCount}</div>
          </div>
          <div className="lesson-students__list">
            {students.map((student) => {
              const isPresent = attendanceData[student.id];
              return (
                <div 
                  key={student.id} 
                  className={`lesson-student-row ${!isPresent ? 'lesson-student-row--absent' : ''}`}
                >
                  <div className="lesson-student-row__avatar">
                    <img src={student.photo} alt={student.name} />
                  </div>
                  <div className="lesson-student-row__name">{student.name}</div>
                  <div className="lesson-student-row__meta">{student.age}</div>
                  <div className="lesson-student-row__meta lesson-student-row__meta--wide">
                    {student.team}
                  </div>
                  <div className="lesson-student-row__meta">{student.birthDate}</div>
                  <div className="lesson-student-row__meta">{student.attendance}</div>
                  <button
                    type="button"
                    className={`attendance-toggle ${isPresent ? 'attendance-toggle--present' : 'attendance-toggle--absent'}`}
                    onClick={() => handleToggleAttendance(student.id)}
                    title={isPresent ? 'Mevcut' : 'Yok'}
                  >
                    {isPresent ? <Check size={16} /> : <X size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
          <button 
            type="button" 
            className="lesson-students__assign-btn"
            onClick={handleSaveAttendance}
          >
            Yoklamayı Kaydet
          </button>
        </div>
      </div>
    </section>
  );
}
