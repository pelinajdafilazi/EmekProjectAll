import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { getStudentsWithoutLesson, getLessonStudents } from '../../../services/lessonService';
import { StudentService } from '../../../services/studentService';
import { transformBackendToStudent } from '../../../services/studentService';

export default function LessonStudentAssignModal({ isOpen, onClose, onAssign, lessonId = null }) {
  const [activeTab, setActiveTab] = useState('without-lesson');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lessonStudentIds, setLessonStudentIds] = useState(new Set()); // Derse kayıtlı öğrenci ID'leri

  // Derse kayıtlı öğrencileri yükle
  useEffect(() => {
    const loadLessonStudents = async () => {
      if (!isOpen || !lessonId) return;
      
      try {
        const lessonStudents = await getLessonStudents(lessonId);
        const ids = new Set();
        
        lessonStudents.forEach(student => {
          const id = student.id || student.studentId || student._backendData?.id;
          if (id) {
            ids.add(String(id));
          }
        });
        
        setLessonStudentIds(ids);
      } catch (error) {
        console.error('Ders öğrencileri yüklenirken hata:', error);
      }
    };

    if (isOpen && lessonId) {
      loadLessonStudents();
    }
  }, [isOpen, lessonId]);

  // Load students when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedStudent(null);
      loadStudents();
    }
  }, [isOpen, activeTab, lessonId]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (activeTab === 'without-lesson') {
        // Derse kayıtlı olmayan sporcular
        try {
          if (lessonId) {
            data = await getStudentsWithoutLesson(lessonId);
          } else {
            data = await getStudentsWithoutLesson();
          }
          console.log('Derse kayıtlı olmayan sporcular:', data);
        } catch (error) {
          console.error('Derse kayıtlı olmayan sporcular yüklenirken hata:', error);
          throw error;
        }
      } else {
        // Tüm sporcular
        data = await StudentService.getAllStudents();
        console.log('Tüm sporcular:', data);
      }
      
      // Transform students if needed
      const transformedStudents = Array.isArray(data) 
        ? data.map(student => {
            // Eğer zaten transform edilmişse olduğu gibi kullan
            if (student.name && student.age !== undefined) {
              return student;
            }
            // Backend formatındaysa transform et
            return transformBackendToStudent(student);
          })
        : [];
      
      setStudents(transformedStudents);
    } catch (err) {
      console.error('Öğrenciler yüklenirken hata:', err);
      setError(err.message || 'Öğrenciler yüklenirken bir hata oluştu');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    const name = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAssign = () => {
    if (selectedStudent && lessonId) {
      onAssign(selectedStudent.id);
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="lesson-student-modal-overlay" onClick={handleBackdropClick}>
      <div className="lesson-student-modal">
        <button className="lesson-student-modal__close" onClick={onClose} aria-label="Close modal">
          <X style={{ width: '24px', height: '24px', color: '#5677fb' }} />
        </button>

        <h1 className="lesson-student-modal__title">Öğrenci Listesi</h1>

        <div className="lesson-student-modal__content">
          {/* Left Panel - Student List */}
          <div className="lesson-student-modal__left">
            {/* Search Bar */}
            <div className="lesson-student-modal__search">
              <input
                type="text"
                className="lesson-student-modal__search-input"
                placeholder="Sporcu ara.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search style={{ width: '20px', height: '20px', color: '#5677fb' }} className="lesson-student-modal__search-icon" />
            </div>

            {/* Tabs */}
            <div className="lesson-student-modal__tabs">
              <button
                className={`lesson-student-modal__tab ${activeTab === 'without-lesson' ? 'lesson-student-modal__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('without-lesson');
                  setSelectedStudent(null);
                  setSearchQuery('');
                }}
              >
                Derse Kayıtlı Olmayan Sporcular
              </button>
              <button
                className={`lesson-student-modal__tab ${activeTab === 'all' ? 'lesson-student-modal__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('all');
                  setSelectedStudent(null);
                  setSearchQuery('');
                }}
              >
                Tüm Sporcular
              </button>
            </div>

            {/* Student List */}
            <div className="lesson-student-modal__list">
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                  Yükleniyor...
                </div>
              ) : error ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
                  {error}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                  {activeTab === 'without-lesson' 
                    ? 'Derse kayıtlı olmayan sporcu bulunamadı' 
                    : 'Öğrenci bulunamadı'}
                </div>
              ) : (
                filteredStudents.map((student) => {
                  // Transform edilmiş öğrenci verilerini kullan
                  const studentName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'İsimsiz Öğrenci';
                  const studentPhoto = student.photo || student.photoUrl || '/avatars/student-1.svg';
                  const studentAge = student.age !== '-' ? student.age : '-';
                  const studentBranch = student.team || student.branch || '-';
                  
                  // Öğrencinin bu derse kayıtlı olup olmadığını kontrol et
                  const studentId = String(student.id || '');
                  const isRegistered = lessonStudentIds.has(studentId);
                  
                  return (
                    <button
                      key={student.id}
                      className={`lesson-student-modal__row ${selectedStudent?.id === student.id ? 'lesson-student-modal__row--active' : ''}`}
                      onClick={() => setSelectedStudent(student)}
                      disabled={isRegistered && activeTab === 'without-lesson'}
                    >
                      <div className="lesson-student-modal__row-indicator" aria-hidden="true" />
                      <div className="lesson-student-modal__row-avatar">
                        <img src={studentPhoto} alt={studentName} />
                      </div>
                      <div className="lesson-student-modal__row-name">{studentName}</div>
                      <div className="lesson-student-modal__row-meta">
                        {isRegistered ? 'Kayıtlı' : '-'}
                      </div>
                      <div className="lesson-student-modal__row-meta lesson-student-modal__row-meta--wide">
                        {studentBranch}
                      </div>
                      <div className="lesson-student-modal__row-meta">{studentAge}</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel - Student Details */}
          <div className="lesson-student-modal__right">
            {selectedStudent ? (
              <>
                <div className="lesson-student-modal__profile">
                  <div className="lesson-student-modal__profile-avatar">
                    <img 
                      src={selectedStudent.photo || selectedStudent.photoUrl || '/avatars/student-1.svg'} 
                      alt={selectedStudent.name || `${selectedStudent.firstName} ${selectedStudent.lastName}`} 
                    />
                  </div>
                  <div className="lesson-student-modal__profile-name">
                    {selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim()}
                  </div>
                  <div className="lesson-student-modal__profile-position">
                    {selectedStudent.position || selectedStudent.branch || 'Sporcu'}
                  </div>
                </div>

                <div className="lesson-student-modal__details">
                  {selectedStudent.jerseyNumber && (
                    <div className="lesson-student-modal__detail-row">
                      <div className="lesson-student-modal__detail-label">Forma No</div>
                      <div className="lesson-student-modal__detail-value">
                        {selectedStudent.jerseyNumber}
                      </div>
                    </div>
                  )}
                  <div className="lesson-student-modal__detail-row">
                    <div className="lesson-student-modal__detail-label">Yaş</div>
                    <div className="lesson-student-modal__detail-value">
                      {selectedStudent.age || (selectedStudent.dateOfBirth ? new Date().getFullYear() - new Date(selectedStudent.dateOfBirth).getFullYear() : '-')}
                    </div>
                  </div>
                  <div className="lesson-student-modal__detail-row lesson-student-modal__detail-row--last">
                    <div className="lesson-student-modal__detail-label">Doğum Tarihi</div>
                    <div className="lesson-student-modal__detail-value">
                      {selectedStudent.birthDate || (selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('tr-TR') : '-')}
                    </div>
                  </div>
                </div>

                {(() => {
                  const studentId = String(selectedStudent.id || '');
                  const isRegistered = lessonStudentIds.has(studentId);
                  
                  if (isRegistered) {
                    return (
                      <div className="lesson-student-modal__details lesson-student-modal__details--registered">
                        <div className="lesson-student-modal__detail-row">
                          <div className="lesson-student-modal__detail-label">Durum</div>
                          <div className="lesson-student-modal__detail-value">
                            Bu derse kayıtlı
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="lesson-student-modal__no-registration">
                        Bu derse<br />kayıtlı değil
                      </div>
                    );
                  }
                })()}

                <button 
                  className="lesson-student-modal__assign-btn" 
                  onClick={handleAssign}
                  disabled={loading || !lessonId || lessonStudentIds.has(String(selectedStudent?.id || ''))}
                >
                  Sporcu Ata
                </button>
              </>
            ) : (
              <div className="lesson-student-modal__empty">
                Öğrenci seçiniz
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

