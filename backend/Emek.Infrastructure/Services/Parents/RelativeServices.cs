using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Parents;
using Emek.Application.DTOs.Responses.Parents;
using Emek.Application.Interfaces.Parents;
using Emek.Domain.Entities.Parents;
using Emek.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Emek.Infrastructure.Services.Parents
{
    public class RelativeServices : IRelativeServices
    {
        private readonly EmekDbContext _context;

        public RelativeServices(EmekDbContext context)
        {
            _context = context;
        }

        public async Task<RelativeResponse> CreateAsync(CreateRelativeRequest request)
        {
            // TC validasyonları
            ValidateNationalId(request.NationalId, "Yakın");
            ValidateNationalId(request.StudentNationalId, "Öğrenci");

            // Öğrenci var mı kontrol et
            var student = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.NationalId == request.StudentNationalId);

            if (student == null)
            {
                throw new Exception($"TC Kimlik No'su '{request.StudentNationalId}' olan öğrenci bulunamadı.");
            }

            // Yakın TC kontrolü (aynı TC ile tekrar eklenmesin)
            var existingRelative = await _context.Relatives
                .FirstOrDefaultAsync(r => r.NationalId == request.NationalId && r.StudentId == student.Id);

            if (existingRelative != null)
            {
                throw new Exception($"TC Kimlik No'su '{request.NationalId}' olan bir yakın bu öğrenci için zaten kayıtlı.");
            }

            var relative = new Relatives
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                NationalId = request.NationalId,
                PhoneNumber = request.PhoneNumber,
                Email = request.Email,
                Occupation = request.Occupation,
                RelationType = request.RelationType,
                StudentId = student.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Relatives.Add(relative);
            await _context.SaveChangesAsync();

            return MapToResponse(relative);
        }

        public async Task<RelativeResponse> UpdateAsync(Guid id, UpdateRelativeRequest request)
        {
            // TC validasyonu
            ValidateNationalId(request.NationalId, "Yakın");

            var relative = await _context.Relatives
                .FirstOrDefaultAsync(r => r.Id == id);

            if (relative == null)
            {
                throw new Exception($"ID'si '{id}' olan yakın bulunamadı.");
            }

            // Aynı öğrenci için TC duplicate kontrolü
            var duplicate = await _context.Relatives
                .FirstOrDefaultAsync(r => r.NationalId == request.NationalId &&
                                          r.StudentId == relative.StudentId &&
                                          r.Id != id);

            if (duplicate != null)
            {
                throw new Exception($"TC Kimlik No'su '{request.NationalId}' olan başka bir yakın zaten mevcut.");
            }

            relative.FirstName = request.FirstName;
            relative.LastName = request.LastName;
            relative.NationalId = request.NationalId;
            relative.PhoneNumber = request.PhoneNumber;
            relative.Email = request.Email;
            relative.Occupation = request.Occupation;
            relative.RelationType = request.RelationType;
            relative.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponse(relative);
        }

        public async Task DeleteAsync(Guid id)
        {
            var relative = await _context.Relatives
                .FirstOrDefaultAsync(r => r.Id == id);

            if (relative == null)
            {
                throw new Exception($"ID'si '{id}' olan yakın bulunamadı.");
            }

            _context.Relatives.Remove(relative);
            await _context.SaveChangesAsync();
        }

        public async Task<RelativeResponse> GetByIdAsync(Guid id)
        {
            var relative = await _context.Relatives
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == id);

            if (relative == null)
            {
                throw new Exception($"ID'si '{id}' olan yakın bulunamadı.");
            }

            return MapToResponse(relative);
        }

        public async Task<IEnumerable<RelativeResponse>> GetByStudentIdAsync(Guid studentId)
        {
            var relatives = await _context.Relatives
                .AsNoTracking()
                .Where(r => r.StudentId == studentId)
                .ToListAsync();

            return relatives.Select(MapToResponse);
        }

        public async Task<IEnumerable<RelativeResponse>> GetByRelativeNationalIdAsync(string nationalId)
        {
            ValidateNationalId(nationalId, "Yakın");

            var relatives = await _context.Relatives
                .AsNoTracking()
                .Where(r => r.NationalId == nationalId)
                .ToListAsync();

            if (!relatives.Any())
            {
                throw new Exception($"TC Kimlik No'su '{nationalId}' olan herhangi bir yakın bulunamadı.");
            }

            return relatives.Select(MapToResponse);
        }

        public async Task<IEnumerable<RelativeResponse>> GetAllAsync(FilterRelativeRequest? filter = null)
        {
            var query = _context.Relatives.AsNoTracking().AsQueryable();

            if (filter != null)
            {
                if (filter.StudentId.HasValue)
                    query = query.Where(r => r.StudentId == filter.StudentId.Value);

                if (!string.IsNullOrWhiteSpace(filter.FirstName))
                    query = query.Where(r => r.FirstName.Contains(filter.FirstName));

                if (!string.IsNullOrWhiteSpace(filter.LastName))
                    query = query.Where(r => r.LastName.Contains(filter.LastName));

                if (!string.IsNullOrWhiteSpace(filter.NationalId))
                {
                    ValidateNationalId(filter.NationalId, "Yakın");
                    query = query.Where(r => r.NationalId == filter.NationalId);
                }

                if (!string.IsNullOrWhiteSpace(filter.RelationType))
                    query = query.Where(r => r.RelationType == filter.RelationType);
            }

            var relatives = await query.ToListAsync();

            return relatives.Select(MapToResponse);
        }

        private void ValidateNationalId(string nationalId, string entityName)
        {
            if (string.IsNullOrWhiteSpace(nationalId))
                throw new Exception($"TC Kimlik No boş olamaz. Lütfen geçerli bir TC Kimlik No giriniz.");

            if (nationalId.Length != 11)
                throw new Exception($" TC Kimlik No tam olarak 11 karakter olmalıdır.");

            if (!nationalId.All(char.IsDigit))
                throw new Exception($" TC Kimlik No sadece rakamlardan oluşmalıdır.");
        }

        private static RelativeResponse MapToResponse(Relatives relative)
        {
            return new RelativeResponse
            {
                Id = relative.Id,
                StudentId = relative.StudentId,
                FirstName = relative.FirstName,
                LastName = relative.LastName,
                NationalId = relative.NationalId,
                PhoneNumber = relative.PhoneNumber,
                Email = relative.Email,
                Occupation = relative.Occupation,
                RelationType = relative.RelationType,
                CreatedAt = relative.CreatedAt,
                UpdatedAt = relative.UpdatedAt
            };
        }
    }
}
