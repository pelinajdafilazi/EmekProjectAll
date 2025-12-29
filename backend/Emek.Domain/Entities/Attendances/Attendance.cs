using Emek.Domain.Entities.Base;
using Emek.Domain.Entities.Lessons;
using Emek.Domain.Entities.Personal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Domain.Entities.Attendances
{
    public class Attendance: BaseEntity
    {


        public DateTime AttendanceDate { get; set; } // Devam tarihi
        public bool IsPresent { get; set; } // Öğrencinin o gün devam edip etmediği bilgisi




        // Ders ile 1-M ilişki
        public Guid LessonId { get; set; }
        public Lesson Lesson { get; set; }

        // Öğrenci ile 1-M ilişki
        public Guid StudentId { get; set; }
        public StudentPersonalInfo Student { get; set; }

    }
}
