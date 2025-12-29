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
    public class StudentMotherInfoServices : IStudentMotherInfoServices
    {
        private readonly EmekDbContext _context;

        public StudentMotherInfoServices(EmekDbContext context)
        {
            _context = context;
        }

        public async Task<MotherResponse> GetByIdAsync(Guid id)
        {
            var mother = await _context.StudentMotherInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mother == null)
                throw new Exception($"ID'si '{id}' olan anne bulunamadı.");

            return MapToResponse(mother);
        }

        public async Task<MotherResponse> GetByNationalIdAsync(string nationalId)
        {
            ValidateNationalId(nationalId, "Anne");

            var mother = await _context.StudentMotherInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.NationalId == nationalId);

            if (mother == null)
                throw new Exception($"TC Kimlik No'su '{nationalId}' olan anne bulunamadı.");

            return MapToResponse(mother);
        }

        public async Task<MotherResponse> UpdateAsync(Guid id, UpdateMotherRequest request)
        {
            // TC validasyonu
            ValidateNationalId(request.NationalId, "Anne");

            var mother = await _context.StudentMotherInfos
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mother == null)
                throw new Exception($"ID'si '{id}' olan anne bulunamadı.");

            // TC değiştiyse kontrol et
            if (mother.NationalId != request.NationalId)
            {
                var existingMother = await _context.StudentMotherInfos
                    .FirstOrDefaultAsync(m => m.NationalId == request.NationalId && m.Id != id);

                if (existingMother != null)
                    throw new Exception($"TC Kimlik No'su '{request.NationalId}' olan başka bir anne zaten kayıtlıdır.");
            }

            // Anne bilgilerini güncelle
            mother.FirstName = request.FirstName;
            mother.LastName = request.LastName;
            mother.NationalId = request.NationalId;
            mother.PhoneNumber = request.PhoneNumber;
            mother.Email = request.Email;
            mother.Occupation = request.Occupation;
            mother.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponse(mother);
        }

        public async Task<IEnumerable<MotherResponse>> GetAllAsync()
        {
            var mothers = await _context.StudentMotherInfos
                .AsNoTracking()
                .ToListAsync();

            return mothers.Select(MapToResponse);
        }

        private MotherResponse MapToResponse(StudentMotherInfo mother)
        {
            return new MotherResponse
            {
                Id = mother.Id,
                FirstName = mother.FirstName,
                LastName = mother.LastName,
                NationalId = mother.NationalId,
                PhoneNumber = mother.PhoneNumber,
                Email = mother.Email,
                Occupation = mother.Occupation,
                CreatedAt = mother.CreatedAt,
                UpdatedAt = mother.UpdatedAt
            };
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
