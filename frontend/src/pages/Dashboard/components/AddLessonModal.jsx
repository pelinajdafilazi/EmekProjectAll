import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useGroups } from '../../../context/GroupContext';
import { createLesson } from '../../../services/lessonService';

// Türkçe gün isimlerini sayısal değere çevir (Backend sayısal değer bekliyor olabilir)
// 0 = Pazartesi, 1 = Salı, 2 = Çarşamba, 3 = Perşembe, 4 = Cuma, 5 = Cumartesi, 6 = Pazar
const dayToNumberMapping = {
  'Pazartesi': 0,
  'Salı': 1,
  'Çarşamba': 2,
  'Perşembe': 3,
  'Cuma': 4,
  'Cumartesi': 5,
  'Pazar': 6
};

// Alternatif: Türkçe gün adı mapping (eğer backend Türkçe bekliyorsa)
const dayToTurkishMapping = {
  'Pazartesi': 'Pazartesi',
  'Salı': 'Salı',
  'Çarşamba': 'Çarşamba',
  'Perşembe': 'Perşembe',
  'Cuma': 'Cuma',
  'Cumartesi': 'Cumartesi',
  'Pazar': 'Pazar'
};

const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function AddLessonModal({ isOpen, onClose, onLessonCreated }) {
  const { state: groupState } = useGroups();
  const [formData, setFormData] = useState({
    lessonName: '',
    startingDayOfWeek: '',
    startingHour: '',
    endingHour: '',
    capacity: '',
    groupId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isStartingDayDropdownOpen, setIsStartingDayDropdownOpen] = useState(false);
  const startingDayDropdownRef = useRef(null);

  // Load groups when modal opens
  useEffect(() => {
    if (isOpen && groupState.groups.length === 0) {
      // Groups should be loaded by GroupContext, but we can trigger a reload if needed
    }
  }, [isOpen, groupState.groups]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startingDayDropdownRef.current && !startingDayDropdownRef.current.contains(event.target)) {
        setIsStartingDayDropdownOpen(false);
      }
    };

    if (isStartingDayDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartingDayDropdownOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleDaySelect = (day) => {
    setFormData(prev => ({
      ...prev,
      startingDayOfWeek: day
    }));
    setIsStartingDayDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasyon
    if (!formData.lessonName.trim()) {
      setError('Ders adı gereklidir');
      return;
    }

    if (!formData.startingDayOfWeek) {
      setError('Başlangıç günü gereklidir');
      return;
    }

    if (!formData.startingHour) {
      setError('Başlangıç saati gereklidir');
      return;
    }

    if (!formData.endingHour) {
      setError('Bitiş saati gereklidir');
      return;
    }

    if (!formData.capacity || parseInt(formData.capacity, 10) <= 0) {
      setError('Geçerli bir kapasite giriniz');
      return;
    }

    if (!formData.groupId) {
      setError('Grup seçimi gereklidir');
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend string bekliyor, Türkçe gün adını gönder
      const dayValue = formData.startingDayOfWeek;
      
      if (!dayValue) {
        setError('Geçerli bir gün seçiniz');
        setIsSubmitting(false);
        return;
      }
      
      const payload = {
        lessonName: formData.lessonName.trim(),
        startingDayOfWeek: dayValue, // Türkçe string olarak gönder
        startingHour: formData.startingHour,
        endingDayOfWeek: dayValue, // Bitiş günü başlangıç günü ile aynı
        endingHour: formData.endingHour,
        capacity: parseInt(formData.capacity, 10),
        groupId: formData.groupId
      };

      console.log('AddLessonModal - Gönderilen payload:', JSON.stringify(payload, null, 2));
      const createdLesson = await createLesson(payload);
      console.log('AddLessonModal - Created lesson response:', createdLesson);
      
      // Form'u temizle ve modal'ı kapat
      setFormData({
        lessonName: '',
        startingDayOfWeek: '',
        startingHour: '',
        endingHour: '',
        capacity: '',
        groupId: ''
      });
      setError(null);
      onClose();
      
      // Callback ile parent component'e bildir (groupId ve lessonId'yi gönder)
      if (onLessonCreated) {
        const lessonId = createdLesson?.id || createdLesson?.lessonId;
        onLessonCreated({ 
          lessonId: lessonId,
          groupId: formData.groupId 
        });
      }
    } catch (err) {
      console.error('Ders oluşturma hatası:', err);
      const errorMessage = err.message || err.toString() || 'Ders oluşturulurken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        lessonName: '',
        startingDayOfWeek: '',
        startingHour: '',
        endingHour: '',
        capacity: '',
        groupId: ''
      });
      setError(null);
      onClose();
    }
  };

  return (
    <div className="add-group-modal-overlay" onClick={handleBackdropClick}>
      <div className="add-group-modal">
        <button 
          className="add-group-modal__close" 
          onClick={handleClose} 
          aria-label="Kapat"
          disabled={isSubmitting}
        >
          <X style={{ width: '24px', height: '24px', color: '#ff7b00' }} />
        </button>

        <h1 className="add-group-modal__title">Yeni Ders Ekle</h1>

        <form className="add-group-modal__form" onSubmit={handleSubmit}>
          {error && (
            <div className="add-group-modal__error">
              {error}
            </div>
          )}

          <div className="add-group-modal__field">
            <label className="add-group-modal__label">Ders Adı:</label>
            <input
              type="text"
              className="add-group-modal__input"
              value={formData.lessonName}
              onChange={(e) => handleInputChange('lessonName', e.target.value)}
              placeholder="Ders adını giriniz"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="add-group-modal__field">
            <label className="add-group-modal__label">Grup:</label>
            <select
              className="add-group-modal__input"
              value={formData.groupId}
              onChange={(e) => handleInputChange('groupId', e.target.value)}
              disabled={isSubmitting}
              required
            >
              <option value="">Grup seçiniz</option>
              {groupState.groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="add-group-modal__field">
            <label className="add-group-modal__label">Başlangıç Günü:</label>
            <div className="add-group-modal__day-selector" ref={startingDayDropdownRef}>
              <button
                type="button"
                className="add-group-modal__day-button"
                onClick={() => setIsStartingDayDropdownOpen(!isStartingDayDropdownOpen)}
                disabled={isSubmitting}
              >
                {formData.startingDayOfWeek || 'Gün seçiniz'}
                <ChevronDown size={16} />
              </button>
              {isStartingDayDropdownOpen && (
                <div className="add-group-modal__day-dropdown">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`add-group-modal__day-item ${formData.startingDayOfWeek === day ? 'add-group-modal__day-item--active' : ''}`}
                      onClick={() => handleDaySelect(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="add-group-modal__field">
            <label className="add-group-modal__label">Başlangıç Saati:</label>
            <input
              type="time"
              className="add-group-modal__input"
              value={formData.startingHour}
              onChange={(e) => handleInputChange('startingHour', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="add-group-modal__field">
            <label className="add-group-modal__label">Bitiş Saati:</label>
            <input
              type="time"
              className="add-group-modal__input"
              value={formData.endingHour}
              onChange={(e) => handleInputChange('endingHour', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="add-group-modal__field">
            <label className="add-group-modal__label">Kapasite:</label>
            <input
              type="number"
              className="add-group-modal__input"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="Kapasite giriniz"
              min="1"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="add-group-modal__actions">
            <button
              type="button"
              className="add-group-modal__cancel-btn"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="add-group-modal__submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Oluşturuluyor...' : 'Ders Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

