using Emek.Application.DTOs.Request.Attendances;
using Emek.Application.DTOs.Responses.Attendances;
using System;
using System.Threading.Tasks;

namespace Emek.Application.Interfaces.Attendances
{
    public interface IAttendanceServices
    {
        // Ders ID ile kayıtlı öğrencilerin ve attendance bilgilerinin listesini getir
        Task<LessonStudentsWithAttendanceResponse> GetStudentsByLessonIdAsync(Guid lessonId, DateTime? attendanceDate = null);
        
        // Öğrenci ID + Present bilgilerini bulk olarak ata
        Task BulkCreateAttendanceAsync(BulkCreateAttendanceDTO request);

        // ÖğrenciId + LessonId ile öğrenci bilgisi + tüm attendance bilgileri + ders bilgisi getir
        Task<StudentAttendanceHistoryWithLessonInfo> GetAttendanceByStudentAndLessonAsync(Guid studentId, Guid lessonId);
        Task<int> GetStudentAllAttendancePercetange(Guid studentId, Guid lessonId);

    }
}
