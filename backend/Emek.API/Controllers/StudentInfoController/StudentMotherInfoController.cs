using System;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Parents;
using Emek.Application.Interfaces.Parents;
using Microsoft.AspNetCore.Mvc;

namespace Emek.API.Controllers.StudentInfoController
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentMotherInfoController : ControllerBase
    {
        private readonly IStudentMotherInfoServices _motherService;

        public StudentMotherInfoController(IStudentMotherInfoServices motherService)
        {
            _motherService = motherService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var mother = await _motherService.GetByIdAsync(id);
                return Ok(mother);
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
                var mother = await _motherService.GetByNationalIdAsync(nationalId);
                return Ok(mother);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMotherRequest request)
        {
            try
            {
                var mother = await _motherService.UpdateAsync(id, request);
                return Ok(mother);
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
                var mothers = await _motherService.GetAllAsync();
                return Ok(mothers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
