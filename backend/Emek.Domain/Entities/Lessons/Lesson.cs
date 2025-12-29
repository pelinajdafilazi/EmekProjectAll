using Emek.Domain.Entities.Base;
using Emek.Domain.Entities.Groups;
using System;
using System.Collections.Generic;

namespace Emek.Domain.Entities.Lessons
{
    public class Lesson: BaseEntity
    {
        public string LessonName { get; set; } // Ders adı
        public string StartingDayOfWeek { get; set; } // Dersin haftanın hangi günü başladığı (Pazartesi, Salı, vs.)
        public TimeSpan StartingHour { get; set; } // Dersin başladığı saat
        public string EndingDayOfWeek { get; set; } // Dersin haftanın hangi günü bittiği (Pazartesi, Salı, vs.)
        public TimeSpan EndingHour { get; set; } // Dersin bittiği saat
        public int Capacity { get; set; } // Dersin kapasitesi

        // Grup ile ilişki 
        public Guid GroupId { get; set; }
        public Group Group { get; set; }

        // Öğrenci ile ilişki
        public ICollection<LessonStudent> LessonStudents { get; set; } = new List<LessonStudent>();
    }
}
