using Emek.Domain.Entities.Base;
using Emek.Domain.Entities.Debts;
using Emek.Domain.Entities.Parents;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Domain.Entities.Personal
{
    public class StudentPersonalInfo: BaseEntity
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string NationalId { get; set; }
        public string SchoolName { get; set; }
        public string HomeAddress { get; set; }
        public string Branch { get; set; }
        public string? Class { get; set; } // Öğrencinin sınıfı
        public string? PhoneNumber { get; set; } // Öğrencinin telefon numarası

        // Borç durumu
        public bool HasDebt { get; set; } = false;

        // Profil resmi
        public string? ProfileImageBase64 { get; set; }
        public string? ProfileImageContentType { get; set; }

        // 1-M => 1 öğrencinin 1 parentı olabilir. DbContext içinde foreign key olarak MotherId ve FatherId tanımlandılar.
        public Guid MotherId { get; set; }
        public Guid FatherId { get; set; }

        // Navigation
        public StudentMotherInfo Mother { get; set; }
        public StudentFatherInfo Father { get; set; }

        // 1 öğrenci - M yakın
        public ICollection<Relatives> Relatives { get; set; } = new List<Relatives>();

        // 1 öğrenci - M borç-ödeme
        public ICollection<Debt> Debts { get; set; } = new List<Debt>();
    }
}
