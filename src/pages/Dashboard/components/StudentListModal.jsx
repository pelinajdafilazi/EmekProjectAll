import React, { useState, useEffect } from 'react';
import { X, Search, MoreVertical } from 'lucide-react';
import * as GroupService from '../../../services/groupService';

export default function StudentListModal({ isOpen, onClose, onAssign }) {
  const [activeTab, setActiveTab] = useState('unassigned');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load students when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen, activeTab]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (activeTab === 'unassigned') {
        data = await GroupService.getStudentsWithoutGroups();
      } else {
        data = await GroupService.getAllStudents();
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
                className={`student-modal__tab ${activeTab === 'unassigned' ? 'student-modal__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('unassigned');
                  setSelectedStudent(null);
                }}
              >
                Grupsuz Sporcular
              </button>
              <button
                className={`student-modal__tab ${activeTab === 'all' ? 'student-modal__tab--active' : ''}`}
                onClick={() => {
                  setActiveTab('all');
                  setSelectedStudent(null);
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
                  {activeTab === 'unassigned' ? 'Grupsuz öğrenci bulunamadı' : 'Öğrenci bulunamadı'}
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const studentName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim();
                  const studentPhoto = student.photo || student.photoUrl || '/avatars/student-1.svg';
                  const studentAge = student.age || (student.dateOfBirth ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear() : '-');
                  
                  return (
                    <button
                      key={student.id}
                      className={`student-modal__row ${selectedStudent?.id === student.id ? 'student-modal__row--active' : ''}`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="student-modal__row-avatar">
                        <img src={studentPhoto} alt={studentName} />
                      </div>
                      <div className="student-modal__row-name">{studentName}</div>
                      <div className="student-modal__row-meta">{studentAge}</div>
                      <div className="student-modal__row-meta student-modal__row-meta--wide">
                        {student.team || student.branch || '-'}
                      </div>
                      <div className="student-modal__row-meta">
                        {student.birthDate || (student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('tr-TR') : '-')}
                      </div>
                      <div className="student-modal__row-meta">{student.attendance || '-'}</div>
                      <div className="student-modal__row-menu">
                        <MoreVertical style={{ width: '16px', height: '16px', color: '#5677fb' }} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="student-modal__divider" />

          {/* Right Panel - Student Details */}
          <div className="student-modal__right">
            {selectedStudent ? (
              <>
                <div className="student-modal__profile">
                  <div className="student-modal__profile-avatar">
                    <img 
                      src={selectedStudent.photo || selectedStudent.photoUrl || '/avatars/student-1.svg'} 
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
                  <div className="student-modal__detail-row">
                    <div className="student-modal__detail-label">Doğum Tarihi</div>
                    <div className="student-modal__detail-value">
                      {selectedStudent.birthDate || (selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('tr-TR') : '-')}
                    </div>
                  </div>
                </div>

                <div className="student-modal__status">
                  {activeTab === 'unassigned' ? 'Mevcut Grubu Bulunmamaktadır' : 'Öğrenci Bilgileri'}
                </div>

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