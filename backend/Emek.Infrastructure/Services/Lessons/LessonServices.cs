using Emek.Application.DTOs.Request.Lessons;
using Emek.Application.DTOs.Responses.Lessons;
using Emek.Application.DTOs.Responses.Students;
using Emek.Application.Interfaces.Lessons;
using Emek.Domain.Entities.Lessons;
using Emek.Domain.Entities.Personal;
using Emek.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Emek.Infrastructure.Services.Lessons
{
    public class LessonServices : ILessonServices
    {
        private readonly EmekDbContext _context;

        public LessonServices(EmekDbContext context)
        {
            _context = context;
        }

        public async Task<LessonResponseDTOs> CreateLessonAsync(CreateLessonDTO request)
        {
            // Grup kontrolü
            var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == request.GroupId)
                ?? throw new Exception($"ID'si '{request.GroupId}' olan grup bulunamadı.");

            // Gün ve saat validasyonu
            ValidateLessonSchedule(request.StartingDayOfWeek, request.StartingHour, request.EndingDayOfWeek, request.EndingHour);
            
            // Türkçe gün adlarını kontrol et
            ValidateTurkishDayOfWeek(request.StartingDayOfWeek);
            ValidateTurkishDayOfWeek(request.EndingDayOfWeek);

            // Kapasite kontrolü
            if (request.Capacity <= 0)
                throw new Exception("Kapasite 0'dan büyük olmalıdır.");

            var lesson = new Lesson
            {
                Id = Guid.NewGuid(),
                LessonName = request.LessonName,
                StartingDayOfWeek = request.StartingDayOfWeek,
                StartingHour = request.StartingHour,
                EndingDayOfWeek = request.EndingDayOfWeek,
                EndingHour = request.EndingHour,
                Capacity = request.Capacity,
                GroupId = request.GroupId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            return await MapToResponseAsync(lesson);
        }

        public async Task<LessonResponseDTOs> UpdateLessonAsync(UpdateLessonDTO request)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Group)
                .FirstOrDefaultAsync(l => l.Id == request.LessonId)
                ?? throw new Exception($"ID'si '{request.LessonId}' olan ders bulunamadı.");

            // Grup kontrolü
            var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == request.GroupId)
                ?? throw new Exception($"ID'si '{request.GroupId}' olan grup bulunamadı.");

            // Gün ve saat validasyonu
            ValidateLessonSchedule(request.StartingDayOfWeek, request.StartingHour, request.EndingDayOfWeek, request.EndingHour);
            
            // Türkçe gün adlarını kontrol et
            ValidateTurkishDayOfWeek(request.StartingDayOfWeek);
            ValidateTurkishDayOfWeek(request.EndingDayOfWeek);

            // Kapasite validasyonu
            if (request.Capacity <= 0)
                throw new Exception("Kapasite 0'dan büyük olmalıdır.");

            // Mevcut öğrenci sayısını kontrol et (sadece aktif öğrenciler)
            var currentStudentCount = await _context.LessonStudents
                .Include(ls => ls.Student)
                .Where(ls => ls.LessonId == lesson.Id && ls.IsActive && ls.Student.IsActive)
                .CountAsync();

            if (request.Capacity < currentStudentCount)
                throw new Exception($"Yeni kapasite ({request.Capacity}), mevcut öğrenci sayısından ({currentStudentCount}) küçük olamaz.");

            lesson.LessonName = request.LessonName;
            lesson.StartingDayOfWeek = request.StartingDayOfWeek;
            lesson.StartingHour = request.StartingHour;
            lesson.EndingDayOfWeek = request.EndingDayOfWeek;
            lesson.EndingHour = request.EndingHour;
            lesson.Capacity = request.Capacity;
            lesson.GroupId = request.GroupId;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await MapToResponseAsync(lesson);
        }

        public async Task<LessonResponseDTOs> UpdateLessonCapacityAsync(UpdateLessonCapacityDTO request)
        {
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.Id == request.LessonId)
                ?? throw new Exception($"ID'si '{request.LessonId}' olan ders bulunamadı.");

            // Kapasite validasyonu
            if (request.NewCapacity <= 0)
                throw new Exception("Kapasite 0'dan büyük olmalıdır.");

            // Mevcut öğrenci sayısını kontrol et (sadece aktif öğrenciler)
            var currentStudentCount = await _context.LessonStudents
                .Include(ls => ls.Student)
                .Where(ls => ls.LessonId == lesson.Id && ls.IsActive && ls.Student.IsActive)
                .CountAsync();

            if (request.NewCapacity < currentStudentCount)
                throw new Exception($"Yeni kapasite ({request.NewCapacity}), mevcut öğrenci sayısından ({currentStudentCount}) küçük olamaz.");

            lesson.Capacity = request.NewCapacity;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await MapToResponseAsync(lesson);
        }

        public async Task DeleteLessonAsync(DeleteLessonDTO request)
        {
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.Id == request.LessonId)
                ?? throw new Exception($"ID'si '{request.LessonId}' olan ders bulunamadı.");

            if (!lesson.IsActive)
                return; // Zaten pasif

            lesson.IsActive = false;
            lesson.DeletedAt = DateTime.UtcNow;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<LessonResponseDTOs> GetLessonByIdAsync(Guid lessonId)
        {
            var lesson = await _context.Lessons
                .AsNoTracking()
                .Where(l => l.IsActive)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson == null)
                throw new Exception($"ID'si '{lessonId}' olan ders bulunamadı.");

            return await MapToResponseAsync(lesson);
        }

        public async Task<IEnumerable<LessonResponseDTOs>> GetAllLessonsAsync()
        {
            var lessons = await _context.Lessons
                .AsNoTracking()
                .Where(l => l.IsActive)
                .ToListAsync();

            var result = new List<LessonResponseDTOs>();
            foreach (var lesson in lessons)
            {
                result.Add(await MapToResponseAsync(lesson));
            }

            return result;
        }

        public async Task<LessonCapacityAndStudentListDTO> GetLessonCapacityAndStudentListAsync(Guid lessonId)
        {
            var lesson = await _context.Lessons
                .AsNoTracking()
                .Where(l => l.IsActive)
                .FirstOrDefaultAsync(l => l.Id == lessonId)
                ?? throw new Exception($"ID'si '{lessonId}' olan ders bulunamadı.");

            var activeLessonStudents = await _context.LessonStudents
                .Include(ls => ls.Student)
                .Where(ls => ls.LessonId == lessonId && ls.IsActive && ls.Student.IsActive)
                .ToListAsync();

            return new LessonCapacityAndStudentListDTO
            {
                LessonId = lesson.Id,
                Capacity = lesson.Capacity,
                CurrentStudentCount = activeLessonStudents.Count,
                Students = activeLessonStudents.Select(ls => MapToStudentSelfInformation(ls.Student)).ToList()
            };
        }

        public async Task AssignStudentToLessonAsync(AssignStudentToLessonDTO request)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Group)
                .FirstOrDefaultAsync(l => l.Id == request.LessonId)
                ?? throw new Exception($"ID'si '{request.LessonId}' olan ders bulunamadı.");

            var student = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.Id == request.StudentId)
                ?? throw new Exception($"ID'si '{request.StudentId}' olan öğrenci bulunamadı.");

            // Öğrencinin bu dersin grubunda aktif olup olmadığını kontrol et
            var isStudentInGroup = await _context.GroupStudents
                .AnyAsync(gs => gs.GroupId == lesson.GroupId && gs.StudentId == student.Id && gs.IsActive);

            if (!isStudentInGroup)
                throw new Exception($"Öğrenci, bu dersin grubunda aktif değildir. Önce öğrenciyi gruba ekleyiniz.");

            // Öğrencinin zaten bu derste aktif olup olmadığını kontrol et
            var existingActive = await _context.LessonStudents
                .FirstOrDefaultAsync(ls => ls.LessonId == lesson.Id && ls.StudentId == student.Id && ls.IsActive);

            if (existingActive != null)
                throw new Exception("Öğrenci zaten bu derste aktif olarak kayıtlı.");

            // Kapasite kontrolü (sadece aktif öğrenciler)
            var currentStudentCount = await _context.LessonStudents
                .Include(ls => ls.Student)
                .Where(ls => ls.LessonId == lesson.Id && ls.IsActive && ls.Student.IsActive)
                .CountAsync();

            if (currentStudentCount >= lesson.Capacity)
                throw new Exception($"Ders kapasitesi dolu. Maksimum kapasite: {lesson.Capacity}");

            var lessonStudent = new LessonStudent
            {
                Id = Guid.NewGuid(),
                LessonId = lesson.Id,
                StudentId = student.Id,
                JoinedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.LessonStudents.Add(lessonStudent);
            await _context.SaveChangesAsync();
        }

        public async Task BulkAssignStudentsToLessonAsync(BulkAssignStudentsToLessonDTO request)
        {
            if (request.StudentIds == null || !request.StudentIds.Any())
                throw new Exception("Öğrenci listesi boş olamaz.");

            var lesson = await _context.Lessons
                .Include(l => l.Group)
                .FirstOrDefaultAsync(l => l.Id == request.LessonId)
                ?? throw new Exception($"ID'si '{request.LessonId}' olan ders bulunamadı.");

            // Mevcut öğrenci sayısını kontrol et (sadece aktif öğrenciler)
            var currentStudentCount = await _context.LessonStudents
                .Include(ls => ls.Student)
                .Where(ls => ls.LessonId == lesson.Id && ls.IsActive && ls.Student.IsActive)
                .CountAsync();

            if (currentStudentCount + request.StudentIds.Count > lesson.Capacity)
                throw new Exception($"Toplu atama sonrası öğrenci sayısı ({currentStudentCount + request.StudentIds.Count}) kapasiteyi ({lesson.Capacity}) aşacaktır.");

            // Öğrencilerin varlığını kontrol et
            var students = await _context.StudentPersonalInfos
                .Where(s => request.StudentIds.Contains(s.Id))
                .ToListAsync();

            if (students.Count != request.StudentIds.Count)
                throw new Exception("Bazı öğrenci ID'leri geçersiz.");

            // Her öğrencinin bu dersin grubunda aktif olup olmadığını kontrol et
            var studentsNotInGroup = new List<Guid>();
            foreach (var studentId in request.StudentIds)
            {
                var isStudentInGroup = await _context.GroupStudents
                    .AnyAsync(gs => gs.GroupId == lesson.GroupId && gs.StudentId == studentId && gs.IsActive);

                if (!isStudentInGroup)
                    studentsNotInGroup.Add(studentId);
            }

            if (studentsNotInGroup.Any())
                throw new Exception($"Şu öğrenciler bu dersin grubunda aktif değildir: {string.Join(", ", studentsNotInGroup)}");

            // Zaten kayıtlı öğrencileri filtrele
            var existingActiveStudents = await _context.LessonStudents
                .Where(ls => ls.LessonId == lesson.Id && ls.IsActive && request.StudentIds.Contains(ls.StudentId))
                .Select(ls => ls.StudentId)
                .ToListAsync();

            var newStudentIds = request.StudentIds.Except(existingActiveStudents).ToList();

            if (!newStudentIds.Any())
                throw new Exception("Tüm öğrenciler zaten bu derste kayıtlı.");

            // Yeni kayıtları oluştur
            var lessonStudents = newStudentIds.Select(studentId => new LessonStudent
            {
                Id = Guid.NewGuid(),
                LessonId = lesson.Id,
                StudentId = studentId,
                JoinedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }).ToList();

            _context.LessonStudents.AddRange(lessonStudents);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveStudentFromLessonAsync(RemoveStudentFromLessonDTO request)
        {
            var lessonStudent = await _context.LessonStudents
                .FirstOrDefaultAsync(ls => ls.LessonId == request.LessonId && ls.StudentId == request.StudentId && ls.IsActive)
                ?? throw new Exception("Bu derste bu öğrenciye ait aktif kayıt bulunamadı.");

            lessonStudent.IsActive = false;
            lessonStudent.LeftAt = DateTime.UtcNow;
            lessonStudent.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task BulkRemoveStudentsFromLessonAsync(BulkRemoveStudentsFromLessonDTO request)
        {
            if (request.StudentIds == null || !request.StudentIds.Any())
                throw new Exception("Öğrenci listesi boş olamaz.");

            var lessonStudents = await _context.LessonStudents
                .Where(ls => ls.LessonId == request.LessonId && ls.IsActive && request.StudentIds.Contains(ls.StudentId))
                .ToListAsync();

            if (!lessonStudents.Any())
                throw new Exception("Belirtilen öğrencilerden hiçbiri bu derste aktif kayıtlı değil.");

            foreach (var lessonStudent in lessonStudents)
            {
                lessonStudent.IsActive = false;
                lessonStudent.LeftAt = DateTime.UtcNow;
                lessonStudent.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<RegisteredStudentsFromLessonDTO> GetRegisteredStudentsFromLessonAsync(Guid lessonId)
        {
            var lesson = await _context.Lessons
                .AsNoTracking()
                .Where(l => l.IsActive)
                .FirstOrDefaultAsync(l => l.Id == lessonId)
                ?? throw new Exception($"ID'si '{lessonId}' olan ders bulunamadı.");

            var activeLessonStudents = await _context.LessonStudents
                .Include(ls => ls.Student)
                .Where(ls => ls.LessonId == lessonId && ls.IsActive && ls.Student.IsActive)
                .ToListAsync();

            return new RegisteredStudentsFromLessonDTO
            {
                LessonId = lesson.Id,
                StudentIds = activeLessonStudents.Select(ls => ls.StudentId).ToList(),
                Students = activeLessonStudents.Select(ls => MapToStudentSelfInformation(ls.Student)).ToList()
            };
        }

        public async Task<UnRegisteredStudentsFromLessonDTO> GetUnRegisteredStudentsFromLessonAsync(Guid lessonId)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Group)
                .AsNoTracking()
                .Where(l => l.IsActive)
                .FirstOrDefaultAsync(l => l.Id == lessonId)
                ?? throw new Exception($"ID'si '{lessonId}' olan ders bulunamadı.");

            // Dersin grubundaki aktif öğrencileri al (sadece aktif öğrenciler)
            var groupStudents = await _context.GroupStudents
                .Include(gs => gs.Student)
                .Where(gs => gs.GroupId == lesson.GroupId && gs.IsActive && gs.Student.IsActive)
                .Select(gs => gs.StudentId)
                .ToListAsync();

            // Derse kayıtlı aktif öğrencileri al
            var registeredStudentIds = await _context.LessonStudents
                .Where(ls => ls.LessonId == lessonId && ls.IsActive)
                .Select(ls => ls.StudentId)
                .ToListAsync();

            // Gruba kayıtlı ama derse kayıtlı olmayan öğrencileri bul
            var unRegisteredStudentIds = groupStudents.Except(registeredStudentIds).ToList();

            // Sadece aktif öğrencileri getir
            var unRegisteredStudents = await _context.StudentPersonalInfos
                .Where(s => unRegisteredStudentIds.Contains(s.Id) && s.IsActive)
                .ToListAsync();

            return new UnRegisteredStudentsFromLessonDTO
            {
                LessonId = lesson.Id,
                StudentIds = unRegisteredStudentIds,
                Students = unRegisteredStudents.Select(MapToStudentSelfInformation).ToList()
            };
        }

        private async Task<LessonResponseDTOs> MapToResponseAsync(Lesson lesson)
        {
            // Sadece aktif öğrencileri say
            var currentStudentCount = await _context.LessonStudents
                .Include(ls => ls.Student)
                .Where(ls => ls.LessonId == lesson.Id && ls.IsActive && ls.Student.IsActive)
                .CountAsync();

            return new LessonResponseDTOs
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
        }

        private void ValidateLessonSchedule(string startingDayOfWeek, TimeSpan startingHour, string endingDayOfWeek, TimeSpan endingHour)
        {
            var startingDayValue = GetDayOfWeekValue(startingDayOfWeek);
            var endingDayValue = GetDayOfWeekValue(endingDayOfWeek);

            // Aynı gün ise, başlangıç saati bitiş saatinden önce olmalı
            if (startingDayValue == endingDayValue)
            {
                if (startingHour >= endingHour)
                    throw new Exception("Başlangıç saati, bitiş saatinden önce olmalıdır.");
            }
            // Farklı günler ise, başlangıç günü bitiş gününden önce veya eşit olmalı (hafta içi sıralamasına göre)
            else
            {
                // Hafta içi sıralamasına göre kontrol (Pazar=0, Pazartesi=1, ..., Cumartesi=6)
                // Başlangıç günü bitiş gününden sonra geliyorsa hata (ör: Cuma=5, Pazartesi=1)
                if (startingDayValue > endingDayValue)
                {
                    throw new Exception("Başlangıç günü, bitiş gününden önce veya aynı olmalıdır.");
                }
            }
        }

        private void ValidateTurkishDayOfWeek(string dayOfWeek)
        {
            if (string.IsNullOrWhiteSpace(dayOfWeek))
                throw new Exception("Gün adı boş olamaz.");

            var validDays = new[] { "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar" };
            if (!validDays.Contains(dayOfWeek, StringComparer.OrdinalIgnoreCase))
            {
                throw new Exception($"Geçersiz gün adı: {dayOfWeek}. Geçerli değerler: {string.Join(", ", validDays)}");
            }
        }

        private int GetDayOfWeekValue(string turkishDay)
        {
            return turkishDay.ToLower() switch
            {
                "pazartesi" => 1,
                "salı" => 2,
                "çarşamba" => 3,
                "perşembe" => 4,
                "cuma" => 5,
                "cumartesi" => 6,
                "pazar" => 0,
                _ => throw new Exception($"Geçersiz gün adı: {turkishDay}")
            };
        }

        private StudentSelfInformationResponse MapToStudentSelfInformation(StudentPersonalInfo student)
        {
            return new StudentSelfInformationResponse
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
        }
    }
}
