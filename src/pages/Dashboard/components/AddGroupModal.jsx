import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGroups } from '../../../context/GroupContext';

export default function AddGroupModal({ isOpen, onClose }) {
  const { actions } = useGroups();
  const [formData, setFormData] = useState({
    name: '',
    minAge: null,
    maxAge: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'minAge' || field === 'maxAge' 
        ? (value === '' ? null : parseInt(value, 10) || null) 
        : value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasyon
    if (!formData.name.trim()) {
      setError('Grup adı gereklidir');
      return;
    }

    if (formData.minAge === null || formData.maxAge === null) {
      setError('Yaş aralığı gereklidir');
      return;
    }

    if (formData.minAge > formData.maxAge) {
      setError('Minimum yaş maksimum yaştan büyük olamaz');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Grup oluşturuluyor:', formData);
      await actions.createGroup(formData);
      // Form'u temizle ve modal'ı kapat
      setFormData({
        name: '',
        minAge: null,
        maxAge: null
      });
      setError(null);
      onClose();
    } catch (err) {
      console.error('Grup oluşturma hatası:', err);
      const errorMessage = err.message || err.toString() || 'Grup oluşturulurken bir hata oluştu';
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
        name: '',
        minAge: null,
        maxAge: null
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
          <X style={{ width: '24px', height: '24px', color: '#5677fb' }} />
        </button>

        <h1 className="add-group-modal__title">Yeni Grup Ekle</h1>

        <form className="add-group-modal__form" onSubmit={handleSubmit}>
          {error && (
            <div className="add-group-modal__error">
              {error}
            </div>
          )}

          <div className="add-group-modal__field">
            <label className="add-group-modal__label">Grup Adı:</label>
            <input
              type="text"
              className="add-group-modal__input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Grup adını giriniz"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="add-group-modal__field">
            <label className="add-group-modal__label">Yaş Aralığı:</label>
            <div className="add-group-modal__age-range">
              <input
                type="number"
                className="add-group-modal__input add-group-modal__input--age"
                value={formData.minAge ?? ''}
                onChange={(e) => handleInputChange('minAge', e.target.value)}
                placeholder="Min"
                min="0"
                max="100"
                disabled={isSubmitting}
                required
              />
              <span className="add-group-modal__age-separator">-</span>
              <input
                type="number"
                className="add-group-modal__input add-group-modal__input--age"
                value={formData.maxAge ?? ''}
                onChange={(e) => handleInputChange('maxAge', e.target.value)}
                placeholder="Max"
                min="0"
                max="100"
                disabled={isSubmitting}
                required
              />
            </div>
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
              {isSubmitting ? 'Oluşturuluyor...' : 'Grup Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

