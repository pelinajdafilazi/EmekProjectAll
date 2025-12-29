using Emek.Domain.Entities.Base;
using Emek.Domain.Entities.Personal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Domain.Entities.Debts
{
    public class Debt: BaseEntity
    {
        public DateTime DueDate { get; set; } // Yılın hangi ayına ait ödemenmesi gerektiği bilgisi
        public DateTime? DateOfPayment { get; set; } // Ödeme yapılan tarihi (nullable - ödeme yapılmadıysa null)
        public int MonthlyTuitionFee { get; set; } // Aylık ücret
        public int MaterialFee { get; set; } // Malzeme ücreti
        public int AmountPaid { get; set; } // Ödenen miktar
        public int DebtAmount => MonthlyTuitionFee - AmountPaid;  // Kalan borç
        public bool IsPaid => DebtAmount <= 0; // Kalan borç 0 veya daha az ise borç tamamen ödenmiştir.

        // Öğrenci ile 1-M ilişki
        public Guid StudentId { get; set; }
        public StudentPersonalInfo Student { get; set; }

    }
}
