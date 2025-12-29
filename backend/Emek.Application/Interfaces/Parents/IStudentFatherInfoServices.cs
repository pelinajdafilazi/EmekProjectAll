using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Parents;
using Emek.Application.DTOs.Responses.Parents;

namespace Emek.Application.Interfaces.Parents
{
    public interface IStudentFatherInfoServices
    {
        Task<FatherResponse> GetByIdAsync(Guid id);
        Task<FatherResponse> GetByNationalIdAsync(string nationalId);
        Task<FatherResponse> UpdateAsync(Guid id, UpdateFatherRequest request);
        Task<IEnumerable<FatherResponse>> GetAllAsync();
    }
}
