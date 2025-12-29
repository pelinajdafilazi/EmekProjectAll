using System;
using System.Threading.Tasks;
using Emek.Application.DTOs.Request.Debts;
using Emek.Application.Interfaces.Debts;
using Microsoft.AspNetCore.Mvc;

namespace Emek.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebtsController : ControllerBase
    {
        private readonly IDebtServices _debtServices;

        public DebtsController(IDebtServices debtServices)
        {
            _debtServices = debtServices;
        }


        // döneme ve gruba göre filtreleme işlemi 
        [HttpGet("group-period-filter")]
        public async Task<IActionResult> GetStudentsWithDebtInfo(
            [FromQuery] Guid? groupId,
            [FromQuery] int? year,
            [FromQuery] int? month)
        {
            try
            {
                var result = await _debtServices.GetStudentsWithDebtInfoAsync(groupId, year, month);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // detaylı öğrenci ve borç bilgileri
        [Obsolete("Bu endpoint kullanım dışıdır.", false)]
        [HttpGet("student/{studentId}/details")]
        public async Task<IActionResult> GetStudentDebtDetails(Guid studentId)
        {
            try
            {
                var result = await _debtServices.GetStudentDebtDetailsAsync(studentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Obsolete("Bu endpoint kullanım dışıdır.", false)]
        [HttpGet("student/{studentId}/summary")]
        public async Task<IActionResult> GetAllDebtsAndStudentInfoByStudentId(Guid studentId)
        {
            try
            {
                var result = await _debtServices.GetAllDebtsAndStudentInfoByStudentIdAsync(studentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }



        // CRUD İşlemleri
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DebtRequestDTOs request)
        {
            try
            {
                var debt = await _debtServices.CreateDebtAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = debt.DebtId }, debt);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Obsolete("Bu endpoint kullanım dışıdır.", false)]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var debt = await _debtServices.GetDebtByIdAsync(id);
                return Ok(debt);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetAllDebtsByStudentId(Guid studentId)
        {
            try
            {
                var debts = await _debtServices.GetAllDebtsByStudentIdAsync(studentId);
                return Ok(debts);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] DebtUpdateRequestDTOs request)
        {
            try
            {
                var debt = await _debtServices.UpdateDebtAsync(request);
                return Ok(debt);
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
                await _debtServices.DeleteDebtAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Obsolete("Bu endpoint kullanım dışıdır.", false)]
        [HttpGet("{id}/basic-info")]
        public async Task<IActionResult> GetDebtAndStudentBasicInfo(Guid id)
        {
            try
            {
                var result = await _debtServices.GetDebtAndStudentBasicInfoAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Obsolete("Bu endpoint kullanım dışıdır.", false)]
        [HttpGet("{id}/detail-info")]
        public async Task<IActionResult> GetDebtAndStudentDetailInfo(Guid id)
        {
            try
            {
                var result = await _debtServices.GetDebtAndStudentDetailInfoAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Obsolete("Bu endpoint kullanım dışıdır.", false)]
        [HttpGet("student/{studentId}/total")]
        public async Task<IActionResult> GetTotalDebtOfStudent(Guid studentId)
        {
            try
            {
                var result = await _debtServices.GetTotalDebtOfStudentAsync(studentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // Ödeme İşlemleri
        // [ApiExplorerSettings(IgnoreApi = true)] // swaggerdan komple gizleme.
        [Obsolete("Bu endpoint kullanım dışıdır.", false)]
        [HttpPost("make-payment")]
        public async Task<IActionResult> MakePayment([FromBody] MakePaymentDTO request)
        {
            try
            {
                var debt = await _debtServices.MakePaymentAsync(request);
                return Ok(debt);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

       
    }
}