using Emek.Application.DTOs.Request.Attendances;
using Emek.Application.Interfaces.Attendances;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Emek.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendancesController : ControllerBase
    {
        private readonly IAttendanceServices _attendanceServices;

        public AttendancesController(IAttendanceServices attendanceServices)
        {
            _attendanceServices = attendanceServices;
        }

      
        [HttpGet("lesson/{lessonId}/students")]
        public async Task<IActionResult> GetStudentsByLessonId(
            Guid lessonId,
            [FromQuery] DateTime? attendanceDate = null)
        {
            try
            {
                var result = await _attendanceServices.GetStudentsByLessonIdAsync(lessonId, attendanceDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // Bulk olarak devam kaydı oluştur
        [HttpPost("bulk-create")]
        public async Task<IActionResult> BulkCreateAttendance([FromBody] BulkCreateAttendanceDTO request)
        {
            try
            {
                await _attendanceServices.BulkCreateAttendanceAsync(request);
                return Ok(new { message = "Derse ait yoklama kaydı başarılıyla yapıldı." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("student-attendance-percetange")]
        public async Task<IActionResult> GetStudentAllAttendancePercetange(
            [FromQuery] Guid studentId,
            [FromQuery] Guid lessonId)
        {
            try
            {
                var percentage = await _attendanceServices.GetStudentAllAttendancePercetange(studentId, lessonId);
                return Ok(new { AttendancePercentage = percentage });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("student/{studentId}/lesson/{lessonId}")]
        public async Task<IActionResult> GetAttendanceRecordsByStudentAndLesson(
            Guid studentId,
            Guid lessonId)
        {
            try
            {
                var result = await _attendanceServices.GetAttendanceByStudentAndLessonAsync(studentId, lessonId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
