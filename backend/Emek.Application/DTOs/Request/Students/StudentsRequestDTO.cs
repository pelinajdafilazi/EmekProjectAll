using System;
using Emek.Application.DTOs.Request.Parents;

namespace Emek.Application.DTOs.Request.Students
{
    public class CreateStudentRequest
    {
        // Öğrenci Bilgileri
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string NationalId { get; set; }
        public string SchoolName { get; set; }
        public string HomeAddress { get; set; }
        public string Branch { get; set; }
        public string? Class { get; set; } // Öğrencinin sınıfı
        public string? PhoneNumber { get; set; } // Öğrencinin telefon numarası

        // Profil resmi (opsiyonel - Base64)
        public string? ProfileImageBase64 { get; set; }
        public string? ProfileImageContentType { get; set; }
        
        // Anne Bilgileri (TC ile kontrol edilecek)
        public CreateMotherRequest MotherInfo { get; set; }
        
        // Baba Bilgileri (TC ile kontrol edilecek)
        public CreateFatherRequest FatherInfo { get; set; }
    }

    public class UpdateStudentRequest
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
        public Guid MotherId { get; set; }
        public Guid FatherId { get; set; }
    }

    public class UpdateStudentProfileImageRequest
    {
        public string ProfileImageBase64 { get; set; }
        public string? ProfileImageContentType { get; set; }
    }

    public class FilterStudentRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Branch { get; set; }
        public string? SchoolName { get; set; }
        public Guid? MotherId { get; set; }
        public Guid? FatherId { get; set; }
        public string? NationalId { get; set; }
    }

    public class StudentsDTO
    {

    }
}
