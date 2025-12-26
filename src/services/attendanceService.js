import { apiClient, ApiError } from './api';

/**
 * Attendance Service
 * Yoklama yönetimi için backend API çağrıları
 */

/**
 * Belirli bir ders için öğrenci yoklama bilgilerini getir
 * @param {string|number} lessonId - Ders ID'si
 * @returns {Promise<Array>} Öğrenci yoklama listesi
 */
export async function getLessonAttendances(lessonId) {
  try {
    const response = await apiClient.get(`/Attendances/lesson/${lessonId}/students`);
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
 * Tarihi ISO formatına çevir (backend için)
 * @param {Date|string} date - Tarih (Date objesi veya string)
 * @returns {string} ISO formatında tarih string'i (YYYY-MM-DD)
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
  
  // ISO format: YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

