using System;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Groups;
using Emek.Application.Interfaces.Groups;
using Microsoft.AspNetCore.Mvc;

namespace Emek.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupsController : ControllerBase
    {
        private readonly IGroupServices _groupServices;

        public GroupsController(IGroupServices groupServices)
        {
            _groupServices = groupServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var groups = await _groupServices.GetAllGroupsAsync();
            return Ok(groups);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var group = await _groupServices.GetGroupByIdAsync(id);
                return Ok(group);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("students-with-groups")]
        public async Task<IActionResult> GetAllStudentsWithGroups()
        {
            var students = await _groupServices.GetAllStudentsWithGroupInfoAsync();
            return Ok(students);
        }

        [HttpGet("students-without-groups")]
        public async Task<IActionResult> GetStudentsWithoutGroups()
        {
            var students = await _groupServices.GetStudentsWithoutGroupsAsync();
            return Ok(students);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGroupRequest request)
        {
            try
            {
                var group = await _groupServices.CreateGroupAsync(request);
                return CreatedAtAction(nameof(GetActiveStudents), new { id = group.Id }, group);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGroupRequest request)
        {
            try
            {
                var group = await _groupServices.UpdateGroupAsync(id, request);
                return Ok(group);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("add-student")]
        public async Task<IActionResult> AddStudent([FromBody] AddStudentToGroupRequest request)
        {
            try
            {
                await _groupServices.AddStudentToGroupAsync(request);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/students")]
        public async Task<IActionResult> GetActiveStudents(Guid id)
        {
            var students = await _groupServices.GetActiveStudentsInGroupAsync(id);
            return Ok(students);
        }

        [HttpGet("{id}/removed-students")]
        public async Task<IActionResult> GetRemovedStudents(Guid id)
        {
            var students = await _groupServices.GetRemovedStudentsInGroupAsync(id);
            return Ok(students);
        }

        [HttpDelete("{groupId}/students/{studentId}")]
        public async Task<IActionResult> RemoveStudent(Guid groupId, Guid studentId)
        {
            try
            {
                await _groupServices.RemoveStudentFromGroupAsync(groupId, studentId);
                return NoContent();
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
                await _groupServices.DeleteGroupAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}



