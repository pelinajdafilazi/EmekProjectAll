using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Parents;
using Emek.Application.DTOs.Responses.Parents;

namespace Emek.Application.Interfaces.Parents
{
    public interface IStudentMotherInfoServices
    {
        Task<MotherResponse> GetByIdAsync(Guid id);
        Task<MotherResponse> GetByNationalIdAsync(string nationalId);
        Task<MotherResponse> UpdateAsync(Guid id, UpdateMotherRequest request);
        Task<IEnumerable<MotherResponse>> GetAllAsync();
    }
}
