using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Application.DTOs.Request.Parents
{
    public class CreateRelativeRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string NationalId { get; set; }
        public string PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string Occupation { get; set; }
        public string RelationType { get; set; } // Amca, teyze, dayı vs

        // Öğrenci ile ilişki (TC üzerinden)
        public string StudentNationalId { get; set; }
    }

    public class UpdateRelativeRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string NationalId { get; set; }
        public string PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string Occupation { get; set; }
        public string RelationType { get; set; } // Amca, teyze, dayı vs
    }

    public class FilterRelativeRequest
    {
        public Guid? StudentId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? NationalId { get; set; }
        public string? RelationType { get; set; }
    }
}
