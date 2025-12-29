using Emek.Application.DTOs.Responses.Lessons;
using Emek.Application.DTOs.Responses.Students;
using System;
using System.Collections.Generic;

namespace Emek.Application.DTOs.Responses.Attendances
{
    public class AttendanceResponseDTOs
    {
        public Guid AttendanceId { get; set; }
        public DateTime AttendanceDate { get; set; }
        public bool IsPresent { get; set; }
        public Guid LessonId { get; set; }
        public Guid StudentId { get; set; }
    }

    public class StudentWithAttendanceInfoResponse : StudentSelfInformationResponse
    {
        public bool? IsPresent { get; set; } 
        public DateTime? AttendanceDate { get; set; } 
    }

    public class LessonStudentsWithAttendanceResponse
    {
        public Guid LessonId { get; set; }
        public List<StudentWithAttendanceInfoResponse> Students { get; set; }
    }

    public class AttendanceWithLessonAndStudentInfo: StudentSelfInformationResponse
    {
        public bool? IsPresent { get; set; }
        public DateTime? AttendanceDate { get; set; }
        public LessonResponseDTOs Lesson { get; set; }
    }

    public class AttendanceSimpleResponse
    {
        public DateTime AttendanceDate { get; set; }
        public bool IsPresent { get; set; }
    }

    public class StudentAttendanceHistoryWithLessonInfo
    {
        public StudentSelfInformationResponse Student { get; set; }
        public LessonResponseDTOs Lesson { get; set; }
        public List<AttendanceSimpleResponse> Attendances { get; set; } // Tüm yoklamalar (tarihe göre sıralı)
    }



}
