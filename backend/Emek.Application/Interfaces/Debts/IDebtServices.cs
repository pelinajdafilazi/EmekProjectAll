using Emek.Application.DTOs.Request.Debts;
using Emek.Application.DTOs.Responses.Debts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Application.Interfaces.Debts
{
    public interface IDebtServices
    {
        // CRUD İşlemleri ( get all eksik, eklenebilir)
        Task<DebtResponseDTOs> CreateDebtAsync(DebtRequestDTOs request); // ödemesi boş veya dolu borç satırı oluştur
        Task<DebtResponseDTOs> GetDebtByIdAsync(Guid debtId); // borç id ile getir
        Task<IEnumerable<DebtResponseDTOs>> GetAllDebtsByStudentIdAsync(Guid studentId); // öğrenciye ait tüm borçları getir
        Task<DebtResponseDTOs> UpdateDebtAsync(DebtUpdateRequestDTOs request); // borç güncelle(hatalı girdileri düzeltme için)
        Task DeleteDebtAsync(Guid debtId);
        Task<IEnumerable<DebtDetailAndStudentBasicInfoDTO>> GetAllDebtsAndStudentInfoByStudentIdAsync(Guid studentId); // öğrenci id ile tüm borç ve öğrenci bilgilerini dön


        Task<DebtStudentBasicInfoDTO> GetDebtAndStudentBasicInfoAsync(Guid debtId); // borç id ile öğrenci ve borç bilgilerini dön
        Task<DebtStudentDetailDTO> GetDebtAndStudentDetailInfoAsync(Guid debtId); // borç id ile öğrenci bilgilerini detaylı dön
        Task<int> GetTotalDebtOfStudentAsync(Guid studentId); // öğrenciye ait toplam borcu getir
        Task<DebtResponseDTOs> MakePaymentAsync(MakePaymentDTO request); // Ödeme yap ve güncellenmiş borç bilgisini dön

        // Filtreleme ve Listeleme
        Task<IEnumerable<StudentFilteredDebtInfoResponse>> GetStudentsWithDebtInfoAsync(Guid? groupId, int? year, int? month); // Grup ve ay/yıl filtresine göre öğrenci listesi
        Task<StudentDebtDetailsResponse> GetStudentDebtDetailsAsync(Guid studentId); // Öğrenci detaylı bilgileri ve tüm borçları

    }
}
