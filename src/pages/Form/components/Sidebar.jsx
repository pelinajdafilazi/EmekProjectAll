import React, { useRef } from 'react';
import { useForm } from '../../../context/FormContext';

// Icon Components
const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

function Sidebar({ formRef }) {
  const { state, actions } = useForm();
  const { settings } = state;
  const logoInputRef = useRef(null);

  const handleSettingChange = (key, value) => {
    actions.updateSettings({ [key]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        actions.updateSettings({ logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetForm = () => {
    if (window.confirm('Formu sıfırlamak istediğinizden emin misiniz?')) {
      actions.resetForm();
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Form Düzenleyici</h2>
      </div>

      {/* Club Settings */}
      <div className="settings-section">
        <h3>Kulüp Bilgileri</h3>
        
        <div className="form-group">
          <label>Kulüp Adı</label>
          <input
            type="text"
            value={settings.clubName}
            onChange={(e) => handleSettingChange('clubName', e.target.value)}
            placeholder="Kulüp adını girin"
          />
        </div>

        <div className="form-group">
          <label>Adres</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => handleSettingChange('address', e.target.value)}
            placeholder="Adresi girin"
          />
        </div>

        <div className="form-group">
          <label>Telefon</label>
          <input
            type="text"
            value={settings.phone}
            onChange={(e) => handleSettingChange('phone', e.target.value)}
            placeholder="Telefon numarasını girin"
          />
        </div>

        <div className="form-group">
          <label>Form Başlığı</label>
          <input
            type="text"
            value={settings.formTitle}
            onChange={(e) => handleSettingChange('formTitle', e.target.value)}
            placeholder="Form başlığını girin"
          />
        </div>
      </div>

      {/* Logo Upload */}
      <div className="settings-section">
        <h3>Logo</h3>
        
        <div 
          className="logo-upload-area"
          onClick={() => logoInputRef.current?.click()}
        >
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="logo-preview" />
          ) : (
            <>
              <div className="upload-icon"><UploadIcon /></div>
              <p>Logo yüklemek için tıklayın</p>
            </>
          )}
        </div>

        {settings.logo && (
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '10px', width: '100%' }}
            onClick={() => actions.updateSettings({ logo: null })}
          >
            Logoyu Kaldır
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="settings-section">
        <h3>Hızlı İşlemler</h3>
        
        <button className="btn btn-secondary" onClick={handleResetForm} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <RefreshIcon /> Formu Sıfırla
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;


