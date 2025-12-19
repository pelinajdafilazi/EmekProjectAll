import { apiClient, ApiError } from './api';


/**
 * Form verilerini backend şemasına dönüştürür
 * Frontend formData -> Backend StudentPersonalInfo
 */
function transformToBackendFormat(formData) {
    const { sporcu, baba, anne } = formData;
    
    // Adı Soyadı'nı firstName ve lastName'e ayır
    const parseFullName = (fullName) => {
      if (!fullName) return { firstName: '', lastName: '' };
      const parts = fullName.trim().split(' ');
      const lastName = parts.pop() || '';
      const firstName = parts.join(' ') || '';
      return { firstName, lastName };
    };
  
    // Tarihi güvenli şekilde ISO formatına çevir
    // Boş veya geçersizse null döner
    const formatDateToISO = (dateStr) => {
      if (!dateStr || dateStr.trim() === '') return null;
      try {
        const date = new Date(dateStr);
        // Geçerli bir tarih mi kontrol et
        if (isNaN(date.getTime())) {
          return null;
        }
        return date.toISOString();
      } catch {
        return null;
      }
    };
  
    const sporcuName = parseFullName(sporcu.adiSoyadi);
    const babaName = parseFullName(baba.adiSoyadi);
    const anneName = parseFullName(anne.adiSoyadi);
  
    return {
      firstName: sporcuName.firstName,
      lastName: sporcuName.lastName,
      dateOfBirth: formatDateToISO(sporcu.dogumTarihi),
      nationalId: sporcu.tcKimlikNo,
      schoolName: sporcu.okulu,
      homeAddress: sporcu.evAdresi,
      branch: sporcu.bransi,
      phoneNumber: sporcu.sporcuCep || null, // Sporcu cep telefonu
      classNumber: sporcu.sinifNo || null, // Sınıf numarası
      photo: formData.photo || null, // Fotoğrafı ekle
      motherInfo: {
        firstName: anneName.firstName,
        lastName: anneName.lastName,
        nationalId: anne.tcKimlikNo,
        phoneNumber: anne.cepTel,
        email: '',
        occupation: anne.meslegi
      },
      fatherInfo: {
        firstName: babaName.firstName,
        lastName: babaName.lastName,
        nationalId: baba.tcKimlikNo,
        phoneNumber: baba.cepTel,
        email: '',
        occupation: baba.meslegi
      }
    };
  }
  
  /**
   * Backend verisini frontend formData formatına dönüştürür
   * Backend StudentPersonalInfo -> Frontend formData
   */
  function transformToFrontendFormat(backendData) {
    return {
      sporcu: {
        bransi: backendData.branch || '',
        tcKimlikNo: backendData.nationalId || '',
        adiSoyadi: `${backendData.firstName || ''} ${backendData.lastName || ''}`.trim(),
        dogumTarihi: backendData.dateOfBirth ? backendData.dateOfBirth.split('T')[0] : '',
        okulu: backendData.schoolName || '',
        sinifNo: backendData.classNumber || '',
        sporcuCep: backendData.phoneNumber || '',
        evAdresi: backendData.homeAddress || ''
      },
      baba: {
        tcKimlikNo: backendData.fatherInfo?.nationalId || '',
        adiSoyadi: `${backendData.fatherInfo?.firstName || ''} ${backendData.fatherInfo?.lastName || ''}`.trim(),
        meslegi: backendData.fatherInfo?.occupation || '',
        cepTel: backendData.fatherInfo?.phoneNumber || ''
      },
      anne: {
        tcKimlikNo: backendData.motherInfo?.nationalId || '',
        adiSoyadi: `${backendData.motherInfo?.firstName || ''} ${backendData.motherInfo?.lastName || ''}`.trim(),
        meslegi: backendData.motherInfo?.occupation || '',
        cepTel: backendData.motherInfo?.phoneNumber || ''
      },
      photo: null,
      id: backendData.id,
      createdAt: backendData.createdAt,
      updatedAt: backendData.updatedAt
    };
  }
  
  /**
   * Form Data Service - Backend API İşlemleri
   */
  export const FormService = {
    async saveForm(formData) {
      try {
        const backendData = transformToBackendFormat(formData);
        const response = await apiClient.post('/StudentPersonalInfo', backendData);
        return {
          success: true,
          data: response.data,
          message: 'Kayıt başarıyla oluşturuldu'
        };
      } catch (error) {
        throw new ApiError(
          error.response?.data?.message || error.message || 'Kayıt oluşturulurken hata oluştu'
        );
      }
    },
  
    async getAllForms() {
      try {
        const response = await apiClient.get('/StudentPersonalInfo');
        return response.data.map(item => transformToFrontendFormat(item));
      } catch (error) {
        throw new ApiError(
          error.response?.data?.message || 'Kayıtlar alınırken hata oluştu'
        );
      }
    },
  
    async getFormById(id) {
      try {
        const response = await apiClient.get(`/StudentPersonalInfo/${id}`);
        return transformToFrontendFormat(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          return null;
        }
        throw new ApiError(
          error.response?.data?.message || 'Kayıt alınırken hata oluştu'
        );
      }
    },
  
    async updateForm(id, formData) {
      try {
        const backendData = transformToBackendFormat(formData);
        const response = await apiClient.put(`/StudentPersonalInfo/${id}`, backendData);
        return {
          success: true,
          data: response.data,
          message: 'Kayıt başarıyla güncellendi'
        };
      } catch (error) {
        throw new ApiError(
          error.response?.data?.message || 'Kayıt güncellenirken hata oluştu'
        );
      }
    },
  
    async deleteForm(id) {
      try {
        await apiClient.delete(`/StudentPersonalInfo/${id}`);
        return {
          success: true,
          message: 'Kayıt başarıyla silindi'
        };
      } catch (error) {
        throw new ApiError(
          error.response?.data?.message || 'Kayıt silinirken hata oluştu'
        );
      }
    }
  };
  
  /**
   * Settings Service - Ayarlar (localStorage'da kalacak)
   */
  export const SettingsService = {
    async getSettings() {
      const defaultSettings = {
        clubName: 'EMEK SPOR KULÜBÜ',
        address: 'Yücetepe, 88. Cd. No:7 Çankaya/ANKARA',
        phone: '0 551 525 37 00',
        logo: null,
        formTitle: 'KAYIT VE SÖZLEŞME FORMU'
      };
      
      const saved = localStorage.getItem('emek_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    },
  
    async saveSettings(settings) {
      localStorage.setItem('emek_settings', JSON.stringify(settings));
      return settings;
    }
  };