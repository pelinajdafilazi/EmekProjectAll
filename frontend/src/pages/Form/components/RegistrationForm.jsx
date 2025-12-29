import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { useForm } from '../../../context/FormContext';
import { exportToPDF, exportToDOCX } from '../../../utils/exportUtils';
import { FormService } from '../../../services/form';
import { ImageService } from '../../../services/imageService';
import WebcamCapture from './WebcamCapture';
import DatePicker, { registerLocale } from 'react-datepicker';
import tr from 'date-fns/locale/tr';
import { useDropzone } from 'react-dropzone';
import 'react-datepicker/dist/react-datepicker.css';

// Türkçe dil desteği
registerLocale('tr', tr);

// Icon Components
const PdfIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const PhoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

// Default logo as SVG data URL
const defaultLogo = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#1a1a2e" stroke="#c41e3a" stroke-width="2"/>
  <path d="M50 15 L60 40 L85 40 L65 55 L75 80 L50 65 L25 80 L35 55 L15 40 L40 40 Z" fill="#c41e3a"/>
  <text x="50" y="95" text-anchor="middle" fill="#1a1a2e" font-size="8" font-weight="bold">EMEK SPOR</text>
</svg>
`)}`;

// Upload Icon
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

// Camera Capture Icon
const CaptureIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

// Save Icon
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

// Plus Icon
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Trash Icon for removing yakın
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const RegistrationForm = forwardRef((props, ref) => {
  const { state, actions } = useForm();
  const { formData, settings } = state;
  const { sporcu, baba, anne, photo, yakinlar = [] } = formData;
  
  const [showWebcam, setShowWebcam] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = React.useRef(null);
  const yakinlarSectionRef = React.useRef(null);

  // Load existing profile image when student ID is available
  useEffect(() => {
    const loadProfileImage = async () => {
      // Try to get student ID from TC Kimlik No if available
      const tcNo = sporcu.tcKimlikNo;
      
      if (tcNo && tcNo.length === 11) {
        try {
          const existingImage = await ImageService.getProfileImage(tcNo);
          if (existingImage && !photo) {
            // Only set if we don't already have a photo in context
            actions.setPhoto(existingImage);
          }
          setStudentId(tcNo);
        } catch (error) {
          // Silently fail - student might not exist yet
          console.log('No existing profile image found');
        }
      }
    };

    loadProfileImage();
  }, [sporcu.tcKimlikNo, photo, actions]);

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const base64Image = await ImageService.fileToBase64(file);
        actions.setPhoto(base64Image);
        setShowPhotoOptions(false);
      } catch (error) {
        alert(error.message || 'Resim yüklenirken hata oluştu');
      }
    }
  }, [actions]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
    noClick: true, // Disable click to open file dialog (we'll handle it manually)
    noKeyboard: true
  });

  const handleSporcuChange = useCallback((field, value) => {
    actions.updateSporcu({ [field]: value });
  }, [actions]);

  const handleBabaChange = useCallback((field, value) => {
    actions.updateBaba({ [field]: value });
  }, [actions]);

  const handleAnneChange = useCallback((field, value) => {
    actions.updateAnne({ [field]: value });
  }, [actions]);

  const handleYakinChange = useCallback((index, field, value) => {
    actions.updateYakin(index, { [field]: value });
  }, [actions]);

  const handleAddYakin = useCallback(() => {
    actions.addYakin();
    // Scroll to yakinlar section after a short delay to allow DOM update
    setTimeout(() => {
      yakinlarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [actions]);

  const handleRemoveYakin = useCallback((index) => {
    actions.removeYakin(index);
  }, [actions]);

  const handlePhotoCapture = useCallback((imageSrc) => {
    actions.setPhoto(imageSrc);
    setShowWebcam(false);
    setShowPhotoOptions(false);
  }, [actions]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        actions.setPhoto(reader.result);
        setShowPhotoOptions(false);
      };
      reader.readAsDataURL(file);
    }
  }, [actions]);

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

  const handleSaveForm = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save form data first
      const result = await FormService.saveForm({
        ...state.formData,
        createdAt: state.formData.createdAt || new Date().toISOString()
      });
      
      // Get student ID from result or use TC Kimlik No
      const savedStudentId = result.data?.id || result.data?.studentId || sporcu.tcKimlikNo;
      
      // Upload profile image if exists
      if (photo && savedStudentId) {
        try {
          setIsUploadingImage(true);
          await ImageService.uploadProfileImage(savedStudentId, photo);
          setStudentId(savedStudentId);
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          // Don't fail the whole operation if image upload fails
          alert('Form kaydedildi ancak resim yüklenirken bir sorun oluştu: ' + imageError.message);
        } finally {
          setIsUploadingImage(false);
        }
      }
      
      // Success - trigger reload in dashboard (using custom event for same-tab and storage event for cross-tab)
      const event = new CustomEvent('studentCreated', { detail: { timestamp: Date.now() } });
      window.dispatchEvent(event);
      
      // Also trigger storage event for cross-tab communication
      localStorage.setItem('student_created', Date.now().toString());
      localStorage.removeItem('student_created');
      
      alert(result.message || 'Kayıt başarıyla oluşturuldu!');
    } catch (error) {
      alert(error.message || 'Form kaydedilirken bir hata oluştu.');
    }
    setIsSaving(false);
  }, [state.formData, photo, sporcu.tcKimlikNo]);

  const handleExportPDF = useCallback(async () => {
    if (ref.current) {
      try {
        await exportToPDF(ref.current, 'emek-spor-kayit-formu.pdf');
      } catch (error) {
        alert('PDF oluşturulurken bir hata oluştu.');
      }
    }
  }, [ref]);

  const handleExportDOCX = useCallback(async () => {
    if (ref.current) {
      try {
        await exportToDOCX(ref.current, state.formData, state.settings, 'emek-spor-kayit-formu.docx');
      } catch (error) {
        alert('DOCX oluşturulurken bir hata oluştu.');
      }
    }
  }, [ref, state.formData, state.settings]);

  return (
    <>
      {/* Export Buttons - Top */}
      <div className="form-export-header">
        <button className="export-btn-top save-btn" onClick={handleSaveForm} disabled={isSaving || isUploadingImage}>
          <SaveIcon /> {isSaving ? 'Kaydediliyor...' : isUploadingImage ? 'Resim Yükleniyor...' : 'Verileri Kaydet'}
        </button>
        <button className="export-btn-top yakin-ekle-header-btn" onClick={handleAddYakin}>
          <PlusIcon /> Yakın Ekle
        </button>
        <div className="header-spacer"></div>
        <button className="export-btn-top" onClick={handleExportPDF}>
          <PdfIcon /> PDF Olarak İndir
        </button>
        <button className="export-btn-top" onClick={handleExportDOCX}>
          <DocIcon /> DOCX Olarak İndir
        </button>
      </div>

      <div className="form-wrapper">
        <div className="form-container" ref={ref}>
        {/* Header */}
        <div className="form-header">
          <img 
            src={settings.logo || defaultLogo} 
            alt="Club Logo" 
            className="club-logo" 
          />
          <div className="club-info">
            <h1 className="club-name">{settings.clubName}</h1>
            <p className="club-address"><LocationIcon /> {settings.address}</p>
            <p className="club-phone"><PhoneIcon /> {settings.phone}</p>
          </div>
          <div 
            {...getRootProps()} 
            className={`photo-area ${isDragActive ? 'drag-active' : ''}`} 
            onClick={handlePhotoAreaClick}
          >
            <input {...getInputProps()} />
            {photo ? (
              <img src={photo} alt="Sporcu Fotoğrafı" />
            ) : (
              <span className="camera-icon"><CameraIcon /></span>
            )}
            {isDragActive && (
              <div className="drag-overlay">
                Resmi buraya bırakın
              </div>
            )}
          </div>
        </div>

        {/* Form Title */}
        <div className="form-title">{settings.formTitle}</div>

        {/* Info Section */}
        <div className="info-section">
          {/* Sporcu Info */}
          <table className="info-table">
            <tbody>
              <tr>
                <th rowSpan="8" className="section-header"><span>SPORCUNUN</span></th>
                <th>BRANŞI</th>
                <td>
                  <input
                    type="text"
                    value={sporcu.bransi}
                    onChange={(e) => handleSporcuChange('bransi', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>TC KİMLİK NO</th>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={sporcu.tcKimlikNo}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleSporcuChange('tcKimlikNo', value);
                    }}
                    maxLength="11"
                  />
                </td>
              </tr>
              <tr>
                <th>ADI SOYADI</th>
                <td>
                  <input
                    type="text"
                    value={sporcu.adiSoyadi}
                    onChange={(e) => handleSporcuChange('adiSoyadi', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>D. TARİHİ</th>
                <td>
                  <DatePicker
                    selected={sporcu.dogumTarihi ? new Date(sporcu.dogumTarihi) : null}
                    onChange={(date) => {
                      const formatted = date ? date.toISOString().split('T')[0] : '';
                      handleSporcuChange('dogumTarihi', formatted);
                    }}
                    locale="tr"
                    dateFormat="dd/MM/yyyy"
                    placeholderText=""
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    className="date-picker-input"
                  />
                </td>
              </tr>
              <tr>
                <th>OKULU</th>
                <td>
                  <input
                    type="text"
                    value={sporcu.okulu}
                    onChange={(e) => handleSporcuChange('okulu', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>SINIF NO</th>
                <td>
                  <input
                    type="text"
                    value={sporcu.sinifNo}
                    onChange={(e) => handleSporcuChange('sinifNo', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>SPORCU CEP</th>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={sporcu.sporcuCep}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleSporcuChange('sporcuCep', value);
                    }}
                    maxLength="11"
                  />
                </td>
              </tr>
              <tr>
                <th>EV ADRESİ</th>
                <td>
                  <input
                    type="text"
                    value={sporcu.evAdresi}
                    onChange={(e) => handleSporcuChange('evAdresi', e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Parent Info */}
          <div>
            {/* Baba Info */}
            <table className="info-table" style={{ marginBottom: '10px' }}>
              <tbody>
                <tr>
                  <th rowSpan="4" className="section-header"><span>BABA</span></th>
                  <th>TC KİMLİK NO</th>
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={baba.tcKimlikNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleBabaChange('tcKimlikNo', value);
                      }}
                      maxLength="11"
                    />
                  </td>
                </tr>
                <tr>
                  <th>ADI SOYADI</th>
                  <td>
                    <input
                      type="text"
                      value={baba.adiSoyadi}
                      onChange={(e) => handleBabaChange('adiSoyadi', e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>MESLEĞİ</th>
                  <td>
                    <input
                      type="text"
                      value={baba.meslegi}
                      onChange={(e) => handleBabaChange('meslegi', e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>CEP TEL</th>
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={baba.cepTel}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleBabaChange('cepTel', value);
                      }}
                      maxLength="11"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Anne Info */}
            <table className="info-table">
              <tbody>
                <tr>
                  <th rowSpan="4" className="section-header"><span>ANNE</span></th>
                  <th>TC KİMLİK NO</th>
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={anne.tcKimlikNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleAnneChange('tcKimlikNo', value);
                      }}
                      maxLength="11"
                    />
                  </td>
                </tr>
                <tr>
                  <th>ADI SOYADI</th>
                  <td>
                    <input
                      type="text"
                      value={anne.adiSoyadi}
                      onChange={(e) => handleAnneChange('adiSoyadi', e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>MESLEĞİ</th>
                  <td>
                    <input
                      type="text"
                      value={anne.meslegi}
                      onChange={(e) => handleAnneChange('meslegi', e.target.value)}
                    />
                  </td>
                </tr>
                <tr>
                  <th>CEP TEL</th>
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={anne.cepTel}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleAnneChange('cepTel', value);
                      }}
                      maxLength="11"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Principles Section */}
        <div className="principles-section">
          <div className="principles-title">EMEK SPOR KULÜBÜ PRENSİPLERİ</div>
          <div className="principles-content">
            <ol>
              <li>Sporcu ve velilerimiz tesise girdiğinde Sağlık Bakanlığı ve İçişleri Bakanlığının pandemi nedeniyle alınmasını zorunlu tuttuğu yada tutacağı tüm uygulamalara uyulması zorunludur. Bakanlıklarca bu ve buna benzer uygulamalardaki değişiklikler aynen uygulanacaktır.</li>
              <li>EMEK SK Spor Okulu sporcuları Fair-Play (Centilmenlik) ve Respect (Saygı) kurallarına uymak zorundadır.</li>
              <li>Belirlenen tarihlerde yapılacak olan bilimsel testlere tüm sporcular katılmak zorundadır.</li>
              <li>Saat, para, cep telefonu vb. gibi kıymetli eşyalar, antrenman ya da müsabaka öncesi spor okulu görevlisine teslim edilir ve antrenmandan sonra alınır. Tarafımıza teslim edilmeyen eşyalardan spor okulumuzun sorumluluğu bulunmamaktadır.</li>
              <li>Yukarıda belirtilen maddelere sporcu ve veliler uymak zorundadır. Aksi halde hiçbir hak talep edilemez.</li>
            </ol>
          </div>
        </div>

        {/* Financial Section */}
        <div className="financial-section">
          <div className="principles-title">EMEK SPOR KULÜBÜ MALİ HUSUSLAR</div>
          <div className="principles-content">
            <ol>
              <li>EMEK SK Spor Okulu eğitim ücretleri 1, 2, 4, 6 ya da 12 aylık ödeme tercihine göre peşin olarak ödenir.</li>
              <li>Aylık ödeme tarihleri ilgili ayın 1-5 veya 15-20 si arasında yapılır.</li>
              <li>Kayıtta bir aylık ücret peşin olarak alınır. İndirimli sözleşmenin iptal edilmesi durumunda indirim oranları tahsil edilir.</li>
              <li>EMEK SK Spor Okullarının belirlediği tek tip spor malzeme giyilmektedir. Malzeme ücreti aylık aidatın içinde değildir.</li>
              <li>Sporcunun kayıt sonrası devamsızlığında geri ödeme yapılmamaktadır. (2,4,6 ve 12 aylık peşin ödemeler hariç)</li>
              <li>Müsabaka Performans Takımına (bu sözleşmede bundan sonra MPT diye anılacaktır) seçilip ilgili federasyon lisansı çıkarılan sporcuların, spor okulu antrenmanlarının dışında da katıldığı antrenman ve müsabaka giderlerine ait eğitim ücreti ayrıca tahsil edilmektedir. Performans Takımı ücreti 12 aylık periyot olarak hesaplanır. Tatil hastalık vs durumunda ücret kesintisi olmaz.</li>
            </ol>
          </div>
        </div>

        {/* Consent Section */}
        <div className="consent-section">
          <div className="consent-title">YASAL VELİNİN SAĞLIK, LİSANS, SEYEHAT VB. KONULARA AİT MUVAFAKATNAME VE TAAHHÜRNAME</div>
          <div className="consent-content">
            <p className="consent-intro">Yukarıdaki sporcu ve yasal veli kimlik bilgileri doğru olup;</p>
            <ol>
              <li>Spor okulu ödemelerimi her ayın tarihleri arasında yapacağımı,</li>
              <li>Sporcu performansını geliştirip, EMEK SK Spor Okulu MPT programına alınmasına karar verildiği taktirde, MPT adına lisansının çıkarılmasına, antrenman ve müsabakalarına katılmasına izin verdiğimi,</li>
              <li>Sporcuya EMEK SK Spor Okulu, MPT ve ilgili federasyonların antrenman, müsabaka ve katılmaya hak kazanılması durumunda il içi ve il dışı şampiyonaları için kafile ile birlikte seyahat etmesine izin vereceğimi,</li>
              <li>EMEK SK Spor Okulu ve MPT'nin müsabaka, antrenman vb. esnasında çekilen resim, video ve röportaj görüntülerinin EMEK SK Spor Okulu ve MPT resmi yayın organları tarafından yayınlanmasında sakınca olmadığını,</li>
              <li>Spor Okulu ve MPT çalışmalarına hiç bir şekilde müdahalede bulunmayacağımı,</li>
              <li>Spor Okulu ve MPT tarafından tarafımıza iletilecek olan SMS ve e-mail bilgilendirme mesajlarının gelmesine izin verdiğimi,</li>
              <li>COVID-19 gibi ortaya çıkan yada çıkacak olan pandemi süreçleri boyunca Sağlık Bakanlığı ve İçişleri Bakanlığının konuya ait yönetmelik, genelge vb. tüm hijyen tedbirleri ile EMEK SK Spor Okulu ve MPT hijyen talimatlarına antrenman yada müsabaka öncesi, esnası ve sonrasında uyacağımızı, hastalık belirtileri gibi durumlarda önceden mutlaka bilgi vereceğimi,</li>
              <li>Velisi / Vasisi bulunduğum sporcunun; Türkiye Halk Sağlığı Kurumu Başkanlığının 11.07.2013 tarih ve 9985883-045-71261 sayılı "SPORCU SAĞLIK KURULU RAPORLARI" konulu yazısına istinaden, tam teşekküllü sağlık kontrolü tarafımın sorumluluğunda olmak şartı ile spor faaliyetlerine katılmasında sağlık yönünden sakınca olmadığını, kabul, beyan ve taahhüt ederim.</li>
            </ol>
          </div>
        </div>

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-box">
            <p className="date">..../..../202..</p>
            <h4>Emek Spor Kulübü Yetkilisi</h4>
            <p>Adı Soyadı :</p>
            <p>İmzası        :</p>
            <div className="signature-line"></div>
          </div>
          <div className="signature-box">
            <p className="date">&nbsp;</p>
            <h4>Yasal Velisi/Vasisi</h4>
            <p>Adı Soyadı :</p>
            <p>İmzası        :</p>
            <div className="signature-line"></div>
          </div>
        </div>
      </div>

      {/* Photo Options - Right side of Form */}
      {showPhotoOptions && (
        <div className="photo-options-outside">
          <button className="photo-option-btn" onClick={handleSelectFromDevice}>
            <UploadIcon /> Galeriden Seç
          </button>
          <button className="photo-option-btn" onClick={handleTakePhoto}>
            <CaptureIcon /> Fotoğraf Çek
          </button>
        </div>
      )}

      </div>

      {/* Yakınlar Section - Below the A4 Form */}
      {yakinlar.length > 0 && (
        <div className="yakinlar-section" ref={yakinlarSectionRef}>
          <div className="yakinlar-header">
            <h3>Ek İletişim Kişileri</h3>
            <div className="yakinlar-header-buttons">
              <button className="yakinlar-circle-btn" onClick={handleAddYakin} title="Yeni Yakın Ekle">
                <PlusIcon />
              </button>
              <button className="yakinlar-circle-btn save" onClick={handleSaveForm} disabled={isSaving || isUploadingImage} title="Verileri Kaydet">
                <SaveIcon />
              </button>
            </div>
          </div>
          <div className="yakinlar-list">
            {yakinlar.map((yakin, index) => (
              <div key={index} className="yakin-card">
                <div className="yakin-card-header">
                  <span className="yakin-number">Yakın #{index + 1}</span>
                  <button 
                    className="yakin-remove-btn" 
                    onClick={() => handleRemoveYakin(index)}
                    title="Kaldır"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <div className="yakin-fields">
                  <div className="yakin-field">
                    <label>Yakınlık Derecesi</label>
                    <input
                      type="text"
                      placeholder="Örn: Amca, Teyze..."
                      value={yakin.yakinlikDerecesi}
                      onChange={(e) => handleYakinChange(index, 'yakinlikDerecesi', e.target.value)}
                    />
                  </div>
                  <div className="yakin-field">
                    <label>TC Kimlik No</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={yakin.tcKimlikNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleYakinChange(index, 'tcKimlikNo', value);
                      }}
                      maxLength="11"
                    />
                  </div>
                  <div className="yakin-field">
                    <label>Adı Soyadı</label>
                    <input
                      type="text"
                      value={yakin.adiSoyadi}
                      onChange={(e) => handleYakinChange(index, 'adiSoyadi', e.target.value)}
                    />
                  </div>
                  <div className="yakin-field">
                    <label>Mesleği</label>
                    <input
                      type="text"
                      value={yakin.meslegi}
                      onChange={(e) => handleYakinChange(index, 'meslegi', e.target.value)}
                    />
                  </div>
                  <div className="yakin-field">
                    <label>Cep No</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={yakin.cepTel}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleYakinChange(index, 'cepTel', value);
                      }}
                      maxLength="11"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </>
  );
});

export default RegistrationForm;


