using System;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Parents;
using Emek.Application.Interfaces.Parents;
using Microsoft.AspNetCore.Mvc;

namespace Emek.API.Controllers.StudentInfoController
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentFatherInfoController : ControllerBase
    {
        private readonly IStudentFatherInfoServices _fatherService;

        public StudentFatherInfoController(IStudentFatherInfoServices fatherService)
        {
            _fatherService = fatherService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var father = await _fatherService.GetByIdAsync(id);
                return Ok(father);
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
                var father = await _fatherService.GetByNationalIdAsync(nationalId);
                return Ok(father);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFatherRequest request)
        {
            try
            {
                var father = await _fatherService.UpdateAsync(id, request);
                return Ok(father);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var fathers = await _fatherService.GetAllAsync();
                return Ok(fathers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
