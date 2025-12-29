using System;
using Emek.Application.DTOs.Responses.Parents;

namespace Emek.Application.DTOs.Responses.Students
{
    public class StudentResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string NationalId { get; set; }
        public string SchoolName { get; set; }
        public string HomeAddress { get; set; }
        public string Branch { get; set; }
        public string? Class { get; set; } // Öğrencinin sınıfı
        public string? PhoneNumber { get; set; } // Öğrencinin telefon numarası
        public bool HasDebt { get; set; }

        // Profil resmi bilgisi
        public bool HasProfileImage { get; set; }
        public string? ProfileImageContentType { get; set; }
        public Guid MotherId { get; set; }
        public Guid FatherId { get; set; }
        public string? MotherNationalId { get; set; }
        public string? FatherNationalId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Navigation Properties (opsiyonel)
        public MotherResponse? Mother { get; set; }
        public FatherResponse? Father { get; set; }
        
        // Yakınlar (opsiyonel)
        public List<RelativeResponse>? Relatives { get; set; }
    }

    public class StudentListResponse
    {
        public List<StudentResponse> Students { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class StudentSelfInformationResponse
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string NationalId { get; set; }
        public string SchoolName { get; set; }
        public string HomeAddress { get; set; }
        public string Branch { get; set; }
        public string? Class { get; set; } // Öğrencinin sınıfı
        public string? PhoneNumber { get; set; } // Öğrencinin telefon numarası
        public bool HasProfileImage { get; set; }
        public string? ProfileImageContentType { get; set; }

    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
    }

    public class ErrorResponse
    {
        public bool Success { get; set; } = false;
        public string Message { get; set; }
        public List<string>? Errors { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class SuccessResponse<T>
    {
        public bool Success { get; set; } = true;
        public string? Message { get; set; }
        public T? Data { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

}
