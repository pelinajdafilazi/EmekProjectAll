using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Students;
using Emek.Application.DTOs.Responses.Students;

namespace Emek.Application.Interfaces.Students
{
    public interface IStudentPersonalInfoServices
    {
        // Öğrenci oluşturma (anne/baba bilgileri ile birlikte)
        Task<StudentResponse> CreateAsync(CreateStudentRequest request);
        
        // Öğrenci sorgulama - sadece kendi bilgileri
        Task<StudentResponse> GetByIdAsync(Guid id);
        
        // Öğrenci sorgulama - kendi + anne/baba bilgileri
        Task<StudentResponse> GetByIdWithParentsAsync(Guid id);
        
        // Öğrenci TC'si ile sorgulama
        Task<StudentResponse> GetByNationalIdAsync(string nationalId);
        
        // Öğrenci TC'si ile sorgulama (anne/baba bilgileri ile)
        Task<StudentResponse> GetByNationalIdWithParentsAsync(string nationalId);
        
        // Anne TC'si ile öğrencileri getir
        Task<IEnumerable<StudentResponse>> GetStudentsByMotherNationalIdAsync(string motherNationalId);
        
        // Baba TC'si ile öğrencileri getir
        Task<IEnumerable<StudentResponse>> GetStudentsByFatherNationalIdAsync(string fatherNationalId);
        
        // Tüm öğrencileri getir
        Task<IEnumerable<StudentResponse>> GetAllAsync();

        // Profil resmi işlemleri
        Task UpdateProfileImageAsync(Guid studentId, UpdateStudentProfileImageRequest request);
        Task<(string? ProfileImageBase64, string? ProfileImageContentType)> GetProfileImageAsync(Guid studentId);
        Task DeleteProfileImageAsync(Guid studentId);

        // Aktif / pasif öğrenciler
        Task<IEnumerable<StudentResponse>> GetActiveStudentsAsync();
        Task<IEnumerable<StudentResponse>> GetInactiveStudentsAsync();
        Task DeactivateStudentAsync(Guid studentId);
    }
}
