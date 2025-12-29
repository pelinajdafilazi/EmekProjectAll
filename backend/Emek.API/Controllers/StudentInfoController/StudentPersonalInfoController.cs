using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Students;
using Emek.Application.Interfaces.Students;

namespace Emek.API.Controllers.StudentInfoController
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentPersonalInfoController : ControllerBase
    {
        private readonly IStudentPersonalInfoServices _studentService;

        public StudentPersonalInfoController(IStudentPersonalInfoServices studentService)
        {
            _studentService = studentService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStudentRequest request)
        {
            try
            {
                var student = await _studentService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var student = await _studentService.GetByIdAsync(id);
                return Ok(student);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/with-parents")]
        public async Task<IActionResult> GetByIdWithParents(Guid id)
        {
            try
            {
                var student = await _studentService.GetByIdWithParentsAsync(id);
                return Ok(student);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("national-id/{nationalId}")]
        public async Task<IActionResult> GetByNationalId(string nationalId)
        {
            try
            {
                var student = await _studentService.GetByNationalIdAsync(nationalId);
                return Ok(student);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("national-id/{nationalId}/with-parents")]
        public async Task<IActionResult> GetByNationalIdWithParents(string nationalId)
        {
            try
            {
                var student = await _studentService.GetByNationalIdWithParentsAsync(nationalId);
                return Ok(student);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("mother/{motherNationalId}")]
        public async Task<IActionResult> GetStudentsByMotherNationalId(string motherNationalId)
        {
            try
            {
                var students = await _studentService.GetStudentsByMotherNationalIdAsync(motherNationalId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("father/{fatherNationalId}")]
        public async Task<IActionResult> GetStudentsByFatherNationalId(string fatherNationalId)
        {
            try
            {
                var students = await _studentService.GetStudentsByFatherNationalIdAsync(fatherNationalId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var students = await _studentService.GetAllAsync();
            return Ok(students);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveStudents()
        {
            var students = await _studentService.GetActiveStudentsAsync();
            return Ok(students);
        }

        [HttpGet("inactive")]
        public async Task<IActionResult> GetInactiveStudents()
        {
            var students = await _studentService.GetInactiveStudentsAsync();
            return Ok(students);
        }

        // Profil resmi işlemleri

        [HttpGet("{id}/profile-image")]
        public async Task<IActionResult> GetProfileImage(Guid id)
        {
            try
            {
                var (base64, contentType) = await _studentService.GetProfileImageAsync(id);
                return Ok(new { ProfileImageBase64 = base64, ProfileImageContentType = contentType });
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/profile-image")]
        public async Task<IActionResult> UpdateProfileImage(Guid id, [FromBody] UpdateStudentProfileImageRequest request)
        {
            try
            {
                await _studentService.UpdateProfileImageAsync(id, request);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/profile-image")]
        public async Task<IActionResult> DeleteProfileImage(Guid id)
        {
            try
            {
                await _studentService.DeleteProfileImageAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/make-passive")]
        public async Task<IActionResult> MakePassive(Guid id)
        {
            try
            {
                await _studentService.DeactivateStudentAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
