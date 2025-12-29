using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Groups;
using Emek.Application.DTOs.Responses.Groups;
using Emek.Application.Interfaces.Groups;
using Emek.Domain.Entities.Groups;
using Emek.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Emek.Infrastructure.Services.Groups
{
    public class GroupServices : IGroupServices
    {
        private readonly EmekDbContext _context;

        public GroupServices(EmekDbContext context)
        {
            _context = context;
        }

        public async Task<GroupResponse> CreateGroupAsync(CreateGroupRequest request)
        {
            ValidateAgeRange(request.MinAge, request.MaxAge);

            var group = new Group
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                MinAge = request.MinAge,
                MaxAge = request.MaxAge,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            return MapToResponse(group);
        }

        public async Task<GroupResponse> UpdateGroupAsync(Guid groupId, UpdateGroupRequest request)
        {
            ValidateAgeRange(request.MinAge, request.MaxAge);

            var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == groupId)
                ?? throw new Exception($"ID'si '{groupId}' olan grup bulunamadı.");

            // Gruptaki aktif öğrencileri kontrol et
            var activeStudents = await _context.GroupStudents
                .Include(gs => gs.Student)
                .Where(gs => gs.GroupId == groupId && gs.IsActive)
                .ToListAsync();

            if (activeStudents.Any())
            {
                var today = DateTime.UtcNow.Date;
                var incompatibleStudents = new List<string>();

                foreach (var groupStudent in activeStudents)
                {
                    var age = CalculateAge(groupStudent.Student.DateOfBirth, today);
                    if (age < request.MinAge || age > request.MaxAge)
                    {
                        incompatibleStudents.Add($"{groupStudent.Student.FirstName} {groupStudent.Student.LastName} (Yaş: {age})");
                    }
                }

                if (incompatibleStudents.Any())
                {
                    var studentList = string.Join(", ", incompatibleStudents);
                    throw new Exception($"Grupta yeni yaş aralığına ({request.MinAge}-{request.MaxAge}) uygun olmayan öğrenciler bulunmaktadır: {studentList}.");
                }
            }

            group.Name = request.Name;
            group.MinAge = request.MinAge;
            group.MaxAge = request.MaxAge;
            group.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToResponse(group);
        }

        public async Task<IEnumerable<GroupResponse>> GetAllGroupsAsync()
        {
            var groups = await _context.Groups
                .AsNoTracking()
                .Where(g => g.IsActive==true)
                .ToListAsync();

            return groups.Select(MapToResponse);
        }

        public async Task<GroupResponse> GetGroupByIdAsync(Guid id)
        {
            var group = await _context.Groups
                .AsNoTracking()
                .Where(group => group.IsActive == true)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
                throw new Exception($"ID'si '{id}' olan grup bulunamadı.");

            return MapToResponse(group);
        }

        public async Task AddStudentToGroupAsync(AddStudentToGroupRequest request)
        {
            var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == request.GroupId)
                ?? throw new Exception($"ID'si '{request.GroupId}' olan grup bulunamadı.");

            var student = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.Id == request.StudentId);

            if (student == null)
                throw new Exception($"ID'si '{request.StudentId}' olan öğrenci bulunamadı.");

            var age = CalculateAge(student.DateOfBirth, DateTime.UtcNow.Date);
            if (age < group.MinAge || age > group.MaxAge)
                throw new Exception($"Öğrencinin yaşı ({age}) bu grubun yaş aralığına ({group.MinAge}-{group.MaxAge}) uygun değildir.");

            var existingActive = await _context.GroupStudents
                .FirstOrDefaultAsync(gs => gs.GroupId == group.Id && gs.StudentId == student.Id && gs.IsActive);

            if (existingActive != null)
                throw new Exception("Öğrenci zaten bu grupta aktif olarak kayıtlı.");

            var groupStudent = new GroupStudent
            {
                Id = Guid.NewGuid(),
                GroupId = group.Id,
                StudentId = student.Id,
                IsActive = true,
                JoinedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.GroupStudents.Add(groupStudent);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<GroupStudentResponse>> GetActiveStudentsInGroupAsync(Guid groupId)
        {
            var list = await _context.GroupStudents
                .Include(gs => gs.Student)
                .Where(gs => gs.GroupId == groupId && gs.IsActive)
                .ToListAsync();

            return list.Select(MapToStudentResponse);
        }

        public async Task RemoveStudentFromGroupAsync(Guid groupId, Guid studentId)
        {
            var gs = await _context.GroupStudents
                .FirstOrDefaultAsync(x => x.GroupId == groupId && x.StudentId == studentId && x.IsActive);

            if (gs == null)
                throw new Exception("Bu grupta bu öğrenciye ait aktif kayıt bulunamadı.");

            gs.IsActive = false;
            gs.LeftAt = DateTime.UtcNow;
            gs.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<GroupStudentResponse>> GetRemovedStudentsInGroupAsync(Guid groupId)
        {
            // Tüm pasif kayıtları al
            var removedRecords = await _context.GroupStudents
                .Include(gs => gs.Student)
                .Where(gs => gs.GroupId == groupId && !gs.IsActive)
                .ToListAsync();

            // Her öğrenci için, aynı grupta aktif kaydı var mı kontrol et
            // Eğer aktif kaydı varsa, o öğrenciyi listeden çıkar (tekrar eklenmiş demektir)
            var studentIdsWithActiveRecords = await _context.GroupStudents
                .Where(gs => gs.GroupId == groupId && gs.IsActive)
                .Select(gs => gs.StudentId)
                .Distinct()
                .ToListAsync();

            // Sadece aktif kaydı olmayan (yani gerçekten çıkarılmış ve tekrar eklenmemiş) öğrencileri filtrele
            var trulyRemoved = removedRecords
                .Where(gs => !studentIdsWithActiveRecords.Contains(gs.StudentId))
                .ToList();

            // Her öğrenci için en son pasif kaydı al (LeftAt veya CreatedAt'e göre en son olan)
            var latestRemovedByStudent = trulyRemoved
                .GroupBy(gs => gs.StudentId)
                .Select(group => group
                    .OrderByDescending(gs => gs.LeftAt ?? gs.CreatedAt)
                    .First())
                .ToList();

            return latestRemovedByStudent.Select(MapToStudentResponse);
        }

        private static int CalculateAge(DateTime dateOfBirth, DateTime today)
        {
            var age = today.Year - dateOfBirth.Year;
            if (dateOfBirth.Date > today.AddYears(-age)) age--;
            return age;
        }

        private static void ValidateAgeRange(int minAge, int maxAge)
        {
            if (minAge < 0 || maxAge < 0)
                throw new Exception("Yaş aralığı negatif olamaz.");
            if (minAge > maxAge)
                throw new Exception("Min yaş, max yaştan büyük olamaz.");
        }

        private static GroupResponse MapToResponse(Group group)
        {
            return new GroupResponse
            {
                Id = group.Id,
                Name = group.Name,
                MinAge = group.MinAge,
                MaxAge = group.MaxAge
            };
        }

        public async Task<IEnumerable<StudentWithGroupInfoResponse>> GetAllStudentsWithGroupInfoAsync()
        {
            // Tüm öğrencileri al (GetAllAsync ile aynı mantık)
            var students = await _context.StudentPersonalInfos
                .ToListAsync();

            // Tüm aktif grup-öğrenci ilişkilerini al
            var activeGroupStudents = await _context.GroupStudents
                .Include(gs => gs.Group)
                .Include(gs => gs.Student)
                .Where(gs => gs.IsActive)
                .ToListAsync();

            // Öğrenci ID'ye göre grup bilgilerini grupla
            var groupsByStudentId = activeGroupStudents
                .GroupBy(gs => gs.StudentId)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Her öğrenci için response oluştur
            var result = students.Select(student =>
            {
                var age = CalculateAge(student.DateOfBirth, DateTime.UtcNow.Date);
                var formattedDateOfBirth = student.DateOfBirth.ToString("dd-MM-yyyy");

                var response = new StudentWithGroupInfoResponse
                {
                    StudentId = student.Id,
                    StudentFirstName = student.FirstName,
                    StudentLastName = student.LastName,
                    DateOfBirth = formattedDateOfBirth,
                    Age = age,
                    HasDebt = student.HasDebt
                };

                // Bu öğrencinin aktif grup kayıtlarını ekle (sadece grup ismi - tek grup)
                if (groupsByStudentId.TryGetValue(student.Id, out var groupStudents) && groupStudents.Any())
                {
                    response.Group = groupStudents.First().Group.Name;
                }
                else
                {
                    response.Group = "Bu öğrencinin kayıtlı bir grubu bulunmamaktadır.";
                }

                return response;
            }).ToList();

            return result;
        }

        public async Task<IEnumerable<StudentWithGroupInfoResponse>> GetStudentsWithoutGroupsAsync()
        {
            // Tüm öğrencileri al
            var students = await _context.StudentPersonalInfos
                .ToListAsync();

            // Tüm aktif grup-öğrenci ilişkilerini al
            var activeGroupStudents = await _context.GroupStudents
                .Where(gs => gs.IsActive)
                .Select(gs => gs.StudentId)
                .Distinct()
                .ToListAsync();

            // Grupsuz öğrencileri filtrele
            var studentsWithoutGroups = students
                .Where(s => !activeGroupStudents.Contains(s.Id))
                .Select(student =>
                {
                    var age = CalculateAge(student.DateOfBirth, DateTime.UtcNow.Date);
                    var formattedDateOfBirth = student.DateOfBirth.ToString("dd-MM-yyyy");

                    return new StudentWithGroupInfoResponse
                    {
                        StudentId = student.Id,
                        StudentFirstName = student.FirstName,
                        StudentLastName = student.LastName,
                        DateOfBirth = formattedDateOfBirth,
                        Age = age,
                        HasDebt = student.HasDebt,
                        Group = "Bu öğrencinin kayıtlı bir grubu bulunmamaktadır."
                    };
                })
                .ToList();

            return studentsWithoutGroups;
        }

        public async Task DeleteGroupAsync(Guid groupId)
        {
            var group = await _context.Groups
                .FirstOrDefaultAsync(g => g.Id == groupId)
                ?? throw new Exception($"ID'si '{groupId}' olan grup bulunamadı.");

            if (!group.IsActive)
                return; // Zaten pasif

            group.IsActive = false;
            group.DeletedAt = DateTime.UtcNow;
            group.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        private static GroupStudentResponse MapToStudentResponse(GroupStudent gs)
        {
            return new GroupStudentResponse
            {
                StudentId = gs.StudentId,
                StudentFirstName = gs.Student.FirstName,
                StudentLastName = gs.Student.LastName,
                DateOfBirth = gs.Student.DateOfBirth,
                IsActive = gs.IsActive,
                JoinedAt = gs.JoinedAt,
                LeftAt = gs.LeftAt
            };
        }
    }
}



