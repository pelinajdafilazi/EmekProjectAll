using Emek.Domain.Entities.Base;
using Emek.Domain.Entities.Personal;
using System;

namespace Emek.Domain.Entities.Lessons
{
    public class LessonStudent : BaseEntity
    {
        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; }

        public Guid StudentId { get; set; }
        public StudentPersonalInfo Student { get; set; }

        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
    }
}

