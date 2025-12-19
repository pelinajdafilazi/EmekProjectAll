import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import StudentListModal from './StudentListModal';

export default function GroupDetailsPanel({ group, students }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groupData, setGroupData] = useState({
    name: group?.name || '',
    ageRange: group?.ageRange || ''
  });

  const handleAssignStudent = (studentId) => {
    console.log('Assigning student:', studentId, 'to group:', group?.id);
    // Here you would typically update the backend or state management
  };

  const handleInputChange = (field, value) => {
    setGroupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving group data:', groupData);
    setIsEditing(false);
    // Here you would typically update the backend or state management
  };

  const handleEdit = () => {
    setIsEditing(true);
    setGroupData({
      name: group?.name || '',
      ageRange: group?.ageRange || ''
    });
  };

  if (!group) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Grup seçiniz
        </div>
      </section>
    );
  }

  return (
    <section className="dash-right">
      <div className="group-header">Grup Bilgisi</div>

      <div className="group-info">
        <h2 className="group-info__title">Grup Bilgileri</h2>
        <div className="group-info__details">
          <div className="group-info__row">
            <div className="group-info__label">Grup Adı:</div>
            {isEditing ? (
              <input
                type="text"
                className="group-info__input"
                value={groupData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Grup adını giriniz"
              />
            ) : (
              <div className="group-info__value">{group.name}</div>
            )}
          </div>
          <div className="group-info__row">
            <div className="group-info__label">Yaş Aralığı:</div>
            {isEditing ? (
              <input
                type="text"
                className="group-info__input"
                value={groupData.ageRange}
                onChange={(e) => handleInputChange('ageRange', e.target.value)}
                placeholder="Yaş aralığını giriniz (örn: 10 - 15)"
              />
            ) : (
              <div className="group-info__value">{group.ageRange} Yaş</div>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="group-info__button-group">
            <button type="button" className="group-info__save-btn" onClick={handleSave}>
              Kaydet
            </button>
            <button type="button" className="group-info__cancel-btn" onClick={() => setIsEditing(false)}>
              İptal
            </button>
          </div>
        ) : (
          <button type="button" className="group-info__edit-btn" onClick={handleEdit}>
            Grup Bilgisi Düzenle
          </button>
        )}
      </div>

      <div className="group-students">
        <h2 className="group-students__title">Öğrenci Listesi</h2>
        <div className="group-students__list">
          {students.map((student) => (
            <div key={student.id} className="group-student-row">
              <div className="group-student-row__avatar">
                <img src={student.photo} alt={student.name} />
              </div>
              <div className="group-student-row__name">{student.name}</div>
              <div className="group-student-row__meta">{student.age}</div>
              <div className="group-student-row__meta group-student-row__meta--wide">
                {student.team}
              </div>
              <div className="group-student-row__meta">{student.birthDate}</div>
              <div className="group-student-row__meta">{student.attendance}</div>
              <div className="group-student-row__menu">
                <MoreVertical size={16} strokeWidth={2.5} />
              </div>
              <div className="group-student-row__indicator" />
            </div>
          ))}
        </div>
        <button 
          type="button" 
          className="group-students__assign-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Sporcu Ata
        </button>
      </div>

      <StudentListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssign={handleAssignStudent}
      />
    </section>
  );
}