using System;
using System.Collections.Generic;

namespace Emek.Application.DTOs.Request.Attendances
{
    public class BulkCreateAttendanceDTO
    {
        public Guid LessonId { get; set; }
        public DateTime AttendanceDate { get; set; } // Tek bir tarih - tüm öğrenciler için aynı
        public List<StudentAttendanceDTO> StudentAttendances { get; set; }
    }

    public class StudentAttendanceDTO
    {
        public Guid StudentId { get; set; }
        public bool IsPresent { get; set; }
    }
}
