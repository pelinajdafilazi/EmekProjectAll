using Emek.Application.DTOs.Request.Attendances;
using Emek.Application.DTOs.Responses.Attendances;
using Emek.Application.DTOs.Responses.Lessons;
using Emek.Application.DTOs.Responses.Students;
using Emek.Application.Interfaces.Attendances;
using Emek.Domain.Entities.Attendances;
using Emek.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Emek.Infrastructure.Services.Attendances
{
    public class AttendanceServices : IAttendanceServices
    {
        private readonly EmekDbContext _context;

        public AttendanceServices(EmekDbContext context)
        {
            _context = context;
        }

        public async Task<LessonStudentsWithAttendanceResponse> GetStudentsByLessonIdAsync(Guid lessonId, DateTime? attendanceDate = null)
        {
            // Ders kontrolü
            var lesson = await _context.Lessons
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lessonId)
                ?? throw new Exception($"ID'si '{lessonId}' olan ders bulunamadı.");

            // Derse kayıtlı aktif öğrencileri getir
            var lessonStudents = await _context.LessonStudents
                .Include(ls => ls.Student)
                .AsNoTracking()
                .Where(ls => ls.LessonId == lessonId && ls.IsActive)
                .ToListAsync();

            // Eğer attendanceDate verilmişse, o tarihe ait attendance bilgilerini getir
            Dictionary<Guid, Attendance> attendanceDict = null;
            if (attendanceDate.HasValue)
            {
                var attendances = await _context.Attendances
                    .AsNoTracking()
                    .Where(a => a.LessonId == lessonId 
                        && a.AttendanceDate.Date == attendanceDate.Value.Date
                        && a.IsActive)
                    .ToListAsync();
                
                attendanceDict = attendances.ToDictionary(a => a.StudentId);
            }

            // Öğrenci bilgilerini map et
            var studentsWithAttendance = lessonStudents.Select(ls => 
            {
                var studentResponse = new StudentWithAttendanceInfoResponse
                {
                    Id = ls.Student.Id,
                    FirstName = ls.Student.FirstName,
                    LastName = ls.Student.LastName,
                    DateOfBirth = ls.Student.DateOfBirth,
                    NationalId = ls.Student.NationalId,
                    SchoolName = ls.Student.SchoolName,
                    HomeAddress = ls.Student.HomeAddress,
                    Branch = ls.Student.Branch,
                    Class = ls.Student.Class,
                    PhoneNumber = ls.Student.PhoneNumber,
                    HasProfileImage = !string.IsNullOrEmpty(ls.Student.ProfileImageBase64),
                    ProfileImageContentType = ls.Student.ProfileImageContentType
                };

                // Eğer attendanceDate verilmişse ve o öğrenci için kayıt varsa, bilgileri doldur
                if (attendanceDate.HasValue && attendanceDict != null && attendanceDict.TryGetValue(ls.StudentId, out var attendance))
                {
                    studentResponse.IsPresent = attendance.IsPresent;
                    studentResponse.AttendanceDate = attendance.AttendanceDate;
                }
                else
                {
                    studentResponse.IsPresent = null;
                    studentResponse.AttendanceDate = null;
                }

                return studentResponse;
            }).ToList();

            return new LessonStudentsWithAttendanceResponse
            {
                LessonId = lessonId,
                Students = studentsWithAttendance
            };
        }

        public async Task BulkCreateAttendanceAsync(BulkCreateAttendanceDTO request)
        {
            // Ders kontrolü
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.Id == request.LessonId)
                ?? throw new Exception($"ID'si '{request.LessonId}' olan ders bulunamadı.");

            // Öğrenci kontrolü
            var studentIds = request.StudentAttendances.Select(sa => sa.StudentId).ToList();
            var students = await _context.StudentPersonalInfos
                .Where(s => studentIds.Contains(s.Id))
                .ToListAsync();

            if (students.Count != studentIds.Count)
                throw new Exception("Bazı öğrenci ID'leri geçersiz.");

            // Her öğrencinin bu derste kayıtlı olup olmadığını kontrol et
            var registeredStudentIds = await _context.LessonStudents
                .Where(ls => ls.LessonId == request.LessonId && ls.IsActive && studentIds.Contains(ls.StudentId))
                .Select(ls => ls.StudentId)
                .ToListAsync();

            var unregisteredStudents = studentIds.Except(registeredStudentIds).ToList();
            if (unregisteredStudents.Any())
                throw new Exception($"Şu öğrenciler bu derste kayıtlı değildir: {string.Join(", ", unregisteredStudents)}");

            // Mevcut attendance kayıtlarını kontrol et (aynı tarih, ders ve öğrenci için)
            var existingAttendances = await _context.Attendances
                .Where(a => a.LessonId == request.LessonId 
                    && a.AttendanceDate.Date == request.AttendanceDate.Date
                    && studentIds.Contains(a.StudentId)
                    && a.IsActive)
                .ToListAsync();

            var attendanceList = new List<Attendance>();

            foreach (var studentAttendance in request.StudentAttendances)
            {
                var existingAttendance = existingAttendances
                    .FirstOrDefault(a => a.StudentId == studentAttendance.StudentId);

                if (existingAttendance != null)
                {
                    // Mevcut kaydı güncelle
                    existingAttendance.IsPresent = studentAttendance.IsPresent;
                    existingAttendance.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Yeni kayıt oluştur
                    var newAttendance = new Attendance
                    {
                        Id = Guid.NewGuid(),
                        LessonId = request.LessonId,
                        StudentId = studentAttendance.StudentId,
                        AttendanceDate = request.AttendanceDate,
                        IsPresent = studentAttendance.IsPresent,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    attendanceList.Add(newAttendance);
                }
            }

            if (attendanceList.Any())
            {
                _context.Attendances.AddRange(attendanceList);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<StudentAttendanceHistoryWithLessonInfo> GetAttendanceByStudentAndLessonAsync(Guid studentId, Guid lessonId)
        {
            // Öğrenci kontrolü
            var student = await _context.StudentPersonalInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == studentId)
                ?? throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            // Ders kontrolü
            var lesson = await _context.Lessons
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == lessonId)
                ?? throw new Exception($"ID'si '{lessonId}' olan ders bulunamadı.");

            // Öğrencinin bu derste kayıtlı olup olmadığını kontrol et
            var isRegistered = await _context.LessonStudents
                .AnyAsync(ls => ls.LessonId == lessonId && ls.StudentId == studentId && ls.IsActive);

            if (!isRegistered)
                throw new Exception($"Öğrenci bu derste kayıtlı değil.");

            // Tüm attendance kayıtlarını getir (tarihe göre sıralı)
            var attendances = await _context.Attendances
                .AsNoTracking()
                .Where(a => a.StudentId == studentId 
                    && a.LessonId == lessonId 
                    && a.IsActive)
                .OrderBy(a => a.AttendanceDate)
                .ToListAsync();

            // Ders bilgilerini map et
            var currentStudentCount = await _context.LessonStudents
                .CountAsync(ls => ls.LessonId == lessonId && ls.IsActive);

            var lessonResponse = new LessonResponseDTOs
            {
                Id = lesson.Id,
                LessonName = lesson.LessonName,
                StartingDayOfWeek = lesson.StartingDayOfWeek,
                StartingHour = lesson.StartingHour,
                EndingDayOfWeek = lesson.EndingDayOfWeek,
                EndingHour = lesson.EndingHour,
                Capacity = lesson.Capacity,
                CurrentStudentCount = currentStudentCount
            };

            // Öğrenci bilgilerini map et
            var studentResponse = new StudentSelfInformationResponse
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                DateOfBirth = student.DateOfBirth,
                NationalId = student.NationalId,
                SchoolName = student.SchoolName,
                HomeAddress = student.HomeAddress,
                Branch = student.Branch,
                Class = student.Class,
                PhoneNumber = student.PhoneNumber,
                HasProfileImage = !string.IsNullOrEmpty(student.ProfileImageBase64),
                ProfileImageContentType = student.ProfileImageContentType
            };

            // Attendance kayıtlarını map et
            var attendanceList = attendances.Select(a => new AttendanceSimpleResponse
            {
                AttendanceDate = a.AttendanceDate,
                IsPresent = a.IsPresent
            }).ToList();

            var response = new StudentAttendanceHistoryWithLessonInfo
            {
                Student = studentResponse,
                Lesson = lessonResponse,
                Attendances = attendanceList
            };

            return response;
        }

        public async Task<int> GetStudentAllAttendancePercetange(Guid studentId, Guid lessonId)
        {
            // Öğrenci kontrolü
            var student = await _context.StudentPersonalInfos
                .AsNoTracking()
                .AnyAsync(s => s.Id == studentId);

            if (!student)
                throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            // Ders kontrolü
            var lesson = await _context.Lessons
                .AsNoTracking()
                .AnyAsync(l => l.Id == lessonId);

            if (!lesson)
                throw new Exception($"ID'si '{lessonId}' olan ders bulunamadı.");

            // Öğrencinin bu derste kayıtlı olup olmadığını kontrol et
            var isRegistered = await _context.LessonStudents
                .AnyAsync(ls => ls.LessonId == lessonId && ls.StudentId == studentId && ls.IsActive);

            if (!isRegistered)
                throw new Exception($"Öğrenci bu derste kayıtlı değildir.");

            // Tüm aktif attendance kayıtlarını getir
            var allAttendances = await _context.Attendances
                .AsNoTracking()
                .Where(a => a.StudentId == studentId 
                    && a.LessonId == lessonId 
                    && a.IsActive)
                .ToListAsync();

            // Eğer hiç attendance kaydı yoksa, 0 döndür
            if (allAttendances.Count == 0)
                return 0;

            // Present olan kayıt sayısını hesapla
            var presentCount = allAttendances.Count(a => a.IsPresent);

            // Yüzde hesapla ve yuvarla
            var percentage = (int)Math.Round((double)presentCount / allAttendances.Count * 100);

            return percentage;
        }
    }
}
