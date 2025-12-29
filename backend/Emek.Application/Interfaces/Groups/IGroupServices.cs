using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Groups;
using Emek.Application.DTOs.Responses.Groups;

namespace Emek.Application.Interfaces.Groups
{
    public interface IGroupServices
    {
        Task<GroupResponse> CreateGroupAsync(CreateGroupRequest request);
        Task<GroupResponse> UpdateGroupAsync(Guid groupId, UpdateGroupRequest request);
        Task<IEnumerable<GroupResponse>> GetAllGroupsAsync();
        Task<GroupResponse> GetGroupByIdAsync(Guid id);
        Task AddStudentToGroupAsync(AddStudentToGroupRequest request);
        Task<IEnumerable<GroupStudentResponse>> GetActiveStudentsInGroupAsync(Guid groupId);
        Task RemoveStudentFromGroupAsync(Guid groupId, Guid studentId);
        Task<IEnumerable<GroupStudentResponse>> GetRemovedStudentsInGroupAsync(Guid groupId);
        Task<IEnumerable<StudentWithGroupInfoResponse>> GetAllStudentsWithGroupInfoAsync();
        Task<IEnumerable<StudentWithGroupInfoResponse>> GetStudentsWithoutGroupsAsync();
        Task DeleteGroupAsync(Guid groupId); // Grup sil (soft delete)
    }
}



