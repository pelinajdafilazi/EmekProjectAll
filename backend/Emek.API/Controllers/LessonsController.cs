using System;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Lessons;
using Emek.Application.Interfaces.Lessons;
using Microsoft.AspNetCore.Mvc;

namespace Emek.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly ILessonServices _lessonServices;

        public LessonsController(ILessonServices lessonServices)
        {
            _lessonServices = lessonServices;
        }

        // Ders CRUD işlemleri
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateLessonDTO request)
        {
            try
            {
                var lesson = await _lessonServices.CreateLessonAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = lesson.Id }, lesson);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateLessonDTO request)
        {
            try
            {
                var lesson = await _lessonServices.UpdateLessonAsync(request);
                return Ok(lesson);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("capacity")]
        public async Task<IActionResult> UpdateCapacity([FromBody] UpdateLessonCapacityDTO request)
        {
            try
            {
                var lesson = await _lessonServices.UpdateLessonCapacityAsync(request);
                return Ok(lesson);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{lessonId}")]
        public async Task<IActionResult> Delete(Guid lessonId)
        {
            try
            {
                await _lessonServices.DeleteLessonAsync(new DeleteLessonDTO { LessonId = lessonId });
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Ders sorgulama işlemleri
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var lessons = await _lessonServices.GetAllLessonsAsync();
            return Ok(lessons);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var lesson = await _lessonServices.GetLessonByIdAsync(id);
                return Ok(lesson);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/capacity-and-students")]
        public async Task<IActionResult> GetCapacityAndStudents(Guid id)
        {
            try
            {
                var result = await _lessonServices.GetLessonCapacityAndStudentListAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // Öğrenci atama/çıkarma işlemleri
        [HttpPost("assign-student")]
        public async Task<IActionResult> AssignStudent([FromBody] AssignStudentToLessonDTO request)
        {
            try
            {
                await _lessonServices.AssignStudentToLessonAsync(request);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("bulk-assign-students")]
        public async Task<IActionResult> BulkAssignStudents([FromBody] BulkAssignStudentsToLessonDTO request)
        {
            try
            {
                await _lessonServices.BulkAssignStudentsToLessonAsync(request);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("remove-student")]
        public async Task<IActionResult> RemoveStudent([FromBody] RemoveStudentFromLessonDTO request)
        {
            try
            {
                await _lessonServices.RemoveStudentFromLessonAsync(request);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("bulk-remove-students")]
        public async Task<IActionResult> BulkRemoveStudents([FromBody] BulkRemoveStudentsFromLessonDTO request)
        {
            try
            {
                await _lessonServices.BulkRemoveStudentsFromLessonAsync(request);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Öğrenci listesi sorgulama işlemleri
        [HttpGet("{id}/registered-students")]
        public async Task<IActionResult> GetRegisteredStudents(Guid id)
        {
            try
            {
                var result = await _lessonServices.GetRegisteredStudentsFromLessonAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/unregistered-students")]
        public async Task<IActionResult> GetUnRegisteredStudents(Guid id)
        {
            try
            {
                var result = await _lessonServices.GetUnRegisteredStudentsFromLessonAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
