import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
// import { BsPencilSquare } from 'react-icons/bs';
import { FaPencil } from "react-icons/fa6";
import StudentImage from './StudentImage';
import { getLessons, getLessonStudents } from '../../../services/lessonService';
import { getStudentAttendancePercentage } from '../../../services/attendanceService';
import { StudentService, transformStudentToUpdateRequest, transformStudentToUpdateRequestWithoutPhoto } from '../../../services/studentService';
import { ImageService } from '../../../services/imageService';
import WebcamCapture from '../../Form/components/WebcamCapture';

function ProfileAvatar({ student, name, onClick }) {
  return (
    <div className="dash-profile">
      <div className="dash-profile__avatar" onClick={onClick} style={{ cursor: 'pointer' }}>
        <div className="dash-profile__avatarInner">
          <StudentImage 
            student={student} 
            alt={name} 
            style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }} 
          />
        </div>
      </div>
      <div className="dash-profile__name">{name}</div>
    </div>
  );
}

function InfoGrid({ profile, name, isEditable, onProfileChange, onNameChange }) {
  const [localProfile, setLocalProfile] = useState(profile || {});
  const [localName, setLocalName] = useState(name || '');

  useEffect(() => {
    setLocalProfile(profile || {});
  }, [profile]);

  useEffect(() => {
    setLocalName(name || '');
  }, [name]);

  const handleChange = (field, value) => {
    const updated = { ...localProfile, [field]: value };
    setLocalProfile(updated);
    if (onProfileChange) {
      onProfileChange(updated);
    }
  };

  const handleNameChange = (value) => {
    setLocalName(value);
    if (onNameChange) {
      onNameChange(value);
    }
  };

  const gridRows = [
    [
      { label: 'Ad Soyad', field: 'name', value: localName || '—', isName: true },
      { label: 'T.C. Kimlik No', field: 'tc', value: localProfile?.tc || '—' },
    ],
    [
      { label: 'Okul İsmi', field: 'school', value: localProfile?.school || '—' },
      { label: 'Doğum Tarihi', field: 'dob', value: localProfile?.dob || '—' },
    ],
    [
      { label: 'Sınıf No', field: 'grade', value: localProfile?.grade || '—' },
      { label: 'Sporcu Cep', field: 'phone', value: localProfile?.phone || '—' },
    ],
    [
      { label: 'Branşı', field: 'branch', value: localProfile?.branch || '—' },
      { label: '', field: '', value: '', isSpacer: true },
    ],
  ];

  return (
    <div className="dash-info">
      {gridRows.map((rowPair, idx) => (
        <div key={idx} className="dash-info__grid-row">
          {rowPair[0].isSpacer ? (
            <>
              <div className="dash-info__label"></div>
              <div className="dash-info__value"></div>
            </>
          ) : (
            <>
              <div className="dash-info__label">{rowPair[0].label}</div>
              {isEditable ? (
                rowPair[0].isName ? (
                  <input
                    type="text"
                    className="dash-info__input"
                    value={rowPair[0].value === '—' ? '' : rowPair[0].value}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={rowPair[0].label}
                  />
                ) : (
                  <input
                    type="text"
                    className="dash-info__input"
                    value={rowPair[0].value === '—' ? '' : rowPair[0].value}
                    onChange={(e) => handleChange(rowPair[0].field, e.target.value)}
                    placeholder={rowPair[0].label}
                  />
                )
              ) : (
                <div className="dash-info__value">{rowPair[0].value}</div>
              )}
            </>
          )}
          {rowPair[1] && !rowPair[1].isSpacer && (
            <>
              <div className="dash-info__label">{rowPair[1].label}</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-info__input"
                  value={rowPair[1].value === '—' ? '' : rowPair[1].value}
                  onChange={(e) => handleChange(rowPair[1].field, e.target.value)}
                  placeholder={rowPair[1].label}
                />
              ) : (
                <div className="dash-info__value">{rowPair[1].value || ''}</div>
              )}
            </>
          )}
        </div>
      ))}
      <div className="dash-info__address-row">
        <span className="dash-info__address-label">Adres</span>
        {isEditable ? (
          <textarea
            className="dash-info__input dash-info__input--textarea"
            value={localProfile?.address === '—' ? '' : (localProfile?.address || '')}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Adres"
            rows={2}
          />
        ) : (
          <span className="dash-info__address-value">{localProfile?.address || '—'}</span>
        )}
      </div>
    </div>
  );
}

function ParentsCard({ mother, father, isEditable, onParentsChange }) {
  const [localMother, setLocalMother] = useState(mother || {});
  const [localFather, setLocalFather] = useState(father || {});

  useEffect(() => {
    setLocalMother(mother || {});
    setLocalFather(father || {});
  }, [mother, father]);

  const handleMotherChange = (field, value) => {
    const updated = { ...localMother, [field]: value };
    setLocalMother(updated);
    if (onParentsChange) {
      onParentsChange({ mother: updated, father: localFather });
    }
  };

  const handleFatherChange = (field, value) => {
    const updated = { ...localFather, [field]: value };
    setLocalFather(updated);
    if (onParentsChange) {
      onParentsChange({ mother: localMother, father: updated });
    }
  };

  return (
    <>
      <div className="dash-parents">
        <div className="dash-parents__col">
          <div className="dash-parents__header">Anne Bilgileri</div>
          <div className="dash-parents__body">
            <div className="dash-parents__row">
              <div className="dash-parents__label">Ad Soyad</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-parents__input"
                  value={localMother?.name === '—' ? '' : (localMother?.name || '')}
                  onChange={(e) => handleMotherChange('name', e.target.value)}
                  placeholder="Ad Soyad"
                />
              ) : (
                <div className="dash-parents__value">{localMother?.name || '—'}</div>
              )}
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">T.C. Kimlik No</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-parents__input"
                  value={localMother?.tc === '—' ? '' : (localMother?.tc || '')}
                  onChange={(e) => handleMotherChange('tc', e.target.value)}
                  placeholder="T.C. Kimlik No"
                />
              ) : (
                <div className="dash-parents__value">{localMother?.tc || '—'}</div>
              )}
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Mesleği</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-parents__input"
                  value={localMother?.occupation === '—' ? '' : (localMother?.occupation || '')}
                  onChange={(e) => handleMotherChange('occupation', e.target.value)}
                  placeholder="Mesleği"
                />
              ) : (
                <div className="dash-parents__value">{localMother?.occupation || '—'}</div>
              )}
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Cep Tel No</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-parents__input"
                  value={localMother?.phone === '—' ? '' : (localMother?.phone || '')}
                  onChange={(e) => handleMotherChange('phone', e.target.value)}
                  placeholder="Cep Tel No"
                />
              ) : (
                <div className="dash-parents__value">{localMother?.phone || '—'}</div>
              )}
            </div>
          </div>
        </div>
        <div className="dash-parents__divider" />
        <div className="dash-parents__col">
          <div className="dash-parents__header">Baba Bilgileri</div>
          <div className="dash-parents__body">
            <div className="dash-parents__row">
              <div className="dash-parents__label">Ad Soyad</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-parents__input"
                  value={localFather?.name === '—' ? '' : (localFather?.name || '')}
                  onChange={(e) => handleFatherChange('name', e.target.value)}
                  placeholder="Ad Soyad"
                />
              ) : (
                <div className="dash-parents__value">{localFather?.name || '—'}</div>
              )}
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">T.C. Kimlik No</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-parents__input"
                  value={localFather?.tc === '—' ? '' : (localFather?.tc || '')}
                  onChange={(e) => handleFatherChange('tc', e.target.value)}
                  placeholder="T.C. Kimlik No"
                />
              ) : (
                <div className="dash-parents__value">{localFather?.tc || '—'}</div>
              )}
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Mesleği</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-parents__input"
                  value={localFather?.occupation === '—' ? '' : (localFather?.occupation || '')}
                  onChange={(e) => handleFatherChange('occupation', e.target.value)}
                  placeholder="Mesleği"
                />
              ) : (
                <div className="dash-parents__value">{localFather?.occupation || '—'}</div>
              )}
            </div>
            <div className="dash-parents__row">
              <div className="dash-parents__label">Cep Tel No</div>
              {isEditable ? (
                <input
                  type="text"
                  className="dash-parents__input"
                  value={localFather?.phone === '—' ? '' : (localFather?.phone || '')}
                  onChange={(e) => handleFatherChange('phone', e.target.value)}
                  placeholder="Cep Tel No"
                />
              ) : (
                <div className="dash-parents__value">{localFather?.phone || '—'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RelativesCard({ title, relatives = [], isEditable, onRelativesChange }) {
  const [localRelatives, setLocalRelatives] = useState(relatives || []);

  useEffect(() => {
    setLocalRelatives(relatives || []);
  }, [relatives]);

  const handleRelativeChange = (index, field, value) => {
    const updated = [...localRelatives];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRelatives(updated);
    if (onRelativesChange) {
      onRelativesChange(updated);
    }
  };

  if (!localRelatives || localRelatives.length === 0) {
    return (
      <div className="dash-rel">
        <div className="dash-rel__title">{title}</div>
        <div className="dash-rel__cols">
          <div className="dash-rel__col">
            <div className="dash-rel__header">Yakın Bilgisi Yok</div>
            <div className="dash-rel__body">
              <div className="dash-rel__field">
                <div className="dash-rel__value" style={{ gridColumn: '1 / -1', justifyContent: 'center', padding: '20px' }}>
                  Kayıtlı yakın bilgisi bulunmamaktadır.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-rel">
      <div className="dash-rel__title">{title}</div>
      <div className="dash-rel__cols" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {localRelatives.map((relative, index) => (
          <div key={relative.id || index} className="dash-rel__col">
            {isEditable ? (
              <input
                type="text"
                className="dash-rel__input dash-rel__input--header"
                value={relative.relationType || `Yakın ${index + 1}`}
                onChange={(e) => handleRelativeChange(index, 'relationType', e.target.value)}
                placeholder="Yakınlık Derecesi"
              />
            ) : (
              <div className="dash-rel__header">{relative.relationType || `Yakın ${index + 1}`}</div>
            )}
            <div className="dash-rel__body">
              <div className="dash-rel__field">
                <div className="dash-rel__label">Ad Soyad</div>
                {isEditable ? (
                  <input
                    type="text"
                    className="dash-rel__input"
                    value={relative.name || ''}
                    onChange={(e) => handleRelativeChange(index, 'name', e.target.value)}
                    placeholder="Ad Soyad"
                  />
                ) : (
                  <div className="dash-rel__value">{relative.name || '—'}</div>
                )}
              </div>
              <div className="dash-rel__field">
                <div className="dash-rel__label">T.C. Kimlik No</div>
                {isEditable ? (
                  <input
                    type="text"
                    className="dash-rel__input"
                    value={relative.tc || ''}
                    onChange={(e) => handleRelativeChange(index, 'tc', e.target.value)}
                    placeholder="T.C. Kimlik No"
                  />
                ) : (
                  <div className="dash-rel__value">{relative.tc || '—'}</div>
                )}
              </div>
              <div className="dash-rel__field">
                <div className="dash-rel__label">Cep Tel No</div>
                {isEditable ? (
                  <input
                    type="text"
                    className="dash-rel__input"
                    value={relative.phone || ''}
                    onChange={(e) => handleRelativeChange(index, 'phone', e.target.value)}
                    placeholder="Cep Tel No"
                  />
                ) : (
                  <div className="dash-rel__value">{relative.phone || '—'}</div>
                )}
              </div>
              <div className="dash-rel__field">
                <div className="dash-rel__label">Mesleği</div>
                {isEditable ? (
                  <input
                    type="text"
                    className="dash-rel__input"
                    value={relative.occupation || ''}
                    onChange={(e) => handleRelativeChange(index, 'occupation', e.target.value)}
                    placeholder="Mesleği"
                  />
                ) : (
                  <div className="dash-rel__value">{relative.occupation || '—'}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentDetailsPanel({ student, loading = false, onStudentUpdated }) {
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [percentageLoading, setPercentageLoading] = useState(false);
  const [studentEditMode, setStudentEditMode] = useState(false);
  const [parentsEditMode, setParentsEditMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [editingParents, setEditingParents] = useState(null);
  const [editingRelatives, setEditingRelatives] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Load attendance percentage for student across all lessons
  useEffect(() => {
    const loadAttendancePercentage = async () => {
      if (!student?.id) {
        setAttendancePercentage(0);
        return;
      }

      setPercentageLoading(true);
      try {
        // Get all lessons
        const allLessons = await getLessons();
        
        // Find lessons where this student is enrolled
        const studentLessons = [];
        for (const lesson of allLessons) {
          try {
            const lessonStudents = await getLessonStudents(lesson.id || lesson.lessonId);
            const isEnrolled = lessonStudents.some(ls => {
              const studentId = ls.id || ls._backendData?.id;
              return String(studentId) === String(student.id);
            });
            if (isEnrolled) {
              studentLessons.push(lesson);
            }
          } catch (error) {
            // Skip lesson if error (e.g., 404)
            console.warn(`Lesson ${lesson.id} öğrencileri yüklenirken hata:`, error);
          }
        }

        // Calculate attendance percentage for each lesson and get average
        if (studentLessons.length === 0) {
          setAttendancePercentage(0);
          return;
        }

        const percentages = [];
        for (const lesson of studentLessons) {
          try {
            const lessonId = lesson.id || lesson.lessonId;
            const percentage = await getStudentAttendancePercentage(student.id, lessonId);
            if (percentage !== null && percentage !== undefined && !isNaN(percentage)) {
              percentages.push(percentage);
            }
          } catch (error) {
            console.warn(`Öğrenci ${student.id} için ders ${lesson.id} yüzdesi hesaplanırken hata:`, error);
          }
        }

        // Calculate average percentage
        if (percentages.length > 0) {
          const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
          setAttendancePercentage(Math.round(average));
        } else {
          setAttendancePercentage(0);
        }
      } catch (error) {
        console.error('Katılım yüzdesi yüklenirken hata:', error);
        setAttendancePercentage(0);
      } finally {
        setPercentageLoading(false);
      }
    };

    loadAttendancePercentage();
  }, [student?.id]);

  // Reset edit modes when student changes
  useEffect(() => {
    setStudentEditMode(false);
    setParentsEditMode(false);
    setEditingProfile(null);
    setEditingName(null);
    setEditingParents(null);
    setEditingRelatives(null);
  }, [student?.id]);

  const handleStudentEditClick = () => {
    setStudentEditMode(true);
    setParentsEditMode(true); // Anne-baba bilgilerini de editable yap
    setEditingProfile(student?.profile || {});
    setEditingName(student?.name || '');
    setEditingParents(student?.parents || {}); // Anne-baba bilgilerini de set et
  };

  const handleStudentSave = async () => {
    if (!student?.id) return;
    
    setSaving(true);
    try {
      const updatedStudent = {
        ...student,
        name: editingName !== null ? editingName : student.name,
        profile: editingProfile || student.profile,
        parents: editingParents || student.parents // Anne-baba bilgilerini de dahil et
      };
      // Profil fotoğrafını dahil etmeyen fonksiyonu kullan (fotoğraf kaybolmasın)
      const updateData = transformStudentToUpdateRequestWithoutPhoto(updatedStudent);
      await StudentService.updateStudent(student.id, updateData);
      setStudentEditMode(false);
      setParentsEditMode(false); // Anne-baba edit mode'unu da kapat
      setEditingProfile(null);
      setEditingName(null);
      setEditingParents(null); // Anne-baba editing state'ini de temizle
      if (onStudentUpdated) {
        // Reload student data
        const updated = await StudentService.getStudentById(student.id);
        onStudentUpdated(updated);
      }
    } catch (error) {
      alert('Öğrenci bilgileri güncellenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      console.error('Öğrenci güncelleme hatası:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStudentCancel = () => {
    setStudentEditMode(false);
    setParentsEditMode(false); // Anne-baba edit mode'unu da kapat
    setEditingProfile(null);
    setEditingName(null);
    setEditingParents(null); // Anne-baba editing state'ini de temizle
  };

  const handleParentsEditClick = () => {
    setParentsEditMode(true);
    setEditingParents(student?.parents || {});
    // Relatives are also editable when parents are edited
    setEditingRelatives(Array.isArray(student?.relatives) ? student.relatives : []);
  };

  const handleParentsSave = async () => {
    if (!student?.id) return;
    
    setSaving(true);
    try {
      // Get current student data with parents to get mother and father IDs
      const currentStudent = await StudentService.getStudentById(student.id);
      const motherId = currentStudent._backendData?.motherId;
      const fatherId = currentStudent._backendData?.fatherId;

      // Prepare parent data - use editing data or fallback to current data
      const finalParents = editingParents || student.parents || {};
      const finalMother = finalParents.mother || student.parents?.mother || {};
      const finalFather = finalParents.father || student.parents?.father || {};

      // Parse names into firstName and lastName
      const parseFullName = (fullName) => {
        if (!fullName || fullName === '-') return { firstName: '', lastName: '' };
        const parts = fullName.trim().split(' ');
        const lastName = parts.pop() || '';
        const firstName = parts.join(' ') || '';
        return { firstName, lastName };
      };

      const motherName = parseFullName(finalMother.name);
      const fatherName = parseFullName(finalFather.name);

      // Update mother if ID exists
      if (motherId) {
        try {
          await StudentService.updateMother(motherId, {
            firstName: motherName.firstName || currentStudent._backendData?.mother?.firstName || '',
            lastName: motherName.lastName || currentStudent._backendData?.mother?.lastName || '',
            nationalId: finalMother.tc || currentStudent._backendData?.mother?.nationalId || '',
            phoneNumber: finalMother.phone || currentStudent._backendData?.mother?.phoneNumber || '',
            email: currentStudent._backendData?.mother?.email || '',
            occupation: finalMother.occupation || currentStudent._backendData?.mother?.occupation || ''
          });
        } catch (error) {
          console.error('Anne bilgisi güncellenirken hata:', error);
          // Continue even if mother update fails
        }
      }

      // Update father if ID exists
      if (fatherId) {
        try {
          await StudentService.updateFather(fatherId, {
            firstName: fatherName.firstName || currentStudent._backendData?.father?.firstName || '',
            lastName: fatherName.lastName || currentStudent._backendData?.father?.lastName || '',
            nationalId: finalFather.tc || currentStudent._backendData?.father?.nationalId || '',
            phoneNumber: finalFather.phone || currentStudent._backendData?.father?.phoneNumber || '',
            email: currentStudent._backendData?.father?.email || '',
            occupation: finalFather.occupation || currentStudent._backendData?.father?.occupation || ''
          });
        } catch (error) {
          console.error('Baba bilgisi güncellenirken hata:', error);
          // Continue even if father update fails
        }
      }

      // Update relatives if changed
      if (editingRelatives !== null && Array.isArray(editingRelatives)) {
        try {
          // Get current relatives
          const currentRelatives = await StudentService.getStudentRelatives(student.id);
          
          // Delete removed relatives
          const currentRelativeIds = new Set(currentRelatives.map(r => r.id));
          const editingRelativeIds = new Set(editingRelatives.filter(r => r.id).map(r => r.id));
          const toDelete = currentRelatives.filter(r => !editingRelativeIds.has(r.id));
          
          for (const relative of toDelete) {
            await StudentService.deleteRelative(relative.id);
          }

          // Update or create relatives
          for (const relative of editingRelatives) {
            // Parse name into firstName and lastName
            const nameParts = (relative.name || '').trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            if (relative.id) {
              // Update existing - use editing data or fallback to current data
              const currentRelative = currentRelatives.find(r => r.id === relative.id);
              await StudentService.updateRelative(relative.id, {
                firstName: firstName || currentRelative?.firstName || '',
                lastName: lastName || currentRelative?.lastName || '',
                nationalId: relative.tc || currentRelative?.nationalId || '',
                phoneNumber: relative.phone || currentRelative?.phoneNumber || '',
                occupation: relative.occupation || currentRelative?.occupation || '',
                relationType: relative.relationType || currentRelative?.relationType || ''
              });
            } else if (relative.name && relative.name.trim() !== '') {
              // Create new
              const studentNationalId = student.profile?.tc || student._backendData?.nationalId || '';
              if (studentNationalId) {
                await StudentService.createRelative({
                  firstName: firstName,
                  lastName: lastName,
                  nationalId: relative.tc || '',
                  phoneNumber: relative.phone || '',
                  occupation: relative.occupation || '',
                  relationType: relative.relationType || '',
                  studentNationalId: studentNationalId
                });
              }
            }
          }
        } catch (error) {
          console.error('Yakın bilgileri güncellenirken hata:', error);
          // Continue even if relatives update fails
        }
      }

      setParentsEditMode(false);
      setEditingParents(null);
      setEditingRelatives(null);
      if (onStudentUpdated) {
        // Reload student data
        const updated = await StudentService.getStudentById(student.id);
        const updatedRelatives = await StudentService.getStudentRelatives(student.id);
        updated.relatives = updatedRelatives;
        onStudentUpdated(updated);
      }
    } catch (error) {
      alert('Anne-baba ve yakın bilgileri güncellenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      console.error('Anne-baba ve yakın güncelleme hatası:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleParentsCancel = () => {
    setParentsEditMode(false);
    setEditingParents(null);
    setEditingRelatives(null);
  };

  // Profile image update handlers
  const handlePhotoAreaClick = useCallback(() => {
    setShowPhotoOptions(prev => !prev);
  }, []);

  const handleTakePhoto = useCallback(() => {
    setShowWebcam(true);
    setShowPhotoOptions(false);
  }, []);

  const handleSelectFromDevice = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePhotoUpdate = useCallback(async (imageBase64) => {
    if (!student?.id) return;
    
    setIsUploadingImage(true);
    try {
      await ImageService.uploadProfileImage(student.id, imageBase64);
      setShowPhotoOptions(false);
      
      // Anlık olarak student state'ini güncelle (fotoğrafı hemen göster)
      if (onStudentUpdated) {
        // Önce mevcut student'ı güncelle (fotoğrafı ekle)
        const updatedStudent = {
          ...student,
          photo: imageBase64,
          _backendData: {
            ...student._backendData,
            profileImageBase64: imageBase64,
            profileImageContentType: imageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
          }
        };
        // Anlık güncelleme için callback'i çağır
        onStudentUpdated(updatedStudent);
        
        // Sonra backend'den tam veriyi çek (diğer bilgileri de güncelle)
        setTimeout(async () => {
          try {
            const updated = await StudentService.getStudentById(student.id);
            onStudentUpdated(updated);
          } catch (error) {
            console.error('Öğrenci verisi yeniden yüklenirken hata:', error);
          }
        }, 100);
      }
    } catch (error) {
      alert('Profil resmi güncellenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      console.error('Profil resmi güncelleme hatası:', error);
    } finally {
      setIsUploadingImage(false);
    }
  }, [student, onStudentUpdated]);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64Image = await ImageService.fileToBase64(file);
        await handlePhotoUpdate(base64Image);
      } catch (error) {
        alert(error.message || 'Resim yüklenirken hata oluştu');
      }
    }
  }, [handlePhotoUpdate]);

  const handlePhotoCapture = useCallback(async (imageSrc) => {
    setShowWebcam(false);
    setShowPhotoOptions(false);
    await handlePhotoUpdate(imageSrc);
  }, [handlePhotoUpdate]);

  if (loading) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          Yükleniyor...
        </div>
      </section>
    );
  }
  
  if (!student) {
    return (
      <section className="dash-right">
        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af' }}>
          Öğrenci seçiniz
        </div>
      </section>
    );
  }

  const name = student?.name || '—';
  const parents = student?.parents || {};
  const relatives = Array.isArray(student?.relatives) ? student.relatives : [];
  const training = attendancePercentage; // Use calculated attendance percentage
  
  // Use the same paymentStatus logic as PaymentListPanel
  const paymentStatus = student?.paymentStatus || 'unpaid'; // 'paid', 'unpaid'

  const getPaymentButtonClass = () => {
    return paymentStatus === 'paid' 
      ? 'dash-paid dash-paid--green' 
      : 'dash-paid dash-paid--red';
  };

  const getPaymentButtonText = () => {
    return paymentStatus === 'paid' 
      ? 'Ödeme Yapıldı' 
      : 'Ödeme Yapılmadı';
  };

  return (
    <section className="dash-right">
      <div className="dash-top">
        <ProfileAvatar student={student} name={name} onClick={handlePhotoAreaClick} />
        <div className="dash-top__info">
          <div className="dash-info-wrapper">
            <InfoGrid 
              profile={editingProfile || student?.profile}
              name={editingName !== null ? editingName : (student?.name || '')}
              isEditable={studentEditMode}
              onProfileChange={setEditingProfile}
              onNameChange={setEditingName}
            />
            <div className="dash-info__actions">
              {!studentEditMode ? (
                <button
                  type="button"
                  className="dash-info__edit-btn"
                  onClick={handleStudentEditClick}
                  title="Öğrenci bilgilerini düzenle"
                >
                  
                 <FaPencil size={16} /> 
                </button>
              ) : (
                <div className="dash-info__action-group">
                  <button
                    type="button"
                    className="dash-info__save-btn"
                    onClick={handleStudentSave}
                    disabled={saving}
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    className="dash-info__cancel-btn"
                    onClick={handleStudentCancel}
                    disabled={saving}
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-parents-wrapper">
        <ParentsCard 
          mother={editingParents?.mother || parents.mother} 
          father={editingParents?.father || parents.father}
          isEditable={parentsEditMode}
          onParentsChange={setEditingParents}
        />
        <div className="dash-parents__actions">
          {!parentsEditMode ? (
            <button
              type="button"
              className="dash-parents__edit-btn"
              onClick={handleParentsEditClick}
              title="Anne-baba ve yakın bilgilerini düzenle"
            >
              <FaPencil size={16} /> 
            </button>
          ) : (
            <div className="dash-parents__action-group">
              <button
                type="button"
                className="dash-parents__save-btn"
                onClick={handleParentsSave}
                disabled={saving}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                className="dash-parents__cancel-btn"
                onClick={handleParentsCancel}
                disabled={saving}
              >
                İptal
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dash-scrollable">
        <RelativesCard 
          title="Yakın Listesi" 
          relatives={editingRelatives !== null ? editingRelatives : relatives}
          isEditable={parentsEditMode}
          onRelativesChange={setEditingRelatives}
        />
      </div>

      <div className="dash-bottom">
        <div className="dash-attendance">
          <div className="dash-attendance__bar-wrapper">
            <div className="dash-attendance__label">
              Antrenman Katılımı %{percentageLoading ? '...' : training}
            </div>
            <div className="dash-attendance__bar-container">
              <div className="dash-attendance__bar">
                <div className="dash-attendance__fill" style={{ width: `${training}%` }} />
              </div>
              <ChevronDown size={14} className="dash-attendance__chevron-icon" />
            </div>
          </div>
        </div>

        <button type="button" className={getPaymentButtonClass()}>
          {getPaymentButtonText()}
        </button>
      </div>

      {/* Photo Options Modal */}
      {showPhotoOptions && (
        <div className="photo-options-modal" onClick={handlePhotoAreaClick}>
          <div className="photo-options-container" onClick={(e) => e.stopPropagation()}>
            <h3>Profil Fotoğrafı Güncelle</h3>
            <div className="photo-options-buttons">
              <button
                type="button"
                className="photo-option-btn"
                onClick={handleTakePhoto}
                disabled={isUploadingImage}
              >
                📷 Kamera ile Çek
              </button>
              <button
                type="button"
                className="photo-option-btn"
                onClick={handleSelectFromDevice}
                disabled={isUploadingImage}
              >
                📁 Dosyadan Seç
              </button>
              <button
                type="button"
                className="photo-option-btn photo-option-btn--cancel"
                onClick={() => setShowPhotoOptions(false)}
                disabled={isUploadingImage}
              >
                İptal
              </button>
            </div>
            {isUploadingImage && (
              <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280' }}>
                Yükleniyor...
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Webcam Modal */}
      {showWebcam && (
        <WebcamCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowWebcam(false)}
        />
      )}
    </section>
  );
}


