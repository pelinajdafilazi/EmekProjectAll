import { apiClient, ApiError } from './api';

/**
 * Rastgele avatar seç (mock data gibi görünsün)
 */
function getRandomAvatar() {
  const avatars = [
    '/avatars/student-1.svg',
    '/avatars/student-2.svg',
    '/avatars/student-3.svg',
    '/avatars/student-4.svg',
    '/avatars/student-5.svg',
    '/avatars/student-6.svg',
    '/avatars/student-7.svg',
    '/avatars/student-8.svg',
    '/avatars/student-9.svg'
  ];
  // ID'ye göre deterministik seçim (aynı öğrenci aynı avatar'ı alsın)
  return avatars[0]; // Varsayılan olarak ilk avatar
}

/**
 * Backend StudentPersonalInfo formatından frontend student formatına dönüştürür
 */
function transformBackendToStudent(backendData) {
  // Yaş hesaplama
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Tarih formatı dönüştürme (DD.MM.YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return null;
    }
  };

  const firstName = backendData.firstName || '';
  const lastName = backendData.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'İsimsiz Öğrenci';
  const studentId = String(backendData.id || backendData.nationalId || Date.now());

  // Fotoğraf kontrolü
  let photo = backendData.photo || backendData.photoUrl || backendData.photoBase64;
  if (!photo || (typeof photo === 'string' && !photo.startsWith('data:') && !photo.startsWith('http') && !photo.startsWith('/'))) {
    // Fotoğraf yoksa ID'ye göre deterministik avatar seç
    const avatars = [
      '/avatars/student-1.svg',
      '/avatars/student-2.svg',
      '/avatars/student-3.svg',
      '/avatars/student-4.svg',
      '/avatars/student-5.svg',
      '/avatars/student-6.svg',
      '/avatars/student-7.svg',
      '/avatars/student-8.svg',
      '/avatars/student-9.svg'
    ];
    // ID'den sayı çıkar veya hash kullan
    const idNum = parseInt(studentId.replace(/\D/g, '')) || studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = idNum % avatars.length;
    photo = avatars[avatarIndex];
  }

  // Anne bilgileri - /with-parents endpoint'inden gelen format
  // Backend'de mother ve father objeleri direkt olarak geliyor
  const motherName = backendData.mother 
    ? `${backendData.mother.firstName || ''} ${backendData.mother.lastName || ''}`.trim()
    : backendData.motherInfo 
    ? `${backendData.motherInfo.firstName || ''} ${backendData.motherInfo.lastName || ''}`.trim()
    : '';
  
  // Baba bilgileri
  const fatherName = backendData.father
    ? `${backendData.father.firstName || ''} ${backendData.father.lastName || ''}`.trim()
    : backendData.fatherInfo
    ? `${backendData.fatherInfo.firstName || ''} ${backendData.fatherInfo.lastName || ''}`.trim()
    : '';

  return {
    id: studentId,
    name: fullName,
    age: calculateAge(backendData.dateOfBirth) || '-',
    team: backendData.branch || '-',
    birthDate: formatDate(backendData.dateOfBirth) || '-',
    attendance: 0, // Varsayılan değer, backend'den gelmiyorsa
    photo: photo,
    position: backendData.branch || '-',
    jerseyNumber: null,
    hasGroup: false,
    // Profil bilgileri
    profile: {
      tc: backendData.nationalId || '-',
      school: backendData.schoolName || '-',
      dob: formatDate(backendData.dateOfBirth) || '-',
      grade: backendData.classNumber || '-', // Sınıf numarası
      phone: backendData.phoneNumber || '-', // Sporcu cep telefonu
      branch: backendData.branch || '-',
      address: backendData.homeAddress || '-'
    },
    // Anne bilgileri - /with-parents endpoint'inden gelen format
    parents: {
      mother: {
        name: motherName || '-',
        tc: backendData.mother?.nationalId || backendData.motherInfo?.nationalId || '-',
        occupation: backendData.mother?.occupation || backendData.motherInfo?.occupation || '-',
        phone: backendData.mother?.phoneNumber || backendData.motherInfo?.phoneNumber || '-'
      },
      father: {
        name: fatherName || '-',
        tc: backendData.father?.nationalId || backendData.fatherInfo?.nationalId || '-',
        occupation: backendData.father?.occupation || backendData.fatherInfo?.occupation || '-',
        phone: backendData.father?.phoneNumber || backendData.fatherInfo?.phoneNumber || '-'
      }
    },
    // Yakınlar (şimdilik boş, backend'de yok)
    relatives: {
      aunt: {
        name: '-',
        tc: '-'
      },
      uncle: {
        name: '-',
        tc: '-'
      }
    },
    // Backend'den gelen ham veri
    _backendData: backendData
  };
}

/**
 * Student Service - Backend API İşlemleri
 */
export const StudentService = {
  /**
   * Tüm öğrencileri getir
   */
  async getAllStudents() {
    try {
      const response = await apiClient.get('/StudentPersonalInfo');
      return response.data.map(item => transformBackendToStudent(item));
    } catch (error) {
      throw new ApiError(
        error.response?.data?.message || 'Öğrenciler alınırken hata oluştu'
      );
    }
  },

  /**
   * ID'ye göre öğrenci getir (anne-baba bilgileriyle birlikte)
   */
  async getStudentById(id) {
    try {
      // /with-parents endpoint'ini kullanarak anne-baba bilgilerini de al
      const response = await apiClient.get(`/StudentPersonalInfo/${id}/with-parents`);
      return transformBackendToStudent(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new ApiError(
        error.response?.data?.message || 'Öğrenci alınırken hata oluştu'
      );
    }
  },

  /**
   * Öğrencinin yakınlarını getir
   * @param {string|number} studentId - Öğrenci ID'si
   * @returns {Promise<Array>} Yakın listesi
   */
  async getStudentRelatives(studentId) {
    try {
      const response = await apiClient.get(`/StudentRelatives/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw new ApiError(
        error.response?.data?.message || 'Yakınlar alınırken hata oluştu'
      );
    }
  }
};

