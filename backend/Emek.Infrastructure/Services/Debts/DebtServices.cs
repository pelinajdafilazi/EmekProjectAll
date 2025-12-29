using Emek.Application.DTOs.Request.Debts;
using Emek.Application.DTOs.Responses.Debts;
using Emek.Application.DTOs.Responses.Students;
using Emek.Application.Interfaces.Debts;
using Emek.Domain.Entities.Debts;
using Emek.Domain.Entities.Personal;
using Emek.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Emek.Infrastructure.Services.Debts
{
    public class DebtServices : IDebtServices
    {
        private readonly EmekDbContext _context;

        public DebtServices(EmekDbContext context)
        {
            _context = context;
        }

        public async Task<DebtResponseDTOs> CreateDebtAsync(DebtRequestDTOs request)
        {
            // Öğrenci kontrolü
            var student = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.Id == request.StudentId)
                ?? throw new Exception($"ID'si '{request.StudentId}' olan öğrenci bulunamadı.");

            // Kısıtlamalar, validations
            if (request.MonthlyTuitionFee <= 0)
                throw new Exception("Aylık ücret 0'dan büyük olmalıdır.");

            if (request.AmountPaid < 0)
                throw new Exception("Ödenen miktar negatif olamaz.");

            if (request.AmountPaid > request.MonthlyTuitionFee)
                throw new Exception("Ödenen miktar, aylık ücretten fazla olamaz.");

            // Aynı öğrenci için aynı ay için borç kaydı var mı kontrol et
            var existingDebt = await _context.Debts
                .FirstOrDefaultAsync(d => d.StudentId == request.StudentId
                    && d.DueDate.Year == request.DueDate.Year
                    && d.DueDate.Month == request.DueDate.Month
                    && d.IsActive);

            if (existingDebt != null)
                throw new Exception($"Bu öğrenci için {request.DueDate:yyyy-MM} ayına ait borç kaydı zaten mevcut.");

            var debt = new Debt
            {
                Id = Guid.NewGuid(),
                StudentId = request.StudentId,
                DueDate = request.DueDate,
                MonthlyTuitionFee = request.MonthlyTuitionFee,
                MaterialFee = request.MaterialFee,
                AmountPaid = request.AmountPaid,
                DateOfPayment = request.DateOfPayment,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Debts.Add(debt);
            await _context.SaveChangesAsync();

            // Öğrencinin HasDebt durumunu güncelle
            await UpdateStudentDebtStatusAsync(request.StudentId);

            return MapToResponse(debt);
        }

        public async Task<DebtResponseDTOs> GetDebtByIdAsync(Guid debtId)
        {
            var debt = await _context.Debts
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == debtId)
                ?? throw new Exception($"ID'si '{debtId}' olan borç bulunamadı.");

            return MapToResponse(debt);
        }

        public async Task<IEnumerable<DebtResponseDTOs>> GetAllDebtsByStudentIdAsync(Guid studentId)
        {
            var student = await _context.StudentPersonalInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == studentId)
                ?? throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            var debts = await _context.Debts
                .AsNoTracking()
                .Where(d => d.StudentId == studentId && d.IsActive)
                .OrderByDescending(d => d.DueDate)
                .ToListAsync();

            return debts.Select(MapToResponse);
        }

        public async Task<DebtResponseDTOs> UpdateDebtAsync(DebtUpdateRequestDTOs request)
        {
            var debt = await _context.Debts
                .FirstOrDefaultAsync(d => d.Id == request.DebtId)
                ?? throw new Exception($"ID'si '{request.DebtId}' olan borç bulunamadı.");

            // Validasyonlar
            if (request.MonthlyTuitionFee <= 0)
                throw new Exception("Aylık ücret 0'dan büyük olmalıdır.");

            if (request.AmountPaid < 0)
                throw new Exception("Ödenen miktar negatif olamaz.");

            if (request.AmountPaid > request.MonthlyTuitionFee)
                throw new Exception("Ödenen miktar, aylık ücretten fazla olamaz.");

            // Aynı öğrenci için aynı ay için başka bir borç kaydı var mı kontrol et (güncellenen kayıt hariç)
            var existingDebt = await _context.Debts
                .FirstOrDefaultAsync(d => d.StudentId == request.StudentId
                    && d.DueDate.Year == request.DueDate.Year
                    && d.DueDate.Month == request.DueDate.Month
                    && d.Id != request.DebtId
                    && d.IsActive);

            if (existingDebt != null)
                throw new Exception($"Bu öğrenci için {request.DueDate:yyyy-MM} ayına ait başka bir borç kaydı mevcut.");

            debt.StudentId = request.StudentId;
            debt.DueDate = request.DueDate;
            debt.MonthlyTuitionFee = request.MonthlyTuitionFee;
            debt.MaterialFee = request.MaterialFee;
            debt.AmountPaid = request.AmountPaid;
            debt.DateOfPayment = request.DateOfPayment;
            debt.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Öğrencinin HasDebt durumunu güncelle
            await UpdateStudentDebtStatusAsync(request.StudentId);

            return MapToResponse(debt);
        }

        public async Task DeleteDebtAsync(Guid debtId)
        {
            var debt = await _context.Debts
                .FirstOrDefaultAsync(d => d.Id == debtId)
                ?? throw new Exception($"ID'si '{debtId}' olan borç bulunamadı.");

            if (!debt.IsActive)
                return; // Zaten pasif

            var studentId = debt.StudentId;

            debt.IsActive = false;
            debt.DeletedAt = DateTime.UtcNow;
            debt.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Öğrencinin HasDebt durumunu güncelle
            await UpdateStudentDebtStatusAsync(studentId);
        }

        public async Task<DebtStudentBasicInfoDTO> GetDebtAndStudentBasicInfoAsync(Guid debtId)
        {
            var debt = await _context.Debts
                .Include(d => d.Student)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == debtId)
                ?? throw new Exception($"ID'si '{debtId}' olan borç bulunamadı.");

            return new DebtStudentBasicInfoDTO
            {
                StudentId = debt.StudentId,
                DebtId = debt.Id,
                StudentName = $"{debt.Student.FirstName} {debt.Student.LastName}",
                DueDate = debt.DueDate,
                IsPaid = debt.IsPaid
            };
        }

        public async Task<DebtStudentDetailDTO> GetDebtAndStudentDetailInfoAsync(Guid debtId)
        {
            var debt = await _context.Debts
                .Include(d => d.Student)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == debtId)
                ?? throw new Exception($"ID'si '{debtId}' olan borç bulunamadı.");

            return new DebtStudentDetailDTO
            {
                DebtId = debt.Id,
                DueDate = debt.DueDate,
                DateOfPayment = debt.DateOfPayment,
                MonthlyTuitionFee = debt.MonthlyTuitionFee,
                MaterialFee = debt.MaterialFee,
                AmountPaid = debt.AmountPaid,
                DeptAmount = debt.DebtAmount,
                IsPaid = debt.IsPaid,
                Student = MapToStudentSelfInformation(debt.Student)
            };
        }

        public async Task<int> GetTotalDebtOfStudentAsync(Guid studentId)
        {
            var student = await _context.StudentPersonalInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == studentId)
                ?? throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            var debts = await _context.Debts
                .AsNoTracking()
                .Where(d => d.StudentId == studentId && d.IsActive)
                .ToListAsync();

            int totalDebtAmount = debts.Sum(d => d.DebtAmount);

            return totalDebtAmount;

            //{
            //    //StudentId = student.Id,
            //    //StudentName = $"{student.FirstName} {student.LastName}",
            //    TotalDebtAmount = totalDebtAmount
            //};
        }

        public async Task<DebtResponseDTOs> MakePaymentAsync(MakePaymentDTO request)
        {
            var debt = await _context.Debts
                .FirstOrDefaultAsync(d => d.Id == request.DebtId)
                ?? throw new Exception($"ID'si '{request.DebtId}' olan borç bulunamadı.");

            // Validasyonlar
            if (request.AmountPaid <= 0)
                throw new Exception("Ödenen miktar 0'dan büyük olmalıdır.");

            // Mevcut ödenen miktara yeni ödemeyi ekle
            var newAmountPaid = debt.AmountPaid + request.AmountPaid;

            // Toplam ödenen miktar, aylık ücretten fazla olamaz
            if (newAmountPaid > debt.MonthlyTuitionFee)
                throw new Exception($"Toplam ödenen miktar ({newAmountPaid}), aylık ücretten ({debt.MonthlyTuitionFee}) fazla olamaz.");

            debt.AmountPaid = newAmountPaid;
            debt.DateOfPayment = request.DateOfPayment;
            debt.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Öğrencinin HasDebt durumunu güncelle
            await UpdateStudentDebtStatusAsync(debt.StudentId);

            return MapToResponse(debt);
        }

        private DebtResponseDTOs MapToResponse(Debt debt)
        {
            return new DebtResponseDTOs
            {
                DebtId = debt.Id,
                DueDate = debt.DueDate,
                DateOfPayment = debt.DateOfPayment,
                MonthlyTuitionFee = debt.MonthlyTuitionFee,
                MaterialFee = debt.MaterialFee,
                AmountPaid = debt.AmountPaid,
                DeptAmount = debt.DebtAmount,
                IsPaid = debt.IsPaid
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

        public async Task<IEnumerable<StudentFilteredDebtInfoResponse>> GetStudentsWithDebtInfoAsync(Guid? groupId, int? year, int? month)
        {
            // 1. Grup filtresi: GroupId null ise tüm gruplar
            var studentsQuery = _context.StudentPersonalInfos.AsQueryable();
            
            if (groupId.HasValue)
            {
                // Sadece bu gruptaki öğrencileri al
                var studentIdsInGroup = await _context.GroupStudents
                    .Where(gs => gs.GroupId == groupId.Value && gs.IsActive)
                    .Select(gs => gs.StudentId)
                    .ToListAsync();
                
                studentsQuery = studentsQuery.Where(s => studentIdsInGroup.Contains(s.Id));
            }
            
            var students = await studentsQuery.ToListAsync();
            
            // 2. Her öğrenci için borç bilgilerini getir
            var result = new List<StudentFilteredDebtInfoResponse>();
            
            foreach (var student in students)
            {
                // Grup bilgisi
                var groupStudent = await _context.GroupStudents
                    .Include(gs => gs.Group)
                    .FirstOrDefaultAsync(gs => gs.StudentId == student.Id && gs.IsActive);
                
                // Borç sorgusu - DueDate'e göre filtrele
                var debtsQuery = _context.Debts
                    .Where(d => d.StudentId == student.Id && d.IsActive);
                
                // Ay/Yıl filtresi (DueDate'e göre)
                if (year.HasValue && month.HasValue)
                {
                    debtsQuery = debtsQuery.Where(d => 
                        d.DueDate.Year == year.Value && 
                        d.DueDate.Month == month.Value);
                }
                else if (year.HasValue)
                {
                    debtsQuery = debtsQuery.Where(d => d.DueDate.Year == year.Value);
                }
                
                var debts = await debtsQuery.ToListAsync();
                
                // Seçili ay/yıl için borç bilgisi
                Debt? filteredMonthDebt = null;
                if (year.HasValue && month.HasValue)
                {
                    filteredMonthDebt = debts.FirstOrDefault();
                }
                
                result.Add(new StudentFilteredDebtInfoResponse
                {
                    StudentId = student.Id,
                    StudentFirstName = student.FirstName,
                    StudentLastName = student.LastName,
                    HasProfileImage = !string.IsNullOrEmpty(student.ProfileImageBase64),
                    GroupName = groupStudent?.Group?.Name,
                    HasDebtTotal = student.HasDebt,
                    //DebtAmountTotal = debts.Sum(d => d.DebtAmount),
                    HasDebtMonth = !filteredMonthDebt?.IsPaid,
                    DebtAmountForFilteredMonth = filteredMonthDebt?.DebtAmount,
                    DueDateForFilteredMonth = filteredMonthDebt?.DueDate
                });
            }
            
            return result;
        }

        public async Task<StudentDebtDetailsResponse> GetStudentDebtDetailsAsync(Guid studentId)
        {
            var student = await _context.StudentPersonalInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == studentId)
                ?? throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            // Tüm borçları getir (DueDate'e göre sıralı)
            var debts = await _context.Debts
                .AsNoTracking()
                .Where(d => d.StudentId == studentId && d.IsActive)
                .OrderByDescending(d => d.DueDate)
                .ToListAsync();

            // Toplam borç hesapla
            var totalDebtAmount = debts.Sum(d => d.DebtAmount);

            return new StudentDebtDetailsResponse
            {
                Student = MapToStudentSelfInformation(student),
                TotalDebt = totalDebtAmount,
                AllDebts = debts.Select(MapToResponse)
            };
        }

        private async Task UpdateStudentDebtStatusAsync(Guid studentId)
        {
            var student = await _context.StudentPersonalInfos
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
                return;

            // Öğrencinin aktif borçlarını kontrol et
            // DebtAmount computed property olduğu için hesaplamayı LINQ içinde yapıyoruz
            var hasActiveDebt = await _context.Debts
                .AnyAsync(d => d.StudentId == studentId && d.IsActive && (d.MonthlyTuitionFee - d.AmountPaid) > 0);

            student.HasDebt = hasActiveDebt;
            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<DebtDetailAndStudentBasicInfoDTO>> GetAllDebtsAndStudentInfoByStudentIdAsync(Guid studentId)
        {
            // Öğrenci kontrolü
            var student = await _context.StudentPersonalInfos
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == studentId)
                ?? throw new Exception($"ID'si '{studentId}' olan öğrenci bulunamadı.");

            // Öğrenciye ait tüm aktif borçları getir (DueDate'e göre sıralı)
            var debts = await _context.Debts
                .AsNoTracking()
                .Where(d => d.StudentId == studentId && d.IsActive)
                .OrderByDescending(d => d.DueDate)
                .ToListAsync();

            // Her borç için DebtDetailAndStudentBasicInfoDTO oluştur
            return debts.Select(debt => new DebtDetailAndStudentBasicInfoDTO
            {
                // DebtResponseDTOs özellikleri
                DebtId = debt.Id,
                DueDate = debt.DueDate,
                DateOfPayment = debt.DateOfPayment,
                MonthlyTuitionFee = debt.MonthlyTuitionFee,
                MaterialFee = debt.MaterialFee,
                AmountPaid = debt.AmountPaid,
                DeptAmount = debt.DebtAmount,
                IsPaid = debt.IsPaid,

                // DebtDetailAndStudentBasicInfoDTO özellikleri
                StudentId = student.Id,
                StudentName = $"{student.FirstName} {student.LastName}",
                HasProfileImage = !string.IsNullOrEmpty(student.ProfileImageBase64)
            });
        }
    }
}