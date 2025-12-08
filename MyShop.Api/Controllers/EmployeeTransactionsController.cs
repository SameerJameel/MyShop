using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;

namespace MyShop.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeTransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmployeeTransactionsController(AppDbContext context)
        {
            _context = context;
        }

        // فلترة بالحقل month/year (لصفحة حساب الرواتب)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeTransaction>>> Get(
            int? employeeId, int? year, int? month)
        {
            var q = _context.EmployeeTransactions.AsQueryable();

            if (employeeId.HasValue)
                q = q.Where(t => t.EmployeeId == employeeId.Value);

            if (year.HasValue && month.HasValue)
            {
                q = q.Where(t => t.Date.Year == year.Value && t.Date.Month == month.Value);
            }

            var list = await q
                .AsNoTracking()
                .OrderBy(t => t.Date)
                .ToListAsync();

            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult<EmployeeTransaction>> Create(EmployeeTransaction tx)
        {
            tx.Id = 0;
            _context.EmployeeTransactions.Add(tx);
            await _context.SaveChangesAsync();
            return Ok(tx);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tx = await _context.EmployeeTransactions.FindAsync(id);
            if (tx == null) return NotFound();

            _context.EmployeeTransactions.Remove(tx);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
