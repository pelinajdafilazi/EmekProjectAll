using Emek.Application.DTOs.Request.Lessons;
using Emek.Application.DTOs.Responses.Lessons;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Emek.Application.Interfaces.Lessons
{
    public interface ILessonServices
    {
        // Ders CRUD işlemleri
        Task<LessonResponseDTOs> CreateLessonAsync(CreateLessonDTO request); // ders oluştur(grup bilgisini oluştururken ald. için ek fonksiyona gerek yok)
        Task<LessonResponseDTOs> UpdateLessonAsync(UpdateLessonDTO request); // ders bilgilerini güncelle (bağlı grupta da güncelleme yapar)
        Task<LessonResponseDTOs> UpdateLessonCapacityAsync(UpdateLessonCapacityDTO request); // sadece ders kapasitesini güncelle
        Task DeleteLessonAsync(DeleteLessonDTO request); // ders sil

        // Ders sorgulama işlemleri
        Task<LessonResponseDTOs> GetLessonByIdAsync(Guid lessonId); // idye göre ders getir
        Task<IEnumerable<LessonResponseDTOs>> GetAllLessonsAsync(); // bütün dersleri getir
        Task<LessonCapacityAndStudentListDTO> GetLessonCapacityAndStudentListAsync(Guid lessonId); // ders kapasitesi ve öğrenci listesi

        // Öğrenci atama/çıkarma işlemleri
        Task AssignStudentToLessonAsync(AssignStudentToLessonDTO request); // derse öğrenci ata
        Task BulkAssignStudentsToLessonAsync(BulkAssignStudentsToLessonDTO request); // derse birden fazla öğrenci ata
        Task RemoveStudentFromLessonAsync(RemoveStudentFromLessonDTO request); // dersten öğrenci çıkar
        Task BulkRemoveStudentsFromLessonAsync(BulkRemoveStudentsFromLessonDTO request); // dersten birden fazla öğrenci çıkar

        // Öğrenci listesi sorgulama işlemleri
        Task<RegisteredStudentsFromLessonDTO> GetRegisteredStudentsFromLessonAsync(Guid lessonId); // derse kayıtlı öğrencileri getir
        Task<UnRegisteredStudentsFromLessonDTO> GetUnRegisteredStudentsFromLessonAsync(Guid lessonId); // derse kayıtlı olmayan öğrencileri getir
    }
}
