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
 * @param {Object} backendData - Backend'den gelen öğrenci verisi
 * @returns {Object} Frontend formatında öğrenci objesi
 */
export function transformBackendToStudent(backendData) {
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
      // Geçersiz tarih kontrolü
      if (isNaN(date.getTime())) {
        return null;
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return null;
    }
  };

  // İç içe geçmiş student objesi varsa onu kullan
  const studentData = backendData.student || backendData;
  
  // İsim bilgilerini al - farklı formatları kontrol et
  // Önce direkt name alanını kontrol et
  let name = studentData.name || backendData.name || studentData.fullName || backendData.fullName || '';
  
  // Eğer name yoksa firstName ve lastName'den oluştur
  if (!name) {
    const firstName = studentData.firstName || 
                      backendData.firstName || 
                      studentData.first_name || 
                      backendData.first_name ||
                      backendData.studentFirstName || // Backend'den gelen format
                      '';
    const lastName = studentData.lastName || 
                     backendData.lastName || 
                     studentData.last_name || 
                     backendData.last_name ||
                     backendData.studentLastName || // Backend'den gelen format
                     '';
    name = `${firstName} ${lastName}`.trim();
  }
  
  // Son çare olarak "İsimsiz Öğrenci"
  if (!name) {
    name = 'İsimsiz Öğrenci';
  }
  
  // ID'yi al - backend'den gelen farklı formatları kontrol et
  const studentId = String(studentData.id || 
                           backendData.id || 
                           studentData.studentId || 
                           backendData.studentId || 
                           backendData.studentId || // Backend'den gelen format
                           studentData.nationalId || 
                           backendData.nationalId || 
                           Date.now());

  // Fotoğraf kontrolü - iç içe geçmiş objeleri de kontrol et
  let photo = studentData.photo || 
              backendData.photo || 
              studentData.photoUrl || 
              backendData.photoUrl || 
              studentData.photoBase64 ||
              backendData.photoBase64 ||
              studentData.profileImageBase64 ||
              backendData.profileImageBase64;
              
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
  const motherName = studentData.mother || backendData.mother
    ? `${(studentData.mother || backendData.mother)?.firstName || ''} ${(studentData.mother || backendData.mother)?.lastName || ''}`.trim()
    : studentData.motherInfo || backendData.motherInfo 
    ? `${(studentData.motherInfo || backendData.motherInfo)?.firstName || ''} ${(studentData.motherInfo || backendData.motherInfo)?.lastName || ''}`.trim()
    : '';
  
  // Baba bilgileri
  const fatherName = studentData.father || backendData.father
    ? `${(studentData.father || backendData.father)?.firstName || ''} ${(studentData.father || backendData.father)?.lastName || ''}`.trim()
    : studentData.fatherInfo || backendData.fatherInfo
    ? `${(studentData.fatherInfo || backendData.fatherInfo)?.firstName || ''} ${(studentData.fatherInfo || backendData.fatherInfo)?.lastName || ''}`.trim()
    : '';
  
  return {
    id: studentId,
    name: name,
    age: calculateAge(studentData.dateOfBirth) || calculateAge(backendData.dateOfBirth) || calculateAge(studentData.birthDate) || calculateAge(backendData.birthDate) || '-',
    team: studentData.branch || backendData.branch || studentData.team || backendData.team || '-',
    birthDate: formatDate(studentData.dateOfBirth) || formatDate(backendData.dateOfBirth) || formatDate(studentData.birthDate) || formatDate(backendData.birthDate) || '-',
    attendance: studentData.attendance || backendData.attendance || 0, // Backend'den gelen attendance varsa kullan
    photo: photo,
    position: studentData.branch || backendData.branch || studentData.position || backendData.position || '-',
    jerseyNumber: studentData.jerseyNumber || backendData.jerseyNumber || studentData.jersey_number || backendData.jersey_number || null,
    hasGroup: studentData.hasGroup || backendData.hasGroup || studentData.has_group || backendData.has_group || false,
    // Profil bilgileri - iç içe geçmiş student objesi varsa onu kullan
    profile: {
      tc: studentData.nationalId || backendData.nationalId || '-',
      school: studentData.schoolName || backendData.schoolName || '-',
      dob: formatDate(studentData.dateOfBirth) || formatDate(backendData.dateOfBirth) || '-',
      grade: studentData.class || backendData.class || studentData.classNumber || backendData.classNumber || '-', // Sınıf numarası (backend'de "class" olarak geliyor)
      phone: studentData.phoneNumber || backendData.phoneNumber || '-', // Sporcu cep telefonu
      branch: studentData.branch || backendData.branch || '-',
      address: studentData.homeAddress || backendData.homeAddress || '-'
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

