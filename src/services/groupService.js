import { apiClient, ApiError } from './api';

/**
 * Group Service
 * Grup yönetimi için backend API çağrıları
 */

/**
 * Tüm grupları getir
 * @returns {Promise<Array>} Grup listesi
 */
export async function getGroups() {
  try {
    const response = await apiClient.get('/Groups');
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Gruplar yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * ID'ye göre grup getir
 * @param {string|number} groupId - Grup ID'si
 * @returns {Promise<Object>} Grup bilgisi
 */
export async function getGroupById(groupId) {
  try {
    const response = await apiClient.get(`/Groups/${groupId}`);
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Grup bilgisi yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Yeni grup oluştur
 * @param {Object} groupData - Grup verisi
 * @param {string} groupData.name - Grup adı
 * @param {number} groupData.minAge - Minimum yaş
 * @param {number} groupData.maxAge - Maksimum yaş
 * @returns {Promise<Object>} Oluşturulan grup
 */
export async function createGroup(groupData) {
  try {
    const payload = {
      name: groupData.name.trim(),
      minAge: groupData.minAge,
      maxAge: groupData.maxAge
    };

    // Validasyon
    if (!payload.name) {
      throw new ApiError('Grup adı gereklidir', false);
    }
    if (payload.minAge === null || payload.maxAge === null) {
      throw new ApiError('Yaş aralığı gereklidir', false);
    }
    if (payload.minAge > payload.maxAge) {
      throw new ApiError('Minimum yaş maksimum yaştan büyük olamaz', false);
    }

    const response = await apiClient.post('/Groups', payload);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Backend'den gelen hata mesajını yakala
    let errorMessage = 'Grup oluşturulurken bir hata oluştu';
    
    if (error.response) {
      // Backend'den gelen hata mesajı
      const backendError = error.response.data;
      if (backendError?.message) {
        errorMessage = backendError.message;
      } else if (backendError?.error) {
        errorMessage = backendError.error;
      } else if (typeof backendError === 'string') {
        errorMessage = backendError;
      } else if (error.response.status === 400) {
        errorMessage = 'Geçersiz veri. Lütfen bilgileri kontrol edin.';
      } else if (error.response.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      }
    } else if (error.request) {
      // İstek gönderildi ama yanıt alınamadı
      errorMessage = 'Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.';
    } else {
      // İstek hazırlanırken hata oluştu
      errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
    }
    
    console.error('Grup oluşturma hatası:', error);
    throw new ApiError(errorMessage, false);
  }
}

/**
 * Grup güncelle
 * @param {string|number} groupId - Grup ID'si
 * @param {Object} groupData - Güncellenecek grup verisi
 * @param {string} groupData.name - Grup adı
 * @param {number} groupData.minAge - Minimum yaş
 * @param {number} groupData.maxAge - Maksimum yaş
 * @returns {Promise<Object>} Güncellenen grup
 */
export async function updateGroup(groupId, groupData) {
  try {
    const payload = {
      name: groupData.name.trim(),
      minAge: groupData.minAge,
      maxAge: groupData.maxAge
    };

    // Validasyon
    if (!payload.name) {
      throw new ApiError('Grup adı gereklidir', false);
    }
    if (payload.minAge === null || payload.maxAge === null) {
      throw new ApiError('Yaş aralığı gereklidir', false);
    }
    if (payload.minAge > payload.maxAge) {
      throw new ApiError('Minimum yaş maksimum yaştan büyük olamaz', false);
    }

    const response = await apiClient.put(`/Groups/${groupId}`, payload);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.response?.data?.message || 'Grup güncellenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Grup sil
 * @param {string|number} groupId - Grup ID'si
 * @returns {Promise<void>}
 */
export async function deleteGroup(groupId) {
  try {
    // Backend'de grup silme endpoint'i kontrol ediliyor
    // Swagger'da DELETE /api/Groups/{id} endpoint'i görünmüyor
    // Eğer endpoint farklıysa burayı güncelleyin
    const response = await apiClient.delete(`/Groups/${groupId}`);
    return response.data;
  } catch (error) {
    // Detaylı hata mesajı
    let errorMessage = 'Grup silinirken bir hata oluştu';
    
    if (error.response) {
      // Backend'den gelen hata mesajı
      const backendError = error.response.data;
      if (backendError?.message) {
        errorMessage = backendError.message;
      } else if (backendError?.error) {
        errorMessage = backendError.error;
      } else if (typeof backendError === 'string') {
        errorMessage = backendError;
      } else if (error.response.status === 404) {
        errorMessage = 'Grup silme endpoint\'i bulunamadı. Backend\'de DELETE /api/Groups/{id} endpoint\'i tanımlı olmayabilir.';
      } else if (error.response.status === 405) {
        errorMessage = 'Grup silme metodu desteklenmiyor. Backend\'de DELETE endpoint\'i tanımlı değil.';
      } else if (error.response.status === 400) {
        errorMessage = 'Geçersiz grup ID';
      } else if (error.response.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      }
    } else if (error.request) {
      // İstek gönderildi ama yanıt alınamadı
      errorMessage = 'Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.';
    } else {
      // İstek hazırlanırken hata oluştu
      errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
    }
    
    console.error('Grup silme hatası:', {
      groupId,
      error: error.response?.data || error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      note: 'Backend\'de DELETE /api/Groups/{id} endpoint\'i olmayabilir. Swagger\'ı kontrol edin.'
    });
    
    throw new ApiError(errorMessage, false);
  }
}

/**
 * Gruba öğrenci ata
 * @param {string|number} groupId - Grup ID'si
 * @param {string|number} studentId - Öğrenci ID'si
 * @returns {Promise<void>}
 */
export async function assignStudentToGroup(groupId, studentId) {
  try {
    await apiClient.post('/Groups/add-student', { 
      groupId, 
      studentId 
    });
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Öğrenci atanırken bir hata oluştu',
      false
    );
  }
}

/**
 * Gruptan öğrenci çıkar
 * @param {string|number} groupId - Grup ID'si
 * @param {string|number} studentId - Öğrenci ID'si
 * @returns {Promise<void>}
 */
export async function removeStudentFromGroup(groupId, studentId) {
  try {
    await apiClient.delete(`/Groups/${groupId}/students/${studentId}`);
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Öğrenci çıkarılırken bir hata oluştu',
      false
    );
  }
}

/**
 * Grubun öğrencilerini getir
 * @param {string|number} groupId - Grup ID'si
 * @returns {Promise<Array>} Öğrenci listesi
 */
export async function getGroupStudents(groupId) {
  try {
    const response = await apiClient.get(`/Groups/${groupId}/students`);
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Öğrenci listesi yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Grupsuz öğrencileri getir
 * @returns {Promise<Array>} Grupsuz öğrenci listesi
 */
export async function getStudentsWithoutGroups() {
  try {
    const response = await apiClient.get('/Groups/students-without-groups');
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Grupsuz öğrenciler yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Tüm öğrencileri getir (gruplu ve grupsuz)
 * @returns {Promise<Array>} Tüm öğrenci listesi
 */
export async function getAllStudents() {
  try {
    const response = await apiClient.get('/Groups/students-with-groups');
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Öğrenciler yüklenirken bir hata oluştu',
      false
    );
  }
}

