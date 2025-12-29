using Emek.Domain.Entities.Base;
using Emek.Domain.Entities.Personal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Domain.Entities.Parents
{
    public class StudentMotherInfo: BaseEntity
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string NationalId { get; set; }
        public string PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string Occupation { get; set; }

        // 1-M => 1 parentın birden fazla öğrencisi olabilir.
        public ICollection<StudentPersonalInfo> Students { get; set; } = new List<StudentPersonalInfo>();
    }
}
