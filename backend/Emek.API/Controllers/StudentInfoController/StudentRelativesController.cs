using System;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Parents;
using Emek.Application.Interfaces.Parents;
using Microsoft.AspNetCore.Mvc;

namespace Emek.API.Controllers.StudentInfoController
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentRelativesController : ControllerBase
    {
        private readonly IRelativeServices _relativeServices;

        public StudentRelativesController(IRelativeServices relativeServices)
        {
            _relativeServices = relativeServices;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRelativeRequest request)
        {
            try
            {
                var relative = await _relativeServices.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = relative.Id }, relative);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRelativeRequest request)
        {
            try
            {
                var relative = await _relativeServices.UpdateAsync(id, request);
                return Ok(relative);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _relativeServices.DeleteAsync(id);
                return NoContent();
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
                var relative = await _relativeServices.GetByIdAsync(id);
                return Ok(relative);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudentId(Guid studentId)
        {
            var relatives = await _relativeServices.GetByStudentIdAsync(studentId);
            return Ok(relatives);
        }

        [HttpGet("national-id/{nationalId}")]
        public async Task<IActionResult> GetByRelativeNationalId(string nationalId)
        {
            try
            {
                var relatives = await _relativeServices.GetByRelativeNationalIdAsync(nationalId);
                return Ok(relatives);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}


