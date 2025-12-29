using Emek.Domain.Entities.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Emek.Domain.Entities.Personal;

namespace Emek.Domain.Entities.Parents
{
    public class Relatives: BaseEntity
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string NationalId { get; set; }
        public string PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string Occupation { get; set; }
        public string RelationType { get; set; } // Amca, teyze, dayı vs

        // İlişki: 1 Öğrenci - N Yakın
        public Guid StudentId { get; set; }
        public StudentPersonalInfo Student { get; set; }
    }
}
