import { apiClient, ApiError } from './api';

/**
 * Attendance Service
 * Yoklama yönetimi için backend API çağrıları
 */

/**
 * Belirli bir ders için öğrenci yoklama bilgilerini getir
 * @param {string|number} lessonId - Ders ID'si
 * @param {string|Date} attendanceDate - Yoklama tarihi (opsiyonel, formatDateForBackend formatında)
 * @returns {Promise<Object>} Öğrenci yoklama listesi (Students array içerir)
 */
export async function getLessonAttendances(lessonId, attendanceDate = null) {
  try {
    const params = {};
    if (attendanceDate) {
      // Eğer Date objesi ise formatla, string ise direkt kullan
      params.attendanceDate = attendanceDate instanceof Date 
        ? formatDateForBackend(attendanceDate) 
        : attendanceDate;
    }
    const response = await apiClient.get(`/Attendances/lesson/${lessonId}/students`, { params });
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Yoklama bilgileri yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Toplu yoklama kaydı oluştur/güncelle
 * @param {Object} attendanceData - Yoklama verisi
 * @param {string} attendanceData.lessonId - Ders ID'si
 * @param {string} attendanceData.attendanceDate - Yoklama tarihi (ISO format veya DD.MM.YYYY)
 * @param {Array<Object>} attendanceData.attendances - Öğrenci yoklama listesi
 * @param {string} attendanceData.attendances[].studentId - Öğrenci ID'si
 * @param {boolean} attendanceData.attendances[].isPresent - Katıldı mı (true/false)
 * @returns {Promise<Object>} Kayıt sonucu
 */
export async function bulkCreateAttendances(attendanceData) {
  try {
    const response = await apiClient.post('/Attendances/bulk-create', attendanceData);
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Yoklama kaydedilirken bir hata oluştu',
      false
    );
  }
}

/**
 * Öğrenci katılım yüzdesini getir
 * @param {string|number} studentId - Öğrenci ID'si
 * @param {string|number} lessonId - Ders ID'si (zorunlu)
 * @returns {Promise<number>} Katılım yüzdesi (0-100 arası)
 */
export async function getStudentAttendancePercentage(studentId, lessonId) {
  try {
    const response = await apiClient.get(`/Attendances/student-attendance-percetange`, {
      params: { studentId, lessonId }
    });
    // Backend'den gelen response: { attendancePercentage: number } (küçük harf)
    return response.data?.attendancePercentage || 0;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Katılım yüzdesi yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Belirli bir öğrenci ve ders için yoklama bilgilerini getir
 * @param {string|number} studentId - Öğrenci ID'si
 * @param {string|number} lessonId - Ders ID'si
 * @returns {Promise<Array>} Öğrenci yoklama listesi
 */
export async function getStudentLessonAttendances(studentId, lessonId) {
  try {
    const response = await apiClient.get(`/Attendances/student/${studentId}/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Yoklama bilgileri yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Tarihi ISO formatına çevir (backend için)
 * PostgreSQL UTC beklediği için UTC timezone ile gönderilir
 * @param {Date|string} date - Tarih (Date objesi veya string)
 * @returns {string} ISO 8601 formatında tarih string'i (YYYY-MM-DDTHH:mm:ssZ)
 */
export function formatDateForBackend(date) {
  if (!date) return null;
  
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // DD.MM.YYYY formatından parse et
    const parts = date.split('.');
    if (parts.length === 3) {
      dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      dateObj = new Date(date);
    }
  } else {
    return null;
  }
  
  if (isNaN(dateObj.getTime())) {
    return null;
  }
  
  // UTC olarak ISO 8601 formatında gönder (PostgreSQL için)
  // Default saat 00:00:00 UTC olarak ayarla
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  
  // ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ (PostgreSQL UTC bekliyor)
  return `${year}-${month}-${day}T00:00:00Z`;
}

