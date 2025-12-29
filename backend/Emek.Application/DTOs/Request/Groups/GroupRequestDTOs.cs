using System;

namespace Emek.Application.DTOs.Request.Groups
{
    public class CreateGroupRequest
    {
        public string Name { get; set; }
        public int MinAge { get; set; }
        public int MaxAge { get; set; }
    }

    public class UpdateGroupRequest
    {
        public string Name { get; set; }
        public int MinAge { get; set; }
        public int MaxAge { get; set; }
    }

    public class AddStudentToGroupRequest
    {
        public Guid GroupId { get; set; }
        public Guid StudentId { get; set; }
    }
}



