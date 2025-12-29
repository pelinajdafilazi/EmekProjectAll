using System;
using System.Collections.Generic;

namespace Emek.Application.DTOs.Responses.Groups
{
    public class GroupResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int MinAge { get; set; }
        public int MaxAge { get; set; }
    }

    public class GroupStudentResponse
    {
        public Guid StudentId { get; set; }
        public string StudentFirstName { get; set; }
        public string StudentLastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public bool IsActive { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
    }

    public class StudentWithGroupInfoResponse
    {
        public Guid StudentId { get; set; }
        public string StudentFirstName { get; set; }
        public string StudentLastName { get; set; }
        public string DateOfBirth { get; set; }
        public int Age { get; set; }
        public bool HasDebt { get; set; }
        public string? Group { get; set; }
    }

    public class GroupInfo
    {
        public Guid GroupId { get; set; }
        public string GroupName { get; set; }
        public int MinAge { get; set; }
        public int MaxAge { get; set; }
        public DateTime JoinedAt { get; set; }
    }
}



