using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Parents;
using Emek.Application.DTOs.Responses.Parents;

namespace Emek.Application.Interfaces.Parents
{
    public interface IRelativeServices
    {
        Task<RelativeResponse> CreateAsync(CreateRelativeRequest request);
        Task<RelativeResponse> UpdateAsync(Guid id, UpdateRelativeRequest request);
        Task DeleteAsync(Guid id);
        Task<RelativeResponse> GetByIdAsync(Guid id);
        Task<IEnumerable<RelativeResponse>> GetByStudentIdAsync(Guid studentId);
        Task<IEnumerable<RelativeResponse>> GetByRelativeNationalIdAsync(string nationalId);
        Task<IEnumerable<RelativeResponse>> GetAllAsync(FilterRelativeRequest? filter = null);
    }
}
