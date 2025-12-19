import React, { useState } from 'react';
import { X, Search, MoreVertical } from 'lucide-react';
import { mockStudents } from '../../../data/mockStudents';

export default function StudentListModal({ isOpen, onClose, onAssign }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (!isOpen) return null;

  // Filter students based on active tab and search query
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'unassigned') {
      return matchesSearch && !student.hasGroup;
    }
    return matchesSearch;
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
                onClick={() => setActiveTab('unassigned')}
              >
                Grupsuz Sporcular
              </button>
              <button
                className={`student-modal__tab ${activeTab === 'all' ? 'student-modal__tab--active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Tüm Sporcular
              </button>
            </div>

            {/* Student List */}
            <div className="student-modal__list">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  className={`student-modal__row ${selectedStudent?.id === student.id ? 'student-modal__row--active' : ''}`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="student-modal__row-avatar">
                    <img src={student.photo} alt={student.name} />
                  </div>
                  <div className="student-modal__row-name">{student.name}</div>
                  <div className="student-modal__row-meta">{student.age}</div>
                  <div className="student-modal__row-meta student-modal__row-meta--wide">
                    {student.team}
                  </div>
                  <div className="student-modal__row-meta">{student.birthDate}</div>
                  <div className="student-modal__row-meta">{student.attendance}</div>
                  <div className="student-modal__row-menu">
                    <MoreVertical style={{ width: '16px', height: '16px', color: '#5677fb' }} />
                  </div>
                </button>
              ))}
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
                    <img src={selectedStudent.photo} alt={selectedStudent.name} />
                  </div>
                  <div className="student-modal__profile-name">{selectedStudent.name}</div>
                  <div className="student-modal__profile-position">
                    {selectedStudent.position || 'Orta Oyuncu'}
                  </div>
                </div>

                <div className="student-modal__details">
                  <div className="student-modal__detail-row">
                    <div className="student-modal__detail-label">Forma No</div>
                    <div className="student-modal__detail-value">
                      {selectedStudent.jerseyNumber || '8'}
                    </div>
                  </div>
                  <div className="student-modal__detail-row">
                    <div className="student-modal__detail-label">Yaş</div>
                    <div className="student-modal__detail-value">{selectedStudent.age}</div>
                  </div>
                  <div className="student-modal__detail-row">
                    <div className="student-modal__detail-label">Doğum Tarihi</div>
                    <div className="student-modal__detail-value">{selectedStudent.birthDate}</div>
                  </div>
                </div>

                <div className="student-modal__status">
                  Mevcut Grubu Bulunmamaktadır
                </div>

                <button className="student-modal__assign-btn" onClick={handleAssign}>
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