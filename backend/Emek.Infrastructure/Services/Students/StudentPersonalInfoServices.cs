using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Students;
using Emek.Application.DTOs.Responses.Students;
using Emek.Application.DTOs.Responses.Parents;
using Emek.Application.Interfaces.Students;
using Emek.Domain.Entities.Personal;
using Emek.Domain.Entities.Parents;
using Emek.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Emek.Infrastructure.Services.Students
{
    public class StudentPersonalInfoServices : IStudentPersonalInfoServices
    {
        private readonly EmekDbContext _context;

        public StudentPersonalInfoServices(EmekDbContext context)
        {
            _context = context;
        }

        public async Task<StudentResponse> CreateAsync(CreateStudentRequest request)
        {
            // TC kısıtlamaları
            ValidateNationalId(request.NationalId, "Öğrenci");
            ValidateNationalId(request.MotherInfo.NationalId, "Anne");
            ValidateNationalId(request.FatherInfo.NationalId, "Baba");

            // Anne TC'si ile kontrol et, varsa kullan, yoksa oluştur
            var mother = await _context.StudentMotherInfos
                .FirstOrDefaultAsync(m => m.NationalId == request.MotherInfo.NationalId);

            if (mother == null)
            {
                // Yeni anne oluştur
                mother = new StudentMotherInfo
                {
                    Id = Guid.NewGuid(),
                    FirstName = request.MotherInfo.FirstName,
                    LastName = request.MotherInfo.LastName,
                    NationalId = request.MotherInfo.NationalId,
                    PhoneNumber = request.MotherInfo.PhoneNumber,
                    Email = request.MotherInfo.Email,
                    Occupation = request.MotherInfo.Occupation,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.StudentMotherInfos.Add(mother);
            }
            else
            {
                // Mevcut anne bilgilerini güncelle (opsiyonel - sadece boş alanları doldur)
                if (string.IsNullOrEmpty(mother.PhoneNumber) && !string.IsNullOrEmpty(request.MotherInfo.PhoneNumber))
                    mother.PhoneNumber = request.MotherInfo.PhoneNumber;
                if (string.IsNullOrEmpty(mother.Email) && !string.IsNullOrEmpty(request.MotherInfo.Email))
                    mother.Email = request.MotherInfo.Email;
                if (string.IsNullOrEmpty(mother.Occupation) && !string.IsNullOrEmpty(request.MotherInfo.Occupation))
                    mother.Occupation = request.MotherInfo.Occupation;
                mother.UpdatedAt = DateTime.UtcNow;
            }

            // Baba TC'si ile kontrol et, varsa kullan, yoksa oluştur
            var father = await _context.StudentFatherInfos
                .FirstOrDefaultAsync(f => f.NationalId == request.FatherInfo.NationalId);

            if (father == null)
            {
                // Yeni baba oluştur
                father = new StudentFatherInfo
                {
                    Id = Guid.NewGuid(),
                    FirstName = request.FatherInfo.FirstName,
                    LastName = request.FatherInfo.LastName,
                    NationalId = request.FatherInfo.NationalId,
                    PhoneNumber = request.FatherInfo.PhoneNumber,
                    Email = request.FatherInfo.Email,
                    Occupation = request.FatherInfo.Occupation,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.StudentFatherInfos.Add(father);
            }
            else
            {
                // Mevcut baba bilgilerini güncelle (opsiyonel - sadece boş alanları doldur)
                if (string.IsNullOrEmpty(father.PhoneNumber) && !string.IsNullOrEmpty(request.FatherInfo.PhoneNumber))
                    father.PhoneNumber = request.FatherInfo.PhoneNumber;
                if (string.IsNullOrEmpty(father.Email) && !string.IsNullOrEmpty(request.FatherInfo.Email))
                    father.Email = request.FatherInfo.Email;
                if (string.IsNullOrEmpty(father.Occupation) && !string.IsNullOrEmpty(request.FatherInfo.Occupation))
                    father.Occupation = request.FatherInfo.Occupation;
                father.UpdatedAt = DateTime.UtcNow;
            }

            // Öğrenci TC kontrolü - aynı TC'ye sahip öğrenci var mı?
            var existingStudent = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.NationalId == request.NationalId);

            if (existingStudent != null)
                throw new Exception($"TC Kimlik No'su '{request.NationalId}' olan bir öğrenci zaten kayıtlıdır. (Öğrenci ID: {existingStudent.Id}, Ad Soyad: {existingStudent.FirstName} {existingStudent.LastName})");

            // Öğrenci oluştur
            var student = new StudentPersonalInfo
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                NationalId = request.NationalId,
                SchoolName = request.SchoolName,
                HomeAddress = request.HomeAddress,
                Branch = request.Branch,
                Class = request.Class,
                PhoneNumber = request.PhoneNumber,
                ProfileImageBase64 = request.ProfileImageBase64,
                ProfileImageContentType = request.ProfileImageContentType,
                MotherId = mother.Id,
                FatherId = father.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.StudentPersonalInfos.Add(student);
            await _context.SaveChangesAsync();

            // Oluşturulan öğrenciyi anne/baba bilgileri ile birlikte döndür
            return await GetByIdWithParentsAsync(student.Id);
        }

        public async Task<StudentResponse> UpdateAsync(Guid id, UpdateStudentRequest request)
        {
            // TC kısıtlamaları
            ValidateNationalId(request.NationalId, "Öğrenci");
            ValidateNationalId(request.MotherInfo.NationalId, "Anne");
            ValidateNationalId(request.FatherInfo.NationalId, "Baba");

            // Öğrenciyi bul
            var student = await _context.StudentPersonalInfos
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
                throw new Exception($"ID'si '{id}' olan öğrenci bulunamadı.");

            // TC değiştiyse kontrol et
            if (student.NationalId != request.NationalId)
            {
                var existingStudent = await _context.StudentPersonalInfos
                    .FirstOrDefaultAsync(s => s.NationalId == request.NationalId && s.Id != id);

                if (existingStudent != null)
                    throw new Exception($"TC Kimlik No'su '{request.NationalId}' olan başka bir öğrenci zaten kayıtlıdır.");
            }

            // Anne TC'si ile kontrol et, varsa güncelle, yoksa oluştur
            var mother = await _context.StudentMotherInfos
                .FirstOrDefaultAsync(m => m.NationalId == request.MotherInfo.NationalId);

            if (mother == null)
            {
                // Yeni anne oluştur
                mother = new StudentMotherInfo
                {
                    Id = Guid.NewGuid(),
                    FirstName = request.MotherInfo.FirstName,
                    LastName = request.MotherInfo.LastName,
                    NationalId = request.MotherInfo.NationalId,
                    PhoneNumber = request.MotherInfo.PhoneNumber,
                    Email = request.MotherInfo.Email,
                    Occupation = request.MotherInfo.Occupation,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.StudentMotherInfos.Add(mother);
            }
            else
            {
                // Mevcut anne bilgilerini güncelle
                mother.FirstName = request.MotherInfo.FirstName;
                mother.LastName = request.MotherInfo.LastName;
                mother.PhoneNumber = request.MotherInfo.PhoneNumber;
                mother.Email = request.MotherInfo.Email;
                mother.Occupation = request.MotherInfo.Occupation;
                mother.UpdatedAt = DateTime.UtcNow;
            }

            // Baba TC'si ile kontrol et, varsa güncelle, yoksa oluştur
            var father = await _context.StudentFatherInfos
                .FirstOrDefaultAsync(f => f.NationalId == request.FatherInfo.NationalId);

            if (father == null)
            {
                // Yeni baba oluştur
                father = new StudentFatherInfo
                {
                    Id = Guid.NewGuid(),
                    FirstName = request.FatherInfo.FirstName,
                    LastName = request.FatherInfo.LastName,
                    NationalId = request.FatherInfo.NationalId,
                    PhoneNumber = request.FatherInfo.PhoneNumber,
                    Email = request.FatherInfo.Email,
                    Occupation = request.FatherInfo.Occupation,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.StudentFatherInfos.Add(father);
            }
            else
            {
                // Mevcut baba bilgilerini güncelle
                father.FirstName = request.FatherInfo.FirstName;
                father.LastName = request.FatherInfo.LastName;
                father.PhoneNumber = request.FatherInfo.PhoneNumber;
                father.Email = request.FatherInfo.Email;
                father.Occupation = request.FatherInfo.Occupation;
                father.UpdatedAt = DateTime.UtcNow;
            }

            // Öğrenci bilgilerini güncelle
            student.FirstName = request.FirstName;
            student.LastName = request.LastName;
            student.DateOfBirth = request.DateOfBirth;
            student.NationalId = request.NationalId;
            student.SchoolName = request.SchoolName;
            student.HomeAddress = request.HomeAddress;
            student.Branch = request.Branch;
            student.Class = request.Class;
            student.PhoneNumber = request.PhoneNumber;
            student.MotherId = mother.Id;
            student.FatherId = father.Id;
            student.UpdatedAt = DateTime.UtcNow;

            // Profil resmi güncelle (eğer gönderildiyse)
            if (request.ProfileImageBase64 != null)
            {
                student.ProfileImageBase64 = request.ProfileImageBase64;
                student.ProfileImageContentType = request.ProfileImageContentType;
            }

            await _context.SaveChangesAsync();

            // Güncellenmiş öğrenciyi anne/baba bilgileri ile birlikte döndür
            return await GetByIdWithParentsAsync(student.Id);
        }

        public async Task<StudentResponse> GetByIdAsync(Guid id)
        {
            var student = await _context.StudentPersonalInfos
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
                throw new Exception($"ID'si '{id}' olan öğrenci bulunamadı.");

            return MapToResponseWithParentTCs(student);
        }

        public async Task<StudentResponse> GetByIdWithParentsAsync(Guid id)
        {
            var student = await _context.StudentPersonalInfos
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .Include(s => s.Relatives)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
                throw new Exception($"ID'si '{id}' olan öğrenci bulunamadı.");

            return MapToResponseWithParents(student);
        }

        public async Task<StudentResponse> GetByNationalIdAsync(string nationalId)
        {
            ValidateNationalId(nationalId, "Öğrenci");

            var student = await _context.StudentPersonalInfos
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .FirstOrDefaultAsync(s => s.NationalId == nationalId);

            if (student == null)
                throw new Exception($"TC Kimlik No'su '{nationalId}' olan öğrenci bulunamadı.");

            return MapToResponseWithParentTCs(student);
        }

        public async Task<StudentResponse> GetByNationalIdWithParentsAsync(string nationalId)
        {
            ValidateNationalId(nationalId, "Öğrenci");

            var student = await _context.StudentPersonalInfos
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .Include(s => s.Relatives)
                .FirstOrDefaultAsync(s => s.NationalId == nationalId);

            if (student == null)
                throw new Exception($"TC Kimlik No'su '{nationalId}' olan öğrenci bulunamadı.");

            return MapToResponseWithParents(student);
        }

        public async Task<IEnumerable<StudentResponse>> GetStudentsByMotherNationalIdAsync(string motherNationalId)
        {
            ValidateNationalId(motherNationalId, "Anne");

            var mother = await _context.StudentMotherInfos
                .FirstOrDefaultAsync(m => m.NationalId == motherNationalId);

            if (mother == null)
                throw new Exception($"TC Kimlik No'su '{motherNationalId}' olan anne bulunamadı.");

            var students = await _context.StudentPersonalInfos
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .Include(s => s.Relatives)
                .Where(s => s.MotherId == mother.Id)
                .ToListAsync();

            if (!students.Any())
                throw new Exception($"TC Kimlik No'su '{motherNationalId}' olan annenin kayıtlı öğrencisi bulunmamaktadır.");

            return students.Select(MapToResponseWithParents);
        }

        public async Task<IEnumerable<StudentResponse>> GetStudentsByFatherNationalIdAsync(string fatherNationalId)
        {
            ValidateNationalId(fatherNationalId, "Baba");

            var father = await _context.StudentFatherInfos
                .FirstOrDefaultAsync(f => f.NationalId == fatherNationalId);

            if (father == null)
                throw new Exception($"TC Kimlik No'su '{fatherNationalId}' olan baba bulunamadı.");

            var students = await _context.StudentPersonalInfos
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .Include(s => s.Relatives)
                .Where(s => s.FatherId == father.Id)
                .ToListAsync();

            if (!students.Any())
                throw new Exception($"TC Kimlik No'su '{fatherNationalId}' olan babanın kayıtlı öğrencisi bulunmamaktadır.");

            return students.Select(MapToResponseWithParents);
        }

        public async Task<IEnumerable<StudentResponse>> GetAllAsync()
        {
            var students = await _context.StudentPersonalInfos
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .ToListAsync();

            return students.Select(MapToResponseWithParentTCs);
        }

        public async Task<IEnumerable<StudentResponse>> GetActiveStudentsAsync()
        {
            var students = await _context.StudentPersonalInfos
                .Where(s => s.IsActive)
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .ToListAsync();

            return students.Select(MapToResponseWithParentTCs);
        }

        public async Task<IEnumerable<StudentResponse>> GetInactiveStudentsAsync()
        {
            var students = await _context.StudentPersonalInfos
                .Where(s => !s.IsActive)
                .Include(s => s.Mother)
                .Include(s => s.Father)
                .ToListAsync();

            return students.Select(MapToResponseWithParentTCs);
        }

        public async Task DeactivateStudentAsync(Guid studentId)
        {
            var student = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            if (!student.IsActive)
                return; // Zaten pasif

            student.IsActive = false;
            student.DeletedAt = DateTime.UtcNow;
            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateProfileImageAsync(Guid studentId, UpdateStudentProfileImageRequest request)
        {
            var student = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            student.ProfileImageBase64 = request.ProfileImageBase64;
            student.ProfileImageContentType = request.ProfileImageContentType;
            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<(string? ProfileImageBase64, string? ProfileImageContentType)> GetProfileImageAsync(Guid studentId)
        {
            var student = await _context.StudentPersonalInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            return (student.ProfileImageBase64, student.ProfileImageContentType);
        }

        public async Task DeleteProfileImageAsync(Guid studentId)
        {
            var student = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            student.ProfileImageBase64 = null;
            student.ProfileImageContentType = null;
            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        private StudentResponse MapToResponseWithParentTCs(StudentPersonalInfo student)
        {
            return new StudentResponse
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
                HasDebt = student.HasDebt,
                MotherId = student.MotherId,
                FatherId = student.FatherId,
                MotherNationalId = student.Mother?.NationalId,
                FatherNationalId = student.Father?.NationalId,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt,
                HasProfileImage = !string.IsNullOrEmpty(student.ProfileImageBase64),
                ProfileImageContentType = student.ProfileImageContentType
            };
        }

        private StudentResponse MapToResponseWithParents(StudentPersonalInfo student)
        {
            var response = MapToResponseWithParentTCs(student);
            response.MotherNationalId = student.Mother?.NationalId;
            response.FatherNationalId = student.Father?.NationalId;

            if (student.Relatives != null && student.Relatives.Any())
            {
                response.Relatives = student.Relatives.Select(r => new RelativeResponse
                {
                    Id = r.Id,
                    StudentId = r.StudentId,
                    FirstName = r.FirstName,
                    LastName = r.LastName,
                    NationalId = r.NationalId,
                    PhoneNumber = r.PhoneNumber,
                    Email = r.Email,
                    Occupation = r.Occupation,
                    RelationType = r.RelationType,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                }).ToList();
            }

            if (student.Mother != null)
            {
                response.Mother = new MotherResponse
                {
                    Id = student.Mother.Id,
                    FirstName = student.Mother.FirstName,
                    LastName = student.Mother.LastName,
                    NationalId = student.Mother.NationalId,
                    PhoneNumber = student.Mother.PhoneNumber,
                    Email = student.Mother.Email,
                    Occupation = student.Mother.Occupation,
                    CreatedAt = student.Mother.CreatedAt,
                    UpdatedAt = student.Mother.UpdatedAt
                };
            }

            if (student.Father != null)
            {
                response.Father = new FatherResponse
                {
                    Id = student.Father.Id,
                    FirstName = student.Father.FirstName,
                    LastName = student.Father.LastName,
                    NationalId = student.Father.NationalId,
                    PhoneNumber = student.Father.PhoneNumber,
                    Email = student.Father.Email,
                    Occupation = student.Father.Occupation,
                    CreatedAt = student.Father.CreatedAt,
                    UpdatedAt = student.Father.UpdatedAt
                };
            }

            return response;
        }

        private void ValidateNationalId(string nationalId, string entityName)
        {
            if (string.IsNullOrWhiteSpace(nationalId))
                throw new Exception($"TC Kimlik No boş olamaz. Lütfen geçerli bir TC Kimlik No giriniz.");

            if (nationalId.Length != 11)
                throw new Exception($"TC Kimlik No tam olarak 11 karakter olmalıdır.");

            if (!nationalId.All(char.IsDigit))
                throw new Exception($"TC Kimlik No sadece rakamlardan oluşmalıdır.");
        }
    }
}
