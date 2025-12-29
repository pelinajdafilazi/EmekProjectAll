using Emek.Application.DTOs.Responses.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Application.DTOs.Responses.Debts
{
    public class DebtResponseDTOs
    {
        public Guid DebtId { get; set; }
        public DateTime DueDate { get; set; } // Yılın hangi ayına ait ödemenmesi gerektiği bilgisi
        public DateTime? DateOfPayment { get; set; } // Ödeme yapılan tarihi
        public int MonthlyTuitionFee { get; set; } // Aylık ücret
        public int MaterialFee { get; set; } // Malzeme ücreti
        public int AmountPaid { get; set; } // Ödenen miktar
        public int DeptAmount { get; set; } // Kalan borç
        public bool IsPaid { get; set; } // Borcun tamamen ödenip ödenmediği bilgisi

    }

    public class DebtStudentBasicInfoDTO
    {
        public Guid StudentId { get; set; }
        public Guid DebtId { get; set; }
        public string StudentName { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsPaid { get; set; }

    }

    public class DebtDetailAndStudentBasicInfoDTO: DebtResponseDTOs
    {
        public  Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public bool HasProfileImage { get; set; }

    }

    public class DebtStudentDetailDTO: DebtResponseDTOs
    { 
        public StudentSelfInformationResponse Student { get; set; }
        // Hem debt hem de student responselarını içerir
    }

    public class TotalDeptDTO
    {
        public int TotalDebtAmount { get; set; } // Bütün aylardaki borçlardan toplanadan toplam borç miktarı
        //public Guid StudentId { get; set; }
        //public string StudentName { get; set; }

    }

    public class StudentFilteredDebtInfoResponse // filtreli öğrenci borç bilgisi
    {
        public Guid StudentId { get; set; }
        public string StudentFirstName { get; set; }
        public string StudentLastName { get; set; }
        public bool HasProfileImage { get; set; }
        public string? GroupName { get; set; } // grubu olmayanlar için null olabilir
        public bool HasDebtTotal { get; set; } // Genel borcu olup olmadığı bilgisi (tüm aylar için)
        // public int DebtAmountTotal { get; set; } // toplam borcu
        public bool? HasDebtMonth { get; set; }
        public int? DebtAmountForFilteredMonth { get; set; } // aya ait toplam borç
        public DateTime? DueDateForFilteredMonth { get; set; } 
    }

    public class StudentDebtDetailsResponse
    {
        public StudentSelfInformationResponse Student { get; set; }
        public int TotalDebt { get; set; }
        public IEnumerable<DebtResponseDTOs> AllDebts { get; set; } // Tüm borçlar (DueDate'e göre sıralı)
    }

}
