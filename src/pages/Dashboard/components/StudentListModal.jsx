import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import * as GroupService from '../../../services/groupService';
import { StudentService } from '../../../services/studentService';
import StudentImage from './StudentImage';

export default function StudentListModal({ isOpen, onClose, onAssign, lessonId = null }) {
  const [activeTab, setActiveTab] = useState('without-group');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentGroupMap, setStudentGroupMap] = useState(new Map()); // Öğrenci ID -> Grup adı

  // Gruplardaki öğrencileri yükle ve mapping oluştur
  useEffect(() => {
    const loadGroupStudents = async () => {
      if (!isOpen) return;
      
      const studentToGroupMap = new Map(); // Öğrenci ID -> Grup adı
      
      try {
        const groups = await GroupService.getGroups();
        
        for (const group of groups) {
          try {
            const groupStudents = await GroupService.getGroupStudents(group.id);
            // Öğrenci ID'lerini Set'e ekle (hem id hem de nationalId'yi kontrol et)
            groupStudents.forEach(student => {
              const studentId = student.id || student._backendData?.id;
              const studentNationalId = student.profile?.tc || student._backendData?.nationalId;
              
              if (studentId) {
                studentToGroupMap.set(String(studentId), group.name);
              }
              if (studentNationalId && studentNationalId !== '-') {
                studentToGroupMap.set(String(studentNationalId), group.name);
              }
              if (student._backendData?.id) {
                studentToGroupMap.set(String(student._backendData.id), group.name);
              }
              if (student._backendData?.nationalId) {
                studentToGroupMap.set(String(student._backendData.nationalId), group.name);
              }
            });
          } catch (error) {
            console.error(`Grup ${group.id} öğrencileri yüklenirken hata:`, error);
          }
        }
        
        setStudentGroupMap(studentToGroupMap);
      } catch (error) {
        console.error('Gruplar yüklenirken hata:', error);
      }
    };

    if (isOpen) {
      loadGroupStudents();
    }
  }, [isOpen]);

  // Load students when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedStudent(null);
      loadStudents();
    }
  }, [isOpen, activeTab]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (activeTab === 'without-group') {
        // Grubu olmayan sporcular
        try {
          data = await GroupService.getStudentsWithoutGroups();
          console.log('Grubu olmayan sporcular:', data);
        } catch (error) {
          console.error('Grubu olmayan sporcular yüklenirken hata:', error);
          throw error;
        }
      } else {
        // Tüm sporcular - hem gruplu hem grupsuz tüm öğrenciler
        data = await StudentService.getAllStudents();
        console.log('Tüm sporcular:', data);
      }
      setStudents(data || []);
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
    const name = student.name || student.firstName + ' ' + student.lastName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAssign = () => {
    if (selectedStudent) {
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
    <div className="student-modal-overlay" onClick={handleBackdropClick}>
      <div className="student-modal">
        <button className="student-modal__close" onClick={onClose} aria-label="Close modal">
          <X style={{ width: '24px', height: '24px', color: '#5677fb' }} />
        </button>

        <h1 className="student-modal__title">Öğrenci Listesi</h1>

        <div className="student-modal__content">
          {/* Left Panel - Student List */}
          <div className="student-modal__left">
            {/* Search Bar */}
            <div className="student-modal__search">
              <input
                type="text"
                className="student-modal__search-input"
                placeholder="Sporcu ara.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search style={{ width: '20px', height: '20px', color: '#5677fb' }} className="student-modal__search-icon" />
            </div>

            {/* Tabs */}
            <div className="student-modal__tabs">
              <button
                className={`student-modal__tab ${activeTab === 'without-group' ? 'student-modal__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('without-group');
                  setSelectedStudent(null);
                  setSearchQuery('');
                }}
              >
                Grubu Olmayan Sporcular
              </button>
              <button
                className={`student-modal__tab ${activeTab === 'all' ? 'student-modal__tab--active' : ''}`}
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
            <div className="student-modal__list">
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
                  {activeTab === 'without-group' 
                    ? 'Grubu olmayan sporcu bulunamadı' 
                    : 'Öğrenci bulunamadı'}
                </div>
              ) : (
                filteredStudents.map((student) => {
                  // Transform edilmiş öğrenci verilerini kullan
                  const studentName = student.name || 'İsimsiz Öğrenci';
                  const studentAge = student.age !== '-' ? student.age : '-';
                  const studentBranch = student.team || student.branch || '-';
                  
                  // Öğrencinin hangi grupta olduğunu bul
                  const studentId = String(student.id || '');
                  const studentNationalId = String(student.profile?.tc || student._backendData?.nationalId || '');
                  const studentGroup = studentGroupMap.get(studentId) || 
                                      (studentNationalId !== '' ? studentGroupMap.get(studentNationalId) : null) ||
                                      '-';
                  
                  return (
                    <button
                      key={student.id}
                      className={`student-modal__row ${selectedStudent?.id === student.id ? 'student-modal__row--active' : ''}`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="student-modal__row-indicator" aria-hidden="true" />
                      <div className="student-modal__row-avatar">
                        <StudentImage student={student} alt={studentName} />
                      </div>
                      <div className="student-modal__row-name">{studentName}</div>
                      <div className="student-modal__row-meta">{studentGroup}</div>
                      <div className="student-modal__row-meta student-modal__row-meta--wide">
                        {studentBranch}
                      </div>
                      <div className="student-modal__row-meta">{studentAge}</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel - Student Details */}
          <div className="student-modal__right">
            {selectedStudent ? (
              <>
                <div className="student-modal__profile">
                  <div className="student-modal__profile-avatar">
                    <StudentImage 
                      student={selectedStudent}
                      alt={selectedStudent.name || `${selectedStudent.firstName} ${selectedStudent.lastName}`} 
                    />
                  </div>
                  <div className="student-modal__profile-name">
                    {selectedStudent.name || `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim()}
                  </div>
                  <div className="student-modal__profile-position">
                    {selectedStudent.position || selectedStudent.branch || 'Sporcu'}
                  </div>
                </div>

                <div className="student-modal__details">
                  {selectedStudent.jerseyNumber && (
                    <div className="student-modal__detail-row">
                      <div className="student-modal__detail-label">Forma No</div>
                      <div className="student-modal__detail-value">
                        {selectedStudent.jerseyNumber}
                      </div>
                    </div>
                  )}
                  <div className="student-modal__detail-row">
                    <div className="student-modal__detail-label">Yaş</div>
                    <div className="student-modal__detail-value">
                      {selectedStudent.age || (selectedStudent.dateOfBirth ? new Date().getFullYear() - new Date(selectedStudent.dateOfBirth).getFullYear() : '-')}
                    </div>
                  </div>
                  <div className="student-modal__detail-row student-modal__detail-row--last">
                    <div className="student-modal__detail-label">Doğum Tarihi</div>
                    <div className="student-modal__detail-value">
                      {selectedStudent.birthDate || (selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('tr-TR') : '-')}
                    </div>
                  </div>
                </div>

                {(() => {
                  const studentId = String(selectedStudent.id || '');
                  const studentNationalId = String(selectedStudent.profile?.tc || selectedStudent._backendData?.nationalId || '');
                  const studentGroup = studentGroupMap.get(studentId) || 
                                      (studentNationalId !== '' ? studentGroupMap.get(studentNationalId) : null);
                  
                  if (studentGroup) {
                    return (
                      <div className="student-modal__details student-modal__details--group">
                        <div className="student-modal__detail-row">
                          <div className="student-modal__detail-label">Mevcut Grup</div>
                          <div className="student-modal__detail-value">
                            {studentGroup}
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="student-modal__no-group">
                        Mevcut Grubu<br />Bulunmamaktadır
                      </div>
                    );
                  }
                })()}

                <button 
                  className="student-modal__assign-btn" 
                  onClick={handleAssign}
                  disabled={loading}
                >
                  Sporcu Ata
                </button>
              </>
            ) : (
              <div className="student-modal__empty">
                Öğrenci seçiniz
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}