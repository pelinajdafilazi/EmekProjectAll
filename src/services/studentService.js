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
    // Backend'den gelen ek bilgiler
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
   * ID'ye göre öğrenci getir
   */
  async getStudentById(id) {
    try {
      const response = await apiClient.get(`/StudentPersonalInfo/${id}`);
      return transformBackendToStudent(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new ApiError(
        error.response?.data?.message || 'Öğrenci alınırken hata oluştu'
      );
    }
  }
};

