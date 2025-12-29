using Emek.Domain.Entities.Base;
using Emek.Domain.Entities.Personal;
using System;

namespace Emek.Domain.Entities.Groups
{
    public class GroupStudent : BaseEntity
    {
        public Guid GroupId { get; set; }
        public Group Group { get; set; }

        public Guid StudentId { get; set; }
        public StudentPersonalInfo Student { get; set; }

        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
    }
}


