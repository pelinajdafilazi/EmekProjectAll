import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';
import LessonStudentAssignModal from './LessonStudentAssignModal';
import { useGroups } from '../../../context/GroupContext';
import { updateLesson, assignStudentToLesson, getLessonStudents, deleteLesson } from '../../../services/lessonService';
import { transformBackendToStudent, StudentService } from '../../../services/studentService';
import '../styles/lesson-student-modal.css';

// Türkçe gün isimlerini sayısal değere çevir (Backend sayısal değer bekliyor)
// 0 = Pazartesi, 1 = Salı, 2 = Çarşamba, 3 = Perşembe, 4 = Cuma, 5 = Cumartesi, 6 = Pazar
const dayMappingTrToNumber = {
  'Pazartesi': 0,
  'Salı': 1,
  'Çarşamba': 2,
  'Perşembe': 3,
  'Cuma': 4,
  'Cumartesi': 5,
  'Pazar': 6
};

// Alternatif: İngilizce gün adı mapping (eğer backend İngilizce bekliyorsa)
const dayMappingTrToEn = {
  'Pazartesi': 'Monday',
  'Salı': 'Tuesday',
  'Çarşamba': 'Wednesday',
  'Perşembe': 'Thursday',
  'Cuma': 'Friday',
  'Cumartesi': 'Saturday',
  'Pazar': 'Sunday'
};

export default function LessonDetailsPanel({ lesson, students, onLessonUpdated, onStudentsUpdated, lessonGroupIds = {} }) {
  const { state: groupState } = useGroups();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [lessonStudents, setLessonStudents] = useState(students || []);
  
  // Grup ID'sini bul - önce lesson'dan, sonra _backendData'dan, sonra lessonGroupIds'den
  const getLessonGroupId = useCallback((lesson) => {
    if (!lesson) return '';
    const lessonId = lesson.lessonId || lesson.id;
    return lesson.groupId 
      || lesson._backendData?.groupId 
      || (lessonId ? lessonGroupIds[lessonId] : null)
      || '';
  }, [lessonGroupIds]);
  
  // Initial lessonData with groupId
  const initialGroupId = useMemo(() => getLessonGroupId(lesson), [lesson, getLessonGroupId]);
  
  const [lessonData, setLessonData] = useState({
    name: lesson?.name || '',
    groupId: initialGroupId,
    capacity: lesson?.capacity || '',
    selectedDay: lesson?.day || '',
    startingHour: lesson?.startingHour || '',
    endingHour: lesson?.endingHour || ''
  });

  const dayDropdownRef = useRef(null);
  const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  // Load lesson students - useCallback ile sarmalandı
  const loadLessonStudents = useCallback(async () => {
    if (!lesson?.id && !lesson?.lessonId) return;
    
    try {
      const lessonId = lesson.lessonId || lesson.id;
      const backendStudents = await getLessonStudents(lessonId);
      console.log('Load Lesson Students - Backend Response:', backendStudents);
      
      // Backend'den gelen öğrencileri frontend formatına dönüştür
      const transformedStudents = Array.isArray(backendStudents) 
        ? backendStudents.map(student => {
            // Eğer zaten transform edilmişse olduğu gibi kullan
            if (student.name && student.age !== undefined) {
              return student;
            }
            // Backend formatındaysa transform et
            return transformBackendToStudent(student);
          })
        : [];
      
      console.log('Load Lesson Students - Transformed Students:', transformedStudents);
      setLessonStudents(transformedStudents);
      
      // Parent component'e bildir
      if (onStudentsUpdated) {
        onStudentsUpdated(transformedStudents);
      }
    } catch (error) {
      console.error('Ders öğrencileri yüklenirken hata:', error);
      setLessonStudents([]);
    }
  }, [lesson?.id, lesson?.lessonId, onStudentsUpdated]);

  // Update lessonData when lesson changes (but not when editing)
  useEffect(() => {
    if (lesson && !isEditing) {
      // Grup ID'sini al - önce lesson'dan, sonra _backendData'dan, sonra lessonGroupIds'den
      const groupId = getLessonGroupId(lesson);
      
      // Kapasite formatını düzelt (eğer "0/30" formatındaysa sadece sayıyı al)
      let capacityValue = lesson.capacity || '';
      if (typeof capacityValue === 'string' && capacityValue.includes('/')) {
        capacityValue = capacityValue.split('/')[1];
      }
      
      setLessonData({
        name: lesson.name || '',
        groupId: groupId ? String(groupId) : '',
        capacity: capacityValue,
        selectedDay: lesson.day || '',
        startingHour: lesson.startingHour || '',
        endingHour: lesson.endingHour || ''
      });
    }
  }, [lesson?.id, lesson?.lessonId, lesson?.name, lesson?.groupId, lesson?.capacity, lesson?.day, lesson?.startingHour, lesson?.endingHour, lesson?._backendData?.groupId, isEditing, lessonGroupIds]);

  // Load lesson students when lesson changes - ayrı useEffect
  useEffect(() => {
    if (lesson && !isEditing) {
      loadLessonStudents();
    }
  }, [lesson?.id, lesson?.lessonId, isEditing, loadLessonStudents]);

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

  const handleAssignStudent = async (studentId) => {
    if (!lesson?.id && !lesson?.lessonId) {
      setError('Ders seçilmedi');
      return;
    }

    setIsAssigning(true);
    setError(null);
    
    try {
      const lessonId = lesson.lessonId || lesson.id;
      console.log('Assigning student:', studentId, 'to lesson:', lessonId);
      
      // Önce öğrenci bilgilerini al (liste yüklenemezse kullanmak için)
      let assignedStudent = null;
      try {
        const allStudents = await StudentService.getAllStudents();
        assignedStudent = allStudents.find(s => String(s.id) === String(studentId));
      } catch (err) {
        console.warn('Öğrenci bilgileri alınamadı:', err);
      }
      
      await assignStudentToLesson(lessonId, studentId);
      console.log('Student assigned successfully, reloading lesson students...');
      
      // Kısa bir gecikme ekle (backend'in güncellemesi için)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Öğrenci listesini yenile
      try {
        await loadLessonStudents();
      } catch (loadError) {
        console.warn('Öğrenci listesi yüklenemedi, lokal state\'e ekleniyor:', loadError);
        // Eğer liste yüklenemezse, atanan öğrenciyi lokal state'e ekle
        if (assignedStudent) {
          const transformedStudent = transformBackendToStudent(assignedStudent);
          setLessonStudents(prev => {
            // Öğrenci zaten listede var mı kontrol et
            const exists = prev.some(s => String(s.id) === String(studentId));
            if (exists) {
              return prev;
            }
            const updatedList = [...prev, transformedStudent];
            
            // Parent component'e bildir
            if (onStudentsUpdated) {
              onStudentsUpdated(updatedList);
            }
            
            return updatedList;
          });
        }
      }
      
      // Modal'ı kapat
      setIsModalOpen(false);
    } catch (err) {
      console.error('Öğrenci atama hatası:', err);
      const errorMessage = err.message || err.toString() || 'Öğrenci atanırken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setIsAssigning(false);
    }
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

  const handleSave = async () => {
    setError(null);
    
    // Validasyon
    if (!lessonData.name.trim()) {
      setError('Ders adı gereklidir');
      return;
    }
    
    if (!lessonData.groupId) {
      setError('Grup seçimi gereklidir');
      return;
    }
    
    if (!lessonData.selectedDay) {
      setError('Gün seçimi gereklidir');
      return;
    }
    
    if (!lessonData.startingHour) {
      setError('Başlangıç saati gereklidir');
      return;
    }
    
    if (!lessonData.endingHour) {
      setError('Bitiş saati gereklidir');
      return;
    }
    
    // Kapasite formatını düzelt (eğer "0/30" formatındaysa sadece sayıyı al)
    let capacityValue = lessonData.capacity;
    
    // Eğer string ise ve "/" içeriyorsa, sadece sayıyı al
    if (typeof capacityValue === 'string' && capacityValue.includes('/')) {
      capacityValue = capacityValue.split('/')[1];
    }
    
    // Sayıya çevir
    const capacityNumber = parseInt(capacityValue, 10);
    
    if (!capacityValue || isNaN(capacityNumber) || capacityNumber <= 0) {
      setError('Geçerli bir kapasite giriniz');
      return;
    }

    setIsSaving(true);
    try {
      // Backend string bekliyor, Türkçe gün adını gönder
      const startingDayValue = lessonData.selectedDay;
      
      if (!startingDayValue) {
        setError('Geçerli bir gün seçiniz');
        setIsSaving(false);
        return;
      }
      
      const updatePayload = {
        lessonName: lessonData.name.trim(),
        startingDayOfWeek: startingDayValue, // Türkçe string olarak gönder
        startingHour: lessonData.startingHour,
        endingDayOfWeek: startingDayValue, // Bitiş günü başlangıç günü ile aynı
        endingHour: lessonData.endingHour,
        capacity: capacityNumber,
        groupId: lessonData.groupId
      };

      // Backend'de lessonId kullanılıyor, id değil
      const lessonIdToUpdate = lesson.lessonId || lesson.id || lesson._backendData?.id || lesson._backendData?.lessonId;
      
      if (!lessonIdToUpdate || lessonIdToUpdate === '00000000-0000-0000-0000-000000000000') {
        setError('Ders ID\'si bulunamadı. Lütfen sayfayı yenileyin.');
        setIsSaving(false);
        return;
      }
      
      console.log('Ders güncelleniyor - Lesson ID:', lessonIdToUpdate);
      console.log('Ders güncelleniyor - Payload:', JSON.stringify(updatePayload, null, 2));
      await updateLesson(lessonIdToUpdate, updatePayload);
      
      setIsEditing(false);
      setError(null);
      
      // Parent component'e bildir (liste yenilensin ve groupId'yi sakla)
      if (onLessonUpdated) {
        onLessonUpdated({ 
          lessonId: lessonIdToUpdate,
          groupId: lessonData.groupId 
        });
      }
    } catch (err) {
      console.error('Ders güncelleme hatası:', err);
      const errorMessage = err.message || err.toString() || 'Ders güncellenirken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    
    // Grup ID'sini al - önce lesson'dan, sonra _backendData'dan, sonra lessonGroupIds'den
    const groupId = getLessonGroupId(lesson);
    
    // Kapasite formatını düzelt (eğer "0/30" formatındaysa sadece sayıyı al)
    let capacityValue = lesson?.capacity || '';
    if (typeof capacityValue === 'string' && capacityValue.includes('/')) {
      capacityValue = capacityValue.split('/')[1];
    }
    
    setLessonData({
      name: lesson?.name || '',
      groupId: groupId ? String(groupId) : '',
      capacity: capacityValue,
      selectedDay: lesson?.day || '',
      startingHour: lesson?.startingHour || '',
      endingHour: lesson?.endingHour || ''
    });
  };

  const handleDelete = async () => {
    if (!lesson?.id && !lesson?.lessonId) {
      setError('Ders seçilmedi');
      return;
    }

    // Kullanıcıdan onay al
    const confirmed = window.confirm('Bu dersi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const lessonId = lesson.lessonId || lesson.id;
      console.log('Ders siliniyor - Lesson ID:', lessonId);
      await deleteLesson(lessonId);
      
      // Parent component'e bildir (ders silindi, liste yenilensin)
      if (onLessonUpdated) {
        onLessonUpdated({ 
          lessonId: lessonId,
          deleted: true 
        });
      }
    } catch (err) {
      console.error('Ders silme hatası:', err);
      const errorMessage = err.message || err.toString() || 'Ders silinirken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
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
          {error && (
            <div className="lesson-info__error" style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#dc2626',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
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
              <div className="lesson-info__label">Grup:</div>
              {isEditing ? (
                <select
                  className="lesson-info__input select-dropdown"
                  value={String(lessonData.groupId || '')}
                  onChange={(e) => handleInputChange('groupId', e.target.value)}
                >
                  <option value="">Grup seçiniz</option>
                  {groupState.groups.map((group) => (
                    <option key={group.id} value={String(group.id)}>
                      {group.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="lesson-info__value">
                  {(() => {
                    // Grup ID'sini al - önce lesson'dan, sonra _backendData'dan, sonra lessonGroupIds'den
                    const groupId = getLessonGroupId(lesson);
                    
                    // Grup bilgisini bul - önce groupId'den grup listesinde ara
                    if (groupId && groupState.groups && groupState.groups.length > 0) {
                      const lessonGroupIdStr = String(groupId).trim();
                      const foundGroup = groupState.groups.find(g => {
                        const gId = String(g.id).trim();
                        return gId === lessonGroupIdStr || gId.toLowerCase() === lessonGroupIdStr.toLowerCase();
                      });
                      if (foundGroup) {
                        return foundGroup.name;
                      }
                    }
                    
                    // Eğer grup bulunamazsa lesson'dan gelen groupName veya group'u kullan
                    const displayName = lesson.groupName || lesson.group;
                    if (displayName && displayName !== '-' && displayName !== 'Grup Bulunamadı' && displayName !== 'Grup Yükleniyor...') {
                      return displayName;
                    }
                    
                    // Eğer hala grup bulunamadıysa ve groupId varsa, grup yükleniyor olabilir
                    if (groupId) {
                      return 'Grup yükleniyor...';
                    }
                    
                    return '-';
                  })()}
                </div>
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
              <div className="lesson-info__label">Başlangıç Saati:</div>
              {isEditing ? (
                <input
                  type="time"
                  className="lesson-info__input"
                  value={lessonData.startingHour}
                  onChange={(e) => handleInputChange('startingHour', e.target.value)}
                  placeholder="Başlangıç saati giriniz"
                />
              ) : (
                <div className="lesson-info__value">{lesson.startingHour || '-'}</div>
              )}
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Bitiş Saati:</div>
              {isEditing ? (
                <input
                  type="time"
                  className="lesson-info__input"
                  value={lessonData.endingHour}
                  onChange={(e) => handleInputChange('endingHour', e.target.value)}
                  placeholder="Bitiş saati giriniz"
                />
              ) : (
                <div className="lesson-info__value">{lesson.endingHour || '-'}</div>
              )}
            </div>
            <div className="lesson-info__row">
              <div className="lesson-info__label">Kapasite:</div>
              {isEditing ? (
                <input
                  type="number"
                  className="lesson-info__input"
                  value={typeof lessonData.capacity === 'string' && lessonData.capacity.includes('/') 
                    ? lessonData.capacity.split('/')[1] 
                    : lessonData.capacity}
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
              <button 
                type="button" 
                className="lesson-info__delete-btn" 
                onClick={handleDelete}
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? 'Siliniyor...' : 'Dersi Sil'}
              </button>
              <button 
                type="button" 
                className="lesson-info__cancel-btn" 
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  // Form verilerini sıfırla
                  setLessonData({
                    name: lesson?.name || '',
                    groupId: lesson?.groupId || '',
                    capacity: lesson?.capacity || '',
                    selectedDay: lesson?.day || '',
                    startingHour: lesson?.startingHour || '',
                    endingHour: lesson?.endingHour || ''
                  });
                }}
                disabled={isSaving || isDeleting}
              >
                İptal
              </button>
              <button 
                type="button" 
                className="lesson-info__save-btn" 
                onClick={handleSave}
                disabled={isSaving || isDeleting}
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          ) : (
            <button type="button" className="lesson-info__edit-btn" onClick={handleEdit}>
              Ders Bilgisi Güncelle
            </button>
          )}
        </div>

        <div className="lesson-students">
          <h2 className="lesson-students__title">Öğrenci Listesi</h2>
          <div className="dash-list" role="list">
            {lessonStudents.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                Henüz öğrenci atanmamış
              </div>
            ) : (
              lessonStudents.map((student) => {
                const studentName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'İsimsiz Öğrenci';
                const studentPhoto = student.photo || student.photoUrl || '/avatars/student-1.svg';
                const studentAge = student.age !== undefined && student.age !== '-' ? student.age : '-';
                const studentTeam = student.team || student.branch || '-';
                const studentBirthDate = student.birthDate || student.dateOfBirth || '-';
                
                // Grup bilgisini al
                const lessonGroupId = getLessonGroupId(lesson);
                const lessonGroup = lessonGroupId 
                  ? groupState.groups.find(g => String(g.id) === String(lessonGroupId))
                  : null;
                const groupName = lessonGroup ? lessonGroup.name : '-';
                
                return (
                  <button
                    key={student.id}
                    type="button"
                    className="dash-row dash-row--group-students"
                  >
                    <div className="dash-row__indicator" aria-hidden="true" />
                    <div className="dash-row__avatar">
                      <img src={studentPhoto} alt={studentName} />
                    </div>
                    <div className="dash-row__name">{studentName}</div>
                    <div className="dash-row__meta">{groupName}</div>
                    <div className="dash-row__meta dash-row__meta--wide">{studentTeam}</div>
                    <div className="dash-row__meta dash-row__meta--wide">{studentBirthDate}</div>
                    <div className="dash-row__meta">{studentAge}</div>
                  </button>
                );
              })
            )}
          </div>
          <button 
            type="button" 
            className="lesson-students__assign-btn"
            onClick={() => setIsModalOpen(true)}
            disabled={isAssigning}
          >
            {isAssigning ? 'Atanıyor...' : 'Sporcu Ata'}
          </button>
        </div>
      </div>

      <LessonStudentAssignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssign={handleAssignStudent}
        lessonId={lesson.lessonId || lesson.id}
      />
    </section>
  );
}
