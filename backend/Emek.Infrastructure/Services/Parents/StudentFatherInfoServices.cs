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
    public class StudentFatherInfoServices : IStudentFatherInfoServices
    {
        private readonly EmekDbContext _context;

        public StudentFatherInfoServices(EmekDbContext context)
        {
            _context = context;
        }

        public async Task<FatherResponse> GetByIdAsync(Guid id)
        {
            var father = await _context.StudentFatherInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.Id == id);

            if (father == null)
                throw new Exception($"ID'si '{id}' olan baba bulunamadı.");

            return MapToResponse(father);
        }

        public async Task<FatherResponse> GetByNationalIdAsync(string nationalId)
        {
            ValidateNationalId(nationalId, "Baba");

            var father = await _context.StudentFatherInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.NationalId == nationalId);

            if (father == null)
                throw new Exception($"TC Kimlik No'su '{nationalId}' olan baba bulunamadı.");

            return MapToResponse(father);
        }

        public async Task<FatherResponse> UpdateAsync(Guid id, UpdateFatherRequest request)
        {
            // TC validasyonu
            ValidateNationalId(request.NationalId, "Baba");

            var father = await _context.StudentFatherInfos
                .FirstOrDefaultAsync(f => f.Id == id);

            if (father == null)
                throw new Exception($"ID'si '{id}' olan baba bulunamadı.");

            // TC değiştiyse kontrol et
            if (father.NationalId != request.NationalId)
            {
                var existingFather = await _context.StudentFatherInfos
                    .FirstOrDefaultAsync(f => f.NationalId == request.NationalId && f.Id != id);

                if (existingFather != null)
                    throw new Exception($"TC Kimlik No'su '{request.NationalId}' olan başka bir baba zaten kayıtlıdır.");
            }

            // Baba bilgilerini güncelle
            father.FirstName = request.FirstName;
            father.LastName = request.LastName;
            father.NationalId = request.NationalId;
            father.PhoneNumber = request.PhoneNumber;
            father.Email = request.Email;
            father.Occupation = request.Occupation;
            father.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponse(father);
        }

        public async Task<IEnumerable<FatherResponse>> GetAllAsync()
        {
            var fathers = await _context.StudentFatherInfos
                .AsNoTracking()
                .ToListAsync();

            return fathers.Select(MapToResponse);
        }

        private FatherResponse MapToResponse(StudentFatherInfo father)
        {
            return new FatherResponse
            {
                Id = father.Id,
                FirstName = father.FirstName,
                LastName = father.LastName,
                NationalId = father.NationalId,
                PhoneNumber = father.PhoneNumber,
                Email = father.Email,
                Occupation = father.Occupation,
                CreatedAt = father.CreatedAt,
                UpdatedAt = father.UpdatedAt
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
