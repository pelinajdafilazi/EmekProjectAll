using Emek.Domain.Entities.Base;
using System;
using System.Collections.Generic;

namespace Emek.Domain.Entities.Groups
{
    public class Group : BaseEntity
    {
        public string Name { get; set; }

        // Yaş aralığı: 0-6, 6–10 gibi..
        public int MinAge { get; set; }
        public int MaxAge { get; set; }

        public ICollection<GroupStudent> GroupStudents { get; set; } = new List<GroupStudent>();
    }
}



