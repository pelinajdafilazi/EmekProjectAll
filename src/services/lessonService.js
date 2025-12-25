import { apiClient, ApiError } from './api';

/**
 * Lesson Service
 * Ders yönetimi için backend API çağrıları
 */

/**
 * Tüm dersleri getir
 * @returns {Promise<Array>} Ders listesi
 */
export async function getLessons() {
  try {
    const response = await apiClient.get('/Lessons');
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Dersler yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * ID'ye göre ders getir
 * @param {string|number} lessonId - Ders ID'si
 * @returns {Promise<Object>} Ders bilgisi
 */
export async function getLessonById(lessonId) {
  try {
    const response = await apiClient.get(`/Lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Ders bilgisi yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Yeni ders oluştur
 * @param {Object} lessonData - Ders verisi
 * @param {string} lessonData.lessonName - Ders adı
 * @param {string} lessonData.startingDayOfWeek - Başlangıç günü (örn: "Monday")
 * @param {string} lessonData.startingHour - Başlangıç saati (örn: "14:00")
 * @param {string} lessonData.endingDayOfWeek - Bitiş günü (örn: "Monday")
 * @param {string} lessonData.endingHour - Bitiş saati (örn: "16:00")
 * @param {number} lessonData.capacity - Kapasite
 * @param {string} lessonData.groupId - Grup ID'si (UUID)
 * @returns {Promise<Object>} Oluşturulan ders
 */
export async function createLesson(lessonData) {
  try {
    const payload = {
      lessonName: lessonData.lessonName.trim(),
      startingDayOfWeek: lessonData.startingDayOfWeek,
      startingHour: lessonData.startingHour,
      endingDayOfWeek: lessonData.endingDayOfWeek,
      endingHour: lessonData.endingHour,
      capacity: parseInt(lessonData.capacity, 10),
      groupId: lessonData.groupId
    };

    console.log('Lesson Service - Gönderilen payload:', JSON.stringify(payload, null, 2));

    // Validasyon
    if (!payload.lessonName) {
      throw new ApiError('Ders adı gereklidir', false);
    }
    if (!payload.startingDayOfWeek) {
      throw new ApiError('Başlangıç günü gereklidir', false);
    }
    if (!payload.startingHour) {
      throw new ApiError('Başlangıç saati gereklidir', false);
    }
    if (!payload.endingDayOfWeek) {
      throw new ApiError('Bitiş günü gereklidir', false);
    }
    if (!payload.endingHour) {
      throw new ApiError('Bitiş saati gereklidir', false);
    }
    if (!payload.capacity || payload.capacity <= 0) {
      throw new ApiError('Geçerli bir kapasite giriniz', false);
    }
    if (!payload.groupId) {
      throw new ApiError('Grup seçimi gereklidir', false);
    }

    const response = await apiClient.post('/Lessons', payload);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Backend'den gelen hata mesajını yakala
    let errorMessage = 'Ders oluşturulurken bir hata oluştu';
    
    if (error.response) {
      // Backend'den gelen hata mesajı
      const backendError = error.response.data;
      console.error('Backend hata detayları:', {
        status: error.response.status,
        data: backendError,
        payload: error.config?.data
      });
      
      if (backendError?.message) {
        errorMessage = backendError.message;
      } else if (backendError?.error) {
        errorMessage = backendError.error;
      } else if (typeof backendError === 'string') {
        errorMessage = backendError;
      } else if (Array.isArray(backendError?.errors)) {
        // Validation errors array
        errorMessage = backendError.errors.map(e => e.message || e).join(', ');
      } else if (error.response.status === 400) {
        // 400 hatası için daha detaylı mesaj
        errorMessage = backendError?.title || backendError?.Message || 'Geçersiz veri. Lütfen bilgileri kontrol edin.';
        if (backendError) {
          console.error('Backend validation errors:', JSON.stringify(backendError, null, 2));
        }
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
    
    console.error('Ders oluşturma hatası:', error);
    throw new ApiError(errorMessage, false);
  }
}

/**
 * Ders güncelle
 * @param {string|number} lessonId - Ders ID'si
 * @param {Object} lessonData - Güncellenecek ders verisi
 * @returns {Promise<Object>} Güncellenen ders
 */
export async function updateLesson(lessonId, lessonData) {
  try {
    // Backend'in beklediği format: tüm alanlar doğrudan payload'da
    const payload = {
      lessonName: lessonData.lessonName?.trim(),
      startingDayOfWeek: String(lessonData.startingDayOfWeek), // String'e çevir
      startingHour: lessonData.startingHour,
      endingDayOfWeek: String(lessonData.endingDayOfWeek), // String'e çevir
      endingHour: lessonData.endingHour,
      capacity: lessonData.capacity ? parseInt(lessonData.capacity, 10) : undefined,
      lessonId: lessonId, // Backend 'lessonId' bekliyor, 'id' değil
      groupId: lessonData.groupId
    };

    console.log('Lesson Service - Güncelleme payload:', JSON.stringify(payload, null, 2));

    // Backend PUT /api/Lessons endpoint'ini kullan (ID body'de gönderiliyor)
    console.log('Lesson Service - PUT request:', `/Lessons`, payload);
    const response = await apiClient.put(`/Lessons`, payload);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Backend'den gelen hata mesajını yakala
    let errorMessage = 'Ders güncellenirken bir hata oluştu';
    
    if (error.response) {
      // Backend'den gelen hata mesajı
      const backendError = error.response.data;
      console.error('Backend hata detayları:', {
        status: error.response.status,
        data: backendError,
        payload: error.config?.data
      });
      
      if (backendError?.message) {
        errorMessage = backendError.message;
      } else if (backendError?.error) {
        errorMessage = backendError.error;
      } else if (typeof backendError === 'string') {
        errorMessage = backendError;
      } else if (Array.isArray(backendError?.errors)) {
        // Validation errors array
        errorMessage = backendError.errors.map(e => e.message || e).join(', ');
      } else if (error.response.status === 400) {
        // 400 hatası için daha detaylı mesaj
        errorMessage = backendError?.title || backendError?.Message || 'Geçersiz veri. Lütfen bilgileri kontrol edin.';
        if (backendError) {
          console.error('Backend validation errors:', JSON.stringify(backendError, null, 2));
        }
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
    
    console.error('Ders güncelleme hatası:', error);
    throw new ApiError(errorMessage, false);
  }
}

/**
 * Ders sil (isActive: false yaparak soft delete)
 * @param {string|number} lessonId - Ders ID'si
 * @param {string|number|null} [optionalGroupId] - Opsiyonel grup ID'si (lessonGroupIds'den gelebilir)
 * @returns {Promise<void>}
 */
export async function deleteLesson(lessonId, optionalGroupId = null) {
  try {
    const lessonIdString = String(lessonId);
    
    // Önce dersin mevcut bilgilerini al
    const currentLesson = await getLessonById(lessonIdString);
    
    // groupId'yi kontrol et - önce optionalGroupId'den, sonra currentLesson'dan
    const rawGroupId = optionalGroupId || currentLesson.groupId || currentLesson.group?.id;
    const isValidGroupId = rawGroupId && 
                          rawGroupId !== '00000000-0000-0000-0000-000000000000' && 
                          rawGroupId !== null &&
                          rawGroupId !== undefined &&
                          String(rawGroupId).trim() !== '';
    
    // Tüm ders bilgilerini koruyarak sadece isActive'i false yap
    const payload = {
      lessonName: currentLesson.lessonName || currentLesson.name,
      startingDayOfWeek: currentLesson.startingDayOfWeek,
      startingHour: currentLesson.startingHour,
      endingDayOfWeek: currentLesson.endingDayOfWeek || currentLesson.startingDayOfWeek,
      endingHour: currentLesson.endingHour,
      capacity: currentLesson.capacity,
      lessonId: lessonIdString,
      isActive: false
    };
    
    // Sadece geçerli bir groupId varsa payload'a ekle
    // Eğer groupId geçersizse, backend muhtemelen null/undefined kabul etmez
    // Bu durumda mevcut ders bilgilerini kullanıyoruz ama groupId'yi atlıyoruz
    // Backend groupId'yi zorunlu kılıyorsa hata alacağız, ama denemiş olacağız
    if (isValidGroupId) {
      payload.groupId = rawGroupId;
    } else {
      // groupId geçersizse payload'a eklemiyoruz
      console.warn('Delete Lesson - Geçersiz groupId, payload\'a eklenmiyor:', rawGroupId);
      // Backend groupId'yi zorunlu kılıyorsa, burada hata alacağız
      // Ama kullanıcının istediği mantık: sadece ders ID'si ile isActive değiştirmek
      // Bu yüzden groupId olmadan deniyoruz
    }

    console.log('Delete Lesson - Payload (groupId olmadan):', JSON.stringify(payload, null, 2));
    
    // PUT kullanarak isActive: false yap
    const response = await apiClient.put(`/Lessons`, payload);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Backend'den gelen hata mesajını yakala
    let errorMessage = 'Ders silinirken bir hata oluştu';
    
    if (error.response) {
      const backendError = error.response.data;
      if (backendError?.message) {
        errorMessage = backendError.message;
      } else if (backendError?.error) {
        errorMessage = backendError.error;
      } else if (typeof backendError === 'string') {
        errorMessage = backendError;
      }
    } else if (error.request) {
      errorMessage = 'Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.';
    } else {
      errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
    }
    
    console.error('Ders silme hatası:', error);
    throw new ApiError(errorMessage, false);
  }
}

/**
 * Derse öğrenci ata
 * @param {string|number} lessonId - Ders ID'si
 * @param {string|number} studentId - Öğrenci ID'si
 * @returns {Promise<Object>} Atama sonucu
 */
export async function assignStudentToLesson(lessonId, studentId) {
  try {
    // Backend endpoint: POST /api/Lessons/assign-student
    // Body'de hem studentId hem de lessonId gönderilmeli
    const payload = {
      studentId: studentId,
      lessonId: lessonId
    };
    
    console.log('Assign Student to Lesson - Payload:', JSON.stringify(payload, null, 2));
    
    const response = await apiClient.post('/Lessons/assign-student', payload);
    return response.data;
  } catch (error) {
    console.error('Assign Student to Lesson - Error:', error);
    throw new ApiError(
      error.response?.data?.message || 'Öğrenci atanırken bir hata oluştu',
      false
    );
  }
}

/**
 * Dersten öğrenci çıkar
 * @param {string|number} lessonId - Ders ID'si
 * @param {string|number} studentId - Öğrenci ID'si
 * @returns {Promise<void>}
 */
export async function removeStudentFromLesson(lessonId, studentId) {
  try {
    const response = await apiClient.delete(`/Lessons/${lessonId}/Students/${studentId}`);
    return response.data;
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Öğrenci çıkarılırken bir hata oluştu',
      false
    );
  }
}

/**
 * Dersin öğrencilerini getir
 * @param {string|number} lessonId - Ders ID'si
 * @returns {Promise<Array>} Öğrenci listesi
 */
export async function getLessonStudents(lessonId) {
  try {
    // Backend endpoint: GET /api/Lessons/{id}/capacity-and-students
    // Response formatı: { lessonId, currentStudentCount, capacity, students: [...] }
    const response = await apiClient.get(`/Lessons/${lessonId}/capacity-and-students`);
    
    // Response'dan students array'ini al
    if (response.data && response.data.students && Array.isArray(response.data.students)) {
      console.log(`Ders ${lessonId} öğrencileri alındı:`, response.data.students.length, 'öğrenci');
      return response.data.students;
    }
    
    // Eğer students array'i yoksa boş liste döndür
    console.warn('Response\'da students array\'i bulunamadı:', response.data);
    return [];
  } catch (error) {
    // Eğer 404 hatası alınırsa, alternatif yöntemleri dene
    if (error.response?.status === 404) {
      console.warn(`Endpoint /Lessons/${lessonId}/capacity-and-students bulunamadı, alternatif yöntem deneniyor...`);
      
      try {
        // Alternatif 1: Eski endpoint'i dene
        const response2 = await apiClient.get(`/Lessons/${lessonId}/Students`);
        return response2.data || [];
      } catch (err2) {
        console.warn('Alternatif endpoint de başarısız:', err2);
      }
      
      try {
        // Alternatif 2: Küçük harf endpoint'i dene
        const response3 = await apiClient.get(`/Lessons/${lessonId}/students`);
        return response3.data || [];
      } catch (err3) {
        console.warn('Küçük harf endpoint de başarısız:', err3);
      }
      
      try {
        // Alternatif 3: Ders detayından öğrencileri al (eğer backend öğrencileri de döndürüyorsa)
        const lessonDetail = await getLessonById(lessonId);
        if (lessonDetail && lessonDetail.students && Array.isArray(lessonDetail.students)) {
          console.log('Öğrenciler ders detayından alındı');
          return lessonDetail.students;
        }
      } catch (err4) {
        console.warn('Ders detayından öğrenciler alınamadı:', err4);
      }
      
      // Tüm alternatifler başarısız olduysa boş liste döndür
      console.warn('Tüm alternatif yöntemler başarısız, boş liste döndürülüyor');
      return [];
    }
    
    // Diğer hatalar için hata fırlat
    console.error('Ders öğrencileri yüklenirken hata:', error);
    throw new ApiError(
      error.response?.data?.message || 'Ders öğrencileri yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Derse kayıtlı olmayan öğrencileri getir
 * @param {string|number} lessonId - Ders ID'si (opsiyonel, eğer verilmezse hiçbir derse kayıtlı olmayan öğrenciler)
 * @returns {Promise<Array>} Öğrenci listesi
 */
export async function getStudentsWithoutLesson(lessonId = null) {
  try {
    if (lessonId) {
      // Belirli bir derse kayıtlı olmayan öğrenciler
      try {
        const response = await apiClient.get(`/Lessons/${lessonId}/Students/not-registered`);
        return response.data || [];
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn('Endpoint /Lessons/{lessonId}/Students/not-registered bulunamadı, alternatif yöntem kullanılıyor...');
          // Fallback'e geç
        } else {
          throw error;
        }
      }
    } else {
      // Hiçbir derse kayıtlı olmayan öğrenciler
      try {
        const response = await apiClient.get('/Students/without-lesson');
        return response.data || [];
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn('Endpoint /Students/without-lesson bulunamadı, alternatif yöntem kullanılıyor...');
          // Fallback'e geç
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    // Eğer endpoint yoksa, alternatif yöntem kullan
    console.warn('Derse kayıtlı olmayan öğrenciler endpoint\'i bulunamadı, alternatif yöntem kullanılıyor:', error);
  }
  
  // Alternatif yöntem: Tüm öğrencileri getir ve ders öğrencilerini çıkar
  try {
    const { StudentService } = await import('./studentService');
    const allStudents = await StudentService.getAllStudents();
    
    if (lessonId) {
      // Belirli bir derse kayıtlı olmayan öğrenciler
      const lessonStudents = await getLessonStudents(lessonId);
      const lessonStudentIds = new Set();
      
      // Öğrenci ID'lerini topla (farklı formatları kontrol et)
      lessonStudents.forEach(s => {
        const id = s.id || s.studentId || s.student?.id || s.student?.studentId;
        if (id) {
          lessonStudentIds.add(String(id));
        }
      });
      
      // Tüm öğrencilerden ders öğrencilerini çıkar
      const filtered = allStudents.filter(student => {
        const studentId = String(student.id || student.studentId || '');
        return studentId && !lessonStudentIds.has(studentId);
      });
      
      console.log(`Derse kayıtlı olmayan öğrenciler: ${filtered.length} (Toplam: ${allStudents.length}, Ders öğrencileri: ${lessonStudents.length})`);
      return filtered;
    } else {
      // Hiçbir derse kayıtlı olmayan öğrenciler - tüm dersleri kontrol et
      const allLessons = await getLessons();
      const allLessonStudentIds = new Set();
      
      for (const lesson of allLessons) {
        try {
          const students = await getLessonStudents(lesson.id || lesson.lessonId);
          students.forEach(s => {
            const id = s.id || s.studentId || s.student?.id || s.student?.studentId;
            if (id) {
              allLessonStudentIds.add(String(id));
            }
          });
        } catch (err) {
          console.warn(`Ders ${lesson.id} öğrencileri yüklenemedi:`, err);
        }
      }
      
      const filtered = allStudents.filter(student => {
        const studentId = String(student.id || student.studentId || '');
        return studentId && !allLessonStudentIds.has(studentId);
      });
      
      console.log(`Hiçbir derse kayıtlı olmayan öğrenciler: ${filtered.length} (Toplam: ${allStudents.length})`);
      return filtered;
    }
  } catch (fallbackError) {
    console.error('Alternatif yöntem de başarısız:', fallbackError);
    // Hata fırlatmak yerine boş liste döndür
    return [];
  }
}

