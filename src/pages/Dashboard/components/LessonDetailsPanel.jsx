import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';
import StudentListModal from './StudentListModal';

export default function LessonDetailsPanel({ lesson, students }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const [lessonData, setLessonData] = useState({
    name: lesson?.name || '',
    groupName: lesson?.groupName || '',
    capacity: lesson?.capacity || '',
    selectedDay: lesson?.day || '',
    time: lesson?.time || ''
  });

  const dayDropdownRef = useRef(null);
  const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target)) {
        setIsDayDropdownOpen(false);
      }
    };

    if (isDayDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDayDropdownOpen]);

  const handleAssignStudent = (studentId) => {
    console.log('Assigning student:', studentId, 'to lesson:', lesson?.id);
    // Here you would typically update the backend or state management
  };

  const handleInputChange = (field, value) => {
    setLessonData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDaySelect = (day) => {
    setLessonData(prev => ({
      ...prev,
      selectedDay: day
    }));
    setIsDayDropdownOpen(false);
  };

  const handleSave = () => {
    console.log('Saving lesson data:', lessonData);
    setIsEditing(false);
    // Here you would typically update the backend or state management
  };

  const handleEdit = () => {
    setIsEditing(true);
    setLessonData({
      name: lesson?.name || '',
      groupName: lesson?.groupName || '',
      capacity: lesson?.capacity || '',
      selectedDay: lesson?.day || '',
      time: lesson?.time || ''
    });
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

  return (
    <section className="dash-right">
      <div className="lesson-header">Ders Bilgisi</div>

      <div className="lesson-content-wrapper">
        <div className="lesson-info">
          <h2 className="lesson-info__title">Ders Bilgileri</h2>
          <div className="lesson-info__details">
            <div className="lesson-info__row">
              <div className="lesson-info__label">Ders Adı:</div>
              {isEditing ? (
                <input
                  type="text"
                  className="lesson-info__input"
                  value={lessonData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ders adını giriniz"
                />
              ) : (
                <div className="lesson-info__value">{lesson.name}</div>
              )}
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Grup Adı:</div>
              {isEditing ? (
                <input
                  type="text"
                  className="lesson-info__input"
                  value={lessonData.groupName}
                  onChange={(e) => handleInputChange('groupName', e.target.value)}
                  placeholder="Grup adını giriniz"
                />
              ) : (
                <div className="lesson-info__value">{lesson.groupName}</div>
              )}
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Tarih:</div>
              {isEditing ? (
                <div className="lesson-info__day-selector" ref={dayDropdownRef}>
                  <button
                    type="button"
                    className="lesson-info__day-button"
                    onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
                  >
                    {lessonData.selectedDay || 'Gün seçiniz'}
                    <ChevronDown size={16} />
                  </button>
                  {isDayDropdownOpen && (
                    <div className="lesson-info__day-dropdown">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          className={`lesson-info__day-item ${lessonData.selectedDay === day ? 'lesson-info__day-item--active' : ''}`}
                          onClick={() => handleDaySelect(day)}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="lesson-info__value">{lesson.day}</div>
              )}
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Saat:</div>
              {isEditing ? (
                <input
                  type="time"
                  className="lesson-info__input"
                  value={lessonData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  placeholder="Saat giriniz"
                />
              ) : (
                <div className="lesson-info__value">{lesson.time}</div>
              )}
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Kapasite:</div>
              {isEditing ? (
                <input
                  type="number"
                  className="lesson-info__input"
                  value={lessonData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  placeholder="Kapasite giriniz"
                  min="1"
                />
              ) : (
                <div className="lesson-info__value">{lesson.capacity}</div>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="lesson-info__button-group">
              <button type="button" className="lesson-info__save-btn" onClick={handleSave}>
                Kaydet
              </button>
              <button type="button" className="lesson-info__cancel-btn" onClick={() => setIsEditing(false)}>
                İptal
              </button>
            </div>
          ) : (
            <button type="button" className="lesson-info__edit-btn" onClick={handleEdit}>
              Ders Bilgisi Güncelle
            </button>
          )}
        </div>

        <div className="lesson-students">
          <div className="lesson-students__header">
            <h2 className="lesson-students__title">Öğrenci Listesi</h2>
            <div className="lesson-students__count">{students.length}/{lesson.capacity}</div>
          </div>
          <div className="lesson-students__list">
            {students.map((student) => (
              <div key={student.id} className="lesson-student-row">
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
                <div className="lesson-student-row__menu">
                  <MoreVertical size={16} strokeWidth={2.5} />
                </div>
                <div className="lesson-student-row__indicator" />
              </div>
            ))}
          </div>
          <button 
            type="button" 
            className="lesson-students__assign-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Sporcu Ata
          </button>
        </div>
      </div>

      <StudentListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssign={handleAssignStudent}
      />
    </section>
  );
}
