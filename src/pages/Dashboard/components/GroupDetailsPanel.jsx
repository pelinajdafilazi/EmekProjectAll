import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import StudentListModal from './StudentListModal';
import { useGroups } from '../../../context/GroupContext';

// Helper function to parse age range string to min/max numbers (for backward compatibility)
const parseAgeRange = (ageRangeString) => {
  if (!ageRangeString) return { minAge: null, maxAge: null };
  const match = ageRangeString.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    return {
      minAge: parseInt(match[1], 10),
      maxAge: parseInt(match[2], 10)
    };
  }
  return { minAge: null, maxAge: null };
};

// Helper function to format min/max age to display string
const formatAgeRange = (minAge, maxAge) => {
  if (minAge !== null && maxAge !== null) {
    return `${minAge} - ${maxAge}`;
  }
  return '';
};

// Get age range from group (supports both old string format and new object format)
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
    return parseAgeRange(group.ageRange);
  }
  
  return { minAge: null, maxAge: null };
};

export default function GroupDetailsPanel({ group, students }) {
  const { actions } = useGroups();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Get initial age range from group data
  const initialAgeRange = getAgeRange(group);
  
  const [groupData, setGroupData] = useState({
    name: group?.name || '',
    minAge: initialAgeRange.minAge,
    maxAge: initialAgeRange.maxAge
  });

  // Update state when group prop changes
  useEffect(() => {
    if (group) {
      const ageRange = getAgeRange(group);
      setGroupData({
        name: group.name || '',
        minAge: ageRange.minAge,
        maxAge: ageRange.maxAge
      });
      setIsEditing(false);
      setError(null);
    }
  }, [group]);

  const handleAssignStudent = async (studentId) => {
    try {
      await actions.assignStudentToGroup(group.id, studentId);
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message || 'Öğrenci atanırken bir hata oluştu');
    }
  };

  const handleInputChange = (field, value) => {
    setGroupData(prev => ({
      ...prev,
      [field]: field === 'minAge' || field === 'maxAge' ? (value === '' ? null : parseInt(value, 10) || null) : value
    }));
  };

  const handleSave = async () => {
    setError(null);
    
    // Validasyon
    if (!groupData.name.trim()) {
      setError('Grup adı gereklidir');
      return;
    }

    if (groupData.minAge === null || groupData.maxAge === null) {
      setError('Yaş aralığı gereklidir');
      return;
    }

    if (groupData.minAge > groupData.maxAge) {
      setError('Minimum yaş maksimum yaştan büyük olamaz');
      return;
    }

    setIsSaving(true);
    try {
      await actions.updateGroup(group.id, {
        name: groupData.name.trim(),
        minAge: groupData.minAge,
        maxAge: groupData.maxAge
      });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Grup güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    const ageRange = getAgeRange(group);
    setGroupData({
      name: group?.name || '',
      minAge: ageRange.minAge,
      maxAge: ageRange.maxAge
    });
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${group.name}" grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await actions.deleteGroup(group.id);
      // Silme başarılı - grup zaten context'te kaldırıldı
      setIsSaving(false);
    } catch (err) {
      console.error('Grup silme hatası:', err);
      setError(err.message || 'Grup silinirken bir hata oluştu');
      setIsSaving(false);
    }
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

      <div className="group-content-wrapper">
        <div className="group-info">
          <h2 className="group-info__title">Grup Bilgileri</h2>
          {error && (
            <div className="group-info__error">
              {error}
            </div>
          )}
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
                <div className="group-info__age-range">
                  <input
                    type="number"
                    className="group-info__input group-info__input--age"
                    value={groupData.minAge ?? ''}
                    onChange={(e) => handleInputChange('minAge', e.target.value)}
                    placeholder="Min"
                    min="0"
                    max="100"
                  />
                  <span className="group-info__age-separator">-</span>
                  <input
                    type="number"
                    className="group-info__input group-info__input--age"
                    value={groupData.maxAge ?? ''}
                    onChange={(e) => handleInputChange('maxAge', e.target.value)}
                    placeholder="Max"
                    min="0"
                    max="100"
                  />
                </div>
              ) : (
                <div className="group-info__value">
                  {formatAgeRange(
                    getAgeRange(group).minAge,
                    getAgeRange(group).maxAge
                  )} Yaş
                </div>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="group-info__button-group">
              <button 
                type="button" 
                className="group-info__save-btn" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button 
                type="button" 
                className="group-info__cancel-btn" 
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  const ageRange = getAgeRange(group);
                  setGroupData({
                    name: group?.name || '',
                    minAge: ageRange.minAge,
                    maxAge: ageRange.maxAge
                  });
                }}
                disabled={isSaving}
              >
                İptal
              </button>
              <button 
                type="button" 
                className="group-info__delete-btn" 
                onClick={handleDelete}
                disabled={isSaving}
              >
                {isSaving ? 'Siliniyor...' : 'Grubu Sil'}
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
      </div>

      <StudentListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssign={handleAssignStudent}
      />
    </section>
  );
}