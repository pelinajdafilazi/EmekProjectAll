using Emek.Application.DTOs.Responses.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Application.DTOs.Responses.Lessons
{
    public class LessonResponseDTOs // Ders bilgilerini getir
    {
        public Guid Id { get; set; }
        public string LessonName { get; set; }
        public string StartingDayOfWeek { get; set; } // Dersin haftanın hangi günü başladığı (Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar)
        public TimeSpan StartingHour { get; set; } // Dersin başladığı saat
        public string EndingDayOfWeek { get; set; } // Dersin haftanın hangi günü bittiği (Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar)
        public TimeSpan EndingHour { get; set; } // Dersin bittiği saat
        public int Capacity { get; set; }
        public int CurrentStudentCount { get; set; } // Güncel öğrenci sayısı (yeni oluşturulduysa default 0 döner)

    }

    public class LessonCapacityAndStudentListDTO // Ders kapasitesi ve güncel öğrenci listesi
    {
        public Guid LessonId { get; set; }
        public int CurrentStudentCount { get; set; }
        public int Capacity { get; set; }
        public List<StudentSelfInformationResponse> Students { get; set; } // Detaylı öğrenci bilgileri

    }

    public class RegisteredStudentsFromLessonDTO // Derse kayıtlı öğrencileri getir
    {
        public Guid LessonId { get; set; }
        public List<Guid> StudentIds { get; set; } // Derse kayıtlı öğrenci Id listesi
        public List<StudentSelfInformationResponse> Students { get; set; } // öğrenci bilgileri

    }

    public class UnRegisteredStudentsFromLessonDTO // Derse kayıtlı olmayan öğrencileri getir.(Dersin ait olduğu gruptaki öğrencilerden)
    {
        public Guid LessonId { get; set; }
        public List<Guid> StudentIds { get; set; }
        public List<StudentSelfInformationResponse> Students { get; set; } // öğrenci bilgileri
    }


}
