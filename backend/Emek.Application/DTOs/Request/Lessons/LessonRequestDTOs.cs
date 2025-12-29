using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Emek.Application.DTOs.Request.Lessons
{
    public class LessonRequestDTOs // Ders ile ilgili temel istek DTO'ları
    {
        public string LessonName { get; set; } // Ders adı
        public string StartingDayOfWeek { get; set; } // Dersin haftanın hangi günü başladığı (Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar)
        public TimeSpan StartingHour { get; set; } // Dersin başladığı saat
        public string EndingDayOfWeek { get; set; } // Dersin haftanın hangi günü bittiği (Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar)
        public TimeSpan EndingHour { get; set; } // Dersin bittiği saat
        public int Capacity { get; set; } // Dersin kapasitesi 

    }

    public class CreateLessonDTO : LessonRequestDTOs
    {
        public Guid GroupId { get; set; } // Hangi gruba ait olduğu
    }

    public class UpdateLessonDTO : LessonRequestDTOs // Tüm bilgiler güncelle
    {
        public Guid LessonId { get; set; } // Ders Id
        public Guid GroupId { get; set; } // Hangi gruba ait olduğu
    }

    public class UpdateLessonCapacityDTO // Sadece kapasite güncelle
    {
        public Guid LessonId { get; set; } // Ders Id
        public int NewCapacity { get; set; } // Yeni kapasite değeri
    }

    public class AssignStudentToLessonDTO // Derse öğrenci atama
    {
        public Guid StudentId { get; set; } // Öğrenci Id
        public Guid LessonId { get; set; } // Ders Id

    }

    public class BulkAssignStudentsToLessonDTO // Toplu seçim ile atama
    {
        public List<Guid> StudentIds { get; set; } = new(); // Öğrenci Id listesi, başta null gelebilir new ile oluştur
        public Guid LessonId { get; set; } // Ders Id
    }

    public class RemoveStudentFromLessonDTO // Dersten öğrenci çıkarma
    {
        public Guid StudentId { get; set; } // Öğrenci Id, null gelebilir
        public Guid LessonId { get; set; } // Ders Id
    }

    public class BulkRemoveStudentsFromLessonDTO // Toplu seçim ile çıkarma
    {
        public List<Guid> StudentIds { get; set; } = new(); // Öğrenci Id listesi, null gelebilir
        public Guid LessonId { get; set; } // Ders Id
    }

    public class DeleteLessonDTO // Ders silme => aktif/pasif hale getirecek şekilde uyarla
    {
        public Guid LessonId { get; set; } // Ders Id
    }








}
