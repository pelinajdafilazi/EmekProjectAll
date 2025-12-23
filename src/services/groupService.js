import { apiClient, ApiError } from './api';
import { transformBackendToStudent } from './studentService';

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
 * Öğrencinin mevcut grubunu bul
 * @param {string|number} studentId - Öğrenci ID'si
 * @returns {Promise<string|number|null>} Grup ID'si veya null
 */
export async function findStudentGroup(studentId) {
  try {
    // Tüm grupları çek
    const groups = await getGroups();
    
    // Her grup için öğrencileri kontrol et
    for (const group of groups) {
      try {
        const students = await getGroupStudents(group.id);
        const studentInGroup = students.find(s => s.id === studentId || s.studentId === studentId);
        if (studentInGroup) {
          return group.id;
        }
      } catch (error) {
        // Bir grupta hata olursa diğerlerini kontrol etmeye devam et
        console.warn(`Grup ${group.id} öğrencileri kontrol edilirken hata:`, error);
        continue;
      }
    }
    
    return null; // Öğrenci hiçbir grupta bulunamadı
  } catch (error) {
    console.error('Öğrencinin grubunu bulurken hata:', error);
    return null;
  }
}

/**
 * Gruba öğrenci ata (eğer öğrenci başka bir grupta varsa önce eski gruptan çıkar)
 * @param {string|number} groupId - Grup ID'si
 * @param {string|number} studentId - Öğrenci ID'si
 * @returns {Promise<void>}
 */
export async function assignStudentToGroup(groupId, studentId) {
  try {
    // Öğrencinin mevcut grubunu bul
    const currentGroupId = await findStudentGroup(studentId);
    
    // Eğer öğrenci başka bir grupta varsa ve yeni grup farklıysa, eski gruptan çıkar
    if (currentGroupId && currentGroupId !== groupId) {
      console.log(`Öğrenci ${studentId} şu anda ${currentGroupId} grubunda, yeni grup ${groupId}. Eski gruptan çıkarılıyor...`);
      try {
        await removeStudentFromGroup(currentGroupId, studentId);
        console.log(`Öğrenci ${studentId} başarıyla ${currentGroupId} grubundan çıkarıldı`);
      } catch (removeError) {
        console.error('Eski gruptan çıkarırken hata:', removeError);
        // Eski gruptan çıkarma hatası olsa bile yeni gruba atamaya devam et
      }
    }
    
    // Yeni gruba ata
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
 * Tüm gruplardaki tüm öğrenci atamalarını temizle
 * @returns {Promise<{success: number, failed: number, errors: Array}>}
 */
export async function clearAllStudentAssignments() {
  let successCount = 0;
  let failedCount = 0;
  const errors = [];
  
  try {
    // Tüm grupları çek
    const groups = await getGroups();
    console.log(`Toplam ${groups.length} grup bulundu`);
    
    // Her grup için öğrencileri çek ve çıkar
    for (const group of groups) {
      try {
        const students = await getGroupStudents(group.id);
        console.log(`Grup ${group.name} (${group.id}): ${students.length} öğrenci bulundu`);
        
        // Her öğrenciyi gruptan çıkar
        for (const student of students) {
          try {
            await removeStudentFromGroup(group.id, student.id);
            successCount++;
            console.log(`✓ Öğrenci ${student.name || student.id} ${group.name} grubundan çıkarıldı`);
          } catch (error) {
            failedCount++;
            const errorMsg = `Öğrenci ${student.name || student.id} ${group.name} grubundan çıkarılamadı: ${error.message}`;
            errors.push(errorMsg);
            console.error(`✗ ${errorMsg}`);
          }
        }
      } catch (error) {
        console.error(`Grup ${group.name} öğrencileri alınırken hata:`, error);
        errors.push(`Grup ${group.name} öğrencileri alınamadı: ${error.message}`);
      }
    }
    
    console.log(`Temizleme tamamlandı. Başarılı: ${successCount}, Başarısız: ${failedCount}`);
    return { success: successCount, failed: failedCount, errors };
  } catch (error) {
    console.error('Temizleme işlemi sırasında genel hata:', error);
    throw new ApiError(
      error.response?.data?.message || error.message || 'Temizleme işlemi sırasında bir hata oluştu',
      false
    );
  }
}

/**
 * Grubun öğrencilerini getir
 * @param {string|number} groupId - Grup ID'si
 * @returns {Promise<Array>} Öğrenci listesi (frontend formatında)
 */
export async function getGroupStudents(groupId) {
  try {
    const response = await apiClient.get(`/Groups/${groupId}/students`);
    // Debug: Backend'den gelen veriyi kontrol et
    console.log('Backend response (group students):', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Is array?', Array.isArray(response.data));
    
    // Backend'den gelen veri formatını kontrol et
    let studentsArray = [];
    
    if (Array.isArray(response.data)) {
      // Direkt array ise
      studentsArray = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Eğer obje içinde array varsa
      if (Array.isArray(response.data.data)) {
        studentsArray = response.data.data;
      } else if (Array.isArray(response.data.students)) {
        studentsArray = response.data.students;
      } else if (Array.isArray(response.data.content)) {
        studentsArray = response.data.content;
      } else {
        // Tek bir öğrenci objesi olabilir
        studentsArray = [response.data];
      }
    }
    
    console.log('Students array:', studentsArray);
    if (studentsArray.length > 0) {
      console.log('First student from backend:', studentsArray[0]);
      console.log('First student keys:', Object.keys(studentsArray[0]));
    }
    
    // Backend'den gelen öğrenci listesini frontend formatına dönüştür
    if (studentsArray.length > 0) {
      const transformed = studentsArray.map((student, index) => {
        try {
          console.log(`Transforming student ${index}:`, student);
          const transformedStudent = transformBackendToStudent(student);
          console.log(`Transformed student ${index}:`, transformedStudent);
          console.log(`Student ${index} name:`, transformedStudent.name);
          
          // Eğer transform edilmiş öğrencide isim yoksa, ham veriden tekrar dene
          if (!transformedStudent.name || transformedStudent.name === 'İsimsiz Öğrenci') {
            console.warn(`Student ${index} has no name after transform, trying raw data:`, student);
            const rawName = student.name || 
                           (student.firstName && student.lastName ? `${student.firstName} ${student.lastName}`.trim() : '') ||
                           (student.studentFirstName && student.studentLastName ? `${student.studentFirstName} ${student.studentLastName}`.trim() : '') ||
                           student.fullName ||
                           (student.student?.name) ||
                           (student.student?.firstName && student.student?.lastName ? `${student.student.firstName} ${student.student.lastName}`.trim() : '');
            if (rawName) {
              transformedStudent.name = rawName;
              console.log(`Fixed student ${index} name:`, rawName);
            }
          }
          
          return transformedStudent;
        } catch (transformError) {
          console.error('Transform error for student:', student, transformError);
          // Transform hatası olsa bile öğrenciyi döndür (fallback)
          const fallbackName = student.name || 
                              (student.firstName && student.lastName ? `${student.firstName} ${student.lastName}`.trim() : '') ||
                              (student.studentFirstName && student.studentLastName ? `${student.studentFirstName} ${student.studentLastName}`.trim() : '') ||
                              student.fullName ||
                              (student.student?.name) ||
                              (student.student?.firstName && student.student?.lastName ? `${student.student.firstName} ${student.student.lastName}`.trim() : '') ||
                              'İsimsiz Öğrenci';
          return {
            id: student.id || student.studentId || student.student?.id || Math.random(),
            name: fallbackName,
            age: student.age || '-',
            team: student.branch || student.team || student.student?.branch || '-',
            birthDate: student.birthDate || student.dateOfBirth || student.student?.dateOfBirth || '-',
            attendance: student.attendance || 0,
            photo: student.photo || student.photoUrl || student.student?.photo || '/avatars/student-1.svg',
            position: student.branch || student.position || student.student?.branch || '-',
            jerseyNumber: student.jerseyNumber || null,
            hasGroup: true
          };
        }
      });
      console.log('Final transformed students:', transformed);
      return transformed;
    }
    
    console.warn('No students found in response');
    return [];
  } catch (error) {
    console.error('Error fetching group students:', error);
    console.error('Error response:', error.response?.data);
    throw new ApiError(
      error.response?.data?.message || error.message || 'Öğrenci listesi yüklenirken bir hata oluştu',
      false
    );
  }
}

/**
 * Grupsuz öğrencileri getir
 * @returns {Promise<Array>} Grupsuz öğrenci listesi (frontend formatında)
 */
export async function getStudentsWithoutGroups() {
  try {
    // Önce backend endpoint'ini dene
    let studentsArray = [];
    let useFallback = false;
    
    try {
      const response = await apiClient.get('/Groups/students-without-groups');
      console.log('Backend response (students-without-groups):', response.data);
      
      // Backend'den gelen veri formatını kontrol et
      if (Array.isArray(response.data)) {
        studentsArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.data)) {
          studentsArray = response.data.data;
        } else if (Array.isArray(response.data.students)) {
          studentsArray = response.data.students;
        } else if (Array.isArray(response.data.content)) {
          studentsArray = response.data.content;
        } else if (response.data.id || response.data.studentId) {
          studentsArray = [response.data];
        }
      }
      
      // Eğer veri geldiyse transform et ve kalite kontrolü yap
      if (studentsArray.length > 0) {
        const transformed = studentsArray.map(student => transformBackendToStudent(student));
        
        // Transform edilmiş öğrencilerde eksik bilgi kontrolü yap
        // Eğer çoğu öğrencide eksik bilgi varsa (isim, yaş, doğum tarihi, branş), alternatif yönteme geç
        const studentsWithCompleteData = transformed.filter(s => 
          s.name && 
          s.name !== 'İsimsiz Öğrenci' && 
          s.name.trim() !== '' &&
          (s.age !== '-' || s.birthDate !== '-') &&
          (s.team !== '-' || s.branch !== '-')
        );
        
        // Eğer transform edilmiş öğrencilerin %50'sinden azında tam bilgi varsa, alternatif yöntemi kullan
        if (studentsWithCompleteData.length < transformed.length * 0.5) {
          console.log('Backend endpoint\'inden gelen veriler eksik, alternatif yöntem kullanılıyor...');
          useFallback = true;
        } else {
          // Backend'den gelen verileri de gruplarda olanları çıkararak filtrele
          const filteredStudents = await filterOutStudentsInGroups(transformed);
          return filteredStudents;
        }
      } else {
        // Veri gelmediyse alternatif yöntemi kullan
        useFallback = true;
      }
    } catch (endpointError) {
      console.warn('Grupsuz öğrenciler endpoint\'i hata verdi, alternatif yöntem kullanılıyor...', endpointError);
      useFallback = true;
    }
    
    // Alternatif yöntem: Tüm öğrencileri çekip grupsuz olanları filtrele
    if (useFallback) {
      return await getStudentsWithoutGroupsFallback();
    }
    
    return [];
  } catch (error) {
    console.error('Grupsuz öğrenciler alınırken hata:', error);
    // Hata durumunda da alternatif yöntemi dene
    try {
      return await getStudentsWithoutGroupsFallback();
    } catch (fallbackError) {
      throw new ApiError(
        error.response?.data?.message || error.message || 'Grupsuz öğrenciler yüklenirken bir hata oluştu',
        false
      );
    }
  }
}

/**
 * Gruplarda olan öğrencileri listeden çıkar
 * @param {Array} students - Filtrelenecek öğrenci listesi
 * @returns {Promise<Array>} Gruplarda olmayan öğrenci listesi
 */
async function filterOutStudentsInGroups(students) {
  try {
    // Tüm grupları çek
    const groups = await getGroups();
    
    // Gruplarda olan tüm öğrenci ID'lerini topla
    const studentsInGroupsSet = new Set();
    
    for (const group of groups) {
      try {
        const groupStudents = await getGroupStudents(group.id);
        groupStudents.forEach(student => {
          // Öğrenci ID'sini Set'e ekle (hem id hem de nationalId'yi kontrol et)
          if (student.id) {
            studentsInGroupsSet.add(String(student.id));
          }
          if (student.profile?.tc && student.profile.tc !== '-') {
            studentsInGroupsSet.add(String(student.profile.tc));
          }
          // Backend data'dan da kontrol et
          if (student._backendData?.id) {
            studentsInGroupsSet.add(String(student._backendData.id));
          }
          if (student._backendData?.nationalId) {
            studentsInGroupsSet.add(String(student._backendData.nationalId));
          }
        });
      } catch (groupError) {
        console.warn(`Grup ${group.id} öğrencileri alınırken hata:`, groupError);
        // Bir grupta hata olsa bile diğerlerini kontrol etmeye devam et
      }
    }
    
    // Gruplarda olmayan öğrencileri filtrele
    const filteredStudents = students.filter(student => {
      // Öğrencinin ID'si veya nationalId'si gruplarda varsa false döndür
      const studentId = String(student.id || '');
      const studentNationalId = String(student.profile?.tc || student._backendData?.nationalId || '');
      
      const isInGroup = studentsInGroupsSet.has(studentId) || 
                       (studentNationalId !== '' && studentsInGroupsSet.has(studentNationalId)) ||
                       student.hasGroup === true;
      
      return !isInGroup;
    });
    
    console.log(`Backend endpoint verilerinden ${filteredStudents.length} grupsuz öğrenci filtrelendi (toplam ${students.length} öğrenciden)`);
    return filteredStudents;
  } catch (error) {
    console.error('Öğrencileri filtrelerken hata:', error);
    // Hata durumunda orijinal listeyi döndür (güvenli fallback)
    return students;
  }
}

/**
 * Alternatif yöntem: Tüm öğrencileri çekip, gruplarda olanları çıkararak grupsuz olanları filtrele
 * Bu yöntem daha güvenilir çünkü gerçek grup atamalarını kontrol eder
 */
async function getStudentsWithoutGroupsFallback() {
  try {
    const { StudentService } = await import('./studentService');
    
    // 1. Tüm öğrencileri çek
    const allStudents = await StudentService.getAllStudents();
    console.log(`Toplam ${allStudents.length} öğrenci bulundu`);
    
    // 2. Tüm grupları çek
    const groups = await getGroups();
    console.log(`Toplam ${groups.length} grup bulundu`);
    
    // 3. Gruplarda olan tüm öğrenci ID'lerini topla
    const studentsInGroupsSet = new Set();
    
    for (const group of groups) {
      try {
        const groupStudents = await getGroupStudents(group.id);
        groupStudents.forEach(student => {
          // Öğrenci ID'sini Set'e ekle (hem id hem de nationalId'yi kontrol et)
          if (student.id) {
            studentsInGroupsSet.add(String(student.id));
          }
          if (student.profile?.tc && student.profile.tc !== '-') {
            studentsInGroupsSet.add(String(student.profile.tc));
          }
          // Backend data'dan da kontrol et
          if (student._backendData?.id) {
            studentsInGroupsSet.add(String(student._backendData.id));
          }
          if (student._backendData?.nationalId) {
            studentsInGroupsSet.add(String(student._backendData.nationalId));
          }
        });
        console.log(`Grup ${group.name}: ${groupStudents.length} öğrenci`);
      } catch (groupError) {
        console.warn(`Grup ${group.id} öğrencileri alınırken hata:`, groupError);
        // Bir grupta hata olsa bile diğerlerini kontrol etmeye devam et
      }
    }
    
    console.log(`Toplam ${studentsInGroupsSet.size} farklı öğrenci ID'si gruplarda bulundu`);
    
    // 4. Gruplarda olmayan öğrencileri filtrele
    const unassignedStudents = allStudents.filter(student => {
      // Öğrencinin ID'si veya nationalId'si gruplarda varsa false döndür
      const studentId = String(student.id || '');
      const studentNationalId = String(student.profile?.tc || student._backendData?.nationalId || '');
      
      const isInGroup = studentsInGroupsSet.has(studentId) || 
                       (studentNationalId !== '' && studentsInGroupsSet.has(studentNationalId)) ||
                       student.hasGroup === true;
      
      return !isInGroup;
    });
    
    console.log(`Alternatif yöntem: ${unassignedStudents.length} grupsuz öğrenci bulundu`);
    return unassignedStudents;
  } catch (error) {
    console.error('Alternatif yöntem de başarısız oldu:', error);
    throw error;
  }
}

/**
 * Tüm öğrencileri getir (gruplu ve grupsuz)
 * @returns {Promise<Array>} Tüm öğrenci listesi (frontend formatında)
 */
export async function getAllStudents() {
  try {
    const response = await apiClient.get('/Groups/students-with-groups');
    // Backend'den gelen öğrenci listesini frontend formatına dönüştür
    if (Array.isArray(response.data)) {
      return response.data.map(student => transformBackendToStudent(student));
    }
    return [];
  } catch (error) {
    throw new ApiError(
      error.response?.data?.message || 'Öğrenciler yüklenirken bir hata oluştu',
      false
    );
  }
}

