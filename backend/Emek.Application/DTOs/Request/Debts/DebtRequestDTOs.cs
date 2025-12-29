using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Application.DTOs.Request.Debts
{
    public class DebtRequestDTOs
    {
        public Guid StudentId { get; set; }
        public DateTime DueDate { get; set; } 
        public int MonthlyTuitionFee { get; set; }
        public int MaterialFee { get; set; }
        public int AmountPaid { get; set; } = 0; // default 0
        public DateTime? DateOfPayment { get; set; } // Nullable. ödeme yapılmadıysa ama satır otomatik oluştuysa boş gelsin

        // İlk oluşturulurken öğrenci ödeme yapmasa bile boş satır oluşturmasına yarar. Bu yüzden nullable verildi.
    }
    public class MakePaymentDTO
    {
        // oluşturulurken boş yüklenen alanlara atanır.(Direkt ödeme yapacaksa üstteki responseda alanlar dolur gelir, burası kullanılmaz)
        public Guid DebtId { get; set; }  // Hangi borca ödeme yapılacak
        public int AmountPaid { get; set; } // Ödenen miktar
        public DateTime DateOfPayment { get; set; } // Ödeme tarihi

    }

    public class DebtUpdateRequestDTOs : DebtRequestDTOs
    {
        public Guid DebtId { get; set; } // Güncellenecek borcun Id'si
    }

    public class FilterStudentsWithDebtRequest
    {
        // hepsi boş bırakılabilir, boşsa filtre uygulanmaz
        public Guid? GroupId { get; set; } // null = tüm gruplar
        public int? Year { get; set; } // null = tüm yıllar, örnek: 2025
        public int? Month { get; set; } // null = tüm aylar, örnek: 11 => kasım
    }

}
