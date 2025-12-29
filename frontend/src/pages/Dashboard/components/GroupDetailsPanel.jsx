import React, { useState, useEffect } from 'react';
import StudentListModal from './StudentListModal';
import { useGroups } from '../../../context/GroupContext';
import { StudentService } from '../../../services/studentService';
import StudentImage from './StudentImage';

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
  const [studentBranches, setStudentBranches] = useState(new Map()); // Öğrenci ID -> Branş
  
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

  // Öğrenci ID'lerinden branş bilgilerini çek
  useEffect(() => {
    const fetchStudentBranches = async () => {
      if (!students || students.length === 0) {
        setStudentBranches(new Map());
        return;
      }

      const branchMap = new Map();
      const promises = students.map(async (student) => {
        try {
          const studentId = student?.id || 
                           student?.studentId || 
                           student?.student?.id ||
                           student?._backendData?.id;
          
          if (!studentId) return;

          // Öğrenci verisinde branş bilgisi varsa önce onu kontrol et
          const existingBranch = student?.team || 
                                student?.branch || 
                                student?.position ||
                                student?.student?.branch ||
                                student?.student?.team ||
                                student?._backendData?.branch ||
                                student?.profile?.branch;
          
          if (existingBranch && existingBranch !== '-') {
            branchMap.set(String(studentId), existingBranch);
            return;
          }

          // Branş bilgisi yoksa API'den çek
          const studentDetails = await StudentService.getStudentById(studentId);
          if (studentDetails) {
            const branch = studentDetails.team || 
                          studentDetails.branch || 
                          studentDetails.position ||
                          studentDetails.profile?.branch ||
                          '-';
            branchMap.set(String(studentId), branch);
          }
        } catch (error) {
          console.error(`Öğrenci ${student?.id} branş bilgisi çekilirken hata:`, error);
          // Hata durumunda '-' kullan
          const studentId = student?.id || student?.studentId || student?.student?.id;
          if (studentId) {
            branchMap.set(String(studentId), '-');
          }
        }
      });

      await Promise.all(promises);
      setStudentBranches(branchMap);
    };

    fetchStudentBranches();
  }, [students]);

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
    if (!group || !group.id) {
      setError('Grup bilgisi bulunamadı.');
      return;
    }

    if (!window.confirm(`"${group.name}" grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await actions.deleteGroup(group.id);
      setIsSaving(false);
    } catch (err) {
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
                className="group-info__delete-btn" 
                onClick={handleDelete}
                disabled={isSaving}
              >
                {isSaving ? 'Siliniyor...' : 'Grubu Sil'}
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
                className="group-info__save-btn" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
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
          <div className="dash-list" role="list">
            {students.map((student) => {
              // Öğrenci bilgilerini güvenli şekilde al - tüm olası alan adlarını kontrol et
              // Backend'den gelen _backendData içindeki studentFirstName ve studentLastName'i de kontrol et
              const backendData = student?._backendData || {};
              const studentName = student?.name || 
                                  (student?.firstName && student?.lastName ? `${student.firstName} ${student.lastName}`.trim() : '') ||
                                  (backendData.studentFirstName && backendData.studentLastName ? `${backendData.studentFirstName} ${backendData.studentLastName}`.trim() : '') ||
                                  student?.fullName ||
                                  (student?.student?.name) ||
                                  (student?.student?.firstName && student?.student?.lastName ? `${student.student.firstName} ${student.student.lastName}`.trim() : '') ||
                                  'İsimsiz Öğrenci';
              
              const studentAge = student?.age !== undefined && student?.age !== '-' ? student.age : '-';
              
              // Öğrenci ID'sini al
              const studentId = String(student?.id || 
                                      student?.studentId || 
                                      student?.student?.id ||
                                      student?._backendData?.id ||
                                      '');
              
              // Önce Map'ten branş bilgisini kontrol et (API'den çekilmiş)
              let studentBranch = studentBranches.get(studentId);
              
              // Map'te yoksa mevcut verilerden kontrol et
              if (!studentBranch || studentBranch === '-') {
                studentBranch = student?.team || 
                                student?.branch || 
                                student?.position ||
                                student?.student?.branch ||
                                student?.student?.team ||
                                backendData?.branch ||
                                backendData?.team ||
                                student?.profile?.branch ||
                                '-';
              }
              const studentBirthDate = student?.birthDate !== undefined && student?.birthDate !== '-' 
                ? student.birthDate 
                : (student?.profile?.dob !== undefined && student?.profile?.dob !== '-' 
                  ? student.profile.dob 
                  : (backendData?.dateOfBirth 
                    ? (() => {
                        try {
                          const date = new Date(backendData.dateOfBirth);
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}.${month}.${year}`;
                        } catch {
                          return '-';
                        }
                      })()
                    : (student?.student?.birthDate !== undefined && student?.student?.birthDate !== '-' 
                      ? student.student.birthDate 
                      : '-')));
              const studentAttendance = student?.attendance !== undefined ? student.attendance : '-';
              
              return (
                <button
                  key={student.id || student.studentId || student.student?.id || Math.random()}
                  type="button"
                  className="dash-row dash-row--group-students"
                >
                  <div className="dash-row__indicator" aria-hidden="true" />
                  <div className="dash-row__avatar">
                    <StudentImage student={student} alt={studentName} />
                  </div>
                  <div className="dash-row__name">{studentName}</div>
                  <div className="dash-row__meta">{group?.name || '-'}</div>
                  <div className="dash-row__meta dash-row__meta--wide">{studentBranch}</div>
                  <div className="dash-row__meta dash-row__meta--wide">
                    {studentBirthDate}
                  </div>
                  <div className="dash-row__meta">{studentAge}</div>
                </button>
              );
            })}
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